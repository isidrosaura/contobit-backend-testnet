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
let router = new routerrpc.Router('localhost:10009', creds);
let request = { 
  payment_request: "lntb99750n1p0ac8hgpp5dmsq6xe79arz8kq6l6wkvn2epl77s9lzrvscdvzyyzrg7s89h24qdqvv4h8gun9vasscqzpgxqy9gcqrzjqf69tthcg57e9arsddtqkc2j0npp0h03fkjpwu8ga4nqwxg2rpgms88wqcqqqrcqqqqqqqlgqqqqn3qq9qrzjqf6dmjslzhchp79scaz9y7jqns8rqxnqpp58z4vdffunted6z23lk884muqqqrqqqyqqqqlgqqqqqqgq9qrzjqf6dmjslzhchp79scaz9y7jqns8rqxnqpp58z4vdffunted6z23lk88wsqqqqpgqqyqqqqlgqqqqqqgq9qrzjq027z73uyyl7fy8pkrpcn7x0el82pz3fw974p2052de4uz4j5lqqx88wdqqqqqsqqqqqqqlgqqqqqqgq9qw0xkd7ta26cswgtlflax9728t7hkh7z6yv0sgfkc307nnlkus6a5wrh90sp9d9u0kge5f007tsu79uh5xs55l66ts66zaqdfpe5lcfcprnw5ng",  
}; 
let call = router.sendPaymentV2(request);
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