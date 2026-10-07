import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import syncRouter from './src/routes/dbRoutes.js'
import { iniciarCron } from './src/jobs/syncCron.js'

import authRouter from './src/routes/authRoutes.js'
import { verificarToken } from './src/middleware/authAdmin.js'

import productosRoutes from './src/routes/productosRoutes.js'
import { getNBToken } from './src/services/nbAuth.js'
// import { getCategorias } from './src/services/getProductosDb.js'

//categorias
import categoriasRoutes from './src/routes/categoriasRoutes.js'
//tienda routes
import tiendaRouter from './src/routes/tiendaRoutes.js'
import pedidosRoutes from './src/routes/pedidosRoutes.js'
import { getCategoriasDB, syncCategorias } from './src/services/categoriasQueryes.js'
import { syncDetalles } from './src/services/sync.js'



dotenv.config()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRouter)


app.use('/api/admin', verificarToken, productosRoutes)
app.use('/api/admin', verificarToken, syncRouter)

//categorias
app.use('/api/admin', verificarToken, categoriasRoutes)
app.use('/api/admin', verificarToken, pedidosRoutes)

// Sin verificarToken — es pública
app.use('/api/tienda', tiendaRouter)



app.listen(3000, () => console.log('Server corriendo en puerto 3000'))
iniciarCron()

 //updatePrecio()
 // syncProductos()
// syncCategorias()ejjej
// getCategorias()
// getCategorias()
// syncDetalles()