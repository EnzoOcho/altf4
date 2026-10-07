import { Router } from 'express'
// import { listarProductos, editarProducto, listarCategorias } from '../controllers/productosController.js'
import { listarCategorias, editarCategorias, editarUnaCategoria} from '../controllers/categoriasController.js'
import { syncCategorias } from '../services/categoriasQueryes.js'
//molde

const router = Router()

router.get('/categorias/sync', syncCategorias)

router.get('/categorias', listarCategorias)

router.patch('/categorias/single/:id', editarUnaCategoria)
router.patch('/categorias/:id', editarCategorias)

// router.get('/productos/categorias', listarCategorias)


export default router