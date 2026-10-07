// server/src/services/tienda.service.js
import pool from '../db/pool.js'

// Whitelist de ordenamientos: nunca interpolar lo que manda el cliente directo en el SQL
const ORDENES = {
  precio_asc: 'precio_venta ASC NULLS LAST',
  precio_desc: 'precio_venta DESC NULLS LAST',
  nombre: 'COALESCE(titulo_custom, titulo) ASC',
}
const ORDEN_DEFAULT = 'categoria, titulo'

export async function getProductosTienda({ page = 1, limit = 24, busqueda = '', categoria = '', orden = '' }) {
  page = Math.max(1, parseInt(page) || 1)
  limit = Math.min(100, Math.max(1, parseInt(limit) || 24))
  const offset = (page - 1) * limit

  let whereClause = 'WHERE habilitado = true'
  const params = []

  if (busqueda) {
    params.push(`%${busqueda}%`)
    whereClause += ` AND (
      COALESCE(titulo_custom, titulo) ILIKE $${params.length}
      OR sku ILIKE $${params.length}
    )`
  }

  if (categoria) {
    params.push(categoria)
    whereClause += ` AND categoria = $${params.length}`
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM productos ${whereClause}`,
    params
  )
  const total = parseInt(countRows[0].count)

  params.push(limit, offset)
  const { rows } = await pool.query(
    `SELECT
      nb_id,
      sku,
      COALESCE(titulo_custom, titulo) AS titulo,
      marca,
      categoria,
      imagen_url,
      garantia,
      precio_venta,
      stock
    FROM productos
    ${whereClause}
    ORDER BY ${ORDENES[orden] ?? ORDEN_DEFAULT}, nb_id
    LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return { productos: rows, total, page, limit, totalPaginas: Math.ceil(total / limit) }
}

// export async function getCategoriasTienda() {

//   let whereClause = 'WHERE habilitado = true'
//   const result = await pool.query(`SELECT DISTINCT categoria FROM productos ${whereClause} ORDER BY categoria `);
//   // console.log(result.rows)
//   return result.rows;
// }

export async function getCategoriasTienda() {
  let whereClause = `
  WHERE habilitado = true 
  AND EXISTS (
    SELECT 1 
    FROM productos 
    WHERE productos.categoria_id = categorias.id 
      AND productos.habilitado = true
  )
`

  const { rows } = await pool.query(
    `SELECT 
       nombre
      FROM categorias
      ${whereClause}
      
      `)
  //  console.log(rows)
  return rows
}


export async function getProductoTienda(nb_id) {
  const { rows } = await pool.query(
    `SELECT
      nb_id,
      sku,
      COALESCE(titulo_custom, titulo) AS titulo,
      marca,
      categoria,
      imagen_url,
      imagen_exp_url,
      marca_imagen,
      garantia,
      precio_venta,
      alto,
      ancho,
      largo,
      peso,
      stock,
      descripcion,
      especificaciones,
      imagenes
    FROM productos
    WHERE nb_id = $1 AND habilitado = true`,
    [nb_id]
  )
  return rows[0] || null
}

export async function getProductosCarritoTienda({ ids }) {
  //  console.log("llegando ids:",ids)
  let whereClause = 'WHERE habilitado = true'
  const result = await pool.query(
    `SELECT 
    nb_id,    
      COALESCE(titulo_custom, titulo) AS titulo,    
      imagen_url,
      imagen_exp_url, 
      garantia,
      precio_venta
     FROM productos ${whereClause} AND nb_id = ANY($1) `, [ids]);
  // console.log("results:",result.rows)
  return result.rows;
}

//////////////////////

export async function checkProductDB(nb_id) {
  const { rows } = await pool.query(
    `SELECT nb_id, titulo, habilitado
     FROM productos
     WHERE nb_id = $1 AND habilitado = true`,
    [nb_id]
  );
  console.log("database: ",rows[0])
  return rows[0] ?? null; // la fila, o null si no existe / está deshabilitado
}