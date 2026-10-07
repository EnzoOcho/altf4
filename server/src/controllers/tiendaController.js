import { getCategoriasTienda, getProductosTienda, getProductoTienda, getProductosCarritoTienda } from '../services/getProductosTienda.js'

export async function listarProductosTienda(req, res) {
  try {
    const { page, limit, busqueda, categoria, orden } = req.query
    const resultado = await getProductosTienda({ page, limit, busqueda, categoria, orden })
    res.json(resultado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function detalleProductoTienda(req, res) {
  try {
    const { nb_id } = req.params
    const producto = await getProductoTienda(nb_id)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listarCategoriasTienda(req, res) {
  try {
    const categorias = await getCategoriasTienda();
    res.json(categorias)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listarProductosCarritoTienda(req, res) {
  try {
    const ids = req.query['ids[]'] || req.query['ids'];
    // console.log("req.query:",req.query)
    const idsArray = Array.isArray(ids) ? ids : [ids];
    // console.log("isarray?",idsArray)
    //  console.log("ids",ids)
    const resultado = await getProductosCarritoTienda({ ids: idsArray });
    res.json(resultado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// GET /api/tienda/productos/:nb_id
// Todo sale de la DB; descripción, specs y galería los carga syncDetalles()
export async function getProductoDetallado(req, res) {
  try {
    const { nb_id } = req.params
    if (!/^\d+$/.test(nb_id)) {
      return res.status(400).json({ error: 'ID de producto inválido' })
    }

    const producto = await getProductoTienda(nb_id) // ya filtra habilitado = true
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    return res.json({
      ...producto,
      // si el detalle todavía no se sincronizó, al menos mostramos la imagen principal
      imagenes: producto.imagenes.length ? producto.imagenes : [producto.imagen_url].filter(Boolean),
      disponible: producto.stock !== 'Sin stock',
    })
  } catch (err) {
    console.error('getProductoDetallado:', err)
    return res.status(500).json({ error: 'No se pudo obtener el producto' })
  }
}
