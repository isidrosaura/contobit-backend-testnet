// conexion lnd  rpc
const fs = require("fs");
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const loaderOptions = {
  keepCase: true,
   longs: String,
   enums: String,
   defaults: true, 
   oneofs: true
  };
const packageDefinition = protoLoader.loadSync('rpc.proto', loaderOptions);
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'
let lndCert = fs.readFileSync("../.lnd/tls.cert");  //  Lnd cert is at ~/.lnd/tls.cert on Linux
let credentials = grpc.credentials.createSsl(lndCert);
let lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
let lnrpc = lnrpcDescriptor.lnrpc;
let lightning = new lnrpc.Lightning('localhost:10009', credentials);

export default lightning;
/*
lightning.getInfo({}, function(err, response) {
    if (err) {
      console.log('Error: ' + err);
    }
    console.log('GetInfo:', response);
  })
;
lightning.walletBalance({}, function(err, response) {
    if (err) {
      console.log('Error: ' + err);
    }
    console.log('balance:', response);
  });
*/   