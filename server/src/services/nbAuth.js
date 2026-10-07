let tokenCache = null
let tokenExpiry = null

// El server dev de NB a veces antepone un warning de PHP al JSON: se limpia abajo
let loginEnCurso = null

export function invalidarNBToken() {
  tokenCache = null
  tokenExpiry = null
}

export async function getNBToken() {
  if (tokenCache && tokenExpiry && Date.now() < tokenExpiry) {
    return tokenCache
  }
  // si ya hay un login en curso (varios requests a la vez), esperar ese en vez de loguear de nuevo
  if (!loginEnCurso) {
    loginEnCurso = loginNB().finally(() => { loginEnCurso = null })
  }
  return loginEnCurso
}

async function loginNB() {
  try {
    const res = await fetch(`${process.env.NB_API_URL || 'https://api-nb-dev.blu.net.ar/v1'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: process.env.NB_USER,
        password: process.env.NB_PASS,
        mode: 'api'
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.log("STATUS:", res.status, "BODY:", errText)
      throw new Error('Error al autenticar con NB')
    }

    const rawText = await res.text()

    // Buscamos el primer '{' — ahí empieza el JSON real, ignorando el warning de PHP
    const jsonStart = rawText.indexOf('{')
    
    if (jsonStart === -1) {
      console.log("RAW RESPONSE (sin JSON detectable):", rawText)
      throw new Error('NB no devolvió JSON válido')
    }
    
    const cleanJson = rawText.slice(jsonStart)
    
    let data
    try {
      data = JSON.parse(cleanJson)
    } catch (e) {
      console.log("RAW RESPONSE:", rawText)
      throw new Error('No se pudo parsear el JSON de NB, incluso después de limpiar')
    }
    
    if (!data.token) throw new Error('NB no devolvió token en el login')
    tokenCache = data.token
    tokenExpiry = Date.now() + 1000 * 60 * 60 * 3
    return tokenCache

  } catch (err) {
    console.error("ERROR EN getNBToken:", err)
    throw err
  }
}