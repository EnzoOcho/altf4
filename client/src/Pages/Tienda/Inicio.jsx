import React from 'react'
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import Products from '../../components/Products/Products';
import Benefits from '../../components/Benefits/Benefits';


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

const Inicio = () => {
    return (
        <main>
            <Hero />
            <Categories />
            <Products onAddToCart={handleAddToCart} />
            <Benefits />
        </main>
    )
}

export default Inicio