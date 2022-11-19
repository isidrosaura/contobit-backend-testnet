import express from 'express';
const router = express.Router();

// importar el modelo nota
import Comprar from '../models/ofusban-vista.js';
import User from "../models/user";

// Middlewares
const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");


// Agregar en ofusban-vista
router.post('/nueva-ofusban-vista', verificarAuth, async(req, res) => {
  const body = req.body;
  body.usuarioId = req.usuario._id;  // definido en el verficarauth  
  try {
    const ofusbanDB = await Comprar.create(body);
    res.status(200).json(ofusbanDB); 
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});
// Get con todos los documentos del user logueado
router.get('/ofusban-vista', verificarAuth, async(req, res) => {
//  console.log(req.usuario); // definido en el verficarauth  
  let usuarioId = req.usuario._id;
  try {
    const ofusbanDb = await Comprar.find({usuarioId}).sort({ PRECIOOFERTA: 1 }); 
    res.json(ofusbanDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});


// Get con todos los documentos y filtros treeselect
router.get('/ofusban-vista/:vals', async(req, res) => {
  let vals = req.params.vals;
//  vals=vals.replace(/,/g,"' '");
// console.log(vals);
  try {
    const ofusbanDb = await Comprar.find({ $text : { $search: vals } }).sort({ PRECIOOFERTA: 1 }); 
 // const ofusbanDb = await Comprar.find({ 'MONEDAOFERTA' : 'USD' , 'NOMBANCO' : 'PayPal'});
    res.json(ofusbanDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});
// Get con un documento con parametros
router.get('/ofusban-vistaid/:id', verificarAuth, async(req, res) => {
  //let usuarioId = req.usuario._id; 
  //console.log("aqui el userid:"+req.usuario._id); // definido en el verficarauth   
  const _id = req.params.id;
  //console.log("aqui el id:"+_id); 
  try {
    const ofusbanDB = await Comprar.findOne({_id})
    res.json(ofusbanDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Delete eliminar una nota
router.delete('/ofusban-vista/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  try {
    const ofusbanDb = await Comprar.findByIdAndDelete({_id});
    if(!ofusbanDb){
      return res.status(400).json({
        mensaje: 'No se encontró el id indicado',
        error
      })
    }
    res.json(ofusbanDb);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Put actualizar una nota
router.put('/ofusban-vista/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  const body = req.body;
  try {
    const ofusbanDb = await Comprar.findByIdAndUpdate(
      _id,
      body,
      {new: true});
    res.json(ofusbanDb);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});


// Exportamos la configuración de express app
module.exports = router;
