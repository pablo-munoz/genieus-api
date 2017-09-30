const jwt = require('jsonwebtoken');

function generateToken(payload) {
  const token = jwt.sign(payload, process.env.SECRET || 'sdlkc882skh1adx', {
    expiresIn: 60 * 60 * 2 // seconds, minutes, hours...
  });

  return token;
}

function verifyToken(token, callback) {
  jwt.verify(token,
             process.env.SECRET || 'sdlkc882skh1adx',
             function(error, decoded) {
               if (error) {
                 callback(error, null);
               } else {
                 callback(null, decoded);
               }
             });
}

function authenticationMiddleware(request, response, next) {
  // jwt data comes as the Authorization header value
  // check header or url parameters or post parameters for token
  const authHeader = (request.body.token ||
                      request.query.token ||
                      request.headers['authorization']);

  if (authHeader) {
    // The token comes in the format 'Bearer <token>' need to strip the 'Bearer part'
    const token = authHeader.slice('Bearer '.length);

    jwt.verify(token, process.env.SECRET || 'sdlkc882skh1adx', function(error, decoded) {
      if (error) {
        return response
          .status(400)
          .json({
            errors: {
              "message": "Failed to authenticate token"
            }
          });
      } else {
        request.credentials = decoded;
        next();
      }
    });
  } else {
    return response
      .status(403)
      .json({
        errors: {
          "message": "Failed to provide authentication credentials"
        }
      });
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authenticationMiddleware,
}
