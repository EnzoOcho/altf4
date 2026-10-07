import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../services/CartContext';
import api from '../../services/api';

const NAV_LINKS = [
  
  { label: 'Pedidos', href: '/admin/pedidos', badge: true },
  { label: 'Admin Productos', href: '/admin/productos' },
  { label: 'Admin Categorias', href: '/admin/categorias' },
  { label: 'Admin Pagina', href: '/contacto' },
  { label: 'Inicio', href: '/inicio' },
  //provisorio BORRAR PRODUCCION
  // { label: "ADMIN", href: "/admin/login"},
];

export default function AdminNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {cart}= useCart()
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const [pendientes, setPendientes] = useState(0);

  // pedidos que requieren acción del admin (pagar a NB / errores), se refresca cada minuto
  useEffect(() => {
    const cargar = () => api.get('/admin/pedidos/resumen')
      .then(({ data }) => setPendientes(data.pendientesAccion))
      .catch(() => {});
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, []);
  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate()
  function goToCart(){
    navigate("/cart")
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>

        {/* LOGO */}
        <a href="/inicio" className={styles.logo} aria-label="ALT F4 inicio">
          <span className={styles.logoKeyboard}>
            <span className={styles.logoKey}>ALT</span>
            <span className={styles.logoSep}></span>
            <span className={styles.logoKey}>F4</span>
          </span>
          <span className={styles.logoCursor}>_</span>
        </a>

        {/* NAV LINKS — Desktop */}
        <nav className={styles.nav} aria-label="Navegación principal">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, href, badge }) => (
              <li key={href}>
                <a href={href} className={styles.navLink}>
                  <span className={styles.navLinkInner}>{label}</span>
                  {badge && pendientes > 0 && <PendientesBadge n={pendientes} />}
                </a>
              </li>
            ))}

          </ul>
        </nav>

        {/* ACTIONS */}
        <div className={styles.actions}>
          {/* Search */}
          <button className={styles.iconBtn} aria-label="Buscar">
            <SearchIcon />
          </button>

          {/* Cart */}
          <button className={styles.cartBtn} aria-label={`Carrito (${cartCount} items)`} onClick={goToCart}>
            <CartIcon />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>

          {/* CTA */}
          <a href="/productos" className={styles.ctaBtn}>
            Comprar
          </a>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <ul>
          {NAV_LINKS.map(({ label, href, badge }) => (
            <li key={href}>
              <a
                href={href}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {label}
                {badge && pendientes > 0 && <PendientesBadge n={pendientes} />}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function PendientesBadge({ n }) {
  return (
    <span
      title={`${n} pedido(s) para pagar a NB o con error`}
      style={{
        marginLeft: 6, background: '#facc15', color: '#111', fontSize: 11, fontWeight: 700,
        borderRadius: 10, padding: '0 7px', lineHeight: '18px', display: 'inline-block',
      }}
    >
      {n}
    </span>
  );
}

/* ---- INLINE SVG ICONS ---- */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
