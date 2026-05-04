import { useState } from 'react';
import { formatPrice } from '../../data/mockData';
import styles from './ProductCard.module.css';

// ============================================
// PRODUCT CARD — Componente reutilizable
// Props: product, onAddToCart
// ============================================

const BADGE_STYLES = {
  hot:  { bg: '#ff1a6e', label: 'TOP VENTAS' },
  new:  { bg: '#22d3ee', label: 'NUEVO' },
  sale: { bg: '#f59e0b', label: 'OFERTA' },
  rec:  { bg: '#10b981', label: 'RECOMENDADO' },
};

export default function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (added) return;
    onAddToCart?.(product);
    setAdded(true);
    // Reset visual después de 2s
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const badge = product.badgeType ? BADGE_STYLES[product.badgeType] : null;

  return (
    <article className={styles.card}>
      {/* Badge */}
      {badge && (
        <div
          className={styles.badge}
          style={{ background: badge.bg }}
        >
          {badge.label}
        </div>
      )}

      {/* Stock warning */}
      {product.stock <= 5 && (
        <div className={styles.stockWarn}>
          ⚡ Solo {product.stock} en stock
        </div>
      )}

      {/* Image */}
      <div className={styles.imageWrapper}>
        <img
          src={product.image}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />

        {/* Quick specs overlay */}
        <div className={styles.specsOverlay}>
          {product.specs.map((s) => (
            <span key={s} className={styles.specChip}>{s}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Brand */}
        <p className={styles.brand}>{product.brand}</p>

        {/* Name */}
        <h3 className={styles.name}>{product.name}</h3>

        {/* Rating */}
        <div className={styles.rating}>
          <StarRating value={product.rating} />
          <span className={styles.ratingNum}>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </span>
              <span className={styles.discount}>-{discount}%</span>
            </>
          )}
        </div>

        {/* CTA */}
        <button
          className={`${styles.addBtn} ${added ? styles.added : ''}`}
          onClick={handleAddToCart}
          disabled={added}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          {added ? (
            <>
              <CheckIcon />
              <span>¡Agregado!</span>
            </>
          ) : (
            <>
              <CartIcon />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* ---- STARS ---- */
function StarRating({ value }) {
  return (
    <div className={styles.stars} aria-label={`Rating: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.floor(value) ? styles.starFull : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
