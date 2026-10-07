import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // 1. Al inicializar, lee lo que haya guardado en localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("altf4-cart");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Cada vez que cart cambia, lo sincroniza con localStorage
  useEffect(() => {
    localStorage.setItem("altf4-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    if (cart.some(p => p.productId === product)) {
      setCart(cart.map(p =>
        p.productId === product ? { ...p, qty: p.qty + 1 } : p
      ));
    } else {
      setCart(prev => [...prev, { productId: product, qty: 1 }]);
    }
  }

  function deleteUnitFromCart(product) {
    const item = cart.find(p => p.productId === product);
    if (!item) return;
    if (item.qty === 1) {
      setCart(cart.filter(p => p.productId !== product));
    } else {
      setCart(cart.map(p =>
        p.productId === product ? { ...p, qty: p.qty - 1 } : p
      ));
    }
  }

  function clearCart(){
    setCart([])
  }

  function deleteProduct(product){
    setCart(cart.filter(p => p.productId !== product));

  }

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, deleteUnitFromCart, cartCount,clearCart,deleteProduct }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para consumir el contexto
export function useCart() {
  return useContext(CartContext);
}