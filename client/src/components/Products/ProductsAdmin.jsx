import React from 'react'
// import ProductCard from './ProductCard'
import styles from './Products.module.css';
// import ProductCardAdmin from './ProductCardAdmin';

const productsApi = [
    {
        "title": "AURICULARES IN EAR USB-C GENIUS HS-M366 BLACK",
        "sku": "31710033400",
        "id": 121403,
        "category": "AURICULARES",
        "categoryId": 28,
        "brand": "GENIUS",
        "brandId": 47,
        "mainImage": "https://static.nb.com.ar/i/nb_AURICULARES-IN-EAR-USB-C-GENIUS-HS-M366-BLACK_ver_7f30e6160cad1536383ed2abefb50aac.png",
        "mainImageExp": "https://static.nb.com.ar/i/nb_AURICULARES-IN-EAR-USB-C-GENIUS-HS-M366-BLACK_export_7f30e6160cad1536383ed2abefb50aac.png",
        "brandImage": "https://static.nb.com.ar/img/76239acd087113b4b4c0c480b6e31f2e.jpg",
        "initialB": 5,
        "initialC": 10,
        "stock": "Alto",
        "amountInCart": 0,
        "amountStock": 10,
        "categoryIdUser": 851,
        "categoryDescriptionUser": "Auriculares",
        "utility": 25,
        "highAverage": 65,
        "widthAverage": 25,
        "lengthAverage": 130,
        "weightAverage": 35,
        "titleUser": null,
        "price": {
            "value": 6.303,
            "iva": 21,
            "internalTax": 0,
            "finalPrice": 7.6266300000000005,
            "percepcion": null,
            "finalPriceWithUtility": 9.53329,
            "ncostoextra": 0
        },
        "warranty": "12 meses",
        "cotizacion": 1415
    },
    {
        "title": "CABLE USB-C CARGA DATOS M/M PD60W 3A 150cm GENIUS ASSY ACC-C2CC",
        "sku": "32590006401",
        "id": 119162,
        "category": "CELULARES Y TELEFONIA",
        "categoryId": 40,
        "brand": "GENIUS",
        "brandId": 47,
        "mainImage": "https://static.nb.com.ar/i/nb_CABLE-USB-C-CARGA-DATOS-M/M-PD60W-3A-150cm-GENIUS-ASSY-ACC-C2CC_ver_c42d662f48c0190f4eae52f4ef71bf51.jpg",
        "mainImageExp": "https://static.nb.com.ar/i/nb_CABLE-USB-C-CARGA-DATOS-M/M-PD60W-3A-150cm-GENIUS-ASSY-ACC-C2CC_export_c42d662f48c0190f4eae52f4ef71bf51.jpg",
        "brandImage": "https://static.nb.com.ar/img/76239acd087113b4b4c0c480b6e31f2e.jpg",
        "initialB": 5,
        "initialC": 10,
        "stock": "Bajo",
        "amountInCart": 0,
        "amountStock": 3,
        "categoryIdUser": null,
        "categoryDescriptionUser": null,
        "utility": null,
        "highAverage": 162.5,
        "widthAverage": 77,
        "lengthAverage": 200,
        "weightAverage": 1000,
        "titleUser": null,
        "price": {
            "value": 3.942,
            "iva": 10.5,
            "internalTax": 0,
            "finalPrice": 4.355910000000001,
            "percepcion": null,
            "finalPriceWithUtility": 4.35591,
            "ncostoextra": 0
        },
        "warranty": "6 meses",
        "cotizacion": 1415
    },
    {
        "title": "D-LINK ACCESS POINT DAP-2610 WIFI 5 AC1300 DUAL-BAND PoE",
        "sku": "DAP-2610",
        "id": 118720,
        "category": "CONECTIVIDAD",
        "categoryId": 19,
        "brand": "D-LINK",
        "brandId": 32,
        "mainImage": "https://static.nb.com.ar/i/nb_D-LINK-ACCESS-POINT-DAP-2610-WIFI-5-AC1300-DUAL-BAND-PoE_ver_cbd172aa7c4b4409c93fcd1b94213afa.jpeg",
        "mainImageExp": "https://static.nb.com.ar/i/nb_D-LINK-ACCESS-POINT-DAP-2610-WIFI-5-AC1300-DUAL-BAND-PoE_export_cbd172aa7c4b4409c93fcd1b94213afa.jpeg",
        "brandImage": "https://static.nb.com.ar/img/2a2f197ce2c04d0c86d459c33c7c8500.jpg",
        "initialB": 5,
        "initialC": 10,
        "stock": "Alto",
        "amountInCart": 0,
        "amountStock": 10,
        "categoryIdUser": 855,
        "categoryDescriptionUser": "Conectividad",
        "utility": 25,
        "highAverage": 200,
        "widthAverage": 50,
        "lengthAverage": 200,
        "weightAverage": 400,
        "titleUser": null,
        "price": {
            "value": 103.9068,
            "iva": 10.5,
            "internalTax": 0,
            "finalPrice": 114.817014,
            "percepcion": null,
            "finalPriceWithUtility": 143.52127,
            "ncostoextra": 0
        },
        "warranty": "24 meses",
        "cotizacion": 1415
    },
    {
        "title": "D-LINK MESH ROUTER M15-2 WIFI 6 AX1500 2 unidades",
        "sku": "M15-2",
        "id": 120120,
        "category": "CONECTIVIDAD",
        "categoryId": 19,
        "brand": "D-LINK",
        "brandId": 32,
        "mainImage": "https://static.nb.com.ar/i/nb_D-LINK-MESH-ROUTER-M15-2-WIFI-6-AX1500-2-unidades_ver_cf7f71dc8813c57eee7953bff1dfccf2.jpg",
        "mainImageExp": "https://static.nb.com.ar/i/nb_D-LINK-MESH-ROUTER-M15-2-WIFI-6-AX1500-2-unidades_export_cf7f71dc8813c57eee7953bff1dfccf2.jpg",
        "brandImage": "https://static.nb.com.ar/img/2a2f197ce2c04d0c86d459c33c7c8500.jpg",
        "initialB": 5,
        "initialC": 10,
        "stock": "Alto",
        "amountInCart": 0,
        "amountStock": 10,
        "categoryIdUser": 855,
        "categoryDescriptionUser": "Conectividad",
        "utility": 25,
        "highAverage": 100,
        "widthAverage": 150,
        "lengthAverage": 100,
        "weightAverage": 208,
        "titleUser": null,
        "price": {
            "value": 64.8324,
            "iva": 10.5,
            "internalTax": 0,
            "finalPrice": 71.639802,
            "percepcion": null,
            "finalPriceWithUtility": 89.54975,
            "ncostoextra": 0
        },
        "warranty": "24 meses",
        "cotizacion": 1415
    },
    {
        "title": "D-LINK MESH ROUTER M15-3 WIFI 6 AX1500 3 unidades",
        "sku": "M15-3",
        "id": 120121,
        "category": "CONECTIVIDAD",
        "categoryId": 19,
        "brand": "D-LINK",
        "brandId": 32,
        "mainImage": "https://static.nb.com.ar/i/nb_D-LINK-MESH-ROUTER-M15-3-WIFI-6-AX1500-3-unidades_ver_ae50fb5799fb50bbdb16d536a7a2a443.jpg",
        "mainImageExp": "https://static.nb.com.ar/i/nb_D-LINK-MESH-ROUTER-M15-3-WIFI-6-AX1500-3-unidades_export_ae50fb5799fb50bbdb16d536a7a2a443.jpg",
        "brandImage": "https://static.nb.com.ar/img/2a2f197ce2c04d0c86d459c33c7c8500.jpg",
        "initialB": 5,
        "initialC": 10,
        "stock": "Alto",
        "amountInCart": 0,
        "amountStock": 10,
        "categoryIdUser": 855,
        "categoryDescriptionUser": "Conectividad",
        "utility": 25,
        "highAverage": 100,
        "widthAverage": 150,
        "lengthAverage": 100,
        "weightAverage": 208,
        "titleUser": null,
        "price": {
            "value": 95.0184,
            "iva": 10.5,
            "internalTax": 0,
            "finalPrice": 104.995332,
            "percepcion": null,
            "finalPriceWithUtility": 131.24417,
            "ncostoextra": 0
        },
        "warranty": "24 meses",
        "cotizacion": 1415
    }]

const ProductsAdmin = () => {
    return (
        <section className={styles.section} id="productos">
        <div className={`container ${styles.inner}`}>
          {/* Header */}
          <div className={styles.header}>
            <span className="section-tag">Destacadosss</span>
            <h2 className={styles.title}>
              Productos <span className={styles.titleAccent}>destacados</span>
            </h2>
            <a href="#" className={styles.viewAll}>
              Ver todo el catálogo →
            </a>
          </div>
  
          {/* Filters */}
          <div className={styles.filters} role="group" aria-label="Filtrar por categoría">
            {/* {FILTER_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                className={`${styles.filterBtn} ${activeFilter === id ? styles.active : ''}`}
                onClick={() => setActiveFilter(id)}
              >
                {label}
                {activeFilter === id && (
                  <span className={styles.filterActive} />
                )}
              </button>
            ))} */}
          </div>
  
          {/* Grid */}
          <div>
            <div className={styles.grid}>
                {productsApi.map((product, i) => (
                    <ProductCardAdmin
                        key={product.id}
                         product={{ ...product, animationIndex: i }}
                        // onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </div>
  
          {/* CTA */}
          <div className={styles.bottomCta}>
            <a href="#" className={styles.ctaBtn}>
              Ver todos los productos
            </a>
          </div>
        </div>
      </section>


    )
}

export default ProductsAdmin