const express = require('express');
const bodyParser = require("body-parser");
const Commons = require("./api/helpers/commons");

const app = express();
const env = (new Commons()).env;

app.use(
  express.json({
    limit: env('MAX_JSON_BODY_SIZE')
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: env('MAX_URL_ENCODED_SIZE')
  })
);

app.use(
  bodyParser.json({
    limit: env('MAX_JSON_BODY_SIZE')
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: env('MAX_URL_ENCODED_SIZE')
  })
);

// Add Users Router
app.use(
  '/api/v1/auth',
  require('./api/v1/users/auth/routes')
);

// Set the default response for non-existent paths
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const port = env('APP_PORT');

module.exports = app;