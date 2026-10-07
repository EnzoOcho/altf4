import { Router } from 'express'
import {
  listarPedidosAdmin, detallePedidoAdmin, marcarPagadoAdmin, enviarANBAdmin,
  resumenPedidosAdmin, marcarPagadoANBAdmin,
} from '../controllers/pedidosController.js'

// Se monta en /api/admin (con verificarToken)
const router = Router()

router.get('/pedidos', listarPedidosAdmin)
router.get('/pedidos/resumen', resumenPedidosAdmin)
router.get('/pedidos/:id', detallePedidoAdmin)
router.post('/pedidos/:id/marcar-pagado', marcarPagadoAdmin) // temporal hasta Mercado Pago
router.post('/pedidos/:id/enviar-nb', enviarANBAdmin)        // reintento si quedó en error_nb
router.post('/pedidos/:id/pagado-nb', marcarPagadoANBAdmin)  // el admin ya le pagó a NB

export default router
