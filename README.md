# fetch-gists

[![Version](https://img.shields.io/npm/v/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)
[![Build Status](https://img.shields.io/github/workflow/status/mike182uk/fetch-gists/CI/master?style=flat-square)](https://github.com/mike182uk/fetch-gists/actions?query=workflow%3ACI)
[![Coveralls](https://img.shields.io/coveralls/mike182uk/fetch-gists/master.svg?style=flat-square)](https://coveralls.io/r/mike182uk/fetch-gists)
[![npm](https://img.shields.io/npm/dm/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)
[![License](https://img.shields.io/github/license/mike182uk/fetch-gists.svg?style=flat-square)](https://www.npmjs.com/package/fetch-gists)

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
const fetchGists = require('fetch-gists')

const accessToken = '<your-github-access-token>'

try {
  const gists = await fetchGists(accessToken)

  // gists successfully retrieved
} catch (err) {
  // something went wrong
}
```

`fetchGists` will return a promise. The promise will resolve once all gists for the account have been retrieved. Any errors that occur during the retrieval of the gists will cause the promise to reject.
