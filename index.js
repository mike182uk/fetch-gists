'use strict'

const request = require('request')

/**
 * Exports
 */

module.exports = fetchGists

/**
 * Fetch gists for the given access token
 *
 * @param  {String} accessToken
 * @return {Object[]|Promise}
 */

function fetchGists (accessToken) {
  if (!accessToken) {
    return Promise.reject(new Error('You must supply an access token to retrieve your gists'))
  }

  return fetchAllGists([], 1, accessToken)
}

/**
 * Recursively fetch all the gists for an account
 *
 * @param  {Object[]} gists
 * @param  {Number} page
 * @param  {String} accessToken
 * @return {Object[]|Promise}
 */

function fetchAllGists (gists, page, accessToken) {
  return fetchPageOfGists(page, accessToken).then(result => {
    gists = gists.concat(result.gists)

    if (result.moreToGet) {
      page++

      return fetchAllGists(gists, page, accessToken)
    }

    return gists
  })
}

/**
 * Fetch a page of gists
 *
 * @param   {Number} page
 * @param   {String} accessToken
 * @returns {Object[]}
 */

function fetchPageOfGists (page, accessToken) {
  const requestOpts = {
    url: 'https://api.github.com/gists',
    headers: {
      'User-Agent': 'fetch-gists',
      accept: 'application/vnd.github.v3+json'
    },
    qs: {
      page: page,
      per_page: 100,
      access_token: accessToken
    },
    json: true
  }

  return new Promise((resolve, reject) => {
    request(requestOpts, (error, response, body) => {
      if (!error) {
        if (response.statusCode !== 200) {
          error = `Expected 200 response code but got ${response.statusCode}`
        }

        if (response.statusCode === 401 || response.statusCode === 403) {
          error = `${body.message}. You can view the documentation at ${body.documentation_url}`
        }
      }

      if (error) {
        return reject(error)
      }

      let moreToGet = (response.headers.link)
        ? (response.headers.link.indexOf('rel="next"') > -1)
        : false

      resolve({ gists: body, moreToGet: moreToGet })
    })
  })
}
