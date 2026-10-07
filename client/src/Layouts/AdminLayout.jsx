import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styles from '../components/Products/Products.module.css';
import AdminNavbar from './../components/Navbar/AdminNavbar';
import AdminFooter from '../components/Footer/Footer'

export default function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <>
    <AdminNavbar />
    <Outlet />   {/* acá renderizan las rutas hijas */}
    <AdminFooter />
  </>)
    
}