import pool from '../db/pool.js'
import { conCarritoNB } from './colaNB.js'
import {
  cotizarEnvio, crearCarritoNuevo, agregarItemsCarrito, getDisponibilidadCarrito,
  crearDireccionNB, calcularEnvioCarrito, procesarCarrito, getTrackingOrden, getTotalOrden,
} from './nbCompra.js'
import { enviarEmailAdmin } from './email.js'

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173/admin/pedidos'

// medioDePagoId con el que le compramos a NB (3 = Depósito en Banco). Confirmar con el ejecutivo.
const NB_MEDIO_PAGO_ID = Number(process.env.NB_MEDIO_PAGO_ID) || 3
const MAX_CANTIDAD_POR_ITEM = 20

export class ErrorValidacion extends Error {
  constructor(msg) { super(msg); this.status = 400 }
}

// ---------- Validación ----------

function texto(v, campo, { min = 1, max = 200 } = {}) {
  const s = String(v ?? '').trim()
  if (s.length < min || s.length > max) throw new ErrorValidacion(`Campo inválido: ${campo}`)
  return s
}

function validarItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new ErrorValidacion('El carrito está vacío')
  // agrupa por nb_id por si viene repetido
  const porId = new Map()
  for (const i of items) {
    const nb_id = Number(i?.nb_id)
    const cantidad = Number(i?.cantidad)
    if (!Number.isInteger(nb_id) || !Number.isInteger(cantidad) || cantidad < 1) {
      throw new ErrorValidacion('Item de carrito inválido')
    }
    porId.set(nb_id, (porId.get(nb_id) ?? 0) + cantidad)
  }
  return [...porId].map(([nb_id, cantidad]) => {
    if (cantidad > MAX_CANTIDAD_POR_ITEM) throw new ErrorValidacion(`Máximo ${MAX_CANTIDAD_POR_ITEM} unidades por producto`)
    return { nb_id, cantidad }
  })
}

function validarCodigoPostal(cp) {
  const s = String(cp ?? '').trim().toUpperCase()
  // acepta "1407" o CPA "C1407ABC"
  if (!/^([A-Z]\d{4}[A-Z]{3}|\d{4})$/.test(s)) throw new ErrorValidacion('Código postal inválido')
  return s
}

// Productos habilitados, con precio y stock, desde nuestra DB (nunca confiar en precios del cliente)
async function getProductosParaVenta(items, db = pool) {
  const { rows } = await db.query(`
    SELECT nb_id, COALESCE(titulo_custom, titulo) AS titulo, precio_venta, stock,
           ROUND(semi_final_price * cotizacion, 2) AS costo_ars
    FROM productos
    WHERE habilitado = true AND nb_id = ANY($1)
  `, [items.map(i => i.nb_id)])

  const porId = new Map(rows.map(r => [Number(r.nb_id), r]))
  return items.map(i => {
    const p = porId.get(i.nb_id)
    if (!p || p.precio_venta == null) throw new ErrorValidacion(`El producto ${i.nb_id} no está disponible`)
    if (p.stock === 'Sin stock') throw new ErrorValidacion(`"${p.titulo}" no tiene stock`)
    return { ...i, titulo: p.titulo, precio_unitario: Number(p.precio_venta), costo_unitario: p.costo_ars }
  })
}

// ---------- Cotización (checkout, antes de pagar) ----------

export async function cotizarEnvioPedido({ codigo_postal, items }) {
  const cp = validarCodigoPostal(codigo_postal)
  const itemsOk = validarItems(items)
  await getProductosParaVenta(itemsOk) // valida que existan y tengan stock
  const { opciones, estimado } = await cotizarEnvio(cp, itemsOk)
  return { opciones, estimado }
}

// ---------- Crear pedido (queda en pendiente_pago) ----------

export async function crearPedido({ cliente, direccion, items, carrier_id }) {
  const c = {
    email: texto(cliente?.email, 'email', { max: 254 }).toLowerCase(),
    nombre: texto(cliente?.nombre, 'nombre', { max: 80 }),
    apellido: texto(cliente?.apellido, 'apellido', { max: 80 }),
    telefono: texto(cliente?.telefono, 'teléfono', { min: 6, max: 30 }),
    dni_cuit: texto(cliente?.dni_cuit, 'DNI/CUIT', { min: 7, max: 13 }).replace(/\D/g, ''),
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) throw new ErrorValidacion('Email inválido')
  if (!/^\d{7,11}$/.test(c.dni_cuit)) throw new ErrorValidacion('DNI/CUIT inválido')

  const d = {
    direccion: texto(direccion?.direccion, 'dirección', { min: 3, max: 120 }),
    piso_depto: String(direccion?.piso_depto ?? '').trim().slice(0, 30) || null,
    localidad: texto(direccion?.localidad, 'localidad', { max: 80 }),
    provincia_id: Number(direccion?.provincia_id),
    codigo_postal: validarCodigoPostal(direccion?.codigo_postal),
  }
  if (!Number.isInteger(d.provincia_id)) throw new ErrorValidacion('Provincia inválida')

  const itemsOk = validarItems(items)
  const productos = await getProductosParaVenta(itemsOk)

  // re-cotizar del lado del server: el precio del envío no puede venir del cliente
  const { opciones } = await cotizarEnvio(d.codigo_postal, itemsOk)
  const envio = opciones.find(o => o.carrierId === Number(carrier_id))
  if (!envio) throw new ErrorValidacion('La opción de envío elegida ya no está disponible, volvé a cotizar')

  const subtotal = productos.reduce((acc, p) => acc + p.precio_unitario * p.cantidad, 0)
  const total = subtotal + Number(envio.total)

  const db = await pool.connect()
  try {
    await db.query('BEGIN')

    // invitado: si el email ya existe, actualizamos sus datos de contacto
    const { rows: [{ id: clienteId }] } = await db.query(`
      INSERT INTO clientes (email, nombre, apellido, telefono, dni_cuit)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido,
        telefono = EXCLUDED.telefono, dni_cuit = EXCLUDED.dni_cuit
      RETURNING id
    `, [c.email, c.nombre, c.apellido, c.telefono, c.dni_cuit])

    const { rows: [{ id: direccionId }] } = await db.query(`
      INSERT INTO direcciones (cliente_id, direccion, piso_depto, localidad, provincia_id, codigo_postal)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [clienteId, d.direccion, d.piso_depto, d.localidad, d.provincia_id, d.codigo_postal])

    const { rows: [pedido] } = await db.query(`
      INSERT INTO pedidos (cliente_id, direccion_id, subtotal, envio, total,
                           envio_carrier_id, envio_descripcion, envio_plazo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, estado, subtotal, envio, total, envio_descripcion, envio_plazo
    `, [clienteId, direccionId, subtotal, envio.total, total, envio.carrierId, envio.descripcion, envio.plazo])

    for (const p of productos) {
      await db.query(`
        INSERT INTO pedido_items (pedido_id, nb_id, titulo, cantidad, precio_unitario, costo_unitario)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [pedido.id, p.nb_id, p.titulo, p.cantidad, p.precio_unitario, p.costo_unitario])
    }

    await db.query('COMMIT')
    return { ...pedido, items: productos.map(({ costo_unitario, ...p }) => p) }
  } catch (err) {
    await db.query('ROLLBACK')
    throw err
  } finally {
    db.release()
  }
}

// ---------- Enviar pedido pagado a NB ----------

// Arma el carrito en NB y lo procesa con dropshipping (marca blanca).
// Solo para pedidos 'pagado' o 'error_nb' (reintento). Se ejecuta de a uno (colaNB).
export async function enviarPedidoANB(pedidoId) {
  // "reclamar" el pedido: evita que dos llamadas lo procesen a la vez
  const { rows: [reclamado] } = await pool.query(`
    UPDATE pedidos SET estado = 'enviando_a_nb', error = NULL, updated_at = NOW()
    WHERE id = $1 AND estado IN ('pagado', 'error_nb')
    RETURNING id
  `, [pedidoId])
  if (!reclamado) {
    throw new ErrorValidacion('El pedido no existe o no está en estado "pagado" / "error_nb"')
  }

  try {
    return await conCarritoNB(async () => {
      const { rows: [p] } = await pool.query(`
        SELECT p.id, p.envio_carrier_id,
               c.nombre, c.apellido, c.email, c.telefono,
               d.id AS direccion_id, d.direccion, d.piso_depto, d.localidad,
               d.provincia_id, d.codigo_postal, d.nb_direccion_id
        FROM pedidos p
        JOIN clientes c ON c.id = p.cliente_id
        JOIN direcciones d ON d.id = p.direccion_id
        WHERE p.id = $1
      `, [pedidoId])
      const { rows: items } = await pool.query(
        'SELECT nb_id, cantidad FROM pedido_items WHERE pedido_id = $1', [pedidoId]
      )

      // 1. carrito nuevo con los items
      await crearCarritoNuevo()
      await agregarItemsCarrito(items)

      // 2. verificar disponibilidad real
      const disponibilidad = await getDisponibilidadCarrito()
      const faltantes = items.filter(i => {
        const d = disponibilidad.find(x => Number(x.id) === Number(i.nb_id))
        return !d || Number(d.availability) < i.cantidad
      })
      if (faltantes.length) {
        throw new Error(`Sin disponibilidad en NB para: ${faltantes.map(f => f.nb_id).join(', ')}`)
      }

      // 3. dirección del cliente en NB (se reutiliza si ya existe)
      let nbDireccionId = p.nb_direccion_id
      if (!nbDireccionId) {
        nbDireccionId = await crearDireccionNB({
          direccion: [p.direccion, p.piso_depto].filter(Boolean).join(' '),
          telefono: p.telefono,
          codigoPostal: p.codigo_postal,
          provinciaId: p.provincia_id,
          localidad: p.localidad,
        })
        await pool.query('UPDATE direcciones SET nb_direccion_id = $1 WHERE id = $2', [nbDireccionId, p.direccion_id])
      }

      // 4. cotización sobre el carrito: confirma el transporte y da el datosBulto exacto
      const envio = await calcularEnvioCarrito(p.codigo_postal, nbDireccionId)
      const transporte = (envio.cotizacion ?? []).find(t => Number(t.id) === Number(p.envio_carrier_id))
      if (!transporte) throw new Error(`El transporte ${p.envio_carrier_id} ya no está disponible para este envío`)

      // 5. procesar
      const respuesta = await procesarCarrito({
        note: `ALT F4 - pedido #${p.id}`,
        medioDePagoId: NB_MEDIO_PAGO_ID,
        dropShipping: true,
        codigoPostalFavorito: p.codigo_postal,
        mediodeEnvioId: Number(p.envio_carrier_id),
        idDirCli: String(nbDireccionId),
        datosBultos: envio.datosBulto,
        dpPayload: {
          clientName: `${p.nombre} ${p.apellido}`,
          clientEmail: p.email,
        },
        // TODO: salePriceItems para informar nuestro precio de venta en el remito.
        // Confirmar con NB en qué moneda va (los ejemplos parecen USD).
      })

      await pool.query(`
        UPDATE pedidos SET estado = 'enviado_a_nb', nb_branch = $2, nb_order_id = $3,
                           nb_respuesta = $4, updated_at = NOW()
        WHERE id = $1
      `, [pedidoId, respuesta.branch, respuesta.orderId, respuesta])

      return { pedidoId, nb_branch: respuesta.branch, nb_order_id: respuesta.orderId, nb_status: respuesta.status }
    })
  } catch (err) {
    await pool.query(
      `UPDATE pedidos SET estado = 'error_nb', error = $2, updated_at = NOW() WHERE id = $1`,
      [pedidoId, err.message]
    )
    throw err
  }
}

// ---------- Seguimiento ----------

// Guarda la respuesta cruda del tracking de NB. Los cambios de estado
// (despachado / entregado) se definen cuando veamos qué devuelve NB realmente.
export async function actualizarTrackings() {
  const { rows } = await pool.query(`
    SELECT id, nb_branch, nb_order_id FROM pedidos
    WHERE estado IN ('pagado_a_nb', 'despachado') AND nb_order_id IS NOT NULL -- NB da 400 antes del pago
  `)
  for (const p of rows) {
    try {
      const tracking = await getTrackingOrden(p.nb_branch, p.nb_order_id)
      await pool.query('UPDATE pedidos SET tracking = $2, updated_at = NOW() WHERE id = $1', [p.id, JSON.stringify(tracking)])
    } catch (err) {
      console.error(`⚠️ Tracking pedido #${p.id}:`, err.message)
    }
  }
  return rows.length
}

// ---------- Admin ----------

export async function listarPedidos({ estado, page = 1, limit = 50 } = {}) {
  page = Math.max(1, parseInt(page) || 1)
  limit = Math.min(100, Math.max(1, parseInt(limit) || 50))
  const params = []
  let where = ''
  // acepta varios estados separados por coma: ?estado=enviado_a_nb,error_nb
  if (estado) { params.push(String(estado).split(',')); where = `WHERE p.estado = ANY($1)` }
  params.push(limit, (page - 1) * limit)

  const { rows } = await pool.query(`
    SELECT p.id, p.estado, p.total, p.envio_descripcion, p.nb_branch, p.nb_order_id, p.error, p.created_at,
           c.nombre || ' ' || c.apellido AS cliente, c.email
    FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params)
  return rows
}

export async function getPedido(id) {
  const { rows: [pedido] } = await pool.query(`
    SELECT p.*, row_to_json(c.*) AS cliente, row_to_json(d.*) AS direccion
    FROM pedidos p
    JOIN clientes c ON c.id = p.cliente_id
    JOIN direcciones d ON d.id = p.direccion_id
    WHERE p.id = $1
  `, [id])
  if (!pedido) return null
  delete pedido.cliente.password_hash
  const { rows: items } = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [id])
  return { ...pedido, items }
}

// ---------- Flujo semi-automático ----------
//
// cliente paga → procesarPedidoPagado():
//   1. arma y procesa la orden en NB (enviarPedidoANB)
//   2. avisa al admin por email que tiene que pagarle a NB
//   3. el admin paga y lo marca en el panel (marcarPagadoANB)

const fmt = (n) => `$${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ESCAPES[c])

function htmlItems(items) {
  return `<ul>${items.map(i => `<li>${i.cantidad} × ${esc(i.titulo)} (NB #${i.nb_id})</li>`).join('')}</ul>`
}

// Lo llamará el webhook de Mercado Pago (por ahora, el botón "marcar pagado" del admin).
// No tira error: cualquier falla queda en el pedido (error_nb) y se avisa por email.
export async function procesarPedidoPagado(pedidoId) {
  try {
    const nbOrden = await enviarPedidoANB(pedidoId)

    // total según NB: si falla, el email sale igual con el costo estimado
    let nbTotal = null
    try {
      nbTotal = await getTotalOrden(nbOrden.nb_branch, nbOrden.nb_order_id)
      await pool.query('UPDATE pedidos SET nb_total = $2 WHERE id = $1', [pedidoId, JSON.stringify(nbTotal)])
    } catch (err) {
      console.error(`⚠️ No se pudo obtener el total NB del pedido #${pedidoId}:`, err.message)
    }

    const pedido = await getPedido(pedidoId)
    const costoEstimado = pedido.items.reduce((acc, i) => acc + Number(i.costo_unitario ?? 0) * i.cantidad, 0) + Number(pedido.envio)

    await enviarEmailAdmin(
      `🛒 Venta #${pedidoId}: pagar orden NB ${nbOrden.nb_branch}-${nbOrden.nb_order_id}`,
      `<h2>Nueva venta pagada: pedido #${pedidoId}</h2>
       <p>La orden ya se creó en NB. <strong>Falta pagarla para que la despachen.</strong></p>
       <p><strong>Orden NB:</strong> ${esc(nbOrden.nb_branch)}-${esc(nbOrden.nb_order_id)}<br>
          <strong>A pagar a NB:</strong> ${nbTotal?.SubtotalPesosArFinal != null
            ? `${fmt(nbTotal.SubtotalPesosArFinal)} (USD ${Number(nbTotal.SubtotalDollarFinal).toFixed(2)} × ${nbTotal.Cotizacion}, con IVA y envío)`
            : `aprox. ${fmt(costoEstimado)} (estimado, verificar en NB)`}<br>
          <strong>Cobrado al cliente:</strong> ${fmt(pedido.total)} (envío ${fmt(pedido.envio)}, ${esc(pedido.envio_descripcion)})</p>
       <p><strong>Cliente:</strong> ${esc(pedido.cliente.nombre)} ${esc(pedido.cliente.apellido)}, ${esc(pedido.cliente.email)}, ${esc(pedido.cliente.telefono)}<br>
          <strong>Envío a:</strong> ${esc(pedido.direccion.direccion)} ${esc(pedido.direccion.piso_depto)}, ${esc(pedido.direccion.localidad)} (CP ${esc(pedido.direccion.codigo_postal)})</p>
       ${htmlItems(pedido.items)}
       <p>Cuando la pagues, marcala en el panel: <a href="${ADMIN_URL}?pedido=${pedidoId}">${ADMIN_URL}</a></p>`
    )
    return { ok: true, ...nbOrden }
  } catch (err) {
    console.error(`❌ Pedido #${pedidoId} no se pudo enviar a NB:`, err.message)
    // si el pedido ni siquiera estaba en un estado válido, no hay nada que avisar
    if (err instanceof ErrorValidacion) throw err
    await enviarEmailAdmin(
      `⚠️ Venta #${pedidoId}: falló la orden en NB`,
      `<h2>El pedido #${pedidoId} está pagado pero no se pudo crear la orden en NB</h2>
       <p><strong>Error:</strong> ${esc(err.message)}</p>
       <p>Revisalo y reintentá desde el panel, o devolvé el pago al cliente si no hay stock:
          <a href="${ADMIN_URL}?pedido=${pedidoId}">${ADMIN_URL}</a></p>`
    )
    return { ok: false, error: err.message }
  }
}

// Temporal hasta integrar Mercado Pago: marcar a mano que el cliente pagó
export async function marcarPedidoPagado(id) {
  const { rows: [p] } = await pool.query(`
    UPDATE pedidos SET estado = 'pagado', updated_at = NOW()
    WHERE id = $1 AND estado = 'pendiente_pago'
    RETURNING id, estado
  `, [id])
  if (!p) throw new ErrorValidacion('El pedido no existe o no está pendiente de pago')
  return p
}

// El admin ya le pagó la orden a NB
export async function marcarPagadoANB(id, nota) {
  const { rows: [p] } = await pool.query(`
    UPDATE pedidos SET estado = 'pagado_a_nb', pagado_nb_at = NOW(), pagado_nb_nota = $2, updated_at = NOW()
    WHERE id = $1 AND estado = 'enviado_a_nb'
    RETURNING id, estado, pagado_nb_at
  `, [id, String(nota ?? '').trim().slice(0, 300) || null])
  if (!p) throw new ErrorValidacion('El pedido no existe o no está esperando el pago a NB')
  return p
}

// Contadores para el panel (badge del menú)
export async function resumenPedidos() {
  const { rows } = await pool.query('SELECT estado, COUNT(*)::int AS cantidad FROM pedidos GROUP BY estado')
  const porEstado = Object.fromEntries(rows.map(r => [r.estado, r.cantidad]))
  return {
    porEstado,
    // lo que requiere acción del admin: pagar a NB o resolver un error
    pendientesAccion: (porEstado.enviado_a_nb ?? 0) + (porEstado.error_nb ?? 0),
  }
}
