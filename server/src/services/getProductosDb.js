
import pool from '../db/pool.js'

export async function getCategorias() {
  const result = await pool.query('SELECT DISTINCT categoria FROM productos ORDER BY categoria');
  // console.log(result.rows)
  return result.rows;
}

export async function getProductos({ page = 1, limit = 50, busqueda = '', categoria = '', ordenBy = "", productosTienda, onlyStock }) {
  const offset = (page - 1) * limit

  let whereClause = 'WHERE 1=1'
  const params = []

  const ordenMap = {
    costo_asc: 'value ASC,',
    costo_desc: 'value DESC,',//futuro cambiar a finalPrice
    precio_asc: 'precio_venta ASC,',
    precio_desc: 'precio_venta DESC,',
    stock_asc: `CASE stock WHEN 'Sin stock' THEN 0 WHEN 'Bajo' THEN 1 WHEN 'Medio' THEN 2 WHEN 'Alto' THEN 3 END ASC,`,
    stock_desc: `CASE stock WHEN 'Sin stock' THEN 0 WHEN 'Bajo' THEN 1 WHEN 'Medio' THEN 2 WHEN 'Alto' THEN 3 END DESC,`,
  }

  if (busqueda) {
    params.push(`%${busqueda}%`)
    whereClause += ` AND (titulo ILIKE $${params.length} OR sku ILIKE $${params.length})`
  }

  if (categoria) {
    params.push(categoria)
    whereClause += ` AND categoria = $${params.length}`
  }

  if (onlyStock) {
    whereClause += ` AND stock != 'Sin stock'`
  }

  if (productosTienda) {
    whereClause += ` AND habilitado = true`
  }


  const orderClause = ordenMap[ordenBy] ? `${ordenMap[ordenBy]} categoria, titulo` : 'categoria, titulo'

  // Total para paginación
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM productos ${whereClause}`,
    params
  )
  const total = parseInt(countRows[0].count)
  // Productos de la página actual
  params.push(limit, offset)
  const { rows } = await pool.query(
    `SELECT 
      nb_id, sku, titulo, titulo_custom, marca, categoria,
      imagen_url, garantia, habilitado, precio_venta, ultima_sync, stock, value, iva, internal_tax, cotizacion , utility, semi_final_price
    FROM productos
    ${whereClause}
    ORDER BY 
    ${orderClause}
    LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return { productos: rows, total, page, limit }
}

export async function updateProducto(nb_id, { habilitado, precio_venta, titulo_custom }) {
  const { rows } = await pool.query(
    `UPDATE productos
     SET habilitado = COALESCE($1, habilitado),
         precio_venta = COALESCE($2, precio_venta),
         titulo_custom = COALESCE($3, titulo_custom)
     WHERE nb_id = $4
     RETURNING *`,
    [habilitado, precio_venta, titulo_custom, nb_id]
  )
  return rows[0]
}

export async function updatePrecio() {
  const { rows } = await pool.query(
    `UPDATE productos p
    SET precio_venta = p.semi_final_price * (1 + c.utility / 100) * p.cotizacion
    FROM categorias c
    WHERE p.categoria_id = c.id
      AND p.habilitado = true;`,

  )
  return rows[0]
}