var Promise = require('bluebird');
var request = require('request');

/**
 * Exports
 */

module.exports = fetchGists;

/**
 * Fetch gists for the given access token
 *
 * @param  {string} accessToken
 * @return {Object[]}
 */

function fetchGists(accessToken) {
  return fetchAllGists([], 1, accessToken);
}

/**
 * Recursively fetch all the gists for an account
 *
 * @param  {Object[]} gists
 * @param  {number} page
 * @param  {string} accessToken
 * @return {Object[]|Promise}
 */

function fetchAllGists(gists, page, accessToken) {
  return fetchPageOfGists(page, accessToken).then(function(result) {
    result.gists.forEach(function(gist) {
      gists.push(gist);
    });

    if (result.moreToGet) {
      page++;
      return fetchAllGists(gists, page, accessToken);
    }

    return gists;
  });
}

/**
 * Fetch a page of gists
 *
 * @param {number} page
 * @param {string} accessToken
 * @returns {Object[]}
 */

function fetchPageOfGists(page, accessToken) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  var opts = {
    url: 'https://api.github.com/gists',
    headers: {
      'User-Agent': 'fetch-gists',
    },
    qs: {
      page: page,
      per_page: 100,
      access_token: accessToken,
    },
    json: true,
  };
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

  return new Promise(function(resolve, reject) {
    request(opts, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      var errorMessage = '';

      if (response.statusCode == 401 || response.statusCode == 403) {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        errorMessage = body.message +
          '. You can view the documentation at ' +
          body.documentation_url;
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      } else if (response.statusCode !== 200) {
        errorMessage = 'Expected 200 response code but got ' +
          response.statusCode;
      }

      if (errorMessage) {
        return reject(errorMessage);
      }

      var moreToGet = (response.headers.link) ?
        (response.headers.link.indexOf('rel="next"') > -1) :
        false;

      resolve({ gists: body, moreToGet: moreToGet });
    });
  });
}
