import { benefits } from '../../data/mockData';
import styles from './Benefits.module.css';

// ============================================
// BENEFITS — ALT F4
// Cuatro propuestas de valor con iconos estilizados
// ============================================

export default function Benefits() {
  return (
    <section className={styles.section} id="beneficios">
      {/* Decoración de fondo */}
      <div className={styles.bgAccent} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Header */}
        <div className={styles.header}>
          <span className="section-tag">¿Por qué ALT F4?</span>
          <h2 className={styles.title}>
            La experiencia completa,<br />
            <span className={styles.titleAccent}>de principio a fin</span>
          </h2>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {benefits.map((b, i) => (
            <BenefitCard key={b.id} benefit={b} index={i} />
          ))}
        </div>

        {/* Banner inferior — CTA de confianza */}
        <div className={styles.trustBanner}>
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>+12.000</span>
            <span className={styles.trustLabel}>clientes satisfechos</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>98%</span>
            <span className={styles.trustLabel}>recomendarían</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>5 años</span>
            <span className={styles.trustLabel}>en el mercado</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>+500</span>
            <span className={styles.trustLabel}>productos en stock</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ benefit, index }) {
  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className={styles.cardTop}>
        <div className={styles.iconBox}>
          <span className={styles.icon}>{benefit.icon}</span>
        </div>
        <div className={styles.indexNum}>0{index + 1}</div>
      </div>
      <h3 className={styles.cardTitle}>{benefit.title}</h3>
      <p className={styles.cardDesc}>{benefit.description}</p>
      <p className={styles.cardDetail}>{benefit.detail}</p>
    </div>
  );
}
