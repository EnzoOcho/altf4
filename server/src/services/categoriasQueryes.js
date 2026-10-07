import pool from '../db/pool.js'
import { getNBToken } from './nbAuth.js'

export async function syncCategorias() {
    console.log('🔄 Iniciando sync con NB...')
    const token = await getNBToken()

    const res = await fetch(`https://api-nb-dev.blu.net.ar/v1/miCuenta/misCategorias`, {
        headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error(`Error al traer productos`)

    const crudo = await res.json()
    console.log(crudo)
    const categorias = crudo.categories

    let categoriasActualizadas = 0
    let totalCategorias = categorias.length

    //   console.log(productos) funciona bien
    // Upsert en bloque — si ya existe el nb_id lo actualiza, si no lo inserta

    for (const c of categorias) {
        const habilitado = !c.hide // invertir valores
        await pool.query(` 
      INSERT INTO categorias (id, nombre, habilitado, utility) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (id) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre, 
        habilitado = EXCLUDED.habilitado, 
        utility = EXCLUDED.utility 
    `, [c.categoryId, c.description, habilitado, c.utility]);

        categoriasActualizadas++;
        console.log(`${categoriasActualizadas} de ${totalCategorias}`);
    }

    console.log(`✅ Sync completada: ${categoriasActualizadas} categorias`)
    return categoriasActualizadas
}

export async function getCategoriasDB() {
    const { rows } = await pool.query(
        `SELECT 
          id, nombre, habilitado, utility
        FROM categorias
        ORDER BY habilitado DESC
        `)
    //  console.log(rows)
    return rows
}

export async function updateCategoria(id, { habilitado, newUtility }) {

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE categorias
        SET habilitado = COALESCE($1,habilitado),
        utility = COALESCE($2,utility)
        WHERE id = $3
        `,
            // console.log(rows)
            [habilitado, newUtility, id]
        );
        await client.query(
            `UPDATE productos
            SET utility = COALESCE($1, utility)
            WHERE categoria_id = $2`,
            [newUtility, id]
        );
        await client.query(`COMMIT`)
    } catch (err) {
        await client.query('ROLLBACK'); // Si algo de arriba tira error, se deshace TODO lo pendiente
        throw err; // re-lanzás el error para no ocultarlo
    } finally {
        client.release(); // 6. SIEMPRE devolvés la conexión al pool, pase lo que pase
    }
}

export async function updateSingleCategoria(id, changes) {
     console.log(id, changes)

    // const keys = Object.keys(changes)
    //  console.log(keys)
    // if (keys.length === 0) return;
    // // 2. Construir dinámicamente la sección SET: "nombre = $1, edad = $2"
    // const setString = keys.map((key, index) => `${key} = COALESCE($${index + 1},${key})`).join(', ');

    // // 3. Preparar la consulta final
    // const query = `UPDATE categorias SET ${setString} WHERE id = $${keys.length + 1}`;
    // // console.log(query)

    // // 4. Juntar todos los valores en un solo arreglo (valores del objeto + el ID)
    // const valores = [...Object.values(changes), id]
    // // console.log("valores",valores)
    // // await pool.query(query,valores)

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE categorias
        SET habilitado = COALESCE($1,habilitado),
        utility = COALESCE($2,utility)
        WHERE id = $3
        `,
            // console.log(rows)
            [changes.habilitado, changes.utility,id]
        );
        await client.query(
            `UPDATE productos
            SET utility = COALESCE($1, utility)
            WHERE categoria_id = $2`,
            [changes.utility, id]
        );
        await client.query(`COMMIT`)
    } catch (err) {
        await client.query('ROLLBACK'); // Si algo de arriba tira error, se deshace TODO lo pendiente
        throw err; // re-lanzás el error para no ocultarlo
    } finally {
        client.release(); // 6. SIEMPRE devolvés la conexión al pool, pase lo que pase
    }
    
/////////////////
    // await pool.query(
    //     `UPDATE categorias
    //      SET habilitado = COALESCE($1, habilitado),
    //          utility = COALESCE($2, utility)
             
    //      WHERE id = $3
    //      RETURNING *`,
    //     [changes.habilitado, changes.utility,id]
    // )
}

//AGREGAR UTILITY A LOS PRODUCTOS

// export async function updateCategoria(id, { habilitado, newUtility }) {
//     const { rows } = await pool.query(
//         `UPDATE categorias
//         SET habilitado = COALESCE($1,habilitado),
//         utility = COALESCE($2,utility)
//         WHERE id = $3
//         RETURNING *`,
//         // console.log(rows)
//         [habilitado, newUtility, id]
//     )
//     return rows[0]
// }