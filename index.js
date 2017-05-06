const merge = require('merge');

module.exports = fetchJsonAlways;

const defaultFetch = (
  typeof self !== 'undefined' && self.fetch
  || typeof window !== 'undefined' && window.fetch
  || typeof global !== 'undefined' && global.fetch
);

const defaultOpts = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

function fetchJsonAlways(pathArg, optsArg) {
  const host = fetchJsonAlways.host || ''
  const path = host + pathArg

  const fetch = fetchJsonAlways.fetch || defaultFetch;


  let error;

  let body
  if (optsArg.body) {
    try {
      body = JSON.stringify(body);
    } catch (err1) {
      // check if body is already stringified
      try {
        JSON.parse(optsArg.body);
        body = optsArg.body;
      } catch (err2) {
        error = 'Failed to stringify/parse request {body}: ' + err1.message;
      }
    }
  }

  if (error) {
    return Promise.resolve({ error });
  }

  const opts = merge({},
    optsArg.method ? {} : { method: body ? 'post' : 'get' },
    defaultOpts,
    fetchJsonAlways.options,
    optsArg,
    body ? { body } : {}
  );

  return fetch(path, opts).then(response => {

    let text, textError;
    let json, jsonError;
    let promise = Promise.resolve();

    if (response.text) promise = promise
      .then(() => response.text())
      .then(__ => text = __)
      .catch(e => textError = e.message)
      .then(() => json = text && JSON.parse(text))
      .catch(e => jsonError = e.message);

    if (!json && response.json) promise = promise
      .then(() => response.json())
      .then(__ => json = __)
      .catch(e => jsonError = e.message);

    return promise.then(() => {
      if (json && response && response.ok) {
        return json;
      } else if (json) {
        return json;
      } else {
        response.error = response.error || jsonError || textError || ((response ? response.status + ' ' : '') + text);
        response.body = response.body || json || text;
        return response;
      }
    });
  }).catch(error => ({ error: error.message }));
}

'get,post,put,patch,delete'.split(/,/g).forEach(method =>
  fetchJsonAlways[method] = (path, options) => fetchJsonAlways(path, merge({}, options, { method })))
