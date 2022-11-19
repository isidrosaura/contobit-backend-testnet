import express from 'express';
const router = express.Router();

// importar el modelo nota
import Nota from '../models/nota';

const {verificarAuth, verificarAdministrador} = require('../middlewares/autenticacion')

// Agregar una nota
router.post('/nueva-nota', verificarAuth, async(req, res) => {
  const body = req.body;
  
  body.usuarioId = req.usuario._id;

  try {
    const notaDB = await Nota.create(body);
    res.status(200).json(notaDB); 
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});
// Get con un documento con parametros
router.get('/nota/:id', async(req, res) => {
  const _id = req.params.id;
  try {
    const notaDB = await Nota.findOne({_id});
    res.json(notaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Get con todos los documentos
router.get('/nota', verificarAuth, async(req, res) => {

  const usuarioId = req.usuario._id

  try {
    const notaDb = await Nota.find({usuarioId}); // ojo se añadio el usuarioId
    res.json(notaDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Delete eliminar una nota
router.delete('/nota/:id', async(req, res) => {
  const _id = req.params.id;
  try {
    const notaDb = await Nota.findByIdAndDelete({_id});
    if(!notaDb){
      return res.status(400).json({
        mensaje: 'No se encontró el id indicado',
        error
      })
    }
    res.json(notaDb);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Put actualizar una nota
router.put('/nota/:id', async(req, res) => {
  const _id = req.params.id;
  const body = req.body;
  try {
    const notaDb = await Nota.findByIdAndUpdate(
      _id,
      body,
      {new: true});
    res.json(notaDb);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});


// Exportamos la configuración de express app
module.exports = router;
