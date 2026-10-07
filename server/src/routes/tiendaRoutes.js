// server/src/routes/tienda.routes.js
import { Router } from 'express'
import { listarProductosTienda, detalleProductoTienda, listarCategoriasTienda, listarProductosCarritoTienda, getProductoDetallado } from '../controllers/tiendaController.js'

import { listarProvincias, cotizarEnvio, crearPedidoTienda } from '../controllers/pedidosController.js'

const router = Router()

// checkout
router.get('/provincias', listarProvincias)
router.post('/envio/cotizar', cotizarEnvio)
router.post('/pedidos', crearPedidoTienda)

router.get('/productos', listarProductosTienda)
router.get('/productos/categorias', listarCategoriasTienda)
router.get('/productos/carrito', listarProductosCarritoTienda)
// router.get('/productos/:nb_id', detalleProductoTienda)

router.get('/productos/:nb_id', getProductoDetallado)

// router.get("/products/:id", async (req, res) => {
//     try {
//       const p = await nbService.getProduct(req.params.id); // llamada a NB con tu token (en .env)
  
//       const dto = {
//         id: p.id,
//         titulo: p.title,
//         sku: p.sku,
//         marca: { nombre: p.brand, logo: p.brandImage },
//         categoria: p.category,
//         precioARS: Math.round(p.price.finalPriceWithUtility * p.cotizacion),
//         disponible: p.amountStock > 0,
//         garantia: p.warranty,
//         imagenes: buildImageUrls(p), // armás las URLs acá
//         especificaciones: cleanAttributes(p.attributes), // unís connectors, limpiás "?"
//         descripcion: p.description.value || null,
//       };
  
//       res.json(dto);
//     } catch (err) {
//       res.status(502).json({ error: "No se pudo obtener el producto" });
//     }
//   });


export default router