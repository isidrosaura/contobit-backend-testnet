import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const optionsSchema = new Schema({

},
{ collection : 'options' }
);   // collection name

// optionsSchema.index({ NOMBREUSUARIO: 'text' });
 
// Convertir a modelo
const options = mongoose.model('options', optionsSchema);

export default options;