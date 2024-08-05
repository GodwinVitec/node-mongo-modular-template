const mongoose = require('mongoose');
const Commons = require("./api/helpers/commons");

const env = (new Commons()).env;

const uriString = `mongodb://${env('DB_HOST')}:${env('DB_PORT')}/${env('DB_NAME')}`;
const uriOptions = env('DB_OPTS') !== undefined &&
  env('DB_OPTS') !== '' ? env('DB_OPTS') : '';

const uri = uriString + uriOptions;
const connectionOptions = {
  tls: false
};

console.log(uri);

function connectMongoose() {
  mongoose.connect(uri, connectionOptions)
    .then(() => {
      console.log('Connected to database');
    })
    .catch(error => {
      console.log(error.message);
    });
}

connectMongoose();

mongoose.connection.on('error', function (err) {
  console.log(err);
}).on('disconnected', function () {
  setTimeout(function () {
    connectMongoose();
  }, 1000);
});