const express = require('express');
const router = express.Router();
import User from '../models/user';
const bcrypt = require('bcrypt');
const saltRounds = 10;
// JWT
const jwt = require('jsonwebtoken');

const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");

// get del login
router.get('/', async(req, res) => {
  res.json({mensaje: 'Funciona!'})
})


// get de fecha server
router.get('/fecha-server/', async(req, res) => {
  //var fecha = new Date();
  //console.log(fecha);
  var today = new Date().getFullYear()+'-'+("0"+(new Date().getMonth()+1)).slice(-2)+'-'+("0"+new Date().getDate()).slice(-2)
  console.log(today);
  res.json({ahora: today})
})


// post del login

router.post('/login', async(req, res) => { // cambiado el orig del frontend de  / a /login y funciona

  let body = req.body;
//  console.log(req.body);
  try {
    // Buscamos nombreuser en DB
    const usuarioDB = await User.findOne({NOMBREUSUARIO: body.NOMBREUSUARIO});
  //  console.log(usuarioDB);
    // Evaluamos si existe el usuario en DB
    if(!usuarioDB){
      return res.status(400).json({
        mensaje: 'Usuario! inválido',
      });
    }
/*
    // Evaluamos la contraseña correcta ****** activar en versión entrar antiguo con password *****
    if( !bcrypt.compareSync(body.PASSWORDUSUARIO, usuarioDB.PASSWORDUSUARIO) ){ // el pass deberia ser el que llega del post
      return res.status(400).json({
        mensaje: 'contraseña! inválida',
      });
    }
*/   
    // Generar Token
    let token = jwt.sign({
    data: usuarioDB
    }, 'secret', { expiresIn: 60 * 60 * 24 * 30}) // Expira en 30 días

    // Pasó las validaciones
  //  console.log('el usuarioDB...'+usuarioDB);
   // console.log('el token...'+token);    
    return res.json({
      usuarioDB,
      token: token
    })
    
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    });
  }

});

// post del login restaurar **************************************************

router.post('/loginrest', async(req, res) => { // cambiado el orig del frontend de  / a /login y funciona

  let body = req.body;
//  console.log(req.body);
  try {
    // Buscamos nombreuser en DB
    const usuarioDB = await User.findOne({NOMBREUSUARIO: body.NOMBREUSUARIO});
  //  console.log(usuarioDB);
    // Evaluamos si existe el usuario en DB
    if(!usuarioDB){
      return res.status(400).json({
        mensaje: 'Usuario! inválido',
      });
    }

    // Evaluamos la contraseña correcta
    if( !bcrypt.compareSync(body.RESTAURARUSUARIO, usuarioDB.RESTAURARUSUARIO) ){ // el pass deberia ser el que llega del post
      return res.status(400).json({
        mensaje: 'contraseña! inválida',
      });
    }
   
    // Generar Token
    let token = jwt.sign({
    data: usuarioDB
    }, 'secret', { expiresIn: 60 * 60 * 24 * 30}) // Expira en 30 días

    // Pasó las validaciones
  //  console.log('el usuarioDB...'+usuarioDB);
   // console.log('el token...'+token);    
    return res.json({
      usuarioDB,
      token: token
    })
    
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    });
  }

});

module.exports = router;
