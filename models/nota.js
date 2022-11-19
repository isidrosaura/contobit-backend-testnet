import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notaSchema = new Schema({
  nombre: String,
  descripcion: String,
  usuarioId: String,
  date:{type: Date, default: Date.now},
  activo: {type: Boolean, default: true}
}, {
  timestamps: true
 });

// Convertir a modelo
const Nota = mongoose.model('Nota', notaSchema);

export default Nota;
