'use strict';

const _ = require('lodash');

module.exports = {
  echo,
};

function echo(request, response) {
  return response.json(request.body);
}

