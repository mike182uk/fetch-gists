const request = require('request-promise-native')

/**
 * Exports
 */

module.exports = fetchGists

/**
 * Fetch gists for the given access token
 *
 * @param   {string} accessToken
 * @returns {Promise.<Object[]>}
 */

async function fetchGists (accessToken) {
  if (!accessToken) {
    throw new Error('You must supply an access token to retrieve your gists')
  }

  return fetchAllGists([], 1, accessToken)
}

/**
 * Recursively fetch all the gists for an account
 *
 * @param   {Object[]} gists
 * @param   {number} page
 * @param   {string} accessToken
 * @returns {Promise.<Object[]>}
 */

async function fetchAllGists (gists, page, accessToken) {
  const { gists: retrievedGists, moreToGet } = await fetchPageOfGists(page, accessToken)

  gists = gists.concat(retrievedGists)

  if (moreToGet) {
    page++

    return fetchAllGists(gists, page, accessToken)
  }

  return gists
}

/**
 * Fetch a page of gists
 *
 * @param   {number} page
 * @param   {string} accessToken
 * @returns {Promise.<Object[]>}
 */

async function fetchPageOfGists (page, accessToken) {
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
    json: true,
    resolveWithFullResponse: true
  }

  try {
    const { body, headers } = await request(requestOpts)

    const moreToGet = (headers.link)
      ? headers.link.includes('rel="next"')
      : false

    return { gists: body, moreToGet }
  } catch (err) {
    if (err.statusCode && (err.statusCode === 401 || err.statusCode === 403)) {
      throw new Error(`${err.error.message}. You can view the documentation at ${err.error.documentation_url}`)
    }

    if (err.statusCode && err.statusCode !== 200) {
      throw new Error(`Expected 200 response code but got ${err.statusCode}`)
    }

    throw err
  }
}
