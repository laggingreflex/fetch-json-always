# fetch-json-always

Configurable wrapper around [**`fetch`**][fetch] to **always** retrieve **JSON**, even in case of an error.

[fetch]: https://developer.mozilla.org/en/docs/Web/API/Fetch_API

Main features:

* **Always** resolves to `{error, ...data}` (i.e. never rejects)
* Attaches relevant headers for JSON:
  ```js
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  ```
* Text errors converted to JSON `{ error: ... }`
  * Errors sent as JSON by server (with status codes > 400) are left as is.
* Stringifies request `{ body }`
* Options are **[merge]d** rather than [assign]ed. (also this is the **only** dependency)
* Auto-specifies `{method: 'post'}` if omitted and a body was passed
* Shortcut methods: `fetch.get`, `fetch.post`, `fetch.put`, ...

Additional features:

* Configurable `fetch` - use either native or polyfill
* Configurable `host` - prefixed to paths before sending request
* ... see [#config](#config)

Other similar libraries: [json-fetch], [fetch-json].

[json-fetch]: https://github.com/goodeggs/json-fetch
[fetch-json]: https://github.com/kahwee/fetch-json

## Install

```sh
npm install fetch-json-always --save
```

## Usage

### Example

```js
fetch(/data-path)
  .then(json => {
    if (json.error) {
      ...
    } else {
      ...
    }
  }) // no catch - it doesn't throw (*always* fetches json)
```
or
```js
const {error, ...data} = await fetch('...');
```
### API

```js
fetch(path, options)
```

* **`path`** `[string](required)` Path to make request to.

* **`options`** `[object]` Options object containing headers, body etc. `body` can be plain JS object.

  [Merge]d with configured options object (see [#config](#config)) and the following json-related default options object:
  ```js
  defaults = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }
  ```
  ```js
    merge({},
      defaults, // above
      {method: body ? 'post' : 'get'},
      fetch.options, // configured
      opts, // passed as argument
      {body} // after stringifying
    )
  ```

[merge]: http://npmjs.com/merge
[assign]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

#### Shortcut Methods

```js
fetch.⟪method⟫(...)
```

* **`get`** Equivalent of: `fetch(path, {method: 'get'})`
* **`post`** Equivalent of: `fetch(path, {method: 'post'})`
* ... **`put`**, **`patch`**, **`delete`**  〃

#### Config
```js
fetch.⟪config⟫ = ...
```

* **`host`** `[string](default:none)` Use this host to add all paths to before making the fetch request

  ```js
  fetch.host = 'http://server.com'
  ```

* **`options`** `[object](default:none)` Default set of options used in every fetch request. **Merged** with *actual* (json-related) options.

  ```js
  fetch.options = {
    headers: {
      'Cache-Control': 'no-cache'
      // 'Accept': 'application/json',  < will still be present in final request
      'Content-Type': 'json' // < overridden default json-related option

    }
  }
  ```

* **`fetch`** `[function](default:none(uses native))` Underlying `fetch` function to use. Use this to polyfill if needed.

  ```js
  fetch.fetch = require('isomorphic-fetch')
  ```
  You may also use `isomorphic-fetch` to globally polyfill the underlying fetch in which case the above won't be needed.
