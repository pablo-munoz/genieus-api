'use strict';

const _ = require('lodash');
const db = require('../../db');

module.exports = {
  searchPublicDecks,
  addPublicDeckToUserCollection
};

function searchPublicDecks(request, response) {
  (async function() {

    const query = request.query.q;

    let selectRows = undefined;

    try {
      selectRows = await db.select('*')
                           .from('deck')
                           .where({
                             is_public: 1,
                           })
                           .andWhere('name', 'ilike', '%'+query+'%');

      db.raw(`
        SELECT * FROM deck where is_public = 1;
        `);
      
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

    return response.json({
      'data': {
        'type': 'quiz',
        'id': '7cd8d9c6-4c1d-488b-9137-a6906afaf3d4'
      }
    });

  }());
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
