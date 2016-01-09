var debug = require('debug')('fetch-gists');
var Promise = require('bluebird');
var request = require('request');

/**
 * Exports
 */

module.exports = fetchGists;

/**
 * Fetch all gists for an account
 *
 * @param {string} accessToken
 * @param {number} [page]
 * @param {Object[]} [gists]
 * @param {function} [onFetchedGists]
 * @returns {Object[]}
 */

function fetchGists(accessToken, page, gists, onFetchedGists) {
  page = page || 1;
  gists = gists || [];

  return new Promise(function(resolve, reject) {
    if (onFetchedGists) {
      resolve = onFetchedGists;
    }

    fetchPageOfGists(page, accessToken).then(function(result) {
      result.gists.map(function(gist) {
        gists.push(gist);
      });

      if (result.nextPage) {
        fetchGists(accessToken, result.nextPage, gists, resolve);
      } else {
        resolve(gists);
      }
    }).catch(function(error) {
      reject(error);
    });
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
  debug('Fetching gists from page ' + page);

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

      var nextPage = (response.headers.link) ?
        getNextPageFromLink(response.headers.link) :
        null;

      resolve({ gists: body, nextPage: nextPage });
    });
  });
}

/**
 * Extract the next page from the link header
 *
 * @param {string} link
 * @returns {number}
 */

function getNextPageFromLink(link) {
  if (link.indexOf('rel="next"') > -1) {
    debug('Found link for next page');

    return link.match(/[0-9]+/g)[0];
  }
}
