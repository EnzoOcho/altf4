import { useState } from 'react';
import { featuredProducts } from '../../data/mockData';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

// ============================================
// PRODUCTS SECTION — ALT F4
// Filtro por categoría + grid de cards
// ============================================

const FILTER_OPTIONS = [
  { id: 'all',     label: 'Todos' },
  { id: 'gpu',     label: 'Placas de Video' },
  { id: 'cpu',     label: 'Procesadores' },
  { id: 'ram',     label: 'RAM' },
  { id: 'storage', label: 'Almacenamiento' },
];

export default function Products({ onAddToCart }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? featuredProducts
    : featuredProducts.filter((p) => p.category === activeFilter);

  return (
    <section className={styles.section} id="productos">
      <div className={`container ${styles.inner}`}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-tag">Destacados</span>
          <h2 className={styles.title}>
            Productos <span className={styles.titleAccent}>destacados</span>
          </h2>
          <a href="#" className={styles.viewAll}>
            Ver todo el catálogo →
          </a>
        </div>

        {/* Filters */}
        <div className={styles.filters} role="group" aria-label="Filtrar por categoría">
          {FILTER_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              className={`${styles.filterBtn} ${activeFilter === id ? styles.active : ''}`}
              onClick={() => setActiveFilter(id)}
            >
              {label}
              {activeFilter === id && (
                <span className={styles.filterActive} />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={{ ...product, animationIndex: i }}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* CTA */}
        <div className={styles.bottomCta}>
          <a href="#" className={styles.ctaBtn}>
            Ver todos los productos
          </a>
        </div>
      </div>
    </section>
  );
}
