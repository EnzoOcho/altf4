import pool from '../db/pool.js'
import { getNBToken } from './nbAuth.js'
import { getProductoNB } from './nbQueryes.js'
import { buildImageUrls, cleanAttributes } from './nbFormat.js'

export async function syncProductos() {
  console.log('🔄 Iniciando sync con NB...')
  const token = await getNBToken()

  const res = await fetch(`https://api-nb-dev.blu.net.ar/v1/`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) throw new Error(`Error al traer productos`)

  const productos = await res.json()

  let productosActualizados = 0
  let totalProductos = productos.length

  //   console.log(productos) funciona bien
  // Upsert en bloque — si ya existe el nb_id lo actualiza, si no lo inserta
  for (const p of productos) {
    await pool.query(`
          INSERT INTO productos (
            nb_id, sku, titulo, marca, marca_id, categoria, categoria_id,
            imagen_url, imagen_exp_url, marca_imagen, garantia,
            alto, ancho, largo, peso, ultima_sync, stock, value, iva, internal_tax, cotizacion, semi_final_price
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),$16,$17,$18,$19,$20,$21)
          ON CONFLICT (nb_id) DO UPDATE SET
            sku           = EXCLUDED.sku,
            titulo        = EXCLUDED.titulo,
            marca         = EXCLUDED.marca,
            marca_id      = EXCLUDED.marca_id,
            categoria     = EXCLUDED.categoria,
            categoria_id  = EXCLUDED.categoria_id,
            imagen_url    = EXCLUDED.imagen_url,
            imagen_exp_url= EXCLUDED.imagen_exp_url,
            marca_imagen  = EXCLUDED.marca_imagen,
            garantia      = EXCLUDED.garantia,
            alto          = EXCLUDED.alto,
            ancho         = EXCLUDED.ancho,
            largo         = EXCLUDED.largo,
            peso          = EXCLUDED.peso,
            ultima_sync   = NOW(),

            stock  = EXCLUDED.stock,
            value = EXCLUDED.value,
            iva = EXCLUDED.iva,
            internal_tax = EXCLUDED.internal_tax,
            cotizacion = EXCLUDED.cotizacion,
            semi_final_price = EXCLUDED.semi_final_price
          -- NO tocamos: habilitado, precio_venta, titulo_custom
        `, [
      p.id, p.sku, p.title, p.brand, p.brandId,
      p.category, p.categoryId, p.mainImage, p.mainImageExp,
      p.brandImage, p.warranty,
      p.highAverage, p.widthAverage, p.lengthAverage, p.weightAverage,
      p.stock, p.price.value, p.price.iva, p.price.internalTax, p.cotizacion,
      p.price.finalPrice
    ])

    productosActualizados++
    console.log(`${productosActualizados} de ${totalProductos}`)
  }

  console.log(`✅ Sync completada: ${productosActualizados} productos`)
  return productosActualizados
}


// Trae el detalle (/item/:id) de los productos habilitados que nunca se sincronizaron
// o cuyo detalle tiene más de `diasVigencia` días. Va de a `concurrencia` pedidos
// para no saturar a NB. Un producto que falla no corta el resto.
export async function syncDetalles({ diasVigencia = 7, concurrencia = 3 } = {}) {
  const { rows } = await pool.query(`
    SELECT nb_id FROM productos
    WHERE habilitado = true
      AND (detalle_sync IS NULL OR detalle_sync < NOW() - make_interval(days => $1))
    ORDER BY detalle_sync NULLS FIRST
  `, [diasVigencia])

  console.log(`🔄 Sync de detalles: ${rows.length} productos pendientes`)
  let ok = 0, fallidos = 0

  for (let i = 0; i < rows.length; i += concurrencia) {
    const lote = rows.slice(i, i + concurrencia)
    const resultados = await Promise.allSettled(lote.map(async ({ nb_id }) => {
      const p = await getProductoNB(nb_id)
      await pool.query(`
        UPDATE productos SET
          descripcion      = $2,
          especificaciones = $3,
          imagenes         = $4,
          detalle_sync     = NOW()
        WHERE nb_id = $1
      `, [
        nb_id,
        p.description?.value || null,
        JSON.stringify(cleanAttributes(p.attributes)),
        JSON.stringify(buildImageUrls(p))
      ])
    }))

    for (const r of resultados) {
      if (r.status === 'fulfilled') ok++
      else { fallidos++; console.error('  ⚠️', r.reason.message) }
    }
  }

  console.log(`✅ Detalles sincronizados: ${ok} ok, ${fallidos} con error`)
  return { ok, fallidos }
}
