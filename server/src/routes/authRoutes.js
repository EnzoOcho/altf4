import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    )

    const admin = rows[0]
    if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' })

    const passwordOk = await bcrypt.compare(password, admin.password_hash)
    if (!passwordOk) return res.status(401).json({ error: 'Credenciales inválidas' })

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    )

    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router