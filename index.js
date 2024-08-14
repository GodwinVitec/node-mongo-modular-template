require('./db_connection');
const app = require('./app');
const Commons = require("./api/helpers/commons");

const env = (new Commons()).env;

const port = env('APP_PORT');

app.listen(port, () => {
  console.log('http://localhost:' + port);
});
