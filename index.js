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

  let gists = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    try {
      const { body, headers } = await request({
        url: 'https://api.github.com/gists',
        headers: {
          'User-Agent': 'fetch-gists',
          accept: 'application/vnd.github.v3+json'
        },
        qs: {
          page,
          per_page: 100,
          access_token: accessToken
        },
        json: true,
        resolveWithFullResponse: true
      })

      gists = gists.concat(body)

      hasMore = headers.link
        ? headers.link.includes('rel="next"')
        : false

      page++
    } catch (err) {
      if (err.statusCode && [401, 403].includes(err.statusCode)) {
        throw new Error(`${err.error.message}. You can view the documentation at ${err.error.documentation_url}`)
      }

      if (err.statusCode && err.statusCode !== 200) {
        throw new Error(`Expected 200 response code but got ${err.statusCode}`)
      }

      throw err
    }
  }

  return gists
}
