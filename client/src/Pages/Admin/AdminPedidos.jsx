import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import './AdminPedidos.css'

const ESTADOS = {
  pendiente_pago: { label: 'Esperando pago', tono: 'gris' },
  pagado: { label: 'Pagado', tono: 'azul' },
  enviando_a_nb: { label: 'Creando orden NB', tono: 'azul' },
  enviado_a_nb: { label: 'Pagar a NB', tono: 'amarillo' },
  pagado_a_nb: { label: 'Pagado a NB', tono: 'azul' },
  despachado: { label: 'Despachado', tono: 'verde' },
  entregado: { label: 'Entregado', tono: 'verde' },
  cancelado: { label: 'Cancelado', tono: 'gris' },
  error_nb: { label: 'Error NB', tono: 'rojo' },
}

const TABS = [
  { id: 'accion', label: 'Requieren acción', estados: 'enviado_a_nb,error_nb' },
  { id: 'curso', label: 'En curso', estados: 'pagado,enviando_a_nb,pagado_a_nb,despachado' },
  { id: 'pendientes', label: 'Esperando pago', estados: 'pendiente_pago' },
  { id: 'cerrados', label: 'Cerrados', estados: 'entregado,cancelado' },
  { id: 'todos', label: 'Todos', estados: '' },
]

const fmt = (n) => `$${Math.round(Number(n)).toLocaleString('es-AR')}`
const fecha = (d) => new Date(d).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })

function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] ?? { label: estado, tono: 'gris' }
  return <span className={`apd-badge apd-${e.tono}`}>{e.label}</span>
}

export default function AdminPedidos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('accion')
  const [pedidos, setPedidos] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const pedidoAbierto = searchParams.get('pedido')

  async function cargar() {
    setLoading(true)
    try {
      const estados = TABS.find(t => t.id === tab).estados
      const [{ data: lista }, { data: res }] = await Promise.all([
        api.get('/admin/pedidos', { params: estados ? { estado: estados } : {} }),
        api.get('/admin/pedidos/resumen'),
      ])
      setPedidos(lista)
      setResumen(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [tab])

  function abrir(id) { setSearchParams({ pedido: id }) }
  function cerrar() { setSearchParams({}) }

  return (
    <section className="apd">
      <div className="apd-header">
        <h1 className="apd-title">Pedidos</h1>
        <button className="apd-btn apd-btn-ghost" onClick={cargar}>Actualizar</button>
      </div>

      <div className="apd-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`apd-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'accion' && resumen?.pendientesAccion > 0 && (
              <span className="apd-tab-count">{resumen.pendientesAccion}</span>
            )}
          </button>
        ))}
      </div>

      <div className="apd-table-wrap">
        {loading ? (
          <p className="apd-empty">Cargando...</p>
        ) : pedidos.length === 0 ? (
          <p className="apd-empty">
            {tab === 'accion' ? 'Nada pendiente. Todo al día ✔' : 'No hay pedidos.'}
          </p>
        ) : (
          <table className="apd-table">
            <thead>
              <tr>
                <th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Orden NB</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} onClick={() => abrir(p.id)} className={p.estado === 'error_nb' ? 'apd-row-error' : ''}>
                  <td className="apd-mono">#{p.id}</td>
                  <td className="apd-mono">{fecha(p.created_at)}</td>
                  <td>{p.cliente}<div className="apd-sub">{p.email}</div></td>
                  <td className="apd-mono">{fmt(p.total)}</td>
                  <td><EstadoBadge estado={p.estado} /></td>
                  <td className="apd-mono">{p.nb_order_id ? `${p.nb_branch}-${p.nb_order_id}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pedidoAbierto && (
        <DetallePedido id={pedidoAbierto} onClose={cerrar} onCambio={cargar} />
      )}
    </section>
  )
}

function DetallePedido({ id, onClose, onCambio }) {
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState(null)
  const [accionando, setAccionando] = useState(false)
  const [nota, setNota] = useState('')

  async function cargar() {
    setError(null)
    try {
      const { data } = await api.get(`/admin/pedidos/${id}`)
      setPedido(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el pedido')
    }
  }

  useEffect(() => { cargar() }, [id])

  async function accion(url, body) {
    setAccionando(true)
    setError(null)
    try {
      await api.post(url, body)
    } catch (err) {
      setError(err.response?.data?.error || 'La acción falló')
    } finally {
      setAccionando(false)
      await cargar()
      onCambio()
    }
  }

  const costo = pedido?.items.reduce((acc, i) => acc + Number(i.costo_unitario ?? 0) * i.cantidad, 0) ?? 0
  // total NB incluye productos + envío + IVA; si no está, se estima con los costos guardados
  const pagoNB = pedido?.nb_total?.SubtotalPesosArFinal != null
    ? Number(pedido.nb_total.SubtotalPesosArFinal)
    : costo + Number(pedido?.envio ?? 0)
  const margen = pedido ? Number(pedido.total) - pagoNB : 0

  return (
    <div className="apd-overlay" onClick={onClose}>
      <aside className="apd-drawer" onClick={(e) => e.stopPropagation()} aria-label={`Pedido ${id}`}>
        <div className="apd-drawer-head">
          <h2>Pedido #{id}</h2>
          <button className="apd-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {!pedido ? (
          <p className="apd-empty">{error || 'Cargando...'}</p>
        ) : (
          <div className="apd-drawer-body">
            <div className="apd-row-between">
              <EstadoBadge estado={pedido.estado} />
              <span className="apd-sub">{fecha(pedido.created_at)}</span>
            </div>

            {error && <div className="apd-alert apd-alert-rojo">{error}</div>}

            {/* Acción según estado */}
            {pedido.estado === 'enviado_a_nb' && (
              <div className="apd-alert apd-alert-amarillo">
                <strong>Pagale esta orden a NB para que la despachen.</strong>
                <div className="apd-kv"><span>Orden NB</span><strong className="apd-mono">{pedido.nb_branch}-{pedido.nb_order_id}</strong></div>
                <div className="apd-kv">
                  <span>A pagar</span>
                  <strong className="apd-mono">
                    {pedido.nb_total?.SubtotalPesosArFinal != null
                      ? fmt(pedido.nb_total.SubtotalPesosArFinal)
                      : `≈ ${fmt(costo + Number(pedido.envio))} (estimado)`}
                  </strong>
                </div>
                <input
                  className="apd-input"
                  placeholder="Nota (opcional): nro de transferencia, etc."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                />
                <button
                  className="apd-btn apd-btn-primary"
                  disabled={accionando}
                  onClick={() => accion(`/admin/pedidos/${id}/pagado-nb`, { nota })}
                >
                  {accionando ? 'Guardando...' : 'Ya le pagué a NB'}
                </button>
              </div>
            )}

            {pedido.estado === 'error_nb' && (
              <div className="apd-alert apd-alert-rojo">
                <strong>No se pudo crear la orden en NB.</strong>
                <p className="apd-mono apd-error-msg">{pedido.error}</p>
                <p>Si es falta de stock, devolvé el pago al cliente. Si fue un error temporal, reintentá.</p>
                <button
                  className="apd-btn apd-btn-primary"
                  disabled={accionando}
                  onClick={() => accion(`/admin/pedidos/${id}/enviar-nb`)}
                >
                  {accionando ? 'Reintentando...' : 'Reintentar en NB'}
                </button>
              </div>
            )}

            {pedido.estado === 'pendiente_pago' && (
              <div className="apd-alert">
                <p>El cliente todavía no pagó.</p>
                {/* Temporal hasta integrar Mercado Pago (simula el webhook) */}
                <button
                  className="apd-btn apd-btn-ghost"
                  disabled={accionando}
                  onClick={() => accion(`/admin/pedidos/${id}/marcar-pagado`)}
                >
                  {accionando ? 'Creando orden en NB...' : 'Marcar como pagado (prueba)'}
                </button>
              </div>
            )}

            {pedido.estado === 'pagado_a_nb' && (
              <div className="apd-alert apd-alert-verde">
                Pagado a NB el {fecha(pedido.pagado_nb_at)}
                {pedido.pagado_nb_nota && <> · {pedido.pagado_nb_nota}</>}. Esperando despacho.
              </div>
            )}

            {/* Productos */}
            <h3 className="apd-section">Productos</h3>
            <ul className="apd-items">
              {pedido.items.map(i => (
                <li key={i.id}>
                  <span>{i.cantidad} × {i.titulo}<span className="apd-sub"> NB #{i.nb_id}</span></span>
                  <span className="apd-mono">{fmt(i.precio_unitario * i.cantidad)}</span>
                </li>
              ))}
            </ul>
            <div className="apd-totales">
              <div className="apd-kv"><span>Subtotal</span><span className="apd-mono">{fmt(pedido.subtotal)}</span></div>
              <div className="apd-kv"><span>Envío ({pedido.envio_descripcion})</span><span className="apd-mono">{fmt(pedido.envio)}</span></div>
              <div className="apd-kv apd-total"><span>Total cobrado</span><span className="apd-mono">{fmt(pedido.total)}</span></div>
              <div className="apd-kv apd-sub">
                <span>{pedido.nb_total ? 'Pago a NB (con envío)' : 'Pago a NB estimado'}</span>
                <span className="apd-mono">{fmt(pagoNB)}</span>
              </div>
              <div className="apd-kv apd-sub"><span>Ganancia</span><span className="apd-mono">{fmt(margen)}</span></div>
            </div>

            {/* Cliente */}
            <h3 className="apd-section">Cliente</h3>
            <div className="apd-kv"><span>Nombre</span><span>{pedido.cliente.nombre} {pedido.cliente.apellido}</span></div>
            <div className="apd-kv"><span>Email</span><a href={`mailto:${pedido.cliente.email}`}>{pedido.cliente.email}</a></div>
            <div className="apd-kv"><span>Teléfono</span><span>{pedido.cliente.telefono}</span></div>
            <div className="apd-kv"><span>DNI/CUIT</span><span className="apd-mono">{pedido.cliente.dni_cuit}</span></div>

            <h3 className="apd-section">Envío</h3>
            <p>
              {pedido.direccion.direccion} {pedido.direccion.piso_depto}<br />
              {pedido.direccion.localidad} · CP {pedido.direccion.codigo_postal}
            </p>
            <p className="apd-sub">{pedido.envio_descripcion} · {pedido.envio_plazo}</p>

            {pedido.tracking && (
              <>
                <h3 className="apd-section">Seguimiento NB</h3>
                <pre className="apd-pre">{JSON.stringify(pedido.tracking, null, 2)}</pre>
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
