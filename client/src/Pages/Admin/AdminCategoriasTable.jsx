import { useEffect, useState } from "react";
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


    width:66vw;
    margin:0 15vw 
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

export default function AdminCategoriasTable() {
  const [changes, setChanges] = useState({})
  const [loading, setLoading] = useState(false)
  const [categoriasApiState, setCategoriasApi] = useState([])
  //hacer cambios en la tabla
  //actualizar el state de changes sin modificar el servidor
  //que se habilite el boton de subir cambios
  //que se actualize NB, la tabla de Categorias y la de productos

  async function fetchCategorias() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/categorias')
      setCategoriasApi(data)
      // setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  function changeChanges(id, newData) {
    setChanges(prev => {
      if (prev[id]) {
        // Si el id ya existe, clonamos el objeto anterior y le sumamos lo nuevo
        return {
          ...prev,
          [id]: {
            ...prev[id],
            ...newData
          }
        };
      } else {
        // Si no existe, lo creamos directamente con newData
        return {
          ...prev,
          [id]: newData
        };
      }
    });
  }

  async function actualizarUtility(id, newUtility, habilitado, nombre) {

    if(changes[id] && Object.hasOwn(changes[id], 'habilitado')){
      changeChanges(id, {
        description:nombre,

        utility: newUtility,
        habilitado: changes[id].habilitado
      })
    }else{
      changeChanges(id, {
        description:nombre,

        utility: newUtility,
        habilitado: habilitado
      })
    }

    // await api.patch(`/admin/categorias/${id}`, {newUtility})
  }

  async function toggleHabilitado(id, valorActual, utility, nombre) {

    if(changes[id] && Object.hasOwn(changes[id], 'utility')){
      changeChanges(id, {
        description:nombre,

        utility: changes[id].utility,
        habilitado: !changes[id].habilitado
      })
    }else{
      changeChanges(id, {
        description:nombre,

        utility: utility,
        habilitado: !valorActual
      })
    }

    // await api.patch(`/admin/categorias/${id}`, { habilitado: !valorActual })
  }

  async function handleChange(id) {
    console.log("front ",changes[id])
    // let uno = changes[id]+id
    // console.log(uno)
    await api.patch(`/admin/categorias/single/${id}`, changes[id])
  }

  async function syncCategorias() {
    await api.get(`/admin/categorias/sync`)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])


  return (
    <>
      <style>{styles}</style>
      <div className="ap">
        <div className="ap-header">
          <div className="coso-uno">
            <div className="ap-title">Categorias</div>
            {/* <div className="ap-subtitle">
              Sincronizado con <strong>{syncSource}</strong> · última sync {lastSyncLabel}
            </div> */}
          </div>
          <div className="coso-dos">
            {/* <div className="ap-title">Inicia sesion con NB:</div>
            <input type="text" />
            <input type="text" /> */}
            <button className="filterBtn" onClick={syncCategorias}>Sincronizar Categorias con NB</button>
            {/* <button className="filterBtn" onClick={() => console.log(categoriasApiState)}>test</button> */}
            <button className="filterBtn" onClick={() => console.log(changes)}>Subir cambios al SERVER</button>
            <button className="filterBtn" onClick={() => console.log(categoriasApiState)}>oko</button>
          </div>
        </div>


        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="center">Utility %</th>
                <th className="center">Estado</th>
                <th className="center">NB</th>
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
                categoriasApiState.map((p) => (
                  <tr className="ap-row" key={p.id}>

                    <td className="ap-title-cell">
                      <div className="ap-prod-name">{p.nombre + " "}{p.id}</div>

                    </td>


                    <td className="center">
                      <input
                        className="ap-utility-input"
                        type="number"
                        placeholder="—"
                        defaultValue={p.utility}
                        // aria-label={`Utility para ${p.name}`}
                        onBlur={e => actualizarUtility(p.id, e.target.value, p.habilitado, p.nombre)}
                      />
                    </td>
                    <td className="center">
                      <button
                        className={`ap-status-btn ${p.habilitado ? "ap-status-on" : "ap-status-off"}`}
                        onClick={() => toggleHabilitado(p.id, p.habilitado, p.utility, p.nombre)}
                      >
                        {p.habilitado ? "Habilitado" : "Inabilitado"}
                      </button>
                    </td>
                    <td className="center">
                      <button
                        className={`ap-status-btn ${changes[p.id] ? "ap-status-on" : "ap-status-off"}`}
                        onClick={changes[p.id] ? () => handleChange(p.id) : null}
                      >
                        subir cambios
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
