'use strict';

const _ = require('lodash');
const db = require('../../db');

module.exports = {
  createFlashcard,
  listFlashcards,
  retrieveFlashcard,
  patchFlashcard,
  deleteFlashcard,
  recordFlashcardReview
};

function createFlashcard(request, response) {
  (async function() {

    const deck_id = request.swagger.params.id.value;
    let insertResult = undefined;
    const attributes = request.body.data.attributes;
    const data = Object.assign({}, attributes, {
      owner_id: request.credentials.id,
      deck_id,
    });

    try {
      insertResult = await db.insert(data)
                             .into('flashcard')
                             .returning('*');
    } catch(err) {
      return response.status(400)
                     .json({
                       message: err
                     });
    }

    if (insertResult.length) {
      const row = insertResult[0];

      return response.json({
        data: {
          type: 'flashcard',
          id: row.id,
          attributes: _.omit(row, 'id')
        }
      });
    }

    response.status(400).end();
  }());
}

function listFlashcards(request, response) {
  (async function() {
    
    const deck_id = request.swagger.params.id.value;
    let selectResult = undefined;
    let owner_id = request.credentials.id;

    try {
      selectResult = await db.select('*')
                             .from('flashcard')
                             .where({
                               deck_id,
                               owner_id,
                             });
    } catch(err) {
      console.error(err);
      return response.status(400)
                     .json({
                       message: err
                     });
    }

    if (selectResult.length) {
      return response.json({
        data: selectResult.map(row => {
          return {
            type: 'flashcard',
            id: row.id,
            attributes: _.omit(row, 'id')
          };
        })
      });
    } else {
      return response.status(400).end();
    }

  }());
}

function retrieveFlashcard(request, response) {
  (async function() {
    const id = request.swagger.params.id.value;
    const owner_id = request.credentials.id;
    let selectResult = undefined;

    try {
      selectResult = await db.select('*')
                             .from('flashcard')
                             .where({
                               id,
                               owner_id
                             });
    } catch(err) {
      console.error(err);
      return response.status(400).json({ message: err });
    }

    if (selectResult.length) {
      const row = selectResult[0];

      return response.json({
        data: {
          type: 'flashcard',
          id: row.id,
          attributes: _.omit(row, 'id')
        }
      });
    } else {
      return response.status(400).end();
    }
  }());
}

function patchFlashcard(request, response) {
  (async function() {
    const id = request.swagger.params.id.value;
    const payload = request.body;
    const owner_id = request.credentials.id;
    let updateResult = undefined;

    try {
      updateResult = await db.update(payload.data.attributes)
                             .from('flashcard')
                             .where({
                               id,
                               owner_id
                             })
                             .returning('*');
    } catch(err) {
      console.error(err);
      return response.status(400).json({ message: err });
    }

    if (updateResult.length) {
      const row = updateResult[0];

      return response.json({
        data: {
          type: 'flashcard',
          id: row.id,
          attributes: _.omit(row, 'id')
        }
      });
    } else {
      return response.status(400).end();
    }
  }());
}

function deleteFlashcard(request, response) {
  (async function() {
    const id = request.swagger.params.id.value;
    const owner_id = request.credentials.id;

    try {
      let anything = await db.del()
                             .from('flashcard')
                             .where({
                               id,
                               owner_id
                             });
      return response.json({
        data: {
          type: 'flashcard',
          id,
        }
      });
    } catch(err) {
      return response.status(400).end();
    }
  }());
}

function recordFlashcardReview(request, response) {
  (async function() {
    const id = request.swagger.params.id.value;
    const owner_id = request.credentials.id;
    const payload = request.body;
    const score = payload.score;

    console.log(id);
    console.log(score);

    let insertResult = undefined;

    try {
      insertResult = await db.insert({
        flashcard_id: id,
        score,
      }).into('flashcard_review')
        .returning('*');
    } catch(err) {
      console.error(error);
      return response.status(400).json({ message: error });
    }

    if (insertResult === undefined || insertResult.length === 0) {
      return response.status(400).json({ message: 'Error inserting to databsae' });
    }

    return response.json(insertResult[0]);
  }());
}
