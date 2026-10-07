import jwt from 'jsonwebtoken'

export function verificarToken(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Token requerido' })

  const token = header.split(' ')[1]  // "Bearer <token>"

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirados',header })
  }
}