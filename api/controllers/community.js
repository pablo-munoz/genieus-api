'use strict';

const _ = require('lodash');
const db = require('../../db');

// In this experiment seems that the result is an array of
// "results" for each statement, e.g. for the begin, the
// first select, etc.
/* db.raw(`
 *   BEGIN;
 *   SELECT * FROM account;
 *   SELECT * FROM deck;
 *   COMMIT;
 *   `).then( (result) => { console.log(result); } );*/

module.exports = {
  searchPublicDecks,
  getPublicDecksOfAuthor,
  addPublicDeckToUserCollection
};

function searchPublicDecks(request, response) {
  (async function() {

    const search = request.query.q || '';

    let selectRows = undefined;

    try {
      let query = `
SELECT deck.*, account.id as author, account.username as author_username
FROM deck JOIN account ON deck.owner_id = account.id
WHERE deck.is_public = 1
      `;

      if (search !== '')
        query += `
AND deck.name ILIKE '%${search}%'`;

      query += ';';

      selectRows = await db.raw(query);
      selectRows = selectRows.rows;

      const responseObj = {
        data: selectRows.map(r => ({
          id: r.id,
          type: 'deck',
          attributes: _.omit(r, 'id')
        }))
      };
      
      response.json(responseObj);
      
    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }

  }());
}

function getPublicDecksOfAuthor(request, response) {
  (async function() {
    console.log(request.swagger.params);
    const authorId = request.swagger.params.authorId.value;

    let query = `
SELECT deck.*, account.id as author, account.username as author_username
FROM deck JOIN account ON deck.owner_id = account.id
WHERE deck.is_public = 1 AND account.id = '${authorId}';
    `;

    let selectResult;
    let dataOfDecksByAuthor;

    try {
      selectResult = await db.raw(query);
      dataOfDecksByAuthor = selectResult.rows;
    } catch(error) {
      console.error(error);
      return repsonse.status(400).json({ message: error });
    }

    const responseObj = {
      data: dataOfDecksByAuthor.map(r => ({
        id: r.id,
        type: 'deck',
        attributes: _.omit(r, 'id')
      }))
    };
    
    response.json(responseObj);
    
    return 
  }())
}

function addPublicDeckToUserCollection(request, response) {
  (async function() {
    const idOfDeckToAdd = request.body.id;
    const user = request.credentials;
    
    let deck = undefined;
    let flashcards = undefined;
    
    // Find the deck in the database
    try {
      const rows = await db.select('*')
                           .from('deck')
                           .where({ id: idOfDeckToAdd });
      
      deck = rows[0];
    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }
    
    if (deck === undefined)
      return response.status(400).json({ message: `No deck with id = ${idOfDeckToAdd}`});
    
    // Find the flashcards in the deck
    try {
      const rows = await db.select('*')
                           .from('flashcard')
                           .where({ deck_id: idOfDeckToAdd });
      flashcards = rows;
    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }
    
    if (flashcards === undefined || flashcards.length === 0)
      return response.status(400).json({ message: 'Deck is empty' });
    
    // Change the owners of the deck and flashcard data and insert
    deck.owner_id = user.id;
    deck.id = undefined;
    deck.is_public = 0;

   
    let insertResult = undefined;
    
    try {
      insertResult = await db.insert(deck)
                             .into('deck')
                             .returning('*');
    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }
    
    if (insertResult === undefined)
      return response.status(400).json({ message: 'Could not add deck to collection' });
    
    const newDeck = insertResult[0];

    flashcards.forEach(fcard => {
      fcard.deck_id = newDeck.id;
      fcard.owner_id = user.id;
      fcard.id = undefined;
    });

    try {
      await db.insert(flashcards)
              .into('flashcard');
    } catch(error) {
      console.error(error);
      return response.status(400).json({ message: error });
    }
    
    return response.json({
      data: {
        type: 'deck',
        id: newDeck.id,
        attributes: _.omit(newDeck, 'id')
      }
    });
  }());
}
