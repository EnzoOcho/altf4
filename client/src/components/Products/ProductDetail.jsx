import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../services/CartContext";
import "./ProductDetail.css"

const formatPrecio = (n) => Math.round(Number(n)).toLocaleString("es-AR");

// stock que guarda el sync de NB: "Alto" | "Medio" | "Bajo" | "Sin stock"
const STOCK_ESTADOS = {
  "Alto": { texto: "Stock disponible", clase: "ok" },
  "Medio": { texto: "Stock disponible", clase: "ok" },
  "Bajo": { texto: "Últimas unidades", clase: "bajo" },
  "Sin stock": { texto: "Sin stock", clase: "sin" },
};

export default function ProductDetail({ singleProduct: p }) {
  const { addToCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [agregado, setAgregado] = useState(false);

  // al cambiar de producto, volver a la primera imagen
  useEffect(() => { setActiveImg(0); setAgregado(false); }, [p.nb_id]);

  const imagenes = p.imagenes?.length ? p.imagenes : [p.imagen_url].filter(Boolean);
  const specs = p.especificaciones ?? [];
  const stock = STOCK_ESTADOS[p.stock] ?? { texto: "Consultar stock", clase: "bajo" };

  function handleAddToCart() {
    addToCart(p.nb_id);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <div className="altf4-detail">
      <div className="pd-breadcrumb">
        <Link to="/productos">Productos</Link>
        {p.categoria && <>
          <span className="pd-breadcrumb-sep">›</span>
          <span>{p.categoria}</span>
        </>}
        {p.marca && <>
          <span className="pd-breadcrumb-sep">›</span>
          <span className="pd-breadcrumb-accent">{p.marca}</span>
        </>}
      </div>

      <div className="pd-grid">
        {/* Galería */}
        <div className="pd-image-panel">
          <div className="pd-main-img">
            {imagenes.length > 0
              ? <img src={imagenes[activeImg]} alt={p.titulo} />
              : <i className="ti ti-photo-off pd-no-img" aria-hidden="true" />}
          </div>
          {imagenes.length > 1 && (
            <div className="pd-thumb-row">
              {imagenes.map((src, i) => (
                <button
                  key={src}
                  className={`pd-thumb${activeImg === i ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Imagen ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <div>
            <div className="pd-badges">
              {p.marca && <span className="pd-badge pd-badge-marca">{p.marca}</span>}
              {p.categoria && <span className="pd-badge pd-badge-cat">{p.categoria}</span>}
            </div>
            <h1 className="pd-name">{p.titulo}</h1>
            <div className="pd-meta">
              {p.sku && <div className="pd-meta-item">SKU: <strong>{p.sku}</strong></div>}
              <div className="pd-meta-item">ID: <strong>#{p.nb_id}</strong></div>
            </div>
          </div>

          <div className="pd-price-card">
            <div className="pd-price-primary">
              <div>
                <div className="pd-price-label">Precio</div>
                <div className="pd-price-amount">
                  <span>$</span>{p.precio_venta != null ? formatPrecio(p.precio_venta) : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="pd-status-row">
            <div className="pd-status-item">
              <div className={`pd-status-dot ${stock.clase}`} />
              <span className={`pd-status-text ${stock.clase}`}>{stock.texto}</span>
            </div>
            {p.garantia && (
              <div className="pd-status-item">
                <i className="ti ti-shield-check" aria-hidden="true" />
                Garantía {p.garantia.toLowerCase()}
              </div>
            )}
            <div className="pd-status-item">
              <i className="ti ti-truck-delivery" aria-hidden="true" />
              Envíos a todo el país
            </div>
          </div>

          <button
            className="pd-btn pd-btn-primary"
            onClick={handleAddToCart}
            disabled={!p.disponible || p.precio_venta == null}
          >
            <i className={`ti ${agregado ? "ti-check" : "ti-shopping-cart"}`} aria-hidden="true" />
            {!p.disponible ? "Sin stock" : agregado ? "¡Agregado!" : "Sumar al carrito"}
          </button>

          {specs.length > 0 && (
            <div className="pd-specs">
              <div className="pd-specs-header">
                <div className="pd-specs-dot" />
                <span className="pd-specs-title">Especificaciones</span>
              </div>
              <dl className="pd-specs-list">
                {specs.map(({ nombre, valor }) => (
                  <div key={nombre} className="pd-spec-item">
                    <dt className="pd-spec-key">{nombre}</dt>
                    <dd className="pd-spec-val">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {p.descripcion && (
            <div className="pd-specs">
              <div className="pd-specs-header">
                <div className="pd-specs-dot" />
                <span className="pd-specs-title">Descripción</span>
              </div>
              <p className="pd-descripcion">{p.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
