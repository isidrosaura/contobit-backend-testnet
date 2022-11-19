import express from 'express';
const router = express.Router();

// importar el modelo nota
import ChatModel from '../models/chat.js';

// Middlewares
const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");

//  RUTAS

// Delete eliminar una tx en concreto ******* falta testear ********** puede faltar comprobar indice creado en model
router.delete('/eliminarchat-tx/:txid', verificarAuth, async(req, res) => {
  const _txid = req.params.txid.toString().trim();
  console.log("recibido txid del front..."+_txid);
  try {
      const chatDB = await ChatModel.deleteMany( { txid: _txid } );
 
      // eliminar los ficheros de la txid
      const globby = require('globby')
      const fs2 = require('fs').promises
      console.log('runing delete')     
      globby('/home/isidro/contobitapp/public/filesrecibidosfrontchats/'+_txid+'*.*')
        .then(files => {
          const deletePromises = files.map(file => fs2.unlink(file))
          return Promise.all(deletePromises)
        })
        .then(() => {
          console.log('All files removed')
        })
        .catch(err => {
          console.error('Something wrong happened removing files', err)
        })
      // fin eliminar files 

  //console.log(" number of matched documents..."+chatDB.n);
  //console.log("1 if the operation was successful..."+chatDB.ok); 
  //console.log("number of deleted documents..."+chatDB.deletedCount); 

    if(!chatDB){

      return res.status(400).json({
        mensaje: 'No se encontró el id indicado',
        error
      })
    }
    res.json(chatDB);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Exportamos la configuración de express app
module.exports = router;
