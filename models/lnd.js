// conexion lnd  rpc con macroons activo en lnd.conf
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
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
const macaroon = fs.readFileSync("../.lnd/data/chain/bitcoin/testnet/admin.macaroon").toString('hex');
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const lndCert = fs.readFileSync("../.lnd/tls.cert");  //  Lnd cert is at ~/.lnd/tls.cert on Linux
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  let metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let lightning = new lnrpc.Lightning('localhost:10009', creds);

export default lightning;
 