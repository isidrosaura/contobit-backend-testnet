import express from 'express';
const router = express.Router();

// importar el modelo nota
import Transac from '../models/transac.js';
import User from "../models/user";

import CryptoJS from "crypto-js";
var key = process.env.CRYPTO_KEY;
key = CryptoJS.enc.Utf8.parse(key);
var iv = process.env.CRYPTO_IV;
iv = CryptoJS.enc.Utf8.parse(iv);
/*
const word = "meuteste";
let encrypted = CryptoJS.AES.encrypt(word, key, { iv: iv });
encrypted = encrypted.toString();
let decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });
console.log(`Descriptografado 1: ${decrypted}`);
decrypted = decrypted.toString(CryptoJS.enc.Utf8);
console.log("Criptografia AES256 com Base64");
console.log('Texto: "meuteste"');
console.log(`Criptografado: ${encrypted}`);
console.log(`Descriptografado: ${decrypted}`);
*/

// ******************  pruebas preimage LN ***********************************************
//var inithash = "4d94feee7da7d65522bb2e7e2d1e941dffac9236bb7390c5a889f3af9a7d97d9";
//var str = 'c8fa016ba6ea2510dd099b5dd2d5a3ed98655c23d72f5e6cbb353968f058d2fe';
//const preimage = str;
/*
var a = [];
for (var i = 0, len = str.length; i < len; i+=2) {
  a.push(parseInt(str.substr(i,2),16));
}
const preimage = new Uint16Array(a);
console.log("preimage in bytes... " + preimage)
*/
//let hash = CryptoJS.SHA256(preimage);
//let buffer = Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex');
//let array  = new Uint8Array(buffer);

//console.log("Criptografia SHA256 .inithash.." + inithash); 
//console.log("Criptografia SHA256 .hash.." + hash); 
//console.log("Criptografia SHA256 .buffer.." + buffer);
//console.log("Criptografia SHA256 .array.." + array);
/*
Preimage: The preimage is generated using the following formula:
preimage = sha256( concat( s, n, a))
The parameters are defined as follows:
s: A shared secret only known by the recipient node and the point of sale
n: The randomly generated preimage nonce
a: The invoice amount in msat (8 bytes, big-endian); 0 if the invoice does not specify any amount
The SHA-256 hash function is used because the preimage must have a length of 32 bytes according to BOLT-2.
*/
// ****************** fin pruebas preimage LN ***********************************************

// Middlewares
const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");

let transacs = [];

//  RUTAS *****

// Agregar en transac
router.post('/nueva-transac', verificarAuth, async(req, res) => {
  const body = req.body;
//  console.log('body dir arbitrajerecibida .....................'+body.DIRARBITRAJE);
  body.usuarioId = req.usuario._id;  // definido en el verficarauth  
  try {
    const transacDB = await Transac.create(body);

    res.status(200).json(transacDB);
     
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Get Tx del user logueado
router.get('/leer-transac', verificarAuth, async(req, res) => {
//  console.log(req.usuario); // definido en el verficarauth  
  let usuarioNOM = req.usuario.NOMBREUSUARIO;
 // console.log('USER A BUSCAR...'+usuarioNOM);    
  try {
    const transacDB = await Transac.find({ $or: [ {'COMPRADOR': usuarioNOM} , {'VENDEDOR': usuarioNOM}, {'DIRARBITRAJE': usuarioNOM} ]});
  //  console.log('encontrado...'+transacDB);
    res.json(transacDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Get Tx del user logueado en arbitraje
router.get('/leer-transacarb', verificarAuth, async(req, res) => {
  //  console.log(req.usuario); // definido en el verficarauth  
    let usuarioNOM = req.usuario.NOMBREUSUARIO;
    let arbitraje = 'Arbitraje';
    let impago = 'Impago';
    let retorno = 'Retorno';        
   // console.log('USER A BUSCAR...'+usuarioNOM);    
    try {
      const transacDB = await Transac.find({
        $and: [
        { $or: [ {'TIMELINE': arbitraje} , {'TIMELINE': impago}, {'TIMELINE': retorno} ] }, 
        { $or: [ {'COMPRADOR': usuarioNOM} , {'VENDEDOR': usuarioNOM}, {'DIRARBITRAJE': usuarioNOM} ] },
        ]});
    //  console.log('encontrado...'+transacDB);    
      res.json(transacDB);
    } catch (error) {
      return res.status(400).json({
        mensaje: 'Ocurrio un error',
        error
      })
    }
  });

// Put actualizar en transac
router.put('/upt-tx/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  var body = req.body;
  // encriptamos rawtxsignedarb
  //console.log("RAWTXSIGNEDARB:");
  //console.log(body.RAWTXSIGNEDARB);
  //console.log("RAWTXSIGNEDVEND:");  
  //console.log(body.RAWTXSIGNEDVEND);
  if (body.RAWTXSIGNEDARB === body.RAWTXSIGNEDVEND) {
    console.log("SON IDENTICAS y no deberia");
    body.RAWTXSIGNEDARB = '⏳';
    body.RAWTXSIGNEDVEND = '⏳';
  } else { 
    console.log("body.RAWTXSIGNEDARB.substr(0, 2)"+body.RAWTXSIGNEDARB.substr(0, 2));
    if (body.RAWTXSIGNEDARB.substr(0, 2) === '02' | body.RAWTXSIGNEDARB.substr(0, 2) === '01' ) {
    body.RAWTXSIGNEDARB = CryptoJS.AES.encrypt(body.RAWTXSIGNEDARB, key, { iv: iv });
    body.RAWTXSIGNEDARB = body.RAWTXSIGNEDARB.toString();
    }
  }

  try {
    const transacDB = await Transac.findByIdAndUpdate(
      _id,
      body,
      {new: true});

          // actualizamos transacs en socket
          Transac.find((err, result) => {
            if (err) throw err; 
            transacs = result;

              let io = req.app.io;
              io.emit('addedInTransacs', {  
                transacs: transacs 
                });
          });

    res.json(transacDB);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Delete eliminar una tx
router.delete('/eliminar-tx/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  try {
    const transacDB = await Transac.findByIdAndDelete({_id});
    if(!transacDB){
      return res.status(400).json({
        mensaje: 'No se encontró el id indicado',
        error
      })
    }
    res.json(transacDB);  
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// get una tx por id for decode to send
router.get('/get-tx/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  var transac = "";
  try {
    transac = await Transac.findById({_id});
    if(!transac){
      return res.status(400).json({
        mensaje: 'No se encontró el id indicado',
        error
      })
    } 
  // desencriptamos rawtxsignedarb
  //console.log("RAWTXSIGNEDARB:");
  //console.log(transac.RAWTXSIGNEDARB);
    let ecryptd = transac.RAWTXSIGNEDARB;
    let decryptd = CryptoJS.AES.decrypt(ecryptd, key, { iv: iv });
    decryptd = decryptd.toString(CryptoJS.enc.Utf8);
    transac.RAWTXSIGNEDARB = decryptd; 
    //console.log(transac.RAWTXSIGNEDARB);
    res.json(transac);

  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});


// Exportamos la configuración de express app
module.exports = router;
