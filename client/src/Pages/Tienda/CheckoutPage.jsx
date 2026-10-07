import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useCart } from '../../services/CartContext'
import '../../components/Checkout/Checkout.css'

const fmt = (n) => `$${Math.round(Number(n)).toLocaleString('es-AR')}`

const CP_VALIDO = /^([A-Za-z]\d{4}[A-Za-z]{3}|\d{4})$/
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// mismas reglas que el server (services/pedidos.js), para avisar antes de enviar
function validar(f) {
  const e = {}
  if (!EMAIL_VALIDO.test(f.email.trim())) e.email = 'Ingresá un email válido'
  if (!f.nombre.trim()) e.nombre = 'Requerido'
  if (!f.apellido.trim()) e.apellido = 'Requerido'
  if (f.telefono.replace(/\D/g, '').length < 6) e.telefono = 'Ingresá un teléfono válido'
  if (!/^\d{7,11}$/.test(f.dni_cuit.replace(/\D/g, ''))) e.dni_cuit = 'DNI (7-8 dígitos) o CUIT (11 dígitos)'
  if (!f.provincia_id) e.provincia_id = 'Elegí una provincia'
  if (!f.localidad.trim()) e.localidad = 'Requerido'
  if (!CP_VALIDO.test(f.codigo_postal.trim())) e.codigo_postal = 'Ej: 1407 o C1407ABC'
  if (f.direccion.trim().length < 3) e.direccion = 'Calle y altura'
  return e
}

const FORM_VACIO = {
  email: '', nombre: '', apellido: '', telefono: '', dni_cuit: '',
  provincia_id: '', localidad: '', codigo_postal: '', direccion: '', piso_depto: '',
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()

  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [provincias, setProvincias] = useState([])

  const [form, setForm] = useState(FORM_VACIO)
  const [tocados, setTocados] = useState({})
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  const [envio, setEnvio] = useState({ estado: 'idle', opciones: [], error: null })
  const [carrierId, setCarrierId] = useState(null)

  const [enviando, setEnviando] = useState(false)
  const [errorServer, setErrorServer] = useState(null)

  // ---------- datos iniciales ----------

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    api.get('/tienda/provincias').then(({ data }) => setProvincias(data)).catch(() => setProvincias([]))
  }, [])

  useEffect(() => {
    if (cart.length === 0) { setCargandoProductos(false); return }
    api.get('/tienda/productos/carrito', { params: { ids: cart.map(i => i.productId) } })
      .then(({ data }) => setProductos(data))
      .finally(() => setCargandoProductos(false))
  }, []) // solo al entrar: el carrito no se edita desde acá

  // items del carrito que siguen a la venta, con su precio actual
  const items = useMemo(() => cart
    .map(c => {
      const p = productos.find(p => Number(p.nb_id) === Number(c.productId))
      return p ? { ...p, cantidad: c.qty } : null
    })
    .filter(Boolean), [cart, productos])

  const noDisponibles = cart.length - items.length
  const subtotal = items.reduce((acc, i) => acc + Number(i.precio_venta) * i.cantidad, 0)
  const opcionElegida = envio.opciones.find(o => o.carrierId === carrierId)
  const total = subtotal + (opcionElegida ? Number(opcionElegida.total) : 0)

  // ---------- cotización de envío (al tener un CP válido) ----------

  const cp = form.codigo_postal.trim()
  useEffect(() => {
    if (!CP_VALIDO.test(cp) || items.length === 0) {
      setEnvio({ estado: 'idle', opciones: [], error: null })
      setCarrierId(null)
      return
    }
    let cancelado = false
    setEnvio(e => ({ ...e, estado: 'cargando', error: null }))
    const t = setTimeout(async () => {
      try {
        const { data } = await api.post('/tienda/envio/cotizar', {
          codigo_postal: cp,
          items: items.map(i => ({ nb_id: i.nb_id, cantidad: i.cantidad })),
        })
        if (cancelado) return
        setEnvio({ estado: 'ok', opciones: data.opciones, error: null })
        // preseleccionar la más barata
        const masBarata = [...data.opciones].sort((a, b) => a.total - b.total)[0]
        setCarrierId(masBarata?.carrierId ?? null)
      } catch (err) {
        if (cancelado) return
        setEnvio({ estado: 'error', opciones: [], error: err.response?.data?.error || 'No pudimos cotizar el envío' })
        setCarrierId(null)
      }
    }, 500)
    return () => { cancelado = true; clearTimeout(t) }
  }, [cp, items.length])

  // ---------- form ----------

  const errores = validar(form)
  const mostrarError = (campo) => (tocados[campo] || intentoEnviar) && errores[campo]

  function cambiar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }
  function tocar(e) {
    setTocados(t => ({ ...t, [e.target.name]: true }))
  }

  async function confirmar(e) {
    e.preventDefault()
    setIntentoEnviar(true)
    setErrorServer(null)
    const primerError = Object.keys(FORM_VACIO).find(campo => errores[campo])
    if (primerError) {
      document.getElementById(`ck-${primerError}`)?.focus()
      return
    }
    if (!carrierId) {
      setErrorServer('Elegí una opción de envío')
      return
    }

    setEnviando(true)
    try {
      const { data: pedido } = await api.post('/tienda/pedidos', {
        cliente: {
          email: form.email, nombre: form.nombre, apellido: form.apellido,
          telefono: form.telefono, dni_cuit: form.dni_cuit,
        },
        direccion: {
          direccion: form.direccion, piso_depto: form.piso_depto, localidad: form.localidad,
          provincia_id: Number(form.provincia_id), codigo_postal: cp,
        },
        items: items.map(i => ({ nb_id: i.nb_id, cantidad: i.cantidad })),
        carrier_id: carrierId,
      })
      clearCart()
      navigate('/pedido-confirmado', { replace: true, state: { pedido, email: form.email } })
    } catch (err) {
      setErrorServer(err.response?.data?.error || 'No pudimos crear tu pedido. Probá de nuevo en un rato.')
    } finally {
      setEnviando(false)
    }
  }

  // ---------- render ----------

  if (!cargandoProductos && items.length === 0) {
    return (
      <main className="ck">
        <div className="ck-vacio">
          <i className="ti ti-shopping-cart" aria-hidden="true" />
          <p>{cart.length ? 'Los productos de tu carrito ya no están disponibles.' : 'Tu carrito está vacío.'}</p>
          <Link to="/productos" className="ck-btn ck-btn-primary">Ver productos</Link>
        </div>
      </main>
    )
  }

  const campo = (name, label, props = {}) => (
    <div className={`ck-field${mostrarError(name) ? ' ck-invalid' : ''}${props.ancho ? ` ck-${props.ancho}` : ''}`}>
      <label htmlFor={`ck-${name}`}>{label}</label>
      <input
        id={`ck-${name}`}
        name={name}
        value={form[name]}
        onChange={cambiar}
        onBlur={tocar}
        aria-invalid={Boolean(mostrarError(name))}
        {...props.input}
      />
      {mostrarError(name) && <span className="ck-error">{errores[name]}</span>}
    </div>
  )

  return (
    <main className="ck">
      <div className="ck-top">
        <Link to="/cart" className="ck-back" aria-label="Volver al carrito">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </Link>
        <h1 className="ck-title">Finalizar compra</h1>
      </div>

      <form className="ck-body" onSubmit={confirmar} noValidate>
        <div className="ck-left">
          {/* 1. Datos */}
          <section className="ck-card">
            <h2 className="ck-card-title"><span>1</span> Tus datos</h2>
            <div className="ck-grid">
              {campo('email', 'Email', { ancho: 'full', input: { type: 'email', autoComplete: 'email', placeholder: 'tu@email.com' } })}
              {campo('nombre', 'Nombre', { input: { autoComplete: 'given-name' } })}
              {campo('apellido', 'Apellido', { input: { autoComplete: 'family-name' } })}
              {campo('telefono', 'Teléfono', { input: { type: 'tel', autoComplete: 'tel', placeholder: '11 1234 5678' } })}
              {campo('dni_cuit', 'DNI o CUIT', { input: { inputMode: 'numeric', placeholder: 'Para la factura' } })}
            </div>
          </section>

          {/* 2. Dirección */}
          <section className="ck-card">
            <h2 className="ck-card-title"><span>2</span> Dirección de entrega</h2>
            <div className="ck-grid">
              <div className={`ck-field${mostrarError('provincia_id') ? ' ck-invalid' : ''}`}>
                <label htmlFor="ck-provincia_id">Provincia</label>
                <select
                  id="ck-provincia_id"
                  name="provincia_id"
                  value={form.provincia_id}
                  onChange={cambiar}
                  onBlur={tocar}
                  aria-invalid={Boolean(mostrarError('provincia_id'))}
                >
                  <option value="">Elegí…</option>
                  {provincias.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
                </select>
                {mostrarError('provincia_id') && <span className="ck-error">{errores.provincia_id}</span>}
              </div>
              {campo('localidad', 'Localidad', { input: { autoComplete: 'address-level2' } })}
              {campo('direccion', 'Calle y altura', { input: { autoComplete: 'address-line1', placeholder: 'Av. Rivadavia 5000' } })}
              {campo('piso_depto', 'Piso / Depto (opcional)', { input: { autoComplete: 'address-line2' } })}
              {campo('codigo_postal', 'Código postal', { input: { autoComplete: 'postal-code', placeholder: '1407' } })}
            </div>
          </section>

          {/* 3. Envío */}
          <section className="ck-card">
            <h2 className="ck-card-title"><span>3</span> Envío</h2>
            {envio.estado === 'idle' && (
              <p className="ck-hint">Ingresá tu código postal para ver las opciones de envío.</p>
            )}
            {envio.estado === 'cargando' && <p className="ck-hint">Calculando envío…</p>}
            {envio.estado === 'error' && <p className="ck-error-box">{envio.error}</p>}
            {envio.estado === 'ok' && envio.opciones.length === 0 && (
              <p className="ck-error-box">No hay envíos disponibles a ese código postal.</p>
            )}
            {envio.estado === 'ok' && envio.opciones.length > 0 && (
              <div className="ck-envios" role="radiogroup" aria-label="Opciones de envío">
                {envio.opciones.map(o => (
                  <label key={o.carrierId} className={`ck-envio${carrierId === o.carrierId ? ' active' : ''}`}>
                    <input
                      type="radio"
                      name="envio"
                      checked={carrierId === o.carrierId}
                      onChange={() => setCarrierId(o.carrierId)}
                    />
                    <span className="ck-envio-info">
                      <strong>{o.descripcion}</strong>
                      <span>Llega {o.plazo}</span>
                    </span>
                    <span className="ck-envio-precio">{fmt(o.total)}</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Resumen */}
        <aside className="ck-right">
          <div className="ck-card ck-resumen">
            <h2 className="ck-card-title">Resumen</h2>
            {cargandoProductos ? (
              <p className="ck-hint">Cargando…</p>
            ) : (
              <ul className="ck-items">
                {items.map(i => (
                  <li key={i.nb_id}>
                    <img src={i.imagen_url} alt="" />
                    <span className="ck-item-name">{i.cantidad} × {i.titulo}</span>
                    <span className="ck-item-price">{fmt(i.precio_venta * i.cantidad)}</span>
                  </li>
                ))}
              </ul>
            )}
            {noDisponibles > 0 && (
              <p className="ck-warn">
                {noDisponibles === 1 ? '1 producto de tu carrito ya no está disponible' : `${noDisponibles} productos de tu carrito ya no están disponibles`} y no se incluye.
              </p>
            )}

            <div className="ck-totales">
              <div><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div><span>Envío</span><span>{opcionElegida ? fmt(opcionElegida.total) : '—'}</span></div>
              <div className="ck-total"><span>Total</span><span>{fmt(total)}</span></div>
            </div>

            {errorServer && <p className="ck-error-box" role="alert">{errorServer}</p>}

            <button
              type="submit"
              className="ck-btn ck-btn-primary"
              disabled={enviando || cargandoProductos || envio.estado === 'cargando'}
            >
              <i className="ti ti-lock" aria-hidden="true" />
              {enviando ? 'Confirmando…' : 'Confirmar pedido'}
            </button>
            <p className="ck-legal">Tus datos se usan solo para procesar y enviar tu pedido.</p>
          </div>
        </aside>
      </form>
    </main>
  )
}
