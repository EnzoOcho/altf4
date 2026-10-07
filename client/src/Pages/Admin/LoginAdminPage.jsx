import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import "./LoginPage.css"

export default function LoginAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleLogin() {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('admin_token', data.token)
      navigate('/admin')
    } catch {
      setError('Credenciales inválidas')
    }
  }

  return (
    <section className="login_page" >
      <div className="form_box">
        <div className="signin_icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="#db2777" d="M5 7h6v2H7v2h3v2H7v4H5zm8 0h2v4h2V7h2v10h-2v-4h-4z" /></svg>
        </div>
        <h1 className="text-xl font-bold">Panel Admin</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="submit_btn"
        >
          Ingresar
        </button>
      </div>
    </section>
  )
}