// Envío de emails por SMTP. Si no está configurado, solo loguea (no rompe el flujo).
// Variables en .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL
// Con Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465 y una "contraseña de aplicación".
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({ quiet: true })

const configurado = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const transporter = configurado
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (Number(process.env.SMTP_PORT) || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

export async function enviarEmail({ to, subject, html }) {
  if (!configurado) {
    console.log(`📧 (SMTP sin configurar) "${subject}" → ${to}`)
    return false
  }
  try {
    await transporter.sendMail({ from: `"ALT F4" <${process.env.SMTP_USER}>`, to, subject, html })
    return true
  } catch (err) {
    // un email que falla no debe tirar abajo el pedido
    console.error('❌ Error enviando email:', err.message)
    return false
  }
}

export function enviarEmailAdmin(subject, html) {
  const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  if (!to) {
    console.log(`📧 (sin ADMIN_EMAIL) ${subject}`)
    return Promise.resolve(false)
  }
  return enviarEmail({ to, subject, html })
}
