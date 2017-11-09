'use strict';

const _ = require('lodash');
const db = require('../../db');
const jwt = require('../utils/jwt');

module.exports = {
  createSession,
};

function createSession(request, response) {
  (async function() {

    let accountSelect = undefined;
    const attributes = request.body.data.attributes;

    try {
      accountSelect = await db.raw(`
SELECT id, email, username, date_created, last_login FROM account
WHERE email=lower(:email) AND password=crypt(:password, password);
        `, attributes);
    } catch(err) {
      return response.status(400)
                     .json({
                       message: JSON.stringify(err)
                     });
    }

    if (accountSelect.rows.length) {
      const account = accountSelect.rows[0];

      const token = jwt.generateToken({
        id: account.id,
        email: account.email
      });

      console.log(account);

      return response.json({
        data: {
          type: 'session',
          id: '55a26221-88c9-43c3-800b-26e782d976c5',
          attributes: {
            date_created: (new Date()).toISOString(),
            expiration: (new Date()).toISOString(),
            json_web_token: token,
            account: {
              email: account.email,
              username: account.username
            }
          }
        }
      });
    } else {
      return response.json({
        message: "Invalid email or password."
      });
    }
  }());

}

