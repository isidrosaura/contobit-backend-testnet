var express = require("express");
var router = express.Router();
const PASSW_EMAIL = process.env.PASSW_EMAIL;
var nodemailer = require('nodemailer');
// const shell = require('shelljs'); //solo en server

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gettbitcoins@gmail.com',
    pass: PASSW_EMAIL
  }
});

/*
var transporter = nodemailer.createTransport({
  host: "smtps.contobit.com",
  port: 25, //587
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "isidro@contobit.com",
    pass: "13Isidro13"
  }
});
*/
// verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});


// importar el modelo nota y User
import Nota from '../models/nota';
import User from "../models/user";

const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");

let alertas = [];

//RUTAS con auth nuevas
router.post("/nueva", verificarAuth, async (req, res) => {
;  
  let body = req.body;
 // console.log(req.usuario); // definido en el verficarauth
  body.usuarioId = req.usuario._id;
  body.EMAILUSUARIO = req.usuario.EMAILUSUARIO;  

  try {    
    const tareaDB = await Nota.create(body);
// actualica las alertassss en socket
          Nota.find((err, result) => {
            if (err) throw err; 
            alertas = result;
        //   console.log('dentro del find  result alertas..'+alertas);
              // console.log(req.app.io) //io object
              let io = req.app.io;
              io.emit('loggedInAlerts', {  
              alerts: alertas 
              }); // actualica las alertassss en socket
          });
          
// email          
          let mailOptions = {
            from: 'gettbitcoins@gmail.com',
            to: body.EMAILUSUARIO,
            subject: 'Nueva alerta en Contobit',
            text: body.descripcion
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email enviado: ' + info.response);
            }
          });         
// email

    return res.json(tareaDB);

  } catch (error) {
    return res.status(400).json({
      mensaje: "Error al crear nota",
      error
    });
  }

});

router.post('/nueva-a-otro/:id,:mail', verificarAuth, async (req, res) => {
  ;  
    let body = req.body; 
    body.usuarioId = req.params.id;
    body.EMAILUSUARIO = req.params.mail;
    
// primero hacemos un try a users para ver si tiene configurada en la cuenta la recepcion de emails 
      const _id = req.params.id;
      try {
        const UserDB = await User.findOne({ _id });
        var SiSendEmails = UserDB.ALERTEMAIL;
        //console.log('dentro del find result ENVIAR EMAILS..');
        //console.log(SiSendEmails)         
      } catch (error) {
        return res.status(400).json({
          mensaje: 'Ocurrio un error en busqueda por id',
          error
        })
      }
      
    try {    
      const tareaDB = await Nota.create(body);
  // actualica las alertassss en socket
            Nota.find((err, result) => {
              if (err) throw err; 
              alertas = result;            
          //   console.log('dentro del find  result alertas..'+alertas);
                // console.log(req.app.io) //io object
                let io = req.app.io;
                io.emit('loggedInAlerts', {  
                alerts: alertas 
                }); // actualica las alertassss en socket
            });
            
  // email          
            let mailOptions = {
              from: 'gettbitcoins@gmail.com',
              to: body.EMAILUSUARIO,
              subject: '🔔 Contobit.com ',
              html: "<img align=top src=www.contobit.com/img/contobit.png width=200px height=30px><br/><h2>Non-custodial P2P exchange - Bitcoin P2P Arbitration. </h2><br/> <h3> 🔔 </h3> <br/> <br/> Estimado usuario, <br/> <br/> " + body.descripcion  // un espacio blanco seria %20           
            }; 


            // envios desde servidor email google
     
            if ( SiSendEmails === true ) {

          // envios desde servidor email google               
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email enviado: ' + info.response);
              }
            });
              //envio desde server email contobit.com
       /*     shell.exec('echo "<a href="https://www.contobit.com" target="_blank"><img align=top src=www.contobit.com/img/contobit.png width=200px height=30px></a><br/><h2>Non-custodial P2P exchange - Bitcoin P2P Arbitration. </h2><br/> <h3> 🔔 </h3> <br/> <br/> ' + body.descripcion + '" | s-nail -M "text/html" -s "New alert in contobit.com" -r support@contobit.com ' + body.EMAILUSUARIO + ''); */

            } else {

              console.log('Email no enviado:  ** preferencias del cliente no recibir emails **');

            }
            
  // email
  
      return res.json(tareaDB);
  
    } catch (error) {
      return res.status(400).json({
        mensaje: "Error al crear nota",
        error
      });
    }
  
  });

router.get("/letusuar", verificarAuth, async (req, res) => {
  let usuarioId = req.usuario._id;

  try {
    const tareaDB = await Nota.find({ usuarioId });
          alertas = tareaDB;            
          let io = req.app.io;
          io.emit('loggedInAlerts', {  
          alerts: alertas 
          }); // actualica las alertassss en socket    
    return res.json(tareaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: "Error al buscar o crear nota",
      error
    });
  }
});


// ************************* acaban rutas con auth nuevas **********************************************


// Agregar una nota
router.post('/nueva-nota',verificarAuth, async(req, res) => {
  let body = req.body;
  console.log(req.body);
  console.log(req.usuario); // definido en el verficarauth
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
  console.log("aqui el id:"+_id); 
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

// Get con todos los documentos   *** probado con auth en postman
router.get('/nota', async(req, res) => {
  try {
    const notaDb = await Nota.find();
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

        Nota.find((err, result) => {
          if (err) throw err; 
          alertas = result;
        //   console.log('dentro del find  result alertas..'+alertas);
            // console.log(req.app.io) //io object
            let io = req.app.io;
            io.emit('loggedInAlerts', {  
            alerts: alertas 
            }); // actualica las alertassssssssssssssssssssssss
        });  

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
