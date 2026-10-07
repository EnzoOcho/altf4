import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductListing.css"
import { useCart } from "../../services/CartContext";

const formatPrecio = (n) => Math.round(Number(n)).toLocaleString("es-AR");

const ORDENES = [
  { value: "", label: "Relevancia" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

export default function ProductListing({
  products,
  loading,
  loadingCategorias,
  error,
  categoriesList = [],
  filtros,
  onChangeFiltros,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [busquedaInput, setBusquedaInput] = useState(filtros.busqueda);

  // si la búsqueda cambia desde afuera (ej. botón atrás), sincronizar el input
  useEffect(() => { setBusquedaInput(filtros.busqueda) }, [filtros.busqueda]);

  // debounce: buscar 400ms después de que el usuario deja de tipear
  useEffect(() => {
    if (busquedaInput === filtros.busqueda) return;
    const t = setTimeout(() => onChangeFiltros({ busqueda: busquedaInput.trim() }), 400);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  function cambiarPagina(page) {
    onChangeFiltros({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const titulo = filtros.categoria || (filtros.busqueda ? `Resultados para "${filtros.busqueda}"` : "Todos los productos");

  return (
    <div className="altf4-listing">

      {/* Topbar */}
      <div className="pl-topbar">
        <div className="pl-topbar-left">
          <h1 className="pl-title">{titulo}</h1>
          {!loading && !error && (
            <span className="pl-count">
              {products.total} {products.total === 1 ? "producto" : "productos"}
            </span>
          )}
        </div>
        <div className="pl-topbar-right">
          <div className="pl-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre o SKU"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              aria-label="Buscar productos"
            />
          </div>
          <select
            className="pl-sort"
            value={filtros.orden}
            onChange={(e) => onChangeFiltros({ orden: e.target.value })}
            aria-label="Ordenar productos"
          >
            {ORDENES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="pl-view-btns">
            <button
              className={`pl-view-btn${viewMode === "grid" ? " active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Vista grilla"
              aria-pressed={viewMode === "grid"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M120 56v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16m80-16h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-96 96H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m96 0h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16" /></svg>
            </button>
            <button
              className={`pl-view-btn${viewMode === "list" ? " active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="Vista lista"
              aria-pressed={viewMode === "list"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="0.75em" height="1em" viewBox="0 0 12 16"><path fillRule="evenodd" d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1c0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1c0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1c0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="pl-body">
        {/* Sidebar */}
        <aside className="pl-sidebar" aria-label="Categorías">
          <div className="pl-cat-header">Categorías</div>
          {loadingCategorias ? (
            <ul className="pl-cat-list">
              {Array.from({ length: 6 }, (_, i) => <li key={i} className="pl-skel pl-skel-cat" />)}
            </ul>
          ) : (
            <ul className="pl-cat-list">
              {[{ nombre: "" }, ...categoriesList].map(({ nombre }) => (
                <li key={nombre || "todas"}>
                  <button
                    className={`pl-cat-item${filtros.categoria === nombre ? " active" : ""}`}
                    onClick={() => onChangeFiltros({ categoria: nombre })}
                  >
                    {nombre || "Todas"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Grilla */}
        <main className="pl-main">
          {error ? (
            <div className="pl-empty">
              <i className="ti ti-wifi-off" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className={`pl-grid${viewMode === "list" ? " list-view" : ""}`}>
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="pl-skel pl-skel-card" />)}
            </div>
          ) : products.productos.length === 0 ? (
            <div className="pl-empty">
              <i className="ti ti-search-off" aria-hidden="true" />
              <p>No encontramos productos con esos filtros.</p>
              <button className="pl-link-btn" onClick={() => onChangeFiltros({ categoria: "", busqueda: "" })}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className={`pl-grid${viewMode === "list" ? " list-view" : ""}`}>
                {products.productos.map(product => (
                  <ProductCard key={product.nb_id} product={product} />
                ))}
              </div>
              <Paginacion
                page={filtros.page}
                totalPaginas={products.totalPaginas}
                onChange={cambiarPagina}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const { cart, addToCart, deleteUnitFromCart } = useCart();
  const enCarrito = cart.find(p => p.productId === product.nb_id);
  const sinStock = product.stock === "Sin stock";

  // la card entera es un Link (permite ctrl+click / abrir en pestaña nueva);
  // los botones del carrito frenan la navegación
  const sinNavegar = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };

  return (
    <Link to={`/producto/${product.nb_id}`} className="pl-card">
      <div className="pl-card-img">
        <img src={product.imagen_url} alt={product.titulo} loading="lazy" />
        {sinStock && <span className="pl-card-tag">Sin stock</span>}
      </div>
      <div className="pl-card-body">
        <div className="pl-card-name">{product.titulo}</div>
        <div className="pl-card-price">
          {product.precio_venta != null
            ? <><span>$</span>{formatPrecio(product.precio_venta)}</>
            : <span className="pl-card-noprice">Consultar</span>}
        </div>
        {enCarrito ? (
          <div className="pl-qty" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <button className="pl-qty-btn" onClick={sinNavegar(() => deleteUnitFromCart(product.nb_id))} aria-label="Disminuir cantidad">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14z" /></svg>
            </button>
            <span className="pl-qty-val">{enCarrito.qty} en carrito</span>
            <button className="pl-qty-btn" onClick={sinNavegar(() => addToCart(product.nb_id))} aria-label="Aumentar cantidad">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
            </button>
          </div>
        ) : (
          <button
            className="pl-card-btn"
            onClick={sinNavegar(() => addToCart(product.nb_id))}
            disabled={sinStock || product.precio_venta == null}
          >
            <i className="ti ti-shopping-cart" aria-hidden="true" />
            {sinStock ? "Sin stock" : "Sumar al carrito"}
          </button>
        )}
      </div>
    </Link>
  );
}

// Muestra: primera, última, la actual y sus vecinas, con "…" en los saltos
function Paginacion({ page, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  const paginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || Math.abs(i - page) <= 1) paginas.push(i);
    else if (paginas[paginas.length - 1] !== "…") paginas.push("…");
  }

  return (
    <nav className="pl-pagination" aria-label="Paginación">
      <button className="pl-page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
        <i className="ti ti-chevron-left" aria-hidden="true" />
      </button>
      {paginas.map((p, i) => p === "…"
        ? <span key={`e${i}`} className="pl-page-dots">…</span>
        : <button
            key={p}
            className={`pl-page-btn${p === page ? " active" : ""}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
          >{p}</button>
      )}
      <button className="pl-page-btn" disabled={page >= totalPaginas} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
        <i className="ti ti-chevron-right" aria-hidden="true" />
      </button>
    </nav>
  );
}
