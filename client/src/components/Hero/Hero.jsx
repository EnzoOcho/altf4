import styles from './Hero.module.css';

// ============================================
// HERO — ALT F4
// Fondo oscuro con grid tecnológico, partículas,
// texto animado y GPU render fake
// ============================================

export default function Hero() {
  return (
    <section className={styles.hero} id="inicio">
      {/* Fondo: grid técnico + gradiente */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className={styles.bgNoise} aria-hidden="true" />

      {/* Línea de scanline animada */}
      <div className={styles.scanline} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* CONTENIDO LEFT */}
        <div className={styles.content}>
          {/* Badge animado */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>Nueva colección RTX 50XX disponible</span>
          </div>

          {/* Título */}
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>Potenciá</span>
            <span className={styles.titleLine2}>
              tu <span className={styles.titleAccent}>Setup</span>
            </span>
          </h1>

          {/* Subtítulo */}
          <p className={styles.subtitle}>
            Hardware de alto rendimiento para los que no se conforman.<br />
            GPUs, CPUs, RAM y almacenamiento al mejor precio.
          </p>

          {/* Specs rápidos — estilo terminal */}
          <div className={styles.quickSpecs}>
            <div className={styles.specItem}>
              <span className={styles.specKey}>STOCK</span>
              <span className={styles.specVal}>+500 productos</span>
            </div>
            <div className={styles.specDivider} />
            <div className={styles.specItem}>
              <span className={styles.specKey}>ENVÍO</span>
              <span className={styles.specVal}>24 / 48 hs</span>
            </div>
            <div className={styles.specDivider} />
            <div className={styles.specItem}>
              <span className={styles.specKey}>CUOTAS</span>
              <span className={styles.specVal}>Hasta x12</span>
            </div>
          </div>

          {/* CTAs */}
          <div className={styles.ctas}>
            <a href="#productos" className={styles.ctaPrimary}>
              <span>Ver Productos</span>
              <ArrowIcon />
            </a>
            <a href="#categorias" className={styles.ctaSecondary}>
              Explorar categorías
            </a>
          </div>
        </div>

        {/* VISUAL RIGHT — GPU card */}
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.gpuCard}>
            {/* Anillos decorativos */}
            <div className={styles.ring1} />
            <div className={styles.ring2} />

            {/* Imagen GPU */}
            <div className={styles.gpuImageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=420&fit=crop&auto=format"
                alt="GPU de alto rendimiento"
                className={styles.gpuImage}
              />
              <div className={styles.gpuOverlay} />
            </div>

            {/* Info card flotante */}
            <div className={styles.floatCard}>
              <div className={styles.floatCardIcon}>⬡</div>
              <div>
                <p className={styles.floatCardTitle}>RTX 4090</p>
                <p className={styles.floatCardSub}>ASUS ROG STRIX • 24GB</p>
              </div>
              <div className={styles.floatCardPrice}>$2.199.999</div>
            </div>

            {/* Badge performance */}
            <div className={styles.perfBadge}>
              <span className={styles.perfNum}>4K</span>
              <span className={styles.perfLabel}>READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>SCROLL</span>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
