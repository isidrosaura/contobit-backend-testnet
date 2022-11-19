// conexion lnd  rpc
const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};
const packageDefinition = protoLoader.loadSync(['rpc.proto', 'router.proto'], loaderOptions);
const routerrpc = grpc.loadPackageDefinition(packageDefinition).routerrpc;
const macaroon = fs.readFileSync("../.lnd/data/chain/bitcoin/testnet/admin.macaroon").toString('hex');
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const lndCert = fs.readFileSync('../.lnd/tls.cert');
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  let metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let lnrouter = new routerrpc.Router('localhost:10009', creds);

export default lnrouter;
