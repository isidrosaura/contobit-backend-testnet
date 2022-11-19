var express = require('express');
var router = express.Router();

// importar el modelo Options
import options from '../models/options.js';

// Get con todos los documentos
router.get('/Options', async(req, res) => { 
  try {
    const OptionsDb = await options.find();
   // console.log(OptionsDb);
    res.json(OptionsDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Exportamos la configuración de express app
module.exports = router;
