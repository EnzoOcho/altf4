// Transforma datos crudos de NB al formato que guardamos / mostramos

// Imagen principal primero, después el resto de la galería sin duplicados
export function buildImageUrls(p) {
  const urls = []
  if (p.mainImage) urls.push(p.mainImage)
  const extras = [...(p.images ?? [])]
    .sort((a, b) => Number(a.order) - Number(b.order))
    .filter(img => !p.mainImage?.includes(img.checksum.split('.')[0]))
    .map(img => `https://static.nb.com.ar/img/${img.checksum}`) // TODO: verificar formato de URL con NB
  return [...urls, ...extras]
}

// Une "Connectors" + "connectors 2" y limpia los "?" basura que manda NB ("5?50W" -> "550W")
export function cleanAttributes(attributes = []) {
  const specs = []
  for (const { name, value } of attributes) {
    const nombre = name.trim()
    const valor = String(value ?? '').replace(/\?/g, '').trim()
    if (!valor) continue

    const base = nombre.replace(/\s*\d+$/, '').toLowerCase()
    const previo = specs.find(s => s.nombre.toLowerCase() === base)
    if (previo && /\d+$/.test(nombre)) {
      previo.valor += ' ' + valor
    } else {
      specs.push({ nombre, valor })
    }
  }
  return specs
}
