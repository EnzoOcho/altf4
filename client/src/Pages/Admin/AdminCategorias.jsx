import React from 'react'
import styles from '../../components/Products/Products.module.css';
import AdminCategoriasTable from './AdminCategoriasTable';

const AdminCategoriasPage = () => {
  return (
    <section className={styles.section} id="productos">
      <AdminCategoriasTable />
    </section>
  )
}

export default AdminCategoriasPage