// NB tiene UN solo carrito activo por cuenta: si dos pedidos se arman a la vez,
// los productos se mezclan. Esta cola garantiza que se procese de a uno.
//
// Usa un advisory lock de Postgres, así también funciona si algún día corren
// varias instancias del server (o el cron y un request al mismo tiempo).
import pool from '../db/pool.js'

const LOCK_CARRITO_NB = 7240001 // número arbitrario, identifica este lock

export async function conCarritoNB(fn) {
  const client = await pool.connect()
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_CARRITO_NB])
    try {
      return await fn()
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [LOCK_CARRITO_NB])
    }
  } finally {
    client.release()
  }
}
