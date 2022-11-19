require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const cp = require('cookie-parser'); // para control samesite cookies
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const flash = require('connect-flash'); // imprescindible token
const session = require('express-session');
const passport = require('passport');

const hostname = 'contobit.com';
const httpPort = 80;
const httpsPort = 443;
const httpsOptions = {
  cert: fs.readFileSync('./ssl/certificate.crt'),
  ca: fs.readFileSync('./ssl/ca_bundle.crt'),
  key: fs.readFileSync('./ssl/private.key'),  
};

// inicialización
const app = express();
require('./config/passport'); // imprescindible para token autentificacion

app.use(cp()); // para same site

app.use(cors());
app.options('*', cors());
app.use(function (req, res, next) {
  var allowedDomains = ['https://contobit.com','https://www.contobit.com','localhost' ];
  var origin = req.headers.origin;
  if(allowedDomains.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})
/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://www.contobit.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
*/

// *****************************añadiadas 2 lin siguientes para socket io
const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

const io = require("socket.io")(httpsServer, {
  serveClient: false,
  origins: '*:*', // below are engine.IO options
  transports: ['polling'],
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});


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
app.use(passport.session());

app.use((req, res, next) => {
  if(req.protocol === 'http') {
     res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

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

// para samesite cookcies
app.get('/set', (req, res) => {
  // Set the new style cookie
  res.cookie('3pcookie', 'value', { sameSite: 'none', secure: true }); 
  // And set the same value in the legacy cookie
  res.cookie('3pcookie-legacy', 'value', { secure: true });
  res.end();
});
/*
app.get('/', (req, res) => {
  let cookieVal = null;
  
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies) 

  if (req.cookies['3pcookie']) {
    // check the new style cookie first
    cookieVal = req.cookies['3pcookie'];
  } else if (req.cookies['3pcookie-legacy']) {
    // otherwise fall back to the legacy cookie
    cookieVal = req.cookies['3pcookkie-legacy'];
  }

  res.end();
});
*/
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
     console.log(`${socket.username} abandonó el chat socket.on -disconnect-`);
     io.emit("userLeft", socket.username);
     users.splice(users.indexOf(socket), 1);
//     desconexion de la App
      console.log(`${socket.NOMBREUSUARIO} abandonó la App por socket on -disconnect-`);
      io.emit("userLeftApp", socket.NOMBREUSUARIO);
      userstoline.splice(userstoline.indexOf(socket), 1)
//      // aki update activo a false en la base de datos usuarios
//        User.findOneAndUpdate({ NOMBREUSUARIO: socket.NOMBREUSUARIO },{ activo: false }, { new: true }, (err, result) => {
//          if (err) throw err;
//     //   console.log(result);
//        });      
    });
    // desconexion APP y chat
    socket.on("desconectar", () => {
      console.log(`${socket.username} abandonó el chat socket.on -desconectar-`);
      io.emit("userLeft", socket.username);
      users.splice(users.indexOf(socket), 1);
     // desconexion de la App
       console.log(`${socket.NOMBREUSUARIO} abandonó la App socket.on -desconectar-`);
       io.emit("userLeftApp", socket.NOMBREUSUARIO);
       userstoline.splice(userstoline.indexOf(socket), 1)
       // aki update activo a false en la base de datos usuarios
         User.findOneAndUpdate({ NOMBREUSUARIO: socket.NOMBREUSUARIO },{ activo: false }, { new: true }, (err, result) => {
           if (err) throw err;
       //  console.log(result);
         });      
     });    
   
});

//Conexión con socket  ************ añadido para chat revisado en 3 guias
/*
http.listen( process.env.PORT || 3000, () => {
  console.log("http escuchando en puerto %s", process.env.PORT || 3000);
});
*/
httpServer.listen(httpPort, hostname);
httpsServer.listen(httpsPort, hostname);
console.log("http escuchando en puerto ");console.log(httpPort);
console.log("https escuchando en puerto ");console.log(httpsPort);

io.attach( httpsServer );
app.io = io;
