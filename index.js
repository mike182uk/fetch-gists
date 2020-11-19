const got = require('got')

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
      const { body, headers } = await got('https://api.github.com/gists', {
        headers: {
          'User-Agent': 'fetch-gists',
          accept: 'application/vnd.github.v3+json',
          Authorization: `token ${accessToken}`
        },
        searchParams: {
          page,
          per_page: 100
        },
        responseType: 'json'
      })

      gists = gists.concat(body)

      hasMore = headers.link
        ? headers.link.includes('rel="next"')
        : false

      page++
    } catch (err) {
      if (err.response) {
        const statusCode = err.response.statusCode
        const body = err.response.body

        if ([401, 403].includes(statusCode)) {
          throw new Error(`${body.message}. You can view the documentation at ${body.documentation_url}`)
        }

        if (statusCode !== 200) {
          throw new Error(`Expected 200 response code but got ${statusCode}`)
        }
      }

      throw err
    }
  }

  return gists
}
