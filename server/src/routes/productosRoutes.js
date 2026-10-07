import { Router } from 'express'
import { listarProductos, editarProducto, listarCategorias, actualizarPrecios, actualizarProductos } from '../controllers/productosController.js'
import { syncProductos } from '../services/sync.js'

const router = Router()

router.get('/productos/sync', syncProductos)

//actualizar inventario y precios
router.get('/productos/actualizar', actualizarProductos)

router.get('/productos', listarProductos)
router.get('/productos/categorias', listarCategorias)

router.patch('/productos/precios', actualizarPrecios)
router.patch('/productos/:nb_id', editarProducto)


export default router