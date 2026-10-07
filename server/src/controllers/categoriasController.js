 import { getCategoriasDB, updateCategoria, updateSingleCategoria } from "../services/categoriasQueryes.js"
import { updateSingleCategoriaNB } from "../services/nbQueryes.js"

export async function listarCategorias(req, res) {
  try {
    const resultado = await getCategoriasDB()
    res.json(resultado)
  } catch (err) {
    console.error("error en categorias: ", err )
    res.status(500).json({ error: err.message })
  }
}

export async function editarCategorias(req, res) {
    try {
      // console.log("hh",req.params)
      const { id } = req.params
      // console.log("jj",req.body)
      const categoria = await updateCategoria(id, req.body)
      if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' })
      res.json(categoria)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  // export async function editarUnaCategoria(req, res) {
  //   try {

  //     console.log("...")

  //     const { id } = req.params

  //     const nbPatch = await updateSingleCategoriaNB(id, req.body)
  //     console.log(nbPatch)
  //     res.json(nbPatch)
  //      const categoria = await updateSingleCategoria(id, req.body)
  //      if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' })
  //      res.json(categoria)
  //   } catch (err) {
  //     res.status(500).json({ error: err.message })
  //   }
  // }

  export async function editarUnaCategoria(req, res) {
    try {
      const { id } = req.params
  
      const nbPatch = await updateSingleCategoriaNB(id, req.body)
  
      if (!nbPatch.success) {
        return res.status(502).json({ error: nbPatch.msg || 'Error al actualizar en NB' })
      }
  
      const categoria = await updateSingleCategoria(id, req.body)
      if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' })
  
      res.json(categoria)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }