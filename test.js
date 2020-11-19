const nock = require('nock')
const proxyquire = require('proxyquire')
const test = require('tape')

const ACCESS_TOKEN = 'TEST123'

test('retrieves all gists', async t => {
  nock.cleanAll()

  t.plan(1)

  const fetchGists = getFetchGists()
  const gists = [{ id: 1 }, { id: 2 }, { id: 3 }]

  mockGetGistsApiCall(1, gists, true)

  const result = await fetchGists(ACCESS_TOKEN)

  t.deepEqual(result, gists, 'gists retrieved')
})

test('follows pagination', async t => {
  nock.cleanAll()

  t.plan(1)

  const fetchGists = getFetchGists()
  const page1Gists = [{ id: 1 }, { id: 2 }, { id: 3 }]
  const page2Gists = [{ id: 4 }, { id: 5 }]
  const page3Gists = [{ id: 6 }]
  const allGists = [].concat(page1Gists, page2Gists, page3Gists)

  mockGetGistsApiCall(1, page1Gists, false)
  mockGetGistsApiCall(2, page2Gists, false)
  mockGetGistsApiCall(3, page3Gists, true)

  const result = await fetchGists(ACCESS_TOKEN)

  t.deepEqual(allGists, result, 'pagination links followed')
})

test('error when access token not provided', async t => {
  t.plan(1)

  const fetchGists = getFetchGists()

  try {
    await fetchGists()

    t.fail('expected fetchGists to throw')
  } catch ({ message }) {
    t.equal(message, 'You must supply an access token to retrieve your gists', 'error occured and contains correct message')
  }
})

test('error occurs on 401', async t => {
  nock.cleanAll()

  t.plan(2)

  const fetchGists = getFetchGists()
  const requestBody = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, requestBody, true, 401)

  try {
    await fetchGists(ACCESS_TOKEN)

    t.fail('expected fetchGists to throw')
  } catch ({ message }) {
    t.equal(message.includes(requestBody.message), true, 'error occured and contains message')
    t.equal(message.includes(requestBody.documentation_url), true, 'error occured and contains documentation link')
  }
})

test('error occurs on 403', async t => {
  nock.cleanAll()

  t.plan(2)

  const fetchGists = getFetchGists()
  const requestBody = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, requestBody, true, 403)

  try {
    await fetchGists(ACCESS_TOKEN)

    t.fail('expected fetchGists to throw')
  } catch ({ message }) {
    t.equal(message.includes(requestBody.message), true, 'error occured and contains message')
    t.equal(message.includes(requestBody.documentation_url), true, 'error occured and contains documentation link')
  }
})

test('error occurs when response code is not 200, 401 or 403', async t => {
  nock.cleanAll()

  t.plan(1)

  const fetchGists = getFetchGists()

  mockGetGistsApiCall(1, {}, true, 404)

  try {
    await fetchGists(ACCESS_TOKEN)

    t.fail('expected fetchGists to throw')
  } catch ({ message }) {
    t.equal(message.includes(404), true, 'error occured and contains status code')
  }
})

test('error occurs when request fails', async t => {
  nock.cleanAll()

  t.plan(1)

  mockGetGistsApiCall(1, [], true, 200)

  const errMsg = 'foo'
  const fetchGists = getFetchGists({
    got: () => Promise.reject(new Error(errMsg))
  })

  try {
    await fetchGists(ACCESS_TOKEN)

    t.fail('expected fetchGists to throw')
  } catch ({ message }) {
    t.equal(message, errMsg, 'error occured during request')
  }
})

function mockGetGistsApiCall (page, body, isLastPage, statusCode = 200) {
  const responseHeaders = {}

  if (!isLastPage) {
    responseHeaders.Link = `<link?page=${page + 1}> rel="next", <link?page=99> rel="last"`
  }

  const requestHeaders = {
    'User-Agent': 'fetch-gists',
    accept: 'application/vnd.github.v3+json',
    Authorization: `token ${ACCESS_TOKEN}`
  }

  nock('https://api.github.com', { reqheaders: requestHeaders })
    .get('/gists')
    .query({
      page,
      per_page: 100
    })
    .reply(statusCode, body, responseHeaders)
}

function getFetchGists (dependencies) {
  return proxyquire('./index.js', dependencies || {})
}
