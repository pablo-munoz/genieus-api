'use strict';

const cors = require('cors');
const fs = require('fs');
const app = require('express')();
const jwt = require('./api/utils/jwt');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const swaggerDocumentRaw = fs.readFileSync('./api/swagger/swagger.yaml', 'utf-8');
const swaggerDocument = YAML.load(swaggerDocumentRaw);
const { swaggerInit, SWAGGER_EXPRESS } = require('./swagger.js');
module.exports = app; // for testing

const config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    Bearer: (request, authOrSecDef, scopesOrApiKey, callback) => {
      const authHeader = scopesOrApiKey;

      if (authHeader) {
        // The token comes in the format 'Bearer <token>' need to
        // strip the 'Bearer part'
        const token = authHeader.slice('Bearer '.length);

        jwt.verifyToken(token, (err, decoded) => {
          if (err) {
            callback({
              statusCode: 403,
              message: 'Invalid credentials (jwt).'
            });
          } else {
            request.credentials = decoded;
            callback();
          }
        });
      }
    }
  }
};

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

swaggerInit(config, app);
