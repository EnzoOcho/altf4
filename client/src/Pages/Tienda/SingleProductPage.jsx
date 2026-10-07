import React, { useEffect, useState } from 'react'
import ProductDetail from './../../components/Products/ProductDetail';
import styles from './../../components/Products/Products.module.css';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';


const SingleProductPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [singleProduct, setSingleProduct] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    let cancelado = false // evita pisar el estado si cambia el id antes de que responda

    async function checkProduct() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/tienda/productos/${id}`)
        if (!cancelado) setSingleProduct(data)
      } catch (err) {
        if (cancelado) return
        setError(err.response?.status === 404 || err.response?.status === 400
          ? 'Este producto no existe o ya no está disponible.'
          : 'No pudimos cargar el producto. Probá de nuevo en un rato.')
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    checkProduct()
    return () => { cancelado = true }
  }, [id])

  return (
    <section className={styles.align} id="singleproduct">
      {loading && <p className="pd-estado">Cargando producto...</p>}
      {!loading && error && (
        <div className="pd-estado">
          <p>{error}</p>
          <Link to="/productos">Volver a productos</Link>
        </div>
      )}
      {!loading && !error && singleProduct && <ProductDetail singleProduct={singleProduct} />}
    </section>
  )
}

export default SingleProductPage
