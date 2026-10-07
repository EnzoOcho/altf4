import { useEffect, useState } from "react";
import "./CartPageComp.css"
import { useCart } from "../../services/CartContext";
import api from "../../services/api";


function fmt(n) {
  return Math.round(n).toLocaleString("es-AR");
}



export default function CartPageComp({

  onCheckout = () => { },
  onContinueShopping = () => { },
  onBack = () => { },
}) {
  // const [cart, setCart] = useState(initialItems);

  const { cart, addToCart, deleteUnitFromCart, clearCart, deleteProduct } = useCart()
  const [products, setProducts] = useState([])

  async function fetchProductos() {
    const productlist = cart.map(item => item.productId);
    if (productlist.length === 0) return;
    try {
      const { data } = await api.get('/tienda/productos/carrito', {
        params: {
          ids: productlist
        }
      })
      setProducts(data)
    } finally {
      // setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  function deleteUnitFromCartX(pro){
    const item = cart.find(p => p.productId === pro);
    if (!item) return;
    if (item.qty === 1) {
      deleteProductX(pro)
    } else {
      deleteUnitFromCart(pro)
    }
  }

  function deleteProductX(pro){
    deleteProduct(pro)
    setProducts(products.filter(p => p.nb_id !== pro));
  }
  // const clearCart = () => setCart([]);
  function clearCartX(){
    clearCart()
    setProducts([])
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  // const totalPrice = cart.reduce((s, i) => s + i.qty * 5, 0);
  function subtotalPrice(product) {
    const item = cart.find(p => p.productId === product);
    const item2 = products.find(p => p.nb_id === product);
    // console.log(item,item2)
    if (!item) return 0;
    return item2.precio_venta * item.qty;
  }

  function totalPrice(){
    return cart.reduce((total, item) => {
      const product = products.find(p => p.nb_id === item.productId);
      if (!product) return total;
      return total + (product.precio_venta * item.qty);
    }, 0);
  }

  return (
    <>

      <div className="af">
        <div className="af-top">
          <button className="af-back" onClick={onBack} aria-label="Volver">
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>
          <span className="af-title">Mi carrito</span>
        </div>

        <div className="af-body">
          {/* Left: product list */}

          <div className="af-left">
            <div className="af-products-card">
              <div className="af-card-header">
                <span className="af-card-title">Productos</span>
                <button className="af-vaciar" onClick={clearCartX} aria-label="Vaciar carrito">
                  <i className="ti ti-trash" aria-hidden="true" /> Vaciar
                </button>
              </div>

              {products.length === 0 ? (
                <div className="af-empty">
                  <i className="ti ti-shopping-cart" aria-hidden="true" />
                  El carrito está vacío
                </div>
              ) : (
                products.map((item) => (
                  <div className="af-item" key={item.nb_id}>
                    <div className="af-img">
                      {/* {PRODUCT_SVGS[item.id] ?? null} */}
                      <img src={item.imagen_url} alt="" />
                    </div>
                    <div className="af-item-info">
                      <div className="af-item-name">{item.titulo}</div>
                      <div className="af-item-controls">
                        <button
                          className="af-del"
                          onClick={()=>deleteProductX(item.nb_id)}
                          aria-label="Eliminar producto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="currentColor" fillRule="evenodd" d="M320 85.334H192V42.667h128zm-85.333 128H192V384h42.667zm85.333 0h-42.667V384H320zM448 128v42.667h-42.667v298.667H106.667V170.667H64V128zm-85.333 42.667H149.333v256h213.334z" /></svg>
                        </button>
                        <div className="af-qty">
                          <button
                            className="af-qty-btn"
                            onClick={() => deleteUnitFromCartX(item.nb_id)}
                            aria-label="Disminuir cantidad"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14z" /></svg>
                          </button>
                          <span className="af-qty-val">{cart.map((p) => p.productId === item.nb_id ? p.qty : null)}</span>
                          <button
                            className="af-qty-btn"
                            onClick={() => addToCart(item.nb_id)}
                            aria-label="Aumentar cantidad"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="af-item-price">
                      <span>$</span>{fmt(subtotalPrice(item.nb_id) /* item.qty*/)}
                    </div>
                  </div>
            ))
              )}
          </div>
        </div>

        {/* Right: summary */}
        <div className="af-right">
          <div className="af-summary">
            <div className="af-summary-header">
              <div className="af-summary-title">Resumen</div>
            </div>
            <div className="af-summary-body">
              <div className="af-sum-row">
                <span className="af-sum-label">
                  {totalQty === 1 ? "1 producto" : `${totalQty} productos`}
                </span>
                <span className="af-sum-val">
                  <span>$</span>{fmt(totalPrice())}
                </span>
              </div>
              <div className="af-coupon">
                <i className="ti ti-truck-delivery" aria-hidden="true" />
                <span className="af-coupon-text">
                  El envío se calcula en el siguiente paso con tu código postal.
                </span>
              </div>
              <hr className="af-divider" />
              <div>
                <div className="af-total-row">
                  <span className="af-total-label">Total</span>
                  <span className="af-total-val">
                    <span>$</span>{fmt(totalPrice())}
                  </span>
                </div>
                <div className="af-total-note">
                  *Sin envío.
                </div>
              </div>
            </div>
            <div className="af-summary-footer">
              <button
                className="af-btn af-btn-primary"
                onClick={() => onCheckout(cart)}
                disabled={cart.length === 0 || products.length === 0}
              >
                <i className="ti ti-lock" aria-hidden="true" /> Iniciar compra
              </button>
              <button
                className="af-btn af-btn-outline"
                onClick={onContinueShopping}
              >
                <i className="ti ti-arrow-left" aria-hidden="true" /> Ver más productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
    </>
  );
}
