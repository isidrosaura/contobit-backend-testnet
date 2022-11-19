import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// accesso directo a una coleccion exitente en mongo
const comprarSchema = new Schema({
  IDOFERTA: Number,
  NOMBREUSUARIO: {type: String, required: [true, 'Falta campo']},
  usuarioId: String,
  ONLINE: {type: Boolean, default: true},
  CADENARED: {type: String, default: '₿'},
  FORMADEPAGO: String,
  PRECIOOFERTA: {type: Number,  required: [true, 'Valor Precio obligatorio']},
  MONEDATIPO: {type: String, default: 'Fiat'},  
  MONEDAOFERTA: {type: String,  required: [true, 'Valor Moneda obligatorio']},
  LIMITEABAJO: {type: Number,  required: [true, 'Valor para Compra mínima obligatorio']},
  LIMITEARRIBA: {type: Number, default: 1.00000000},
  OFERTAACTIVA: {type: Boolean, default: true},
  TIPOOPERACION: {type: String, default: 'TRAN '},
  BANCO: {type: Number, default: 1001},
  GRUPOBANCO: {type: String, default: 'Globales'},
  NOMBANCO: {type: String,  required: [true, 'Valor Medio de pago obligatorio']},
  createdat: {type: Date, default: Date.now},  
  updatedat: {type: Date, default: Date.now}
},
//  { timestamps: true},
{ collection : 'ofusban-vista' }
);   // collection name
//comprarSchema.index({ "$**": "text" });
comprarSchema.index({ NOMBANCO : "text", MONEDAOFERTA: "text", MONEDATIPO: "text", GRUPOBANCO: "text"})
comprarSchema.index({ PRECIOOFERTA: -1 });

// Convertir a modelo
const Comprar = mongoose.model('ofusban-vista', comprarSchema);

export default Comprar;
