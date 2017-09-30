'use strict';

const _ = require('lodash');
const db = require('../../db');

module.exports = {
  createDeck,
};

function createDeck(request, response) {
  (async function() {

    let insertResult = undefined;
    const attributes = request.body.data.attributes;

    return response.json({
      data: {
        type: 'deck',
        id: '8b27e3a1-86a5-4479-97dc-c22559280c7d',
        attributes: {
          name: 'maths',
          color: 'red'
        }
      }
    });

  }());
}

