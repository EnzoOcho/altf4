import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import "./ProductsPage.css"
import ProductListing from './ProductListing';
import api from '../../services/api';


// ============================================
// PRODUCTS SECTION — ALT F4
// Los filtros viven en la URL (?categoria=&busqueda=&orden=&page=)
// así funcionan el botón "atrás" y los links compartidos
// ============================================


export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = {
    categoria: searchParams.get('categoria') ?? '',
    busqueda: searchParams.get('busqueda') ?? '',
    orden: searchParams.get('orden') ?? '',
    page: Number(searchParams.get('page')) || 1,
  }

  const [products, setProducts] = useState({ productos: [], total: 0, totalPaginas: 0 })
  const [categoriesList, setCategoriesList] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/tienda/productos/categorias')
      .then(({ data }) => setCategoriesList(data))
      .catch(() => setCategoriesList([]))
      .finally(() => setLoadingCategorias(false))
  }, [])

  useEffect(() => {
    let cancelado = false // si cambian los filtros rápido, ignorar respuestas viejas
    setLoadingProductos(true)
    setError(null)

    api.get('/tienda/productos', { params: { ...filtros, limit: 24 } })
      .then(({ data }) => { if (!cancelado) setProducts(data) })
      .catch(() => { if (!cancelado) setError('No pudimos cargar los productos.') })
      .finally(() => { if (!cancelado) setLoadingProductos(false) })

    return () => { cancelado = true }
  }, [searchParams.toString()])

  // Cambiar cualquier filtro vuelve a la página 1 (salvo que se cambie la página misma)
  function cambiarFiltros(cambios) {
    const next = { ...filtros, page: 1, ...cambios }
    const params = {}
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === 'page' && v === 1)) params[k] = v
    }
    setSearchParams(params)
  }

  return (
    <section className='page'>
      <ProductListing
        products={products}
        loading={loadingProductos}
        loadingCategorias={loadingCategorias}
        error={error}
        categoriesList={categoriesList}
        filtros={filtros}
        onChangeFiltros={cambiarFiltros}
      />
    </section>
  );
}
