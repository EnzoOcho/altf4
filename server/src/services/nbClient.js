// Cliente HTTP para la API de NB.
// - baseURL desde NB_API_URL (en desarrollo: https://api-nb-dev.blu.net.ar/v1)
// - agrega el token en cada request
// - si NB responde 401, renueva el token y reintenta una vez
// - tolera el warning de PHP que a veces antepone el server dev al JSON
import axios from 'axios'
import dotenv from 'dotenv'
import { getNBToken, invalidarNBToken } from './nbAuth.js'
dotenv.config({ quiet: true })

const nb = axios.create({
  baseURL: process.env.NB_API_URL || 'https://api-nb-dev.blu.net.ar/v1',
  timeout: 15000,
  transformResponse: [(data) => {
    if (typeof data !== 'string' || !data.trim()) return data
    try { return JSON.parse(data) } catch { /* sigue abajo */ }
    const inicio = data.search(/[[{]/)
    if (inicio === -1) return data
    try { return JSON.parse(data.slice(inicio)) } catch { return data }
  }],
})

nb.interceptors.request.use(async (config) => {
  config.headers.Authorization = `Bearer ${await getNBToken()}`
  return config
})

nb.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config
    if (err.response?.status === 401 && config && !config._reintento) {
      config._reintento = true
      invalidarNBToken()
      return nb(config)
    }
    const msg = err.response?.data?.msg || err.response?.data?.message || err.message
    const e = new Error(`NB ${config?.method?.toUpperCase()} ${config?.url}: ${msg}`)
    e.status = err.response?.status
    e.data = err.response?.data
    throw e
  }
)

export default nb
