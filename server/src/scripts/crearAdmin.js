// Crea un usuario admin. Las credenciales se pasan al ejecutar, nunca quedan en el código.
// Uso: node src/scripts/crearAdmin.js <email> <contraseña>
import bcrypt from 'bcrypt'
import pool from '../db/pool.js'

const [email, password] = process.argv.slice(2)

if (!email || !password) {
  console.error('Uso: node src/scripts/crearAdmin.js <email> <contraseña>')
  process.exit(1)
}
if (password.length < 10) {
  console.error('❌ La contraseña tiene que tener al menos 10 caracteres')
  process.exit(1)
}

try {
  const hash = await bcrypt.hash(password, 10)
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
    [email.trim().toLowerCase(), hash]
  )
  console.log('✅ Admin creado')
} catch (err) {
  console.error('❌ Error creando admin:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
