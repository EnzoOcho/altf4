import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Antes de cada request, agarra el token del localStorage y lo agrega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el server responde 401, borra el token y manda al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api