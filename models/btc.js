// conexion bitcoin rpc
const Rpc = require('bitcoin-rpc-async');
const NODO_BTC_TN = process.env.NODO_BTC_TN;
//const rpc = new Rpc(NODO_BTC_TN);
//rpc.run('getbalance', []).then(data => console.log(data.result));
const rpcbtc = new Rpc(
  NODO_BTC_TN,
  ['getBlockHash', 'getBlock', 'getBalance', 'verifyMessage', 'validateAddress', 'listaddressgroupings','importaddress','getaddressinfo','getnewaddress','gettransaction','getreceivedbyaddress','importpubkey','createmultisig', 'decodescript', 'decoderawtransaction', 'createrawtransaction', 'dumpprivkey', 'signrawtransactionwithkey', 'sendrawtransaction','omni_listproperties','omni_getbalance','omni_gettransaction','listunspent','omni_createpayload_simplesend','omni_createrawtx_opreturn','omni_createrawtx_reference','omni_createrawtx_change'],
  'camelCase'
);

export default rpcbtc;