require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const flash = require('connect-flash'); // imprescindible token
const session = require('express-session');
const passport = require('passport');

// inicialización
const app = express();
require('./config/passport'); // imprescindible para token autentificacion

app.use(cors());
app.options('*', cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// *****************************añadiadas 2 lin siguientes para socket io
const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  serveClient: false,
  origins: '*:*', // below are engine.IO options
  transports: ['polling'],
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

//const io = require("socket.io")(http, { origins: '*:*'});
//const io = require("socket.io")(http);
//const expressStatusMonitor = require('express-status-monitor'); // esta y las 4 que siguen x handsshake error 
//app.use(expressStatusMonitor({
//  websocket: io,
//  port: app.get('PORT')
// }));


// inicializar variables para chat y users on line sockets
let users = []; //chat
let messages = []; // chat
let userstoline = []; // control users online by socket
var alerts = []; // control alertas by socket

// Conexión base de datos
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
const options = {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false };

// Or using promises
mongoose.connect(MONGODB_URI, options).then(
  /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
  () => { console.log('Conectado a DB') },
  /** handle initial connection error */
  err => { console.log(err) }
);

//para el chat
import ChatModel from './models/chat.js';
// ChatModel.create({ username : 'jesus' , msg : 'primer mensaje'})
// para users online socket
import User from './models/user.js'; // para users online socket
// para las alertas
import Nota from './models/nota.js'; // para alertas socket

import { json } from 'express';

// Middlewares
app.use(morgan('tiny'));
//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({  // imprescindible para token
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { sameSite: 'strict' },  
}));
app.use(passport.initialize());
app.use(passport.session())

// Global variables

// Rutas
//app.get('/', (req, res) => {
//  res.send('Hello World!');
//});

// Usamos las rutas
app.use('/api', require('./routes/btcrpc'));
app.use('/api', require('./routes/lnrpc'));
app.use('/api', require('./routes/lnrpc-router'));
app.use('/api', require('./routes/nota'));
app.use('/api', require('./routes/ofusban-vista.js'));
app.use('/api', require('./routes/options.js'));
app.use('/api', require('./routes/transac.js'));
app.use('/api', require('./routes/users.js')); 
app.use('/api', require('./routes/login'));
app.use('/api', require('./routes/chat.js'));
// Middleware para Vue.js router modo history
const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(path.join(__dirname, 'public')));

// conexion con la base de datos del chat
ChatModel.find((err, result) => {
  if (err) throw err;
//console.log(result);
  messages = result;
});
// conexion con la base de datos de usuarios on line al iniciar
User.find({ activo: true },(err, result) => {
  if (err) throw err;
//console.log(result);
  userstoline = result;
});
// conexion con la base de datos de alertas
Nota.find((err, result) => {
  if (err) throw err;
//console.log(result);
  alerts = result;
});


var fs = require('fs');

var files = {}, 
    struct = { 
        name: null, 
        type: null, 
        size: 0, 
        data: [], 
        slice: 0, 
    };

//Conexión con socket  ************ 
io.on("connection", socket => {
//  if (!socket.handshake.session) {
//    return socket.emit('redirect');
//  }

  // al loguear en chat tx
    socket.emit('loggedIn', {
      users: users.map(s => s.username), // nuevo array con los users en chat
      messages: messages // actualica los messages 
    });
  // al loguear en entrar app.... 
    socket.emit('loggedInApp', {
      userstoline: userstoline.map(s => s.NOMBREUSUARIO), // nuevo array con los users en app
  });
  
  // al conectar nuevo array con los _id de usuarios con alertas
    socket.emit('loggedInAlerts', {        
      alerts: alerts // actualica las alertas 
  });     

  // nuevo usuario conectado en chat tx
    socket.on('newuser', username => {
      console.log(`${username} se unió al chat`);
      socket.username = username;

      users.push(socket);         

      io.emit('userOnline', socket.username);
      io.emit('loggedIn', {
        users: users.map(s => s.username), // nuevo array con los users en chat
        messages: messages // actualica los messages 
      });     
    });
  // nuevo usuario conectado en la App logueado en entrar
      socket.on('newuserapp', NOMBREUSUARIO => {
        console.log(`${NOMBREUSUARIO} se conectó a la app`);
        socket.NOMBREUSUARIO = NOMBREUSUARIO;     
        userstoline.push(socket);
        // cambiamos el activo a true en usuarios
        User.findOneAndUpdate({ NOMBREUSUARIO: socket.NOMBREUSUARIO },{ activo: true }, { new: true }, (err, result) => {
          if (err) throw err;
      //  console.log(result);
        });
          
       io.emit('userOnlineApp', socket.NOMBREUSUARIO);
      });    

    
   // nuevo mensaje fichero
   socket.on('slice upload', (data) => { 
     
    if (!files[data.name]) { 
        files[data.name] = Object.assign({}, struct, data); 
        files[data.name].data = []; 
    }
    console.log(data.data);
    console.log(files[data.name].size);           
    //convert the ArrayBuffer to Buffer 
   data.data = new Buffer.from(new Uint8Array(data.data));
  //save the data 
    files[data.name].data.push(data.data); 
    files[data.name].slice++;
    console.log(files[data.name]);
    console.log(files[data.name].slice * 10000);
    console.log(files[data.name].size);    
    if (files[data.name].slice * 10000 >= files[data.name].size) { 
        //do something with the data 
        var fileBuffer = Buffer.concat(files[data.name].data); 
    
        fs.writeFile('/home/isidro/contobitapp/public/filesrecibidosfrontchats/'+data.name, fileBuffer, (err) => { 
       //     delete files[data.name]; 
            if (err) return socket.emit('upload error');
           
            socket.emit('end upload');
        });

    } else {
      console.log('pasa de 10k requerimos mas slices'); 
        socket.emit('request slice upload', { 
            currentSlice: files[data.name].slice 
        }); 
    }  
   });

   // nuevo mensaje normal
   socket.on('msg', (mjedata) => { 

    //console.log(mjedata);

         let message = new ChatModel({
           txid: mjedata.txid,
           username: mjedata.username,
           msg: mjedata.msg,      
           filename: mjedata.filename
         });
   
         message.save((err, result) => {
             if (err) throw err;
  
             //console.log(result);
             messages.push(result);
   
             io.emit('msg', result);
         });
       });             

   // desconexiónes
   // desconexion del chat  
    socket.on("disconnect", () => {
     console.log(`${socket.username} abandonó el chat`);
     io.emit("userLeft", socket.username);
     users.splice(users.indexOf(socket), 1);
    // desconexion de la App
      console.log(`${socket.NOMBREUSUARIO} abandonó la App`);
      io.emit("userLeftApp", socket.NOMBREUSUARIO);
      userstoline.splice(userstoline.indexOf(socket), 1)
      // aki update activo a false en la base de datos usuarios
        User.findOneAndUpdate({ NOMBREUSUARIO: socket.NOMBREUSUARIO },{ activo: false }, { new: true }, (err, result) => {
          if (err) throw err;
     //   console.log(result);
        });      
    });
    socket.on("desconectar", () => {
      console.log(`${socket.username} abandonó el chat`);
      io.emit("userLeft", socket.username);
      users.splice(users.indexOf(socket), 1);
     // desconexion de la App
       console.log(`${socket.NOMBREUSUARIO} abandonó la App`);
       io.emit("userLeftApp", socket.NOMBREUSUARIO);
       userstoline.splice(userstoline.indexOf(socket), 1)
       // aki update activo a false en la base de datos usuarios
         User.findOneAndUpdate({ NOMBREUSUARIO: socket.NOMBREUSUARIO },{ activo: false }, { new: true }, (err, result) => {
           if (err) throw err;
       //  console.log(result);
         });      
     });    
  
    /*
    // aquí va evento escribiendo
    socket.on("typing", data => {
      socket.broadcast.emit("notifyTyping", {
          user: data.user,
          message: data.message
      });
    });      
    // aquí va evento dejar de escribir
    socket.on("stopTyping", () => {
      socket.broadcast.emit("notifyStopTyping");
    });
    */ 

});

//Conexión con socket  ************ añadido para chat revisado en 3 guias

//settings
/*
app.set('puerto', process.env.PORT || 3000);
app.listen(app.get('puerto'), () => {
  console.log('app escuchando en puerto '+ app.get('puerto'));
});
*/

http.listen( process.env.PORT || 3000, () => {
  console.log("http escuchando en puerto %s", process.env.PORT || 3000);
});

io.attach( http );
app.io = io;
