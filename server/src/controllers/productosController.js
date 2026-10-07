import { getCategorias, getProductos, updatePrecio, updateProducto } from '../services/getProductosDb.js'
import { syncProductos } from '../services/sync.js'

export async function listarProductos(req, res) {
  try {
    const { page, limit, busqueda, categoria, ordenBy, productosTienda, onlyStock } = req.query
    const resultado = await getProductos({ page, limit, busqueda, categoria, ordenBy , productosTienda: productosTienda === 'false', onlyStock: onlyStock === 'false'})
    res.json(resultado)
  } catch (err) {
    console.error("error en productos: ", err )
    res.status(500).json({ error: err.message })
  }
}

export async function editarProducto(req, res) {
  try {
    const { nb_id } = req.params
    const producto = await updateProducto(nb_id, req.body)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(producto)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listarCategorias(req, res) {
  try {
    const categorias = await getCategorias();
    res.json(categorias)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function actualizarPrecios(req, res) {
  try {
    console.log("loao")
  const productos =   await updatePrecio();
    res.json(productos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function actualizarProductos(req, res) {
  try {
    console.log("inicio")
     await syncProductos()
     console.log("medio")
    await updatePrecio()
    console.log("final")
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}