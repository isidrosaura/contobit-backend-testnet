import express from 'express';
const router = express.Router();

// importar el modelo
 
import rpcbtc from '../models/btc.js';

// Middlewares
const { verificarAuth, verificaRol } = require("../middlewares/autenticacion");

// moneda tether id
const tt_id = 2147485130; // en modo real sera 31

//ejemplos al rpc btc diferentes y probando omni

router.get('/omni', async(req, res) => {

  try {
      const { result: omni_listprop } = await rpcbtc.omni_listproperties([]);
      //  console.log('props omni: '+omni_listprop);
      res.json(omni_listprop)
  } catch (error) {
      //  console.log(error);
      return res.status(500).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
  }
});

router.get('/rpc', async(req, res) => {

    try {
        const { result: hash } = await rpcbtc.getBlockHash([0]);
        const { result: block } = await rpcbtc.getBlock([hash]);
        const { result: balance } = await rpcbtc.getBalance([]);
        const { result: message } = await rpcbtc.verifyMessage(['n47rmWyPdM1spARwJrNng44KuDcE37qKSY','IA0xIQTi7MZygatjPkanVjuVldSo/iEnteLKyrv4cHAhA3B9MD1AVfPPrb3XbMcKmIg7T9C5DjXwHgCyWVpaLHs=','mensaje']);
          console.log('verificacion de mensaje: '+message);
          console.log('balance: '+balance);
          console.log('blocksize: '+block.size);
        res.json(block.size)
    } catch (error) {
        //  console.log(error);
        return res.status(500).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
  
//get al rpc btc para firmna desde front vue
router.get('/rpc-checkf/:address,:firma,:mensaje', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  const _firma = Buffer.from(req.params.firma, 'base64').toString().trim();
  const _mensaje = Buffer.from(req.params.mensaje, 'base64').toString().trim();
  try {
        const { result: message } = await rpcbtc.verifyMessage([_address,_firma,_mensaje]);
        //  console.log('address recibida:'+_address);              
        //  console.log('firma recibida:'+_firma);
        //  console.log('mensaje recibido:'+_mensaje);
        //  console.log('verificacion de mensaje: '+message);
        res.json(message)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
  
 //get al rpc btc para validar address
router.get('/rpc-checkaddrvalid/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  try {
        const { result: valid } = await rpcbtc.validateAddress([_address]);       

        res.json(valid.isvalid)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });

 //get al rpc btc para saldo de address desde front vue
router.get('/rpc-getlag/', async(req, res) => {

  try {
        const { result: reslag } = await rpcbtc.listaddressgroupings([]);        
        let lag =  reslag.flat().flat();
        ////  console.log(lag);             
        res.json(lag);
       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  }); 

//get al rpc btc para saldo de address desde front vue
router.get('/rpc-getsaldo/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  //  console.log('address getsaldo recibida:'+_address);
  try {
    //  console.log('*********_address*******->'+_address);
        const { result: balances } = await rpcbtc.listaddressgroupings([]);        
        let lag =  balances.flat().flat();
        const found = lag.find(element => element === _address);
        //  console.log('*********encontrado*******->'+found);
        const index_found = lag.findIndex(element => element === _address);
        //  console.log('**indice del encontrado*******->'+index_found);
        //  console.log('*saldo del encontrado**->'+lag[index_found+1]);
        //  console.log(lag);       
        lag = lag[index_found+1]      
        res.json(lag);
        
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });

//get al rpc btc para saldo de address desde front vue
router.get('/rpc-getsaldo-lu/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  //  console.log('address getsaldo recibida:'+_address);
  try {
    const { result: res_lstunspt } = await rpcbtc.listunspent([5,9999999,[_address]])
    //  console.log('res_lstunspt...: ');
    //  console.log(res_lstunspt);
    //  console.log(res_lstunspt.length);    
      var acumsaldo = 0;
      var x=0;
      do {
        if ( x < res_lstunspt.length ) {
         //  console.log("The value of x is : "+x);
         // llenado antes del ++                
         if (res_lstunspt[x] !== undefined & res_lstunspt[x].amount > 0.00000001 & res_lstunspt[x].confirmations > 5 & res_lstunspt[x].safe === true) { 
           acumsaldo = acumsaldo + res_lstunspt[x++].amount;
         } else {
           x++;
         }            
         // como quedan los valores hasta el ultimo caso antes de la condicion while y después del ++
         //  console.log("The value of acumsaldo : "+acumsaldo);
        }
      }
      while (x < res_lstunspt.length & res_lstunspt[x] !== undefined );

      res.json(acumsaldo); 

    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });


//get al rpc btc para saldo de address desde front vue *** omnilayer***** *** omnilayer*****
router.get('/rpc-getsaldott/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  try {
        const { result: balancett } = await rpcbtc.omni_getbalance([_address,tt_id]);                    
        res.json(balancett);
        
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });

//get al rpc btc para info address al nodo desde front vue
router.get('/rpc-getaddressinfo/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
    console.log('address recibida en getaddressinfo: '+_address);
  try {
        const { result: addressinfo } = await rpcbtc.getaddressinfo([_address]);
        console.log( addressinfo );     
        res.json(addressinfo);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });

//importpubkey al rpc btc para info pubkey al nodo desde front vue
router.get('/rpc-importpubkey/:pubkey', async(req, res) => {
  const _pubkey = Buffer.from(req.params.pubkey, 'base64').toString().trim();
  const _label = "";
  const _rescan = false;
  //  console.log('pubkey importada con importpubkey: '+_pubkey);
  try {
        const { result: pubkeyimported } = await rpcbtc.importpubkey([_pubkey,_label,_rescan]);      
        res.json(pubkeyimported);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });

//get al rpc btc para send raw tx definitiva firmas chequeadas del nodo desde front vue 
router.get('/rpc-sendrawtransaction/:hex', verificarAuth, async(req, res) => {
  const _hex = req.params.hex;
  //  console.log('tx hex 2 firmas recibida recibida para : ');
  //  console.log(_hex);  
  try {
        const { result: sended } = await rpcbtc.sendrawtransaction([_hex]);
        //  console.log(sended);          
        res.json(sended);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
}); 

//get al rpc btc para decodificar script del nodo desde front vue
router.get('/rpc-decodescript/:script', verificarAuth, async(req, res) => {
  const _script = req.params.script;
  //  console.log('address recibida para : '+_script);
  try {
        const { result: decoded } = await rpcbtc.decodescript([_script]);           
        res.json(decoded);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
});

//get al rpc btc para decodificar script del nodo desde front vue
router.get('/rpc-decoderawtx/:script', verificarAuth, async(req, res) => {
  const _script = req.params.script;
  //  console.log('address recibida para : '+_script);
  try {
        const { result: decoded } = await rpcbtc.decoderawtransaction([_script]);           
        res.json(decoded);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
});

//get al rpc btc para rpc-arbitcl del nodo desde front vue
router.get('/rpc-arbitcld/:dirarbitrajeB64', verificarAuth, async(req, res) => {

const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  //  console.log('_dirarbitraje recibida : '+_dirarbitraje);
  try {
        const { result: decod } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
        res.json(decod);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
}); 

//crear al rpc btc multifirma createmultisig firmna desde front vue
router.get('/rpc-createmultisig/:comprador,:vendedor,:arbitro', async(req, res) => {
  const _comprador = Buffer.from(req.params.comprador, 'base64').toString().trim();
  const _vendedor = Buffer.from(req.params.vendedor, 'base64').toString().trim();
  const _arbitro = Buffer.from(req.params.arbitro, 'base64').toString().trim();
  //  console.log('_comprador recibida:'+_comprador);              
  //  console.log('_vendedor recibida:'+_vendedor);
  //  console.log('_arbitro recibido:'+_arbitro);
  const arraypartes = [];
  arraypartes.push(_comprador);arraypartes.push(_vendedor);arraypartes.push(_arbitro);

  try {
        const { result: multisig } = await rpcbtc.createmultisig([2,arraypartes,"bech32"]);
        //  console.log('_comprador recibida:'+_comprador);              
        //  console.log('_vendedor recibida:'+_vendedor);
        //  console.log('_arbitro recibido:'+_arbitro);
         //  console.log('verificacion de mensaje: '+message);
        res.json(multisig)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
  
//crear al rpc btc multifirma createmultisig firmna desde front vue
router.get('/rpc-createmultisigLN/:vendedor,:arbitro', async(req, res) => {
  const _vendedor = Buffer.from(req.params.vendedor, 'base64').toString().trim();
  const _arbitro = Buffer.from(req.params.arbitro, 'base64').toString().trim();             
  //  console.log('_vendedor recibida:'+_vendedor);
  //  console.log('_arbitro recibido:'+_arbitro);
  const arraypartes = [];
  arraypartes.push(_vendedor);arraypartes.push(_arbitro);

  try {
        const { result: multisig } = await rpcbtc.createmultisig([2,arraypartes,"bech32"]);             
        //  console.log('_vendedor recibida:'+_vendedor);
        //  console.log('_arbitro recibido:'+_arbitro);
        //  console.log('verificacion de mensaje: '+message);
        res.json(multisig)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });  


//crear al rpc btc RETIRO createopenraw firmna desde front vue *************************************
//prevtxs para el sign del arbitro mas abajo
router.get('/rpc-createopenraw/:origenutxsB64,:dirdestinoB64,:dirarbitrajeB64,:mfscriptPkB64,:redeemB64,:feeminers,:locktimeopen', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dirdestino = Buffer.from(req.params.dirdestinoB64, 'base64').toString().trim();
  var _feeminers = req.params.feeminers;  
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();  
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();
  const _locktim = parseInt(req.params.locktimeopen);
  var inputs = []; 
  var prevtxs = [];

  var _usdt_avendedor = "";
  var _btc_avendedor = "";      

  // mirar saldos de btc y usdt de la multifirma para escoger if 
  try {
    const { result: balancett } = await rpcbtc.omni_getbalance([_origenutxs,tt_id]);                    
    _usdt_avendedor = balancett.balance;
  //  console.log("_usdt_avendedor..."+_usdt_avendedor);         
  } catch (error) {
      return res.status(400).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
  }
  try {
    const { result: res_lstunspt } = await rpcbtc.listunspent([5,9999999,[_origenutxs]])
  
      var acumsaldo = 0;
      var x=0;
      do {
        if ( x < res_lstunspt.length ) {
             
         if (res_lstunspt[x] !== undefined & res_lstunspt[x].amount > 0.00000001 & res_lstunspt[x].confirmations > 5 & res_lstunspt[x].safe === true) { 
           acumsaldo = acumsaldo + res_lstunspt[x++].amount;
         } else {
           x++;
         }            

        }
      }
      while (x < res_lstunspt.length & res_lstunspt[x] !== undefined );

     _btc_avendedor = acumsaldo;
    // console.log("_btc_avendedor..."+_btc_avendedor);
  } catch (error) {
      return res.status(400).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
  }
  //FIN MIRAR Y GUARDAR SALDOS

  _btc_avendedor = _btc_avendedor - ((975 * _feeminers) / 100000000);
  _btc_avendedor = _btc_avendedor.toFixed(8);

if ( parseFloat(_btc_avendedor) > 0 & parseFloat(_usdt_avendedor) === 0 ) {// solo BTC  
  //console.log("_btc_avendedor solo BTC..."+_btc_avendedor);
  try { // conseguir los inputs necesrios para el retiro
    const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
      //console.log('res_listunspent...: ');
      //console.log(res_listunspent);
      //console.log(res_listunspent.length);    
      var acumbtcneeded = 0;
      var x=0;

      do {
        if ( x < res_listunspent.length ) {
          // console.log("The value of x is : "+x);
         // llenado del array de inputs antes del ++
         let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
         inputs.push(input);
         let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: _mfscriptPk, redeemScript: _redeemMf,  amount: res_listunspent[x].amount,};
         prevtxs.push(txsvalues);         
         
         acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount;

         // como quedan los valores hasta el ultimo caso antes de la condicion while
           //console.log("The value of acumbtcneeded : "+acumbtcneeded);
           //console.log('array inputs...: ');
           //console.log(inputs);
           //console.log(prevtxs);
        }
      }
      while ( res_listunspent[x] !== undefined );

  } catch (error) {
     // console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso listunspent a rpc btc',
      error
    })  
  }  

  //outputs
  var outputs = [];
  var output1 = {[_dirdestino]: _btc_avendedor};
  outputs.push(output1);
  //console.log(inputs);     
  //console.log(outputs);
         //var locktime = 1682208000;
  //console.log(_locktim);
  var createdraTx;
  try {
        const { result: createdrawTx } = await rpcbtc.createrawtransaction([inputs,outputs,_locktim])
          //console.log('createdrawTx...: ');
          //console.log(createdrawTx);
        createdraTx = createdrawTx;
        //res.json(createdrawTx)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

  // rescatar clave arbitro en backend
  var _arbitcl = "";
  try {
    const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
    _arbitcl = decodarb;
    //res.json(decod);       
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })   
  }

  //signrawtransactionwithkey "hexrawtx_creada" '["1raclaveprivada" , "2daclaveprivada" ]' '[{"txid":"donde_estan_los_btc","vout":0,"scriptPubKey":"_MULTISIG_SCRIPT_PUBKEY_HERE_","redeemScript":"_MULTISIG_REDEEMSCRIPT_HERE_","amount":0.009}]'"
// privkeys

var pvks = [];
pvks.push(_arbitcl);
//  console.log("******************************* clave arbitro ***************************");
//  console.log("******************************* clave arbitro ***************************");
////  console.log(pvks); //dejar comentado despues de pruebas ****************************** ojoooooooooo*****
//  console.log('prevtxs...: ');
//  console.log(prevtxs);
var rawtxsigned1arbit = "";
try {
   const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([createdraTx,pvks,prevtxs,"NONE|ANYONECANPAY"])  
    //  console.log('signedrawTx 2/2 ARBITRO...: ');
    //  console.log(signedrawTx);
    rawtxsigned1arbit = signedrawTx.hex;
    res.json(signedrawTx.hex)
} catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
}

}

if ( ( parseFloat(_btc_avendedor) > 0 & parseFloat(_usdt_avendedor) > 0) ) {// hay BTC y USDT 
  
  var miners = ((_feeminers * 950)/100000000); 
  miners = parseFloat(miners); 
  if ( miners === 0 ) miners = 0.00000950;
  var prevtxs_tt = [];
  var _cl_arbitro = "";
  var _res_payload = ""; //se llena con detalle de usdt al arbitro 1er envio
  var _res_rawtxtt = ""; //construct tx base sin outputs   

  // 1) List unspent outputs de la multifirma que llenó el vendedor y escogemos el que tiene los btc sufientes...0.suma  
  try { // conseguir los inputs necesrios para el retiro
    const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
      //console.log('res_listunspent...: ');
      //console.log(res_listunspent);
      //console.log(res_listunspent.length);    
      var acumbtcneeded = 0;
      var x=0;

      do {
        if ( x < res_listunspent.length ) {
          // console.log("The value of x is : "+x);
         // llenado del array de inputs antes del ++
            let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
            inputs.push(input);

                let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, value: res_listunspent[x].amount};
                prevtxs.push(txsvalues);
                
                let txsvalues2 =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, redeemScript: _redeemMf,  value: res_listunspent[x].amount};
                prevtxs_tt.push(txsvalues2);                
         
         acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount;

        }
      }
      while ( res_listunspent[x] !== undefined );

  } catch (error) {
     // console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso listunspent a rpc btc',
      error
    })  
  }
  // 2) Construct payload 
  //omni_createpayload_simplesend 2147485130 "1.02"
  try {
    const { result: res_payload } = await rpcbtc.omni_createpayload_simplesend([tt_id,_usdt_avendedor])
    // console.log('res_payload...: ');
    // console.log(res_payload);
    if (res_payload) _res_payload = res_payload;   

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }   
  // 3) Construct transaction base (solo una vez)
    // inputs
    let inputstt = inputs;  
     // console.log(inputstt)
    //outputs
    let outputstt = {};

  try {
    const { result: res_rawtxtt } = await rpcbtc.createrawtransaction([inputstt,outputstt,_locktim])
    // console.log('res_rawtxtt...: ');
    // console.log(res_rawtxtt);
    if (res_rawtxtt) _res_rawtxtt = res_rawtxtt;   

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }
  //4) Attach payload output (el de la cantidad al comprador)
  try {
    const { result: res_opreturn } = await rpcbtc.omni_createrawtx_opreturn([_res_rawtxtt,_res_payload])
    // console.log('omni_createrawtx_opreturn res_opreturn...: ');
    // console.log(res_opreturn);
    if (res_opreturn) _res_rawtxtt = res_opreturn;   

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }
  //5) Attach reference/receiver output
  if (parseFloat(_btc_avendedor) < 0.00000546) {
    var def = "0.00000546";
    }
    if (parseFloat(_btc_avendedor) > 0.00000546) {  
    var def = _btc_avendedor;
    }
    var _res_rawtxtt_prev ="";
    try {
      const { result: res_reference } = await rpcbtc.omni_createrawtx_reference([_res_rawtxtt,_dirdestino,def])
      //  console.log('res_reference...: ');
      //  console.log(res_reference);
      if (res_reference) _res_rawtxtt = res_reference;   
    
    } catch (error) {
      //  console.log(error);
      return res.status(400).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
    }
  //6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta multifirma )
  try {
    const { result: res_change } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt,prevtxs,_origenutxs,miners])
    if (!res_change) console.log("sin res res_change");   
    if (res_change) _res_rawtxtt = res_change; 
    //console.log('res_change...: ');
   // console.log(_res_rawtxtt);   

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }
  //recogemos clave de la firma del arbitro primero _redeemScript
  try {
    const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);
    _cl_arbitro = decodarb;                  
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }
  //7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)
  let pvkstt = [];
  pvkstt.push(_cl_arbitro);
  //let prevtxs_tt = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"redeemScript":_redeemScript,"amount":_amount}];
  //console.log(prevtxs); 
  try {
    const { result: signedarbittt } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt,pvkstt,prevtxs_tt,"NONE|ANYONECANPAY"])
      console.log('signedarbittt...: ');
      console.log(signedarbittt.hex); 
    if (signedarbittt) _res_rawtxtt = signedarbittt.hex;   
    res.json(_res_rawtxtt)
  } catch (error) {
      console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
  }
    
}

});


//crear al rpc btc RETIRO createrawtxRetiro firmna desde front vue *************************************
//prevtxs para el sign del arbitro mas abajo
router.get('/rpc-createrawtxRetiro/:origenutxsB64,:dirdestinoB64,:btc_avendedor,:dirarbitrajeB64,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dirdestino = Buffer.from(req.params.dirdestinoB64, 'base64').toString().trim();
  var _btc_avendedor = req.params.btc_avendedor;
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();  
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();    
  var _feeminers = req.params.feeminers;
  var inputs = []; 
  var prevtxs = [];

  try { // conseguir los inputs necesrios para el retiro
    const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
    //  console.log('res_listunspent...: ');
    //  console.log(res_listunspent);
    //  console.log(res_listunspent.length);    
      var acumbtcneeded = 0;
      var x=0;

      do {
        if ( x < res_listunspent.length ) {
          // console.log("The value of x is : "+x);
         // llenado del array de inputs antes del ++
         let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
         inputs.push(input);
         let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: _mfscriptPk, redeemScript: _redeemMf,  amount: res_listunspent[x].amount,};
         prevtxs.push(txsvalues);         
         
         acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount;

         // como quedan los valores hasta el ultimo caso antes de la condicion while
           //console.log("The value of acumbtcneeded : "+acumbtcneeded);
           //console.log('array inputs...: ');
           //console.log(inputs);
           //console.log(prevtxs);
        }
      }
      while (acumbtcneeded <= _btc_avendedor & res_listunspent[x] !== undefined );

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso listunspent a rpc btc',
      error
    })  
  }  

  //outputs
  var outputs = [];
  var output1 = {[_dirdestino]: _btc_avendedor}; 
  outputs.push(output1);
  var _btc_sobrante = acumbtcneeded - parseFloat(_btc_avendedor) //- _feeminers; // ojoOOOOO
   // console.log("_btc_sobrante*****" +_btc_sobrante);

  if (_btc_sobrante > 0.00000001) {
  _btc_sobrante = _btc_sobrante.toFixed(8);
  var output2 = {[_origenutxs]: _btc_sobrante};  
  outputs.push(output2);  
  }  
   // console.log(inputs);
   // console.log(outputs);

  var rcreatedraTx = "";
  try {
        const { result: createdrawTx } = await rpcbtc.createrawtransaction([inputs,outputs])
        //  console.log('createdrawTx...: ');
        //  console.log(createdrawTx);
        rcreatedraTx = createdrawTx;
        // console.log('rcreatedraTx...: ');
        // console.log(rcreatedraTx);
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

  // rescatar clave arbitro en backend
  var _arbitcl = "";

  try {
    const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
    _arbitcl = decodarb;    
    //res.json(decod);       
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })   
  }

// privkeys
var pvks = [];
pvks.push(_arbitcl);
//  console.log("******************************* clave arbitro ***************************");
//  console.log("******************************* clave arbitro ***************************");
////  console.log(pvks); //dejar comentado despues de pruebas ****************************** ojoooooooooo*****
//  console.log('prevtxs...: ');
//  console.log(prevtxs);
var rawtxsigned1arbit = "";
try {
   const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([rcreatedraTx,pvks,prevtxs])
      console.log('signedrawTx 2/2 ARBITRO...: ');
      console.log(signedrawTx);
    rawtxsigned1arbit = signedrawTx.hex;
    //res.json(signedrawTx.hex)
} catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
}

var size = 0;
try {
      const { result: decoded } = await rpcbtc.decoderawtransaction([rawtxsigned1arbit]);           
      //res.json(decoded);
      size = parseInt(decoded.size * 1.37); //estimado size 2 signs
      //  console.log("size..." + size);
      _feeminers = size * _feeminers;
      _feeminers = _feeminers / 100000000;
      //  console.log("_feeminers..."+_feeminers);

  } catch (error) {
      //  console.log(error);
      return res.status(400).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
  }

  //outputs
  var outputs = [];
  console.log(output2);
  if (output2 === undefined) { // no hay sobrante

    _btc_avendedor = _btc_avendedor - _feeminers;
    _btc_avendedor = _btc_avendedor.toFixed(8);
    var output1 = {[_dirdestino]: _btc_avendedor}; 
    outputs.push(output1);

  } else { // si hay sobrante
  //  console.log("si hay sobrante");
    // a _btc_avendedor no le descontamos nada, queda completo
    var output1 = {[_dirdestino]: _btc_avendedor}; 
    outputs.push(output1);    
   // console.log("_btc_sobrante..."+_btc_sobrante);
    _btc_sobrante = _btc_sobrante - _feeminers;  
    _btc_sobrante = _btc_sobrante.toFixed(8);
    var output2 = {[_origenutxs]: _btc_sobrante};  
    outputs.push(output2);

  }
  //console.log(outputs);

  var fcreatedraTx;
  try {
        const { result: fcreatedrawTx } = await rpcbtc.createrawtransaction([inputs,outputs])
        //  console.log('fcreatedrawTx...: ');
        //  console.log(fcreatedrawTx);
        fcreatedraTx = fcreatedrawTx;
        //res.json(createdrawTx)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

    var frawtxsigned1arbit = "";
    try {
       const { result: fsignedrawTx } = await rpcbtc.signrawtransactionwithkey([fcreatedraTx,pvks,prevtxs])     
        //  console.log('fsignedrawTx 2/2 ARBITRO...: ');
        //  console.log(fsignedrawTx.hex);
        frawtxsigned1arbit = fsignedrawTx.hex;
        res.json(fsignedrawTx.hex)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

});


//crear al rpc usdt RETIRO createrawtxRetiroTT firmna desde front vue *************************************
//prevtxs para el sign del arbitro mas abajo
router.get('/rpc-createrawtxRetiroTT/:origenutxsB64,:dirdestinoB64,:usdt_avendedor,:btc_avendedor,:dirarbitrajeB64,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dirdestino = Buffer.from(req.params.dirdestinoB64, 'base64').toString().trim();
  var _usdt_avendedor = req.params.usdt_avendedor;
  var _btc_avendedor = req.params.btc_avendedor;  
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();  
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();    
  var _feeminers = req.params.feeminers;
  var miners = ((_feeminers * 650)/100000000); 
  miners = parseFloat(miners); 
  if ( miners === 0 ) miners = 0.00000650;
  var suma = miners + parseFloat(_btc_avendedor); 
  //console.log("suma.." + suma); 
  var inputs = []; 
  var prevtxs = [];
  var prevtxs_tt = [];
  
  var _cl_arbitro = "";
  var _res_payload = ""; //se llena con el detalle de usdt al arbitro 1er envio
  var _res_rawtxtt = ""; //construct tx base sin outputs  


// 1) List unspent outputs de la multifirma que llenó el vendedor y escogemos el que tiene los btc sufientes...0.suma
try {
  const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
   // console.log('res_listunspent...: ');
   // console.log(res_listunspent);
   // console.log(res_listunspent.length);
    var acumbtcneeded = 0;
    var x=0;

    do {
      if ( x < res_listunspent.length ) {
       //  console.log("The value of x is : "+x);
       // llenado del array de inputs antes del ++
      // console.log("res_listunspent[x] : "+res_listunspent[x].txid);

                let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
                inputs.push(input);
      
                let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, value: res_listunspent[x].amount};
                prevtxs.push(txsvalues);
              
                let txsvalues2 =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, redeemScript: _redeemMf,  value: res_listunspent[x].amount};
                prevtxs_tt.push(txsvalues2);

                acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount; 

      }
    }
    while ( acumbtcneeded < suma & res_listunspent[x] !== undefined );    

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 2) Construct payload 
//omni_createpayload_simplesend 2147485130 "1.02"
try {
  const { result: res_payload } = await rpcbtc.omni_createpayload_simplesend([tt_id,_usdt_avendedor])
   // console.log('res_payload...: ');
   // console.log(res_payload);
  if (res_payload) _res_payload = res_payload;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 3) Construct transaction base (solo una vez)
  // inputs
  let inputstt = inputs;  
  //  console.log(inputstt)
  //outputs
 //if (parseFloat(_btc_avendedor) === 0) {
 let outputstt = {};
 //}
/*
 if (parseFloat(_btc_avendedor) > 0) {  
 var outputstt = [];
 let output1 = {[_dirdestino]: _btc_avendedor};  
 outputstt.push(output1);
 }
 //console.log(outputstt);
*/
try {
  const { result: res_rawtxtt } = await rpcbtc.createrawtransaction([inputstt,outputstt])
  // console.log('res_rawtxtt...: ');
  // console.log(res_rawtxtt);
  if (res_rawtxtt) _res_rawtxtt = res_rawtxtt;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//4) Attach payload output (el de la cantidad al comprador)
try {
  const { result: res_opreturn } = await rpcbtc.omni_createrawtx_opreturn([_res_rawtxtt,_res_payload])
   // console.log('omni_createrawtx_opreturn res_opreturn...: ');
   // console.log(res_opreturn);
  if (res_opreturn) _res_rawtxtt = res_opreturn;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//5) Attach reference/receiver output
if (parseFloat(_btc_avendedor) <= 0.00000546) {
var def = "0.00000546";
}
if (parseFloat(_btc_avendedor) > 0.00000546) {  
var def = _btc_avendedor-miners;
}
var _res_rawtxtt_prev ="";
try {
  const { result: res_reference } = await rpcbtc.omni_createrawtx_reference([_res_rawtxtt,_dirdestino,def])
   // console.log('res_reference...: ');
   // console.log(res_reference);
  if (res_reference) _res_rawtxtt = res_reference;
  _res_rawtxtt_prev = _res_rawtxtt;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta del user )
try {
  const { result: res_change } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt,prevtxs,_dirdestino,miners])
  if (!res_change) console.log("sin res res_change");   
  if (res_change) _res_rawtxtt = res_change; 
 // console.log('res_change...: ');
 // console.log(_res_rawtxtt);   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//recogemos clave de la firma del arbitro primero _redeemScript
try {
  const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);
  _cl_arbitro = decodarb;                  
} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)
let pvkstt = [];
pvkstt.push(_cl_arbitro);
//let prevtxs_tt = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"redeemScript":_redeemScript,"amount":_amount}];
//console.log(prevtxs); 
try {
  const { result: signedarbittt } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt,pvkstt,prevtxs_tt])
   // console.log('signedarbittt...: ');
   // console.log(signedarbittt.hex); 
  if (signedarbittt) _res_rawtxtt = signedarbittt.hex;   
  //res.json(_res_rawtxtt)
} catch (error) {
    console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// averiguamos el peso real con 1 firma
var size = 0;
try {
      const { result: decoded } = await rpcbtc.decoderawtransaction([_res_rawtxtt]);           
      //res.json(decoded);
      size = parseInt(decoded.size * 1.37); //estimado size 2 signs
      //  console.log("size..." + size);
      miners = size * _feeminers;
      miners = miners / 100000000;
      miners = parseFloat(miners);      
      //  console.log("miners..."+miners);

  } catch (error) {
      //  console.log(error);
      return res.status(400).json({
        mensaje: 'Ocurrio un error en acceso a rpc btc',
        error
      })  
  }
//6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta multifirma )

try {
  const { result: res_changef } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt_prev,prevtxs,_dirdestino,miners])
  if (!res_changef) console.log("sin res res_change");   
  if (res_changef) _res_rawtxtt_prev = res_changef; 
  //console.log('_res_rawtxtt_prev...: ');
  //console.log(_res_rawtxtt_prev);   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)
 
try {
  const { result: signedarbitttf } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt_prev,pvkstt,prevtxs_tt])
  //  console.log('signedarbitttf...: ');
  //  console.log(signedarbitttf.hex); 
  if (signedarbitttf) _res_rawtxtt_prev = signedarbitttf.hex;   
  res.json(_res_rawtxtt_prev)
} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}

});


//crear al rpc btc multifirma createrawTxMf2Mn firmna desde front vue *************************************
//prevtxs para el sign del arbitro mas abajo

router.get('/rpc-createrawtxMf2Mn/:origenutxsB64,:dircompradorB64,:btc_acomprador,:dirarbitrajeB64,:btc_aarbitro,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dircomprador = Buffer.from(req.params.dircompradorB64, 'base64').toString().trim();
  var _btc_acomprador = req.params.btc_acomprador;
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _btc_aarbitro = req.params.btc_aarbitro;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();
  //console.log(_dircomprador);
  
  var _feeminers = req.params.feeminers;
  if ( _feeminers === 0) { _feeminers = 0.00001999 };
  if (_dircomprador !== _dirarbitraje) { // no es lightning
    var sumbtcneeded = parseFloat(_btc_acomprador) + parseFloat(_btc_aarbitro) + parseFloat(_feeminers);
  } else { // si es lightning
    var sumbtcneeded = parseFloat(_btc_acomprador) + parseFloat(_btc_aarbitro) + parseFloat(_feeminers * 2);
  }

  var inputs = []; 
  var prevtxs = [];

  try {
    const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
    //  console.log('res_listunspent...: ');
    //  console.log(res_listunspent);
    //  console.log(res_listunspent.length);    
      var acumbtcneeded = 0;
      var x=0;

      do {
        if ( x < res_listunspent.length ) {
         //  console.log("The value of x is : "+x);
         // llenado del array de inputs antes del ++
         let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
         inputs.push(input);
         let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: _mfscriptPk, redeemScript: _redeemMf,  amount: res_listunspent[x].amount,};
         prevtxs.push(txsvalues);         
         
         acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount;

         // como quedan los valores hasta el ultimo caso antes de la condicion while
         //  console.log("The value of acumbtcneeded : "+acumbtcneeded);
         //  console.log('array inputs...: ');
         //  console.log(inputs);
         //  console.log(prevtxs);

        }
      }
      while (acumbtcneeded < sumbtcneeded & res_listunspent[x] !== undefined );

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso listunspent a rpc btc',
      error
    })  
  }  

  //outputs
  var outputs = [];
  if (_dircomprador !== _dirarbitraje) { // no es lightning
  var output1 = {[_dircomprador]: _btc_acomprador}; 
  outputs.push(output1);
  var output2 = {[_dirarbitraje]: _btc_aarbitro};  
  outputs.push(output2);
  let _btc_sobrante = acumbtcneeded - parseFloat(_btc_acomprador) - parseFloat(_btc_aarbitro) - _feeminers; // ojoOOOOO
  //  console.log("_btc_sobrante*****" +_btc_sobrante);
  //  console.log("_btc_sobrante*****" +_btc_sobrante);
  if (_btc_sobrante > 0.00000001) {
  _btc_sobrante = _btc_sobrante.toFixed(8);
  var output3 = {[_origenutxs]: _btc_sobrante};  
  outputs.push(output3);  
  }
  } else { // es lightning
    _btc_aarbitro = parseFloat(_btc_aarbitro) + parseFloat(_btc_acomprador) + parseFloat(_feeminers);
    _btc_aarbitro = _btc_aarbitro.toFixed(8);    
    var output1 = {[_dirarbitraje]: _btc_aarbitro}; 
    outputs.push(output1);
    let _btc_sobrante = acumbtcneeded - parseFloat(_btc_aarbitro) - _feeminers; 
    //  console.log("_btc_sobrante*****" +_btc_sobrante);
    //  console.log("_btc_sobrante*****" +_btc_sobrante);
    if (_btc_sobrante > 0.00000001) {
    _btc_sobrante = _btc_sobrante.toFixed(8);
    var output3 = {[_origenutxs]: _btc_sobrante};  
    outputs.push(output3);  
    }
  }

  //  console.log(outputs);

  var createdraTx;
  try {
        const { result: createdrawTx } = await rpcbtc.createrawtransaction([inputs,outputs])
        //  console.log('createdrawTx...: ');
        //  console.log(createdrawTx);
        createdraTx = createdrawTx;
        //res.json(createdrawTx)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

  // rescatar clave arbitro en backend
  var _arbitcl = "";
  try {
    const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
    _arbitcl = decodarb;
    //res.json(decod);       
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })   
  }

  //signrawtransactionwithkey "hexrawtx_creada" '["1raclaveprivada" , "2daclaveprivada" ]' '[{"txid":"donde_estan_los_btc","vout":0,"scriptPubKey":"_MULTISIG_SCRIPT_PUBKEY_HERE_","redeemScript":"_MULTISIG_REDEEMSCRIPT_HERE_","amount":0.009}]'"
// privkeys

var pvks = [];
pvks.push(_arbitcl);
//  console.log("******************************* clave arbitro ***************************");
//  console.log("******************************* clave arbitro ***************************");
//  console.log(pvks); //dejar comentado despues de pruebas ****************************** ojoooooooooo*****
//  console.log('prevtxs...: ');
//  console.log(prevtxs);
var rawtxsigned1arbit = "";
try {
   const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([createdraTx,pvks,prevtxs])
    //  console.log('signedrawTx 2/2 ARBITRO...: ');
    //  console.log(signedrawTx);
    rawtxsigned1arbit = signedrawTx.hex;
    res.json(signedrawTx.hex)
} catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
}

});


//crear al rpc btc multifirma createrawTxMf2Mn firmna desde front vue ************************with******LOCKTIME****locktime***LOCKTIME****
//prevtxs para el sign del arbitro mas abajo

router.get('/rpc-createrawtxMf2Mn-LOCKTIME/:origenutxsB64,:dircompradorB64,:btc_acomprador,:dirarbitrajeB64,:btc_aarbitro,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dircomprador = Buffer.from(req.params.dircompradorB64, 'base64').toString().trim();
  var _btc_acomprador = req.params.btc_acomprador;
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _btc_aarbitro = req.params.btc_aarbitro;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();
     
  var _feeminers = req.params.feeminers;
  if ( _feeminers === 0) { _feeminers = 0.00001999 };
  if (_dircomprador !== _dirarbitraje) { // no es lightning
    var sumbtcneeded = parseFloat(_btc_acomprador) + parseFloat(_btc_aarbitro) + parseFloat(_feeminers);
  } else { // si es lightning
    var sumbtcneeded = parseFloat(_btc_acomprador) + parseFloat(_btc_aarbitro) + parseFloat(_feeminers * 2);
  } 

  var inputs = []; 
  var prevtxs = [];

  try {
    const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
    //  console.log('res_listunspent PARA CREATE RAW CON LOCK TIME...: ');
    //  console.log(res_listunspent);
    ////  console.log(res_listunspent.length);    
      var acumbtcneeded = 0;
      var x=0;

      do {
        if ( x < res_listunspent.length ) {
         //  console.log("The value of x is : "+x);
         // llenado del array de inputs antes del ++
         let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
         inputs.push(input);
         let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: _mfscriptPk, redeemScript: _redeemMf,  amount: res_listunspent[x].amount,};
         prevtxs.push(txsvalues);         
         
         acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount;

         // como quedan los valores hasta el ultimo caso antes de la condicion while
         ////  console.log("The value of acumbtcneeded : "+acumbtcneeded);
         //  console.log('array inputs...: ');
         //  console.log(inputs);
         ////  console.log(prevtxs);

        }
      }
      while (acumbtcneeded < sumbtcneeded & res_listunspent[x] !== undefined );

  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso listunspent a rpc btc',
      error
    })  
  }  

  //outputs
  var outputs = [];
  if (_dircomprador !== _dirarbitraje) { // no es lightning
  var output1 = {[_dircomprador]: _btc_acomprador}; 
  outputs.push(output1);
  var output2 = {[_dirarbitraje]: _btc_aarbitro};  
  outputs.push(output2);
  let _btc_sobrante = acumbtcneeded - parseFloat(_btc_acomprador) - parseFloat(_btc_aarbitro) - _feeminers; // ojoOOOOO
  //  console.log("_btc_sobrante*****" +_btc_sobrante);
  //  console.log("_btc_sobrante*****" +_btc_sobrante);
  if (_btc_sobrante > 0.00000001) {
  _btc_sobrante = _btc_sobrante.toFixed(8);
  var output3 = {[_origenutxs]: _btc_sobrante};  
  outputs.push(output3);  
  }
  } else { // es lightning
    _btc_aarbitro = parseFloat(_btc_aarbitro) + parseFloat(_btc_acomprador) + parseFloat(_feeminers);
    _btc_aarbitro = _btc_aarbitro.toFixed(8);    
    var output1 = {[_dirarbitraje]: _btc_aarbitro}; 
    outputs.push(output1);
    let _btc_sobrante = acumbtcneeded - parseFloat(_btc_aarbitro) - _feeminers; 
    //  console.log("_btc_sobrante*****" +_btc_sobrante);
    //  console.log("_btc_sobrante*****" +_btc_sobrante);
    if (_btc_sobrante > 0.00000001) {
    _btc_sobrante = _btc_sobrante.toFixed(8);
    var output3 = {[_origenutxs]: _btc_sobrante};  
    outputs.push(output3);  
    }
  }

  var locktime = 2130000000; // junio de 2037  
 
  ////  console.log(outputs);

  var createdraTx;
  try {
        const { result: createdrawTx } = await rpcbtc.createrawtransaction([inputs,outputs,locktime])
        //  console.log('createdrawTx CON LOCKTIME CON LOCKTIME...: ');
        //  console.log(createdrawTx);
        createdraTx = createdrawTx;
        //res.json(createdrawTx)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }

  // rescatar clave arbitro en backend
  var _arbitcl = "";
  try {
    const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
    _arbitcl = decodarb;
    //res.json(decod);       
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })   
  }

  //signrawtransactionwithkey "hexrawtx_creada" '["1raclaveprivada" , "2daclaveprivada" ]' '[{"txid":"donde_estan_los_btc","vout":0,"scriptPubKey":"_MULTISIG_SCRIPT_PUBKEY_HERE_","redeemScript":"_MULTISIG_REDEEMSCRIPT_HERE_","amount":0.009}]'"
// privkeys

var pvks = [];
pvks.push(_arbitcl);
//  console.log("******************************* clave arbitro ***************************");
//  console.log("******************************* clave arbitro ***************************");
////  console.log(pvks); //dejar comentado despues de pruebas ****************************** ojoooooooooo*****
////  console.log('prevtxs...: ');
////  console.log(prevtxs);
//  console.log(createdraTx);
var rawtxsigned1arbit = "";
try {
   const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([createdraTx,pvks,prevtxs])
    //  console.log('signedrawTx 2/2 ARBITRO...: ');
    //  console.log(signedrawTx);
    rawtxsigned1arbit = signedrawTx.hex;
    res.json(signedrawTx.hex)
} catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })  
}

})


//crear al rpc btc signrawtransactionwithin ALL keys to check desde front vue

router.get('/rpc-signedtocheckcomplete/:rawTxHexaB64,:dirarbitrajeB64', verificarAuth, async(req, res) => {
  const _rawTxHexa_chc = Buffer.from(req.params.rawTxHexaB64, 'base64').toString().trim();
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  // rescatar clave arbitro en backend
  var _arbitcl = "";
  try {
    const { result: decodarbitro } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
    _arbitcl = decodarbitro;
    //res.json(decod);       
  } catch (error) {
    //  console.log(error);
    return res.status(400).json({
      mensaje: 'Ocurrio un error en acceso a rpc btc',
      error
    })   
  }

  // privkeys
  var pvks = [];
  pvks.push(_arbitcl);
  var rawtxsigned1arbit = "";
  try {
      const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([_rawTxHexa_chc,pvks])
      //  console.log('signedrawTx 2/2 ARBITRO check...: ');
      //  console.log(signedrawTx);
      rawtxsigned1arbit = signedrawTx.hex;
      res.json(signedrawTx)
  } catch (error) {
      //  console.log(error);
      return res.status(400).json({
        mensaje: 'La Tx facilitada incorrecta',
        error
      })  
  }  

});


//crear al rpc btc multifirma createrawtxMf2MnTT firmna desde front vue
router.get('/rpc-createrawtxMf2MnTT/:origenutxsB64,:dircompradorB64,:usdt_acomprador,:dirarbitrajeB64,:btc_aarbitro,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dircomprador = Buffer.from(req.params.dircompradorB64, 'base64').toString().trim();
  var _usdt_acomprador = req.params.usdt_acomprador;
  console.log("_usdt_acomprador..." + _usdt_acomprador);
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _btc_aarbitro = req.params.btc_aarbitro;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();    
  var _feeminers = req.params.feeminers;
  _feeminers = parseFloat(_feeminers); 
  if ( _feeminers === 0 ) _feeminers = 0.00000999;
  var suma = _feeminers + 0.00000546;  
 
  var inputs = []; 
  var prevtxs = [];
  var prevtxs_tt = [];  

  var _cl_arbitro = "";
 // var _usdt_aarbitro = req.params.usdt_aarbitro.toString();
  var _res_payload = ""; //se llena con el detalle de usdt al arbitro 1er envio
  var _res_rawtxtt = ""; //construct tx base sin outputs
   

// 1) List unspent outputs de la multifirma que llenó el vendedor y escogemos el que tiene los btc sufientes...0.suma
try {
  const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
   // console.log('res_listunspent...: ');
   // console.log(res_listunspent);
   // console.log(res_listunspent.length);
    var acumbtcneeded = 0;
    var x=0;

    do {
      if ( x < res_listunspent.length ) {
       //  console.log("The value of x is : "+x);
       // llenado del array de inputs antes del ++
      // console.log("res_listunspent[x] : "+res_listunspent[x].txid);

                let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
                inputs.push(input);
      
                let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, value: res_listunspent[x].amount};
                prevtxs.push(txsvalues);
              
                let txsvalues2 =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, redeemScript: _redeemMf,  value: res_listunspent[x].amount};
                prevtxs_tt.push(txsvalues2);


                acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount; 

      }
    }
    while ( acumbtcneeded < suma & res_listunspent[x] !== undefined );    

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 2) Construct payload 
//omni_createpayload_simplesend 2147485130 "1.02"
try {
  const { result: res_payload } = await rpcbtc.omni_createpayload_simplesend([tt_id,_usdt_acomprador])
   // console.log('res_payload...: ');
   // console.log(res_payload);
  if (res_payload) _res_payload = res_payload;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 3) Construct transaction base (solo una vez)
  // inputs
  let inputstt = inputs;  
  //  console.log(inputstt)
  //outputs
 // let outputstt = {};
 let outputstt = [];
 let output1 = {[_dirarbitraje]: _btc_aarbitro};  
 outputstt.push(output1);


try {
  const { result: res_rawtxtt } = await rpcbtc.createrawtransaction([inputstt,outputstt])
  // console.log('res_rawtxtt...: ');
  // console.log(res_rawtxtt);
  if (res_rawtxtt) _res_rawtxtt = res_rawtxtt;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//4) Attach payload output (el de la cantidad al comprador)
try {
  const { result: res_opreturn } = await rpcbtc.omni_createrawtx_opreturn([_res_rawtxtt,_res_payload])
   // console.log('omni_createrawtx_opreturn res_opreturn...: ');
   // console.log(res_opreturn);
  if (res_opreturn) _res_rawtxtt = res_opreturn;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//5) Attach reference/receiver output ( envio de un usdt al arbitro)
try {
  const { result: res_reference } = await rpcbtc.omni_createrawtx_reference([_res_rawtxtt,_dircomprador])
  //  console.log('res_reference...: ');
  //  console.log(res_reference);
  if (res_reference) _res_rawtxtt = res_reference;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta multifirma )


//let prevtxs = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"value":_amount}];
//console.log(prevtxs);
try {
  const { result: res_change } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt,prevtxs,_origenutxs,_feeminers])
  if (!res_change) console.log("sin res res_change");   
  if (res_change) _res_rawtxtt = res_change; 
  //console.log('res_change...: ');
  //console.log(_res_rawtxtt);   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//recogemos clave de la firma del arbitro primero _redeemScript
try {
  const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);
  _cl_arbitro = decodarb;                  
} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)

let pvkstt = [];
pvkstt.push(_cl_arbitro);
//let prevtxs_tt = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"redeemScript":_redeemScript,"amount":_amount}];
//console.log(prevtxs); 
try {
  const { result: signedarbittt } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt,pvkstt,prevtxs_tt])
    console.log('signedarbittt...: ');
    console.log(signedarbittt.hex); 
  if (signedarbittt) _res_rawtxtt = signedarbittt.hex;   
  res.json(_res_rawtxtt)
} catch (error) {
    console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}

});

//crear al rpc btc multifirma createrawtxMf2MnTT firmna desde front vue
router.get('/rpc-createrawtxMf2MnTT/:origenutxsB64,:dircompradorB64,:usdt_acomprador,:dirarbitrajeB64,:btc_aarbitro,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dircomprador = Buffer.from(req.params.dircompradorB64, 'base64').toString().trim();
  var _usdt_acomprador = req.params.usdt_acomprador;
  console.log("_usdt_acomprador..." + _usdt_acomprador);
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _btc_aarbitro = req.params.btc_aarbitro;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();    
  var _feeminers = req.params.feeminers;
  _feeminers = parseFloat(_feeminers); 
  if ( _feeminers === 0 ) _feeminers = 0.00000999;
  var suma = _feeminers + 0.00000547;  
 
  var inputs = []; 
  var prevtxs = [];
  var prevtxs_tt = [];  

  var _cl_arbitro = "";
 // var _usdt_aarbitro = req.params.usdt_aarbitro.toString();
  var _res_payload = ""; //se llena con el detalle de usdt al arbitro 1er envio
  var _res_rawtxtt = ""; //construct tx base sin outputs
   

// 1) List unspent outputs de la multifirma que llenó el vendedor y escogemos el que tiene los btc sufientes...0.suma
try {
  const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
   // console.log('res_listunspent...: ');
   // console.log(res_listunspent);
   // console.log(res_listunspent.length);
    var acumbtcneeded = 0;
    var x=0;

    do {
      if ( x < res_listunspent.length ) {
       //  console.log("The value of x is : "+x);
       // llenado del array de inputs antes del ++
      // console.log("res_listunspent[x] : "+res_listunspent[x].txid);

                let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
                inputs.push(input);
      
                let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, value: res_listunspent[x].amount};
                prevtxs.push(txsvalues);
              
                let txsvalues2 =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, redeemScript: _redeemMf,  value: res_listunspent[x].amount};
                prevtxs_tt.push(txsvalues2);


                acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount; 

      }
    }
    while ( acumbtcneeded < suma & res_listunspent[x] !== undefined );    

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 2) Construct payload 
//omni_createpayload_simplesend 2147485130 "1.02"
try {
  const { result: res_payload } = await rpcbtc.omni_createpayload_simplesend([tt_id,_usdt_acomprador])
   // console.log('res_payload...: ');
   // console.log(res_payload);
  if (res_payload) _res_payload = res_payload;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 3) Construct transaction base (solo una vez)
  // inputs
  let inputstt = inputs;  
  //  console.log(inputstt)
  //outputs
 // let outputstt = {};
 let outputstt = [];
 let output1 = {[_dirarbitraje]: _btc_aarbitro};  
 outputstt.push(output1);


try {
  const { result: res_rawtxtt } = await rpcbtc.createrawtransaction([inputstt,outputstt])
  // console.log('res_rawtxtt...: ');
  // console.log(res_rawtxtt);
  if (res_rawtxtt) _res_rawtxtt = res_rawtxtt;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//4) Attach payload output (el de la cantidad al comprador)
try {
  const { result: res_opreturn } = await rpcbtc.omni_createrawtx_opreturn([_res_rawtxtt,_res_payload])
   // console.log('omni_createrawtx_opreturn res_opreturn...: ');
   // console.log(res_opreturn);
  if (res_opreturn) _res_rawtxtt = res_opreturn;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//5) Attach reference/receiver output ( envio de un usdt al arbitro)
try {
  const { result: res_reference } = await rpcbtc.omni_createrawtx_reference([_res_rawtxtt,_dircomprador])
  //  console.log('res_reference...: ');
  //  console.log(res_reference);
  if (res_reference) _res_rawtxtt = res_reference;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta multifirma )

//let prevtxs = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"value":_amount}];
//console.log(prevtxs);
try {
  const { result: res_change } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt,prevtxs,_origenutxs,_feeminers])
  if (!res_change) console.log("sin res res_change");   
  if (res_change) _res_rawtxtt = res_change; 
  //console.log('res_change...: ');
  //console.log(_res_rawtxtt);   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//recogemos clave de la firma del arbitro primero _redeemScript
try {
  const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);
  _cl_arbitro = decodarb;                  
} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)

let pvkstt = [];
pvkstt.push(_cl_arbitro);
//let prevtxs_tt = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"redeemScript":_redeemScript,"amount":_amount}];
//console.log(prevtxs); 
try {
  const { result: signedarbittt } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt,pvkstt,prevtxs_tt])
    console.log('signedarbittt...: ');
    console.log(signedarbittt.hex); 
  if (signedarbittt) _res_rawtxtt = signedarbittt.hex;   
  res.json(_res_rawtxtt)
} catch (error) {
    console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}

});


//crear al rpc btc multifirma createrawtxMf2MnTT firmna desde front vue
//************************with******LOCKTIME****locktime***LOCKTIME****
router.get('/rpc-createrawtxMf2MnTT-LOCKTIME/:origenutxsB64,:dircompradorB64,:usdt_acomprador,:dirarbitrajeB64,:btc_aarbitro,:mfscriptPkB64,:redeemB64,:feeminers', async(req, res) => {

  const _origenutxs = Buffer.from(req.params.origenutxsB64, 'base64').toString().trim();
  const _dircomprador = Buffer.from(req.params.dircompradorB64, 'base64').toString().trim();
  var _usdt_acomprador = req.params.usdt_acomprador;
  console.log("_usdt_acomprador..." + _usdt_acomprador);
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _btc_aarbitro = req.params.btc_aarbitro;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeemMf = Buffer.from(req.params.redeemB64, 'base64').toString().trim();    
  var _feeminers = req.params.feeminers;
  _feeminers = parseFloat(_feeminers); 
  if ( _feeminers === 0 ) _feeminers = 0.00000999;
  var suma = _feeminers + 0.00000547;  
 
  var inputs = []; 
  var prevtxs = [];
  var prevtxs_tt = [];  

  var _cl_arbitro = "";
 // var _usdt_aarbitro = req.params.usdt_aarbitro.toString();
  var _res_payload = ""; //se llena con el detalle de usdt al arbitro 1er envio
  var _res_rawtxtt = ""; //construct tx base sin outputs
   

// 1) List unspent outputs de la multifirma que llenó el vendedor y escogemos el que tiene los btc sufientes...0.suma
try {
  const { result: res_listunspent } = await rpcbtc.listunspent([5,999999,[_origenutxs]])
   // console.log('res_listunspent...: ');
   // console.log(res_listunspent);
   // console.log(res_listunspent.length);
    var acumbtcneeded = 0;
    var x=0;

    do {
      if ( x < res_listunspent.length ) {
       //  console.log("The value of x is : "+x);
       // llenado del array de inputs antes del ++
      // console.log("res_listunspent[x] : "+res_listunspent[x].txid);

                let input =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout};
                inputs.push(input);
      
                let txsvalues =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, value: res_listunspent[x].amount};
                prevtxs.push(txsvalues);
              
                let txsvalues2 =  {txid: res_listunspent[x].txid , vout: res_listunspent[x].vout, scriptPubKey: res_listunspent[x].scriptPubKey, redeemScript: _redeemMf,  value: res_listunspent[x].amount};
                prevtxs_tt.push(txsvalues2);


                acumbtcneeded = acumbtcneeded + res_listunspent[x++].amount; 

      }
    }
    while ( acumbtcneeded < suma & res_listunspent[x] !== undefined );    

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 2) Construct payload 
//omni_createpayload_simplesend 2147485130 "1.02"
try {
  const { result: res_payload } = await rpcbtc.omni_createpayload_simplesend([tt_id,_usdt_acomprador])
   // console.log('res_payload...: ');
   // console.log(res_payload);
  if (res_payload) _res_payload = res_payload;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
// 3) Construct transaction base (solo una vez)
  // inputs
  let inputstt = inputs;  
  //  console.log(inputstt)
  //outputs
 // let outputstt = {};
 let outputstt = [];
 let output1 = {[_dirarbitraje]: _btc_aarbitro};  
 outputstt.push(output1);
 var locktime = 2130000000; // junio de 2037 

try {
  const { result: res_rawtxtt } = await rpcbtc.createrawtransaction([inputstt,outputstt,locktime])
  // console.log('res_rawtxtt...: ');
  // console.log(res_rawtxtt);
  if (res_rawtxtt) _res_rawtxtt = res_rawtxtt;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//4) Attach payload output (el de la cantidad al comprador)
try {
  const { result: res_opreturn } = await rpcbtc.omni_createrawtx_opreturn([_res_rawtxtt,_res_payload])
   // console.log('omni_createrawtx_opreturn res_opreturn...: ');
   // console.log(res_opreturn);
  if (res_opreturn) _res_rawtxtt = res_opreturn;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//5) Attach reference/receiver output ( envio de un usdt al arbitro)
try {
  const { result: res_reference } = await rpcbtc.omni_createrawtx_reference([_res_rawtxtt,_dircomprador])
  //  console.log('res_reference...: ');
  //  console.log(res_reference);
  if (res_reference) _res_rawtxtt = res_reference;   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//6) Specify miner fee and attach change output (as needed) (probamos dejando el cambio a la cta multifirma )

//let prevtxs = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"value":_amount}];
//console.log(prevtxs);
try {
  const { result: res_change } = await rpcbtc.omni_createrawtx_change([_res_rawtxtt,prevtxs,_origenutxs,_feeminers])
  if (!res_change) console.log("sin res res_change");   
  if (res_change) _res_rawtxtt = res_change; 
  //console.log('res_change...: ');
  //console.log(_res_rawtxtt);   

} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//recogemos clave de la firma del arbitro primero _redeemScript
try {
  const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);
  _cl_arbitro = decodarb;                  
} catch (error) {
  //  console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}
//7) Sign transaction (nosotros son 2 firmas..firmamos por rpc la del arbitro y comprador firme la segunda)

let pvkstt = [];
pvkstt.push(_cl_arbitro);
//let prevtxs_tt = [{"txid":_txid,"vout":_vout_txid,"scriptPubKey":_scriptPubKey,"redeemScript":_redeemScript,"amount":_amount}];
//console.log(prevtxs); 
try {
  const { result: signedarbittt } = await rpcbtc.signrawtransactionwithkey([_res_rawtxtt,pvkstt,prevtxs_tt])
    console.log('signedarbittt...: ');
    console.log(signedarbittt.hex); 
  if (signedarbittt) _res_rawtxtt = signedarbittt.hex;   
  res.json(_res_rawtxtt)
} catch (error) {
    console.log(error);
  return res.status(400).json({
    mensaje: 'Ocurrio un error en acceso a rpc btc',
    error
  })  
}

});


//crear al rpc btc signrawtransactionwithkey firmna arbit desde front vue 

router.get('/rpc-srtrwk/:rawTxHexaB64,:dirarbitrajeB64,:txidB64,:vout_txid,:mfscriptPkB64,:redeemB64,:amount', verificarAuth, async(req, res) => {
  const _rawTxHexa = Buffer.from(req.params.rawTxHexaB64, 'base64').toString().trim();
  const _dirarbitraje = Buffer.from(req.params.dirarbitrajeB64, 'base64').toString().trim();
  var _arbitcl = "";
  const _txidfirma = Buffer.from(req.params.txidB64, 'base64').toString().trim();   
  var _vout_txidfirma = req.params.vout_txid;
  const _mfscriptPk = Buffer.from(req.params.mfscriptPkB64, 'base64').toString().trim();
  const _redeem = Buffer.from(req.params.redeemB64, 'base64').toString().trim();
  var _amount = req.params.amount;
  // rescatar clave arbitro en backend
      try {
        const { result: decodarb } = await rpcbtc.dumpprivkey([_dirarbitraje]);           
        _arbitcl = decodarb;
        //res.json(decod);       
      } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })   
      }

      //signrawtransactionwithkey "hexrawtx_creada" '["1raclaveprivada" , "2daclaveprivada" ]' '[{"txid":"donde_estan_los_btc","vout":0,"scriptPubKey":"_MULTISIG_SCRIPT_PUBKEY_HERE_","redeemScript":"_MULTISIG_REDEEMSCRIPT_HERE_","amount":0.009}]'"
  // privkeys
  _vout_txidfirma=parseInt(_vout_txidfirma);
  var pvks = [];
  pvks.push(_arbitcl);  
  ////  console.log(pvks) //dejar comentado despues de pruebas ****************************** ojoooooooooo*****
  //prevtxs
  var prevtxs = [];
  var txsvalues =  {txid: _txidfirma , vout: _vout_txidfirma, scriptPubKey: _mfscriptPk, redeemScript: _redeem,amount: _amount,};
  prevtxs.push(txsvalues);
  ////  console.log(prevtxs);

  try {
        const { result: signedrawTx } = await rpcbtc.signrawtransactionwithkey([_rawTxHexa,pvks,prevtxs])
        //  console.log('signedrawTx...: ');
        //  console.log(signedrawTx);

        res.json(signedrawTx)
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });


//get al rpc btc para importar address al nodo desde front vue
router.get('/rpc-udptaddress/:address', async(req, res) => {
  const _address = Buffer.from(req.params.address, 'base64').toString().trim();
  //  console.log('address recibida en import: '+_address);
  try {
        const { result: imported } = await rpcbtc.importaddress([_address]);           
        res.json(imported);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
  
router.get('/rpc-udptaddressfalse/:address', async(req, res) => {
    const _address = Buffer.from(req.params.address, 'base64').toString().trim();
    const _label = "";
    const _rescan = false;
    //  console.log('address dirmultifirma recibida en import: '+_address);
  try {
          const { result: imported } = await rpcbtc.importaddress([_address,_label,_rescan]);           
          res.json(imported);       
      } catch (error) {
          //  console.log(error);
          return res.status(400).json({
            mensaje: 'Ocurrio un error en acceso a rpc btc',
            error
          })  
      }
  });  
  
//get al rpc btc para new address al nodo desde front vue
router.get('/rpc-getnewaddress/', async(req, res) => {
  try {
        const { result: newaddress } = await rpcbtc.getnewaddress(["","legacy"]);
      //  //  console.log('nueva addrr: '+newaddress);           
        res.json(newaddress);       
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });


//get al rpc btc para gettransaction al nodo desde front vue
router.get('/rpc-getTransaction/:idlib', async(req, res) => {
  const _idlib = Buffer.from(req.params.idlib, 'base64').toString().trim();
  ////  console.log('idlib recibida en rpc-getTransaction: '+_idlib);
  try {
        const { result: IDinfo } = await rpcbtc.gettransaction([_idlib, true]);
        //  console.log(IDinfo);
        if (!IDinfo) { res.json({
          mensaje: 'respuesta nula'
        }); 
        } else {           
        res.json(IDinfo);       
        }
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
    
//get al rpc btc para gettransaction al nodo desde front vue ****tether********
router.get('/rpc-getTransactiontt/:idlib', async(req, res) => {
  const _idlib = Buffer.from(req.params.idlib, 'base64').toString().trim();
  ////  console.log('idlib recibida en rpc-getTransaction: '+_idlib);
  try {
        const { result: IDinfo } = await rpcbtc.omni_gettransaction([_idlib]); 
        //  console.log(IDinfo);
        if (!IDinfo) { res.json({
          mensaje: 'respuesta nula'
        }); 
        } else {           
        res.json(IDinfo);       
        }      
    } catch (error) {
        //  console.log(error);
        return res.status(400).json({
          mensaje: 'Ocurrio un error en acceso a rpc btc',
          error
        })  
    }
  });
 
module.exports = router;