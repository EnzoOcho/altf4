import pool from '../db/pool.js'
import { getNBToken } from './nbAuth.js'
import axios from 'axios'
// export async function updateSingleCategoria(id, changes) {

//     const token = await getNBToken()

//     const res = await patch(`https://api-nb-dev.blu.net.ar/v1/miCuenta/misCategorias`, 
//         {   
//             "categoryId": id,
//             "utility": changes.utility,
//             "description": changes.description,
//             "hide": !changes.habilitado
//         }, 
//         {
//         headers: { Authorization: `Bearer ${token}` }
//         },
//     )

// if (!res.success) throw new Error(`Error: ${res.msg}`)

// return res

    
// }

export async function updateSingleCategoriaNB(id, changes) {
    console.log("llega hasta aca??")
    const token = await getNBToken()
    console.log("gg",token)
    console.log("nbQuery ", id, changes)
    try {
        const res = await axios.patch(
            `https://api-nb-dev.blu.net.ar/v1/miCuenta/misCategorias`,
            {
                categoryId: id,
                utility: changes.utility,
                description: changes.description,
                hide: !changes.habilitado
            },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!res.data.success) throw new Error(`NB API: ${res.data.msg}`)
        return res.data

    } catch (err) {
        // Distingue error HTTP de error de lógica de la API
        const msg = err.response?.data?.msg || err.message
        throw new Error(`Error actualizando categoría ${id}: ${msg}`)
    }
}

export async function getProductoNB(nb_id) {
    const token = await getNBToken()
    try {
        const res = await axios.get(
            `https://api-nb-dev.blu.net.ar/v1/item/${nb_id}`,
            { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
        )
        return res.data
    } catch (err) {
        const msg = err.response?.data?.msg || err.message
        throw new Error(`Error obteniendo producto ${nb_id} de NB: ${msg}`)
    }
}
