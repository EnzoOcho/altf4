import { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import Products from './components/Products/Products';
import Benefits from './components/Benefits/Benefits';
import Footer from './components/Footer/Footer';

// ============================================
// APP — ALT F4 Landing Page
// Estado global del carrito aquí (en producción
// usaría Context o Zustand/Redux)
// ============================================

export default function App() {
  // Estado del carrito — array de { product, qty }
  const [cart, setCart] = useState([]);

  // Handler: agregar producto al carrito
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  // Total de items en el carrito
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} />

      <main>
        <Hero />
        <Categories />
        <Products onAddToCart={handleAddToCart} />
        <Benefits />
      </main>

      <Footer />
    </>
  );
}
