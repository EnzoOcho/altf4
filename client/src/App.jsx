import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Inicio from './Pages/Tienda/Inicio';
import ProductsPage from './Pages/Tienda/ProductsPage';
import ContactoPage from './Pages/Tienda/ContactoPage';
import RutaProtegida from './components/RutaPortegida'
import AdminLayout from './Layouts/AdminLayout'
import LoginAdminPage from './Pages/Admin/LoginAdminPage'
import ProductosPage from './Pages/Admin/ProductosPage';
import SingleProductPage from './Pages/Tienda/SingleProductPage';
import CartPage from './Pages/Tienda/CartPage';
import CheckoutPage from './Pages/Tienda/CheckoutPage';
import PedidoConfirmadoPage from './Pages/Tienda/PedidoConfirmadoPage';
import { CartProvider, useCart } from './services/CartContext';
import StoreLayout from './Layouts/StoreLayout';
import AdminCategoriasPage from './Pages/Admin/AdminCategorias';
import AdminPedidos from './Pages/Admin/AdminPedidos';

//============================================
// APP — ALT F4 Landing Page
// Estado global del carrito aquí (en producción
// usaría Context o Zustand/Redux)
// ============================================

export default function App() {

  return (
    <>
      <CartProvider>
        <BrowserRouter>
          {/* <Navbar /> */}

          {/* TIENDA */}
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/inicio" element={<Inicio />} />
              <Route path='/productos' element={<ProductsPage />} />
              <Route path='/contacto' element={<ContactoPage />} />
              <Route path='/producto/:id' element={<SingleProductPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/pedido-confirmado' element={<PedidoConfirmadoPage />} />
              {/* <Route path='/altf4/admin' element={<AdminPage />} /> */}
            </Route>


            {/* ADMIN */}
            <Route path="/admin/login" element={<LoginAdminPage />} />
            <Route path="/admin" element={
              <RutaProtegida>
                <AdminLayout />
              </RutaProtegida>
            } >
              <Route index element={<Navigate to="/admin/productos" replace />} />
              <Route path="/admin/productos" element={<ProductosPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
              <Route path="/admin/pedidos" element={<AdminPedidos />} />
              {/* <Route path="sync" element={<SyncPage />} /> */}
            </ Route>

          </Routes>
          {/* <Footer /> */}
        </BrowserRouter>
      </CartProvider>
    </>
  );
}
