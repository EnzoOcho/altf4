
import { useState, useEffect } from 'react'
import api from '../../services/api'

import styles from '../../components/Products/Products.module.css';
import "./tableStyle.css"
import AdminProductsTable from './AdminProductsTable';

export default function ProductosPage() {
    const [productos, setProductos] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [busqueda, setBusqueda] = useState('')
    const [categoria, setCategoria] = useState('')
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(false)

    const [ordenBy, setOrdenBy] = useState("")
    const [filters, setFilters] = useState({ productosTienda: false, onlyStock: false })

    const limit = 50

    function filterOnlyStock() {
        if (filters.onlyStock) { setFilters(prev => ({ ...prev, onlyStock: false })) }
        else setFilters(prev => ({ ...prev, onlyStock: true }))
        console.log(filters)
    }

    function filterProductosTienda() {
        if (filters.productosTienda) { setFilters(prev => ({ ...prev, productosTienda: false })) }
        else setFilters(prev => ({ ...prev, productosTienda: true }))
        console.log(filters)
    }

    async function fetchCategorias() {
        const { data } = await api.get('/admin/categorias')
        setCategorias(data)
    }

    useEffect(() => {
        fetchCategorias()
    }, [])


    async function fetchProductos() {
        setLoading(true)
        console.log(categoria)
        try {
            const { data } = await api.get('/admin/productos', {
                params: { page, limit, busqueda, categoria, ordenBy, ...filters }
            })
            setProductos(data.productos)
            setTotal(data.total)
        } finally {
            setLoading(false)
        }
    }

    // Se ejecuta cada vez que cambia la página, búsqueda o categoría
    useEffect(() => {
        fetchProductos()
    }, [page, busqueda, categoria, ordenBy, filters])

    async function toggleHabilitado(nb_id, valorActual) {
        await api.patch(`/admin/productos/${nb_id}`, { habilitado: !valorActual })
        setProductos(prev =>
            prev.map(p => p.nb_id === nb_id ? { ...p, habilitado: !valorActual } : p)
        )
    }

    // async function actualizarPrecio() {
    //     console.log("losa")
    //     await api.patch(`/admin/productos/actualizar`)
    // }

    async function syncProductsNb() {
        console.log("hola")
        await api.get(`/admin/productos/sync`)
        console.log("chau")
        fetchProductos()
    }

    const totalPaginas = Math.ceil(total / limit)

    return (
        <section className={styles.section} id="productos">
            <AdminProductsTable loading={loading} productos={productos} setOrdenBy={setOrdenBy}
                filters={filters} filterOnlyStock={filterOnlyStock} filterProductosTienda={filterProductosTienda}
                categorias={categorias} setCategoria={setCategoria} setPage={setPage}
                total={total}
                busqueda={busqueda} setBusqueda={setBusqueda}
                setProductos={setProductos}
                // categoria={categoria}

                toggleHabilitado={toggleHabilitado}
                // actualizarPrecio={actualizarPrecio}
                syncProductsNb={syncProductsNb}
            />

            {/* Paginación */}
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="filterBtn"
                >
                    ← Anterior
                </button>
                <span className="text-sm text-gray-600">Página {page} de {totalPaginas}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === totalPaginas}
                    className="filterBtn"
                >
                    Siguiente →
                </button>
            </div>
        </section>
    )
}