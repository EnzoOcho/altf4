import { useState } from "react";
import api from "../../services/api";
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Barlow:wght@400;500;600;700&display=swap');

  .ap {
    --bg: #0f1117;
    --sur: #171b24;
    --elev: #1e2330;
    --hov: #212736;
    --acc: #e63946;
    --acc-d: rgba(230,57,70,0.12);
    --acc-b: rgba(230,57,70,0.30);
    --suc: #22c55e;
    --suc-d: rgba(34,197,94,0.12);
    --warn: #facc15;
    --warn-d: rgba(250,204,21,0.12);
    --tp: #e8eaf0;
    --ts: #8b92a5;
    --tm: #545c72;
    --bo: rgba(255,255,255,0.07);
    --bos: rgba(255,255,255,0.12);
    font-family: 'Barlow', sans-serif;
    background: var(--bg);
    color: var(--tp);
    padding: 24px;
    border-radius: 12px;
  }
  .ap * { box-sizing: border-box; margin: 0; padding: 0; }

  .ap-header { margin-bottom: 18px; display: flex; justify-content: space-around; }
  .ap-title { font-size: 26px; font-weight: 700; color: var(--tp); letter-spacing: -.01em; margin-bottom: 4px; }
  .ap-subtitle { font-size: 12px; color: var(--tm); font-family: 'IBM Plex Mono', monospace; letter-spacing: .03em; }
  .ap-subtitle strong { color: var(--ts); }

  .coso{
    display: flex; align-items: center; gap: 10px;
  }

  .ap-toolbar {
    display: flex; align-items: center; gap: 10px;
    background: var(--sur); border: 1px solid var(--bo);
    border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .ap-search {
    flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
    background: var(--elev); border: 1px solid var(--bos); border-radius: 7px; padding: 8px 12px;
  }
  .ap-search i { color: var(--tm); font-size: 14px; flex-shrink: 0; }
  .ap-search input {
    background: none; border: none; outline: none; color: var(--tp);
    font-size: 13px; font-family: 'Barlow', sans-serif; width: 100%;
  }
  .ap-search input::placeholder { color: var(--tm); }

  .ap-select {
    background: var(--elev); border: 1px solid var(--bos); border-radius: 7px;
    padding: 8px 30px 8px 12px; font-size: 12px; color: var(--ts);
    font-family: 'IBM Plex Mono', monospace; letter-spacing: .02em;
    cursor: pointer; outline: none; appearance: none;
  }
  .ap-select option { background: #1e2330; }

  .ap-toggle {
    display: flex; align-items: center; gap: 7px;
    background: var(--elev); border: 1px solid var(--bos); border-radius: 7px;
    padding: 7px 12px; cursor: pointer; font-size: 12px; color: var(--ts);
    font-weight: 500; transition: all .15s; white-space: nowrap;
  }
  .ap-toggle.active { background: var(--acc-d); border-color: var(--acc-b); color: var(--acc); }
  .ap-switch {
    width: 30px; height: 16px; border-radius: 8px; background: var(--bos);
    position: relative; flex-shrink: 0; transition: background .15s;
  }
  .ap-toggle.active .ap-switch { background: var(--acc); }
  .ap-switch::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 12px; height: 12px; border-radius: 50%; background: #fff; transition: left .15s;
  }
  .ap-toggle.active .ap-switch::after { left: 16px; }

  .ap-count {
    margin-left: auto; font-size: 12px; color: var(--tm);
    font-family: 'IBM Plex Mono', monospace; white-space: nowrap; padding-left: 8px;
  }
  .ap-count strong { color: var(--tp); font-weight: 600; }

  .ap-table-wrap { background: var(--sur); border: 1px solid var(--bo); border-radius: 12px; overflow: hidden; overflow-x: auto; }
  .ap-table { width: 100%; border-collapse: collapse; }
  .ap-table thead th {
    background: var(--elev); text-align: left; padding: 12px 16px;
    font-size: 10px; font-family: 'IBM Plex Mono', monospace; letter-spacing: .08em;
    text-transform: uppercase; color: var(--tm); font-weight: 500;
    border-bottom: 1px solid var(--bo); white-space: nowrap;
  }
  .ap-table thead th.right { text-align: right; }
  .ap-table thead th.center { text-align: center; }

  .ap-row { border-bottom: 1px solid var(--bo); transition: background .15s; }
  .ap-row:last-child { border-bottom: none; }
  .ap-row:hover { background: var(--hov); }
  .ap-table td { padding: 14px 16px; font-size: 13px; vertical-align: middle; }

  .ap-img-cell { width: 64px; }
  .ap-img {
    width: 56px; height: 56px; border-radius: 8px; background: #fff;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; border: 1px solid var(--bo);
  }
  .ap-img img, .ap-img svg { width: 85%; height: 85%; object-fit: contain; }

  .ap-title-cell { min-width: 260px; }
  .ap-prod-name { font-size: 13px; font-weight: 600; color: var(--tp); line-height: 1.4; margin-bottom: 3px; }
  .ap-prod-brand {
    font-size: 11px; color: var(--tm); font-family: 'IBM Plex Mono', monospace;
    letter-spacing: .04em; text-transform: uppercase;
  }

  .ap-sku { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--ts); }

  .ap-stock-pill {
    display: inline-flex; align-items: center; gap: 5px; font-size: 11px;
    font-weight: 600; padding: 4px 10px; border-radius: 20px;
    letter-spacing: .02em; white-space: nowrap;
  }
  .ap-stock-pill::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .ap-stock-alto { background: var(--suc-d); color: var(--suc); }
  .ap-stock-alto::before { background: var(--suc); box-shadow: 0 0 5px var(--suc); }
  .ap-stock-medio { background: var(--warn-d); color: var(--warn); }
  .ap-stock-medio::before { background: var(--warn); box-shadow: 0 0 5px var(--warn); }
  .ap-stock-bajo { background: var(--warn-d); color: var(--warn); }
  .ap-stock-bajo::before { background: var(--warn); box-shadow: 0 0 5px var(--warn); }

  .ap-warranty { color: var(--ts); font-size: 12.5px; }

  .ap-cost { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: var(--ts); }
  .ap-cost .ap-currency { color: var(--tm); font-size: 10px; display: block; margin-top: 1px; }

  .ap-utility-input {
    width: 64px; background: var(--elev); border: 1px solid var(--bos);
    border-radius: 6px; padding: 6px 8px; font-size: 12px; color: var(--tp);
    font-family: 'IBM Plex Mono', monospace; outline: none; text-align: right;
  }
  .ap-utility-input:focus { border-color: var(--acc-b); }

  .ap-cat-pill {
    display: inline-block; font-size: 10px; font-weight: 600; padding: 4px 9px;
    border-radius: 5px; background: var(--elev); border: 1px solid var(--bos);
    color: var(--ts); letter-spacing: .04em; text-transform: uppercase;
  }

  .ap-price-cell { min-width: 140px; }
  .ap-price-input {
    width: 100%; background: var(--elev); border: 1px solid var(--bos);
    border-radius: 7px; padding: 9px 11px; font-size: 13px; font-weight: 600;
    color: var(--tp); font-family: 'IBM Plex Mono', monospace; outline: none;
  }
  .ap-price-input:focus { border-color: var(--acc-b); background: #1b2030; }

  .ap-status-btn {
    border: none; border-radius: 7px; padding: 8px 18px; font-size: 12px;
    font-weight: 700; font-family: 'Barlow', sans-serif; cursor: pointer;
    transition: all .15s; letter-spacing: .02em;
  }
  .ap-status-on { background: var(--suc); color: #0f1117; }
  .ap-status-on:hover { background: #1ea34f; }
  .ap-status-off { background: var(--elev); color: var(--tm); border: 1px solid var(--bos); }
  .ap-status-off:hover { border-color: var(--ts); color: var(--ts); }

  .ap-empty { text-align: center; padding: 48px 24px; color: var(--tm); font-size: 14px; }

  .filterBtn {
    position: relative;
    padding: 8px 20px;
    background: var(--clr-surface);
    border: 1px solid var(--clr-border);
    border-radius: 999px;
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--clr-text-muted);
    transition:
      background var(--transition-base),
      border-color var(--transition-base),
      color var(--transition-base);
  }
  
  .filterBtn:hover {
    color: var(--clr-text);
    border-color: var(--clr-border-hover);
  }
  `;
function stockClass(level) {
  const key = (level || "").toLowerCase();
  if (key === "alto") return "ap-stock-alto";
  if (key === "medio") return "ap-stock-medio";
  return "ap-stock-bajo";
}

const PlaceholderSVG = () => (
  <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="14" width="40" height="32" rx="3" fill="#e8e8e5" />
    <rect x="14" y="18" width="32" height="20" rx="2" fill="#d8d8d4" />
    <circle cx="30" cy="28" r="6" fill="#c8c8c4" />
  </svg>
);


export default function AdminProductsTable({
  title = "Productos",
  syncSource = "New Bytes API",

  productos,
  loading,
  setOrdenBy,
  filters,
  filterOnlyStock,
  filterProductosTienda,
  categorias,
  setCategoria,
  setPage,
  total,
  busqueda,
  setBusqueda,
  setProductos,

  // categoria,
  toggleHabilitado,
  // actualizarPrecio,

  syncProductsNb


}) {
  const [changes, setChanges] = useState({
  })


  async function actualizarInventario() {
    console.log("losa")
    await api.get(`/admin/productos/actualizar`)
}

async function actualizarPrecio() {
  console.log("precio")
  await api.patch(`/admin/productos/precios`)
}


  return (
    <>
      <style>{styles}</style>
      <div className="ap">
        <div className="ap-header">
          <div className="coso-uno">
            <div className="ap-title">{title}</div>
            <div className="ap-subtitle">
              Sincronizado con <strong>{syncSource}</strong> · última sync {productos[0]?productos[0].ultima_sync:"ehe"}
            </div>
          </div>
          <div className="coso-dos">
            {/* <div className="ap-title">Inicia sesion con NB:</div>
            <input type="text" />
            <input type="text" /> */}
            <button className="filterBtn" onClick={syncProductsNb}>Sincronizar Productos con NB</button>
            <button className="filterBtn" onClick={() => console.log(productos)}>ingresa</button>
            <button className="filterBtn" onClick={actualizarInventario}>Actualizar DB</button>
            <button className="filterBtn" onClick={actualizarPrecio}>Actualizar Precio</button>
            <button className="filterBtn" onClick={() => console.log(changes)}>Subir cambios</button>
          </div>
        </div>

        <div className="ap-toolbar">
          <div className="ap-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input

              aria-label="Buscar productos"
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="ap-select"
            aria-label="Filtrar por categoría"
            onChange={e => { setCategoria(e.target.value); setPage(1) }}
          // onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre} {cat.habilitado ? "habilitado" : "no habilitado"} {"utility: " + cat.utility}</option>
            ))}
          </select>
          {/* <div>Cat Utility: {categoria.utility}</div> */}
          <select
            className="ap-select"
            aria-label="Ordenar productos"
            onChange={e => { setOrdenBy(e.target.value) }}
          >
            <option value="">Ordenar por</option>
            <option value="costo_asc">Ordenar por Costo ASC</option>
            <option value="costo_desc">Ordenar por Costo DES</option>
            <option value="precio_asc">Ordenar por Precio de venta ASC</option>
            <option value="precio_desc">Ordenar por Precio de venta DES</option>
            <option value="stock_asc">Ordenar por Stock ASC</option>
            <option value="stock_desc">Ordenar por Stock DES</option>
          </select>
          <div
            className={`ap-toggle${filters.onlyStock ? "" : " active"}`}
            role="button"
            tabIndex={0}
            // aria-pressed={stockOnly}
            onClick={filterOnlyStock}
          >
            <div className="ap-switch" />
            Solo con stock
          </div>
          <div
            className={`ap-toggle${filters.productosTienda ? "" : " active"}`}
            role="button"
            tabIndex={0}

            onClick={filterProductosTienda}
          >
            <div className="ap-switch" />
            En la tienda
          </div>
          <span className="ap-count">
            <strong>{total}</strong> productos
          </span>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                {/* <th>SKU</th> */}
                <th>Categoría</th>
                <th className="center">Stock</th>
                <th>Garantía</th>
                <th className="right">Costo</th>
                <th className="center">Utility %</th>

                <th>Precio venta</th>
                <th className="center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="ap-empty">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr className="ap-row" key={p.nb_id}>
                    <td className="ap-img-cell">
                      <div className="ap-img">
                        {p.imagen_url ? <img src={p.imagen_url} alt={p.titulo} /> : <PlaceholderSVG />}
                      </div>
                    </td>
                    <td className="ap-title-cell">
                      <div className="ap-prod-name">{p.titulo}</div>
                      <div className="ap-prod-brand">{p.marca}</div>
                      <span className="ap-sku">{p.sku}</span>
                    </td>
                    <td>
                      <span className="ap-cat-pill">{p.categoria}</span>
                    </td>
                    {/* <td>
                      <span className="ap-sku">{p.sku}</span>
                    </td> */}
                    <td className="center">
                      <div className="ap-warranty">100</div>
                      <span className={`ap-stock-pill ${stockClass(p.stock)}`}>{p.stock}</span>
                    </td>
                    <td>
                      <span className="ap-warranty">{p.garantia}</span>
                    </td>
                    <td className="right">
                      <span className="ap-cost">
                        {Math.floor(p.semi_final_price * p.cotizacion)}
                        {/* {Math.floor(((p.value * p.cotizacion) + ((p.value * p.cotizacion) * (p.iva / 100)) + ((p.value * p.cotizacion) * (p.internal_tax / 100))))} */}
                        {/* ${fmtMoney(p.cost).split(",")[0]} */}
                        <span className="ap-currency">ARS</span>
                      </span>
                    </td>
                    <td className="center">
                      {/* <input
                        className="ap-utility-input"
                        type="number"
                        placeholder={p.utility}
                          value={p.utility}
                        // aria-label={`Utility para ${p.name}`}
                        // onChange={(e) => handleUtilityChange(p.nb_id, e.target.value)}
                      /> */}
                      <p>{p.utility}</p>
                    </td>

                    <td className="ap-price-cell">
                      <input
                        className="ap-price-input"
                        type="number"
                        // value={fmtMoney(p.price)}
                        defaultValue={p.precio_venta}
                        // onBlur={e => actualizarPrecio(p.nb_id, e.target.value)}
                        aria-label={`Precio de venta para ${p.titulo}`}
                        // onChange={(e) => actualizarPrecio(p.nb_id, e.target.value)}
                      />
                    </td>
                    <td className="center">
                      <button
                        className={`ap-status-btn ${p.habilitado ? "ap-status-on" : "ap-status-off"}`}
                        onClick={() => toggleHabilitado(p.nb_id, p.habilitado)}
                      >
                        {p.habilitado ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
