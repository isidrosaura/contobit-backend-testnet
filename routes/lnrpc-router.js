import express from 'express';
const router = express.Router();

// importar el modelo
import lnrouter from '../models/lnd-router.js';

 router.get('/ln-sendPaymentV2/:Ln_paymreq_entreg', async(req, res) => {

  const _Ln_paymreq_entreg = req.params.Ln_paymreq_entreg;
  let request_paymreq_entreg = { 
    payment_request: _Ln_paymreq_entreg, 
  }; 
/*
  let call = lnrouter.sendPaymentV2(request_paymreq_entreg);
  call.on('data', function(response) {
    // A response was received from the server.
    console.log(response);
    
  });
  call.on('status', function(status) {
    // The current status of the stream.
  });
  call.on('end', function() {
    // The server has closed the stream.
  });
*/
  
  try {
       await lnrouter.sendPaymentV2(request_paymreq_entreg, function(err, response) {
        if (err) {
          console.log('Error: ' + err);
        }
        console.log(response);
        res.json(response);
      });

  } catch (error) {
      console.log(error);
      return res.status(500).json({
        mensaje: 'Ocurrio un error en acceso a rpc lnd',
        error
      })  
  }
  
});  
  
module.exports = router;