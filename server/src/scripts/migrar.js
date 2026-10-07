// Corre todas las migraciones de src/db/migrations en orden.
// Son idempotentes (IF NOT EXISTS), se pueden correr más de una vez.
// Uso: node src/scripts/migrar.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../db/pool.js'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations')

try {
  for (const archivo of fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    await pool.query(fs.readFileSync(path.join(dir, archivo), 'utf8'))
    console.log(`✅ ${archivo}`)
  }
} catch (err) {
  console.error('❌ Error en migración:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
