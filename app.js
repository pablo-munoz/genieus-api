'use strict';

const cors = require('cors');
const fs = require('fs');
const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const jwt = require('./api/utils/jwt');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const swaggerDocumentRaw = fs.readFileSync('./api/swagger/swagger.yaml', 'utf-8');
const swaggerDocument = YAML.load(swaggerDocumentRaw);
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

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 5000;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
