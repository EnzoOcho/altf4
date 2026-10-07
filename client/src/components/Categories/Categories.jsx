import { categories } from '../../data/mockData';
import styles from './Categories.module.css';

// ============================================
// CATEGORIES — ALT F4
// Grid de 4 categorías principales con hover
// ============================================

export default function Categories() {
  return (
    <section className={styles.section} id="categorias">
      <div className={`container ${styles.inner}`}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-tag">Catálogo</span>
          <h2 className={styles.title}>
            Encontrá lo que<br />
            <span className={styles.titleAccent}>necesitás</span>
          </h2>
          <p className={styles.subtitle}>
            Seleccioná tu componente y explorá nuestra línea completa de hardware.
          </p>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, index }) {
  return (
    <a
      href={`#${category.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Icon */}
      <div className={styles.cardIcon}>
        <span className={styles.iconGlyph}>{category.icon}</span>
        <div className={styles.iconGlow} />
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <span className={styles.cardTag}>{category.tag}</span>
        <h3 className={styles.cardTitle}>{category.name}</h3>
        <p className={styles.cardDesc}>{category.description}</p>
      </div>

      {/* Count */}
      <div className={styles.cardFooter}>
        <span className={styles.cardCount}>{category.count} productos</span>
        <span className={styles.cardArrow}>→</span>
      </div>

      {/* Border glow on hover */}
      <div className={styles.cardBorderGlow} />
    </a>
  );
}
