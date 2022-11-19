var express = require('express');
var router = express.Router();
const PASSW_EMAIL = process.env.PASSW_EMAIL;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gettbitcoins@gmail.com',
    pass: PASSW_EMAIL
  }
});

//const passport = require('passport')
// importar el modelo User
import User from '../models/user.js';

// lllamamos al Middleware
const { verificarAuth, verificaRol } = require('../middlewares/autenticacion');

// Hash Contraseña
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Agregar en usuarios sin verif
router.put('/restaurar-usuario/:id', async (req, res) => {
  console.log('id**********************: ' + req.params.id);
  console.log(req.body);
  const _id = req.params.id;
  const email = req.body.EMAIL;
  const restsinbyc = req.body.RESTAURAR;
  let rbody = { RESTAURARUSUARIO: req.body.RESTAURAR };
  rbody.RESTAURARUSUARIO = bcrypt.hashSync(req.body.RESTAURAR, saltRounds);
  console.log('RESTAURARUSUARIO bycrypt: ' + rbody.RESTAURARUSUARIO);
  try {
    const rUserDB = await User.findByIdAndUpdate(
      _id,
      rbody,
      { new: true });

    // email 
    let servidor = 'http://localhost:8080/Restaurar?' // en server como es backend no haria falta comentar esta linea
    // let servidor = 'http://www.contobit.com/Restaurar?'
    let mailOptions = {
      from: 'gettbitcoins@gmail.com',
      to: email,
      subject: 'Restaurar acceso en CoinstoBitcoins',
      html: "<h2>Restaurar acceso: </h2><img align=top src=91.194.90.189/imagenes%20web/tlogonewtext.png width=200px height=30px><br/> Estimado usuario, <br/> <br/> Por favor, pulse el botón para recuperar acceso a su cuenta en CoinstoBitcoins.com. <br/> <br/> <a href=" + servidor + restsinbyc + "><button type=submit class=btn btn-primary btn-lg btn-block info><h4>Restablecer acceso a mi cuenta en GettingBitcoins.com</h4></button></a>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email enviado: ' + info.response);
      }
    });
    // email

    return res.jsonu(rUserDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Agregar en usuarios sin verif
router.post('/nuevo-usuario', async (req, res) => {
  const body = {
    NOMBREUSUARIO: req.body.NOMBREUSUARIO,
    EMAILUSUARIO: req.body.EMAILUSUARIO,
    role: req.body.role,
    IP1: req.body.IP1,
    IP2: req.body.IP1
  }
  body.PASSWORDUSUARIO = bcrypt.hashSync(req.body.PASSWORDUSUARIO, saltRounds);

  try {
    //console.log('usuario: '+body.NOMBREUSUARIO);
    const UserDB = await User.create(body);
    return res.json(UserDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Agregar en usuarios con verif
router.post('/nuevo-usuariovf', [verificarAuth, verificaRol], async (req, res) => {
  const body = {
    NOMBREUSUARIO: req.body.NOMBREUSUARIO,
    EMAILUSUARIO: req.body.EMAILUSUARIO,
    role: req.body.role
  }

  body.PASSWORDUSUARIO = bcrypt.hashSync(req.body.PASSWORDUSUARIO, saltRounds);

  try {
    const UserDB = await User.create(body);
    return res.json(UserDB);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});


// Get con todos los documentos, el de abajo es el que usmos de momento
// probado el verificarAuth desde postman cuando falta enviar un token valido en la cabecera de la peticion del frontend
// y habilitar el verificarAuth en el get de abajo y en todos
router.get('/usuario', [verificarAuth, verificaRol], async (req, res) => { // ojo solo este tiene el ,verificarAuth 
  // cuando lo probemos y funcione falta aplicar en todas las peticiones del user
  try {
    const UserDb = await User.find();
    res.json(UserDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Get con todos los documentos
router.get('/User', async (req, res) => {
  try {
    const UserDb = await User.find();
    res.json(UserDb);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});
// Get con un documento con parametros id
router.get('/User/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const UserDB = await User.findOne({ _id });
    res.json(UserDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error en busqueda por id',
      error
    })
  }
});
// Get con un documento con parametros NOMBREUSUARIO (ADDRESS)
router.get('/seekUser/:NOMBREUSUA', async (req, res) => {
  var _NOMBREUSUARIO = Buffer.from(req.params.NOMBREUSUA, 'base64').toString().trim();
  try {
    const UserDB = await User.findOne({ 'NOMBREUSUARIO': _NOMBREUSUARIO });
    console.log('verificacion válida usuario: ' + UserDB.NOMBREUSUARIO);
    res.json(UserDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error en busquesda por dirección bitcoin',
      error
    })
  }
});

// Delete eliminar un usuario
router.delete('/deleteusuario/:id', verificarAuth, async(req, res) => {
  const _id = req.params.id;
  try {
    const userDelete = await User.findByIdAndDelete({_id});
    console.log('entro *****************');   
    console.log(userDelete);
    if (!userDelete) {
      return res.status(400).json({
        mensaje: 'No se encontró el usuario',
        error
      })
    }
    res.json(userDelete);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});

// Put actualizar un usuario
router.put('/usuario/:id', verificarAuth, async (req, res) => {
  // Filtrar campos de PUT
  const _ = require('underscore');

  let id = req.params.id;
  let body = _.pick(req.body, ['NOMBREUSUARIO', 'EMAILUSUARIO', 'role', 'PASSWORDUSUARIO', 'IPSHABITUALES', 'IP1', 'IP2','ALERTEMAIL','PREFCADENA','PREFIDIOMA','PREFDIVISA','DIRMULTIFIRMA_FIANZALN','MF_SCRIPTPUBKEY_FIANZALN','REDEEMSCRIPT_FIANZALN','ARBITRAJE','RETRAWTXSIGNEDARB','RETRAWTXSIGNEDVEND','IDTX_RETIRO','FEEFORRETRAW','RETRAWTXOPEN_LOCKTIME','LOCKTIME_RAWTXOPEN' ]);  
  if (body.PASSWORDUSUARIO) {
    body.PASSWORDUSUARIO = bcrypt.hashSync(req.body.PASSWORDUSUARIO, saltRounds);
  } 
  try {
    // {new:true} nos devuelve el usuario actualizado
    const usuarioDB = await User.findByIdAndUpdate(
      id,
      body,
      { new: true }); // para que corra las validaciones (para que no se puedan ingresar roles inválidos)
    return res.json(usuarioDB);

  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }
});
// runValidators: true
// Agregaremos otra opción a nuestra actualización para que corra las validaciones (para que no se puedan ingresar roles inválidos)

// Exportamos la configuración de express app
module.exports = router;
