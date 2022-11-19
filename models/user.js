import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

// Roles
const roles = {
    values: ['ADMIN', 'USER'],
    message: '{VALUE} no es un rol válido'
}

const Schema = mongoose.Schema;
const userSchema = new Schema({

    NOMBREUSUARIO: {type: String, required: [true, 'Nombre obligatorio'], unique: true}, //nombre en guia
    EMAILUSUARIO: {type: String, default: 'sinemail@sinemail.com', required: [false, 'Email (Opcional, recomendado alertas)']}, //email en guia
    PASSWORDUSUARIO: {type: String, required: [false, 'Contraseña obligatorio']}, // pass en guia
    RESTAURARUSUARIO: String,
    IP1: String,
    IP2: String,
    IPSHABITUALES: { type: Boolean, default: false },
    DIRMULTIFIRMA_FIANZALN: {type: String, default: '⏳'},
    MF_SCRIPTPUBKEY_FIANZALN: {type: String, default: '⏳'},  
    REDEEMSCRIPT_FIANZALN: {type: String, default: '⏳'},
    RETRAWTXSIGNEDARB: {type: String, default: '⏳'},  
    RETRAWTXSIGNEDVEND: {type: String, default: '⏳'},
    IDTX_RETIRO: {type: String, default: '⏳'},
    FEEFORRETRAW: {type: Number, default: 2},
    RETRAWTXOPEN_LOCKTIME: {type: String, default: '⏳'},
    LOCKTIME_RAWTXOPEN: {type: Number, default: 2130000000},              
    ARBITRAJE: {type: String, default: '⏳'},           
    ALERTEMAIL: { type: Boolean, default: true },
    PREFCADENA: {type: Boolean, default: true, required: [false, 'Cadena de Bloques preferida']},
    PREFIDIOMA: {type: Number, default: 1, required: [false, 'Idioma preferido']},
    PREFDIVISA: {type: String, default: 'united-states-dollar', required: [false, 'Divisa preferida']},        
    createdat: {type: Date, default: Date.now},
    updatedat: {type: Date, default: Date.now},
    role: { type: String, default: 'USER', enum: roles },
    activo: { type: Boolean, default: false }
},
{ collection : 'usuarios' }
);   // collection name

userSchema.index({ NOMBREUSUARIO: 'text' });

// Eliminar pass de respuesta JSON
userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.PASSWORDUSUARIO;
    return obj;
   }
  
// Validator
userSchema.plugin(uniqueValidator, { message: 'Error, esperaba {PATH} único.' });

// creamos modelo en base al esquema y exportamos para su uso

// Convertir a modelo
const User = mongoose.model('User', userSchema);

export default User;