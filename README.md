# fetch-gists

[![Version](https://img.shields.io/npm/v/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)
[![Build Status](https://img.shields.io/travis/mike182uk/fetch-gists.svg?style=flat-square)](http://travis-ci.org/mike182uk/fetch-gists)
[![Code Climate](https://img.shields.io/codeclimate/github/mike182uk/fetch-gists.svg?style=flat-square)](https://codeclimate.com/github/mike182uk/fetch-gists)
[![Coveralls](https://img.shields.io/coveralls/mike182uk/fetch-gists/master.svg?style=flat-square)](https://coveralls.io/r/mike182uk/fetch-gists)
[![npm](https://img.shields.io/npm/dm/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)
[![License](https://img.shields.io/github/license/mike182uk/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

Fetch all of your gists from GitHub.

`fetch-gists` will handle all of the API calls needed to retrieve all of your gists from GitHub. This includes navigating the paginated results.

## Prerequisites

- GitHub account (duh!)
- GitHub [access token](https://github.com/blog/1509-personal-api-tokens) with the `gist` scope enabled

## Installation

```bash
npm install --save fetch-gists
```

## Usage

```js
var fetchGists = require('fetch-gists');

var accessToken = '<your-github-access-token>';

fetchGists(accessToken)
  .then(function(gists) {
    // all gists retrieved
  })
  .catch(function(err) {
    // something went wrong
  });
```

`fetchGists` will return a [promise](https://github.com/petkaantonov/bluebird). The promise will resolve once all gists for the account have been retrieved. Any errors that occur during the retrieval of the gists will cause the promise to reject.
