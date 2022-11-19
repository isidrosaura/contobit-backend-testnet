import express from 'express';
const router = express.Router();

// importar el modelo
import lightning from '../models/lnd.js';

//ejemplos al rpc lnd diferentes
//lightning.walletBalance({}, function(err, response) {
//  if (err) {
//    console.log('Error: ' + err);
//  }
//  console.log('balance:', response);
//});

router.get('/ln-addInvoice/:value,:memo', async(req, res) => {

  const _value = req.params.value;
  const _memo = req.params.memo; 
  let requaddin = { 
    value: _value,
    memo: _memo,
    expiry: 7200,
  }; 
    try {
         await lightning.addInvoice(requaddin, function(err, response) {
          if (err) {
            console.log('Error: ' + err);
          }
        //  console.log(response);
          res.json(response)
        });

    } catch (error) {
      //  console.log(error);
        return res.status(500).json({
          mensaje: 'Ocurrio un error en acceso a rpc lnd',
          error
        })  
    }
  });

  router.get('/ln-decodePayReq/:payment_request', async(req, res) => {

    const _payment_request = req.params.payment_request;
    let request = { 
      pay_req: _payment_request, 
    }; 

    try {
         await lightning.decodePayReq(request, function(err, response) {
          if (err) {
            console.log('Error: ' + err);
          }
          //console.log(response);
          // Sending a response can be achieved by calling the res.send() method. The signature of this method looks like this: res.send([body]) where the body can be any of the following: Buffer, String, an Object and an Array.
          res.json(response)
        });

    } catch (error) {
       // console.log(error);
        return res.status(500).json({
          mensaje: 'Ocurrio un error en acceso a rpc lnd',
          error
        })  
    }
  }); 
  
  router.get('/ln-lookupInvoice/:invoiceID', async(req, res) => {

    const _invoiceID = req.params.invoiceID;
    let request_lookI = { 
      r_hash_str: _invoiceID, 
    }; 

    try {
         await lightning.lookupInvoice(request_lookI, function(err, response) {
          if (err) {
            console.log('Error: ' + err);
          }
          //console.log(response);
          res.json(response)
        });

    } catch (error) {
       // console.log(error);
        return res.status(500).json({
          mensaje: 'Ocurrio un error en acceso a rpc lnd',
          error
        })  
    }
  });

  router.get('/ln-sendPaymentSync/:Ln_paymreq_entreg', async(req, res) => {

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
         await lightning.sendPaymentSync(request_paymreq_entreg, function(err, response) {
          if (err) {
            console.log('Error: ' + err);
          }
          //console.log(response);
          res.json(response);
        });
  
    } catch (error) {
       // console.log(error);
        return res.status(500).json({
          mensaje: 'Ocurrio un error en acceso a rpc lnd',
          error
        })  
    }
    
  });
    
  
module.exports = router;