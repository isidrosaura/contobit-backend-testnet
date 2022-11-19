import mongoose from 'mongoose';
const Schema = mongoose.Schema;
//  accesso directo a una coleccion exitente en mongo
const transacSchema = new Schema({
  CADENARED: {type: String, default: '₿'},
  FEE: {type: Number, default: 0.00000000 },
  SIZERAW: {type: Number, default: 0 },
  RETORNO: {type: String, default: '⏳'},  
  ID_OFERTA: String,
  COMPRADOR: String,
  DESTINO: {type: String, default: '⏳'},  
  EMAIL_COMPRADOR: String,
  ID_COMPRADOR: String,
  RAWTXUNSIGNED: {type: String, default: '⏳'},
  RAWTXSIGNEDARB: {type: String, default: '⏳'},//save 2 f sin locktime
  RAWTXSIGNEDVEND: {type: String, default: '⏳'},//save 2 f con locktime 
  CONTRATOSICOMPRADOR: {type: String, default: '❌'},
  VENDEDOR: String,
  EMAIL_VENDEDOR: String,
  ID_VENDEDOR: String,  
  IDTX_ENTREGA: {type: String, default: '⏳'},
  IDTX_ENTREGA_ARBITRAJE: {type: String, default: '⏳'},
  FECHA_INIC: {type: Date, default: Date.now},
  IMPORTECOMPRA: {type: Number, default: 0.00000000},
  IMPORTEMONEDA: {type: Number, default: 0.00},
  MONEDAOFERTA: String, 
  DOCS_COMPRADOR: {type: String, default: '⏳'},  
  COBRO_VENDEDOR: {type: String, default: '⏳'},
  PAGO_COMPRADOR: {type: String, default: '⏳'},  
  LNINVOICEID_COMIS: {type: String, default: '⏳'},
  LNPAYMENTREQ_COMIS: {type: String, default: '⏳'},
  LNPPAYMENTREQ_COMIS: {type: String, default: '⏳'},
  LNINVOICEID_ENTREGA: {type: String, default: '⏳'},
  LNPAYMENTREQ_ENTREGA: {type: String, default: '⏳'},
  LNPPAYMENTREQ_ENTREGA: {type: String, default: '⏳'},         
  ACEP_VENDEDOR: {type: String, default: '⏳'},
  TIMELINE: {type: String, default: '1.Oferta'},
  DIRARBITRAJE: String,
  updatedat: {type: Date, default: Date.now}
},
//  { timestamps: true},
{ collection : 'transac' }
);   // collection name
//transacSchema.index({ "$**": "text" });
transacSchema.index({ COMPRADOR : -1 });
transacSchema.index({ VENDEDOR: -1 });

// Convertir a modelo
const Transac = mongoose.model('transac', transacSchema);

export default Transac;
