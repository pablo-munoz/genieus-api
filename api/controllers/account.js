'use strict';

const _ = require('lodash');
const db = require('../../db');

module.exports = {
  createAccount,
};

function createAccount(request, response) {
  (async function() {

    let insertResult = undefined;
    const attributes = request.body.data.attributes;

    try {
      insertResult = await db.raw(`
INSERT INTO account (email, password) VALUES
(:email, crypt(:password, gen_salt('bf', 8)))
RETURNING id, email, date_created, last_login
        `, attributes);
    } catch(err) {
      console.error(err);
      return response.status(400)
                     .json({
                       message: JSON.stringify(err)
                     });
    }

    if (insertResult.rows.length) {
      const row = insertResult.rows[0];

      return response.json({
        data: {
          type: 'account',
          id: row.id,
          attributes: _.omit(row, 'id')
        }
      });
    }
  }());
}

