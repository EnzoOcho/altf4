import cron from 'node-cron'
import { syncProductos, syncDetalles } from '../services/sync.js'
import { actualizarTrackings } from '../services/pedidos.js'

// Todos los días a las 3am: primero catálogo/precios/stock, después detalles pendientes
export function iniciarCron() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await syncProductos()
      await syncDetalles()
    } catch (err) {
      console.error('❌ Error en sync automática:', err.message)
    }
  }, { timezone: 'America/Argentina/Buenos_Aires' })

  // Cada 4 horas: seguimiento de pedidos enviados a NB
  cron.schedule('0 */4 * * *', async () => {
    try {
      await actualizarTrackings()
    } catch (err) {
      console.error('❌ Error actualizando trackings:', err.message)
    }
  })
  console.log('⏰ Cron de sync iniciado')
}
