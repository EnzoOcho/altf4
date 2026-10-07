import { Router } from 'express'
import { syncProductos, syncDetalles } from '../services/sync.js'

const router = Router()

//actualizacion de db manual

router.post('/sync', async (req, res) => {
  try {
    const total = await syncProductos()
    res.json({ ok: true, mensaje: `${total} productos sincronizados` })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// Detalle (descripción, specs, galería) de productos habilitados.
// ?forzar=true re-sincroniza todos, aunque estén vigentes
router.post('/sync/detalles', async (req, res) => {
  try {
    const diasVigencia = req.query.forzar === 'true' ? 0 : 7
    const resultado = await syncDetalles({ diasVigencia })
    res.json({ ok: true, ...resultado })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

export default router