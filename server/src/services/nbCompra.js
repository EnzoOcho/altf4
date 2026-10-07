// Endpoints de NB para el proceso de compra (dropshipping)
// Docs: https://developers.nb.com.ar/introduccion/como-realizar-una-compra/
import nb from './nbClient.js'

// NB a veces responde 200 con { success: false, msg }
function verificarOk(data, accion) {
  if (data && typeof data === 'object' && 'success' in data && data.success !== 'ok' && data.success !== true) {
    throw new Error(`NB ${accion}: ${data.msg || JSON.stringify(data)}`)
  }
  return data
}

// ---------- Demografía ----------

let provinciasCache = null
export async function getProvincias() {
  if (!provinciasCache) {
    const { data } = await nb.get('/provinces')
    provinciasCache = data
  }
  return provinciasCache
}

// ---------- Envío ----------

// Cotiza sin tocar el carrito de NB. items: [{ nb_id, cantidad }]
// Devuelve solo transportes que aceptan dropshipping.
export async function cotizarEnvio(codigoPostal, items) {
  const { data } = await nb.post('/dropshipping/shippingQuote',
    { items: items.map(i => ({ itemId: Number(i.nb_id), quantity: Number(i.cantidad) })) },
    { params: { postalCode: codigoPostal } }
  )
  return {
    opciones: (data.quotes ?? [])
      .filter(q => q.dropshippingEnabled)
      .map(q => ({
        carrierId: q.carrierId,
        descripcion: q.carrierName,
        plazo: q.deliveryEstimate,
        dias: q.deliveryDays,
        total: q.total,
      })),
    estimado: data.estimated ?? true,
    bulto: data.package ?? null,
  }
}

// Cotización sobre el carrito activo (da el datosBulto exacto que pide /carrito/process)
export async function calcularEnvioCarrito(codigoPostal, idDireccion) {
  const url = idDireccion
    ? `/carrito/calcularEnvioPara/${codigoPostal}/${idDireccion}`
    : `/carrito/calcularEnvioPara/${codigoPostal}`
  const { data } = await nb.get(url)
  return data // { cotizacion: [{ id, description, plazoEntrega, total }], datosBulto }
}

// ---------- Carrito ----------

// Crea un carrito nuevo y lo deja como activo
export async function crearCarritoNuevo() {
  const { data } = await nb.post('/carrito/new')
  return verificarOk(data, 'crear carrito')
}

// items: [{ nb_id, cantidad }]
export async function agregarItemsCarrito(items) {
  const { data } = await nb.post('/carrito/item',
    items.map(i => ({ productId: Number(i.nb_id), amount: Number(i.cantidad), type: 0 }))
  )
  return verificarOk(data, 'agregar items')
}

// [{ id, stock, availability, amountInCart }]
export async function getDisponibilidadCarrito() {
  const { data } = await nb.get('/carrito/availability')
  return data
}

export async function procesarCarrito(payload) {
  const { data } = await nb.post('/carrito/process', payload)
  return verificarOk(data, 'procesar carrito') // { success, branch, orderId, status, ... }
}

// ---------- Direcciones ----------

// Usa la variante provinceId + placeString (nombre de localidad) en vez de placeId
export async function crearDireccionNB({ direccion, telefono, codigoPostal, provinciaId, localidad }) {
  const { data } = await nb.post('/miCuenta/shippingAddress', {
    direccion,
    telefono,
    codigoPostal,
    predeterminado: null,
    provinceId: Number(provinciaId),
    placeString: localidad,
  })
  verificarOk(data, 'crear dirección')
  if (!data.addressId) throw new Error('NB no devolvió addressId al crear la dirección')
  return data.addressId
}

export async function borrarDireccionNB(addressId) {
  const { data } = await nb.delete(`/miCuenta/shippingAddress/${addressId}`)
  return data
}

// ---------- Seguimiento ----------

export async function getTrackingOrden(branch, orderId) {
  const { data } = await nb.get(`/miCuenta/ordenesDeCompra/${branch}/${orderId}/tracking`)
  return data
}

// Total de una orden ya procesada (lo que hay que pagarle a NB)
export async function getTotalOrden(branch, orderId) {
  const { data } = await nb.get(`/miCuenta/ordenesDeCompra/${branch}/${orderId}/total`)
  return data
}
