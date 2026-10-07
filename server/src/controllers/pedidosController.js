import {
  cotizarEnvioPedido, crearPedido, procesarPedidoPagado,
  listarPedidos, getPedido, marcarPedidoPagado, marcarPagadoANB, resumenPedidos,
} from '../services/pedidos.js'
import { getProvincias } from '../services/nbCompra.js'

// errores de validación (status 400) muestran su mensaje; el resto es genérico
function responderError(res, err, contexto) {
  if (err.status === 400) return res.status(400).json({ error: err.message })
  console.error(`${contexto}:`, err)
  return res.status(502).json({ error: 'No se pudo completar la operación, probá de nuevo en un rato' })
}

// ---------- Tienda (públicas) ----------

export async function listarProvincias(req, res) {
  try {
    res.json(await getProvincias())
  } catch (err) {
    responderError(res, err, 'listarProvincias')
  }
}

export async function cotizarEnvio(req, res) {
  try {
    res.json(await cotizarEnvioPedido(req.body))
  } catch (err) {
    responderError(res, err, 'cotizarEnvio')
  }
}

export async function crearPedidoTienda(req, res) {
  try {
    const pedido = await crearPedido(req.body)
    // TODO: acá se crea la preferencia de Mercado Pago y se devuelve el link de pago
    res.status(201).json(pedido)
  } catch (err) {
    responderError(res, err, 'crearPedido')
  }
}

// ---------- Admin ----------

export async function listarPedidosAdmin(req, res) {
  try {
    res.json(await listarPedidos(req.query))
  } catch (err) {
    responderError(res, err, 'listarPedidos')
  }
}

export async function detallePedidoAdmin(req, res) {
  try {
    const pedido = await getPedido(req.params.id)
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (err) {
    responderError(res, err, 'detallePedido')
  }
}

export async function resumenPedidosAdmin(req, res) {
  try {
    res.json(await resumenPedidos())
  } catch (err) {
    responderError(res, err, 'resumenPedidos')
  }
}

// Temporal hasta Mercado Pago: simula el webhook de pago aprobado
export async function marcarPagadoAdmin(req, res) {
  try {
    await marcarPedidoPagado(req.params.id)
    const resultado = await procesarPedidoPagado(req.params.id)
    res.json(resultado)
  } catch (err) {
    responderError(res, err, 'marcarPagado')
  }
}

// Reintento manual de un pedido en error_nb
export async function enviarANBAdmin(req, res) {
  try {
    const resultado = await procesarPedidoPagado(req.params.id)
    res.status(resultado.ok ? 200 : 502).json(resultado)
  } catch (err) {
    responderError(res, err, 'enviarANB')
  }
}

export async function marcarPagadoANBAdmin(req, res) {
  try {
    res.json(await marcarPagadoANB(req.params.id, req.body?.nota))
  } catch (err) {
    responderError(res, err, 'marcarPagadoANB')
  }
}
