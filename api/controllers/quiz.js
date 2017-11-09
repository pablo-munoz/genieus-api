'use strict';

const _ = require('lodash');
const db = require('../../db');

module.exports = {
  createQuiz,
  retrieveQuizFlashcards,
  retrieveQuizOfDeckFlashcards,
};

function createQuiz(request, response) {
  (async function() {

    return response.json({
      'data': {
        'type': 'quiz',
        'id': '7cd8d9c6-4c1d-488b-9137-a6906afaf3d4'
      }
    });

  }());
}

function retrieveQuizFlashcards(request, response) {
  (async function() {

    let selectRows = undefined;

    try {

      selectRows = await db.raw(`
SELECT flashcard.* FROM flashcard
JOIN flashcard_review_history ON flashcard_review_history.flashcard_id = flashcard.id
JOIN deck ON flashcard.deck_id = deck.id
AND deck.owner_id = :owner_id
ORDER BY flashcard_review_history.avg ASC, flashcard_review_history.max ASC
        `, { owner_id: request.credentials.id });

    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }

    let flashcards = [];
    if (selectRows) {
      flashcards = selectRows.rows;
    }

    return response.json({
      'data': flashcards.map( f => ({
        type: 'flashcard',
        id: f.id,
        attributes: _.omit(f, 'id')
      }))
    });

  }());
}

function retrieveQuizOfDeckFlashcards(request, response) {
  (async function() {
    const deckId = request.swagger.params.id.value;

    console.log("wehee " + deckId);

    let selectRows = undefined;

    try {

      selectRows = await db.raw(`
SELECT flashcard.* FROM flashcard
JOIN deck ON flashcard.deck_id = deck.id
AND deck.owner_id = :owner_id
WHERE flashcard.deck_id = :deckId
        `, { owner_id: request.credentials.id, deckId });

    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }

    let flashcards = [];
    if (selectRows) {
      flashcards = selectRows.rows;
    }

    return response.json({
      'data': flashcards.map( f => ({
        type: 'flashcard',
        id: f.id,
        attributes: _.omit(f, 'id')
      }))
    });

  }());
}
