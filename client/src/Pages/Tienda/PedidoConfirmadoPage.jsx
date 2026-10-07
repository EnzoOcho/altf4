import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../../components/Checkout/Checkout.css'

const fmt = (n) => `$${Math.round(Number(n)).toLocaleString('es-AR')}`

// Llega desde el checkout con el pedido en location.state.
// Si se entra directo (o se recarga), no hay datos: se muestra un mensaje genérico.
export default function PedidoConfirmadoPage() {
  const { state } = useLocation()
  const pedido = state?.pedido

  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (!pedido) {
    return (
      <main className="ck">
        <div className="ck-vacio">
          <i className="ti ti-circle-check" aria-hidden="true" />
          <p>Si hiciste un pedido, te vamos a contactar por email con los próximos pasos.</p>
          <Link to="/productos" className="ck-btn ck-btn-primary">Seguir comprando</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="ck">
      <div className="ck-confirmado">
        <div className="ck-check" aria-hidden="true"><i className="ti ti-check" /></div>
        <h1>¡Recibimos tu pedido!</h1>
        <p className="ck-pedido-nro">Pedido <strong>#{pedido.id}</strong></p>

        {/* TODO: cuando esté Mercado Pago, acá se redirige al pago en vez de este aviso */}
        <div className="ck-aviso">
          <i className="ti ti-info-circle" aria-hidden="true" />
          <p>
            Te vamos a escribir a <strong>{state.email}</strong> con los datos para el pago.
            Cuando se acredite, despachamos tu pedido.
          </p>
        </div>

        <div className="ck-card ck-resumen">
          <ul className="ck-items">
            {pedido.items.map(i => (
              <li key={i.nb_id}>
                <span className="ck-item-name">{i.cantidad} × {i.titulo}</span>
                <span className="ck-item-price">{fmt(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="ck-totales">
            <div><span>Subtotal</span><span>{fmt(pedido.subtotal)}</span></div>
            <div><span>Envío · {pedido.envio_descripcion}</span><span>{fmt(pedido.envio)}</span></div>
            <div className="ck-total"><span>Total</span><span>{fmt(pedido.total)}</span></div>
          </div>
          <p className="ck-hint">Entrega estimada: {pedido.envio_plazo}</p>
        </div>

        <Link to="/productos" className="ck-btn ck-btn-outline">Seguir comprando</Link>
      </div>
    </main>
  )
}
