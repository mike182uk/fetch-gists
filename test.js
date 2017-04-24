'use strict'

const nock = require('nock')
const proxyquire = require('proxyquire')
const test = require('tape')

const accessToken = 'TEST123'

test('retrieves all gists', t => {
  nock.cleanAll()

  t.plan(1)

  let fetchGists = getFetchGists()
  let gists = [{}, {}, {}]

  mockGetGistsApiCall(1, gists, true)

  fetchGists(accessToken).then(retrievedGists => {
    t.deepEqual(retrievedGists, gists, 'gists retrieved')
  })
})

test('follows pagination', t => {
  nock.cleanAll()

  t.plan(1)

  let fetchGists = getFetchGists()
  let page1Gists = [{}, {}, {}]
  let page2Gists = [{}, {}]
  let page3Gists = [{}]
  let allGists = [{}, {}, {}, {}, {}, {}]

  mockGetGistsApiCall(1, page1Gists, false)
  mockGetGistsApiCall(2, page2Gists, false)
  mockGetGistsApiCall(3, page3Gists, true)

  fetchGists(accessToken).then(retrievedGists => {
    t.deepEqual(retrievedGists, allGists, 'pagination links followed')
  })
})

test('error when access token not provided', t => {
  t.plan(1)

  let fetchGists = getFetchGists()

  fetchGists().catch(err => {
    t.equal('You must supply an access token to retrieve your gists', err.message, 'error occured and contains correct message')
  })
})

test('error occurs on 401', t => {
  nock.cleanAll()

  t.plan(2)

  let fetchGists = getFetchGists()
  let body = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, body, true, 401)

  fetchGists(accessToken).catch(error => {
    let containsMessage = error.indexOf(body.message)
    let containsDocs = error.indexOf(body.documentation_url)

    t.equal(true, containsMessage > -1, 'error occured and contains message')
    t.equal(true, containsDocs > -1, 'error occured and contains documentation link')
  })
})

test('error occurs on 403', t => {
  nock.cleanAll()

  t.plan(2)

  let fetchGists = getFetchGists()
  let body = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, body, true, 403)

  fetchGists(accessToken).catch(error => {
    let containsMessage = error.indexOf(body.message)
    let containsDocs = error.indexOf(body.documentation_url)

    t.equal(true, containsMessage > -1, 'error occured and contains message')
    t.equal(true, containsDocs > -1, 'error occured and contains documentation link')
  })
})

test('error occurs when response code is not 200, 401 or 403', t => {
  nock.cleanAll()

  t.plan(1)

  let fetchGists = getFetchGists()

  mockGetGistsApiCall(1, {}, true, 404)

  fetchGists(accessToken).catch(error => {
    let containsStatusCode = error.indexOf(404)

    t.equal(true, containsStatusCode > -1, 'error occured and contains status code')
  })
})

test('error occurs when request fails', t => {
  nock.cleanAll()

  t.plan(1)

  mockGetGistsApiCall(1, [], true, 200)

  let fetchGists = getFetchGists({
    'request': (opts, cb) => cb(responseError)
  })
  let responseError = 'foo'

  fetchGists(accessToken).catch(error => {
    t.equal(responseError, error, 'error occured during request')
  })
})

function mockGetGistsApiCall (page, body, isLastPage, statusCode) {
  statusCode = statusCode || 200

  let respheaders = {}

  if (!isLastPage) {
    respheaders['Link'] = `<link?page=${page + 1}> rel="next", <link?page=99> rel="last"`
  }

  let reqheaders = {
    'User-Agent': 'fetch-gists',
    accept: 'application/vnd.github.v3+json'
  }

  nock('https://api.github.com', { reqheaders })
    .get('/gists')
    .query({
      page: page,
      per_page: 100,
      access_token: accessToken
    })
    .reply(statusCode, body, respheaders)
}

function getFetchGists (dependencies) {
  return proxyquire('./index.js', dependencies || {})
}
