var nock = require('nock');
var rewire = require('rewire');
var test = require('tape');

var fetchGists = rewire('./index');

var accessToken = 'TEST123';

test('retrieves all gists', function (t) {
  nock.cleanAll();

  t.plan(1);

  var gists = [{},{},{}];

  mockGetGistsApiCall(1, gists, true);

  fetchGists(accessToken).then(function (retrievedGists) {
    t.deepEqual(retrievedGists, gists, 'gists retrieved');
  })
});

test('follows pagination', function (t) {
  nock.cleanAll();

  t.plan(1);

  var page1Gists = [{},{},{}];
  var page2Gists = [{},{}];
  var page3Gists = [{}];
  var allGists = [{},{},{},{},{},{}];

  mockGetGistsApiCall(1, page1Gists, false);
  mockGetGistsApiCall(2, page2Gists, false);
  mockGetGistsApiCall(3, page3Gists, true);

  fetchGists(accessToken).then(function (retrievedGists) {
    t.deepEqual(retrievedGists, allGists, 'pagination links followed');
  })
});

test('error occurs on 401', function (t) {
  nock.cleanAll();

  t.plan(2);

  var body = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, body, true, 401)

  fetchGists(accessToken).catch(function (error) {
    var containsMessage = error.indexOf(body.message)
    var containsDocs = error.indexOf(body.documentation_url);

    t.equal(true, containsMessage > -1, 'error occured and contains message');
    t.equal(true, containsDocs > -1, 'error occured and contains documentation link');
  })
});

test('error occurs on 403', function (t) {
  nock.cleanAll();

  t.plan(2);

  var body = {
    message: 'foo',
    documentation_url: 'bar'
  }

  mockGetGistsApiCall(1, body, true, 403)

  fetchGists(accessToken).catch(function (error) {
    var containsMessage = error.indexOf(body.message)
    var containsDocs = error.indexOf(body.documentation_url);

    t.equal(true, containsMessage > -1, 'error occured and contains message');
    t.equal(true, containsDocs > -1, 'error occured and contains documentation link');
  })
});

test('error occurs when response code is not 200, 401 or 403', function (t) {
  nock.cleanAll();

  t.plan(1);

  mockGetGistsApiCall(1, {}, true, 404)

  fetchGists(accessToken).catch(function (error) {
    var containsStatusCode = error.indexOf(404)

    t.equal(true, containsStatusCode > -1, 'error occured and contains status code');
  })
});

test('error occurs when request fails', function (t) {
  nock.cleanAll();

  t.plan(1);

  mockGetGistsApiCall(1, [], true, 200)

  var responseError = 'foo'

  var revert = fetchGists.__set__('request', function (opts, cb) {
    cb(responseError);
  });

  fetchGists(accessToken).catch(function (error) {
    t.equal(responseError, error, 'error occured during request');
  });

  revert();
});

function mockGetGistsApiCall (page, body, isLastPage, statusCode) {
  var statusCode = statusCode || 200;
  var respHeaders = {};

  if (!isLastPage) {
    respHeaders['Link'] = '<link?page=' + (page + 1) + '>; rel="next", <link?page=99>; rel="last"'
  }

  var reqHeaders = {
    'User-Agent': 'fetch-gists',
    accept: 'application/vnd.github.v3+json',
  }

  nock('https://api.github.com', { reqheaders: reqHeaders })
    .get('/gists')
    .query({
      page: page,
      per_page: 100,
      access_token: accessToken
    })
    .reply(statusCode, body, respHeaders);
}
