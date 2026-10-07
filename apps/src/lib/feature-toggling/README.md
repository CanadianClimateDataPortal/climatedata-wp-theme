# feature-toggling

Keeps an unfinished feature out of the interface while its code already ships.

## What a toggle is for

A toggle controls the entry point, not the capability.
It adds the buttons a feature normally gets once it is complete.
Until then the code is in place and not visible.

A toggle is not a security boundary, and it promises nothing about URLs.
Anyone can put any query parameter into any URL, and the interface may then look off.
People reach a feature by clicking a button, and that button is what a toggle controls.

## Usage

```ts
// File: `src/lib/feature-toggling/toggle-names.ts`

export const TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM =
	'<some ASCII string we can add in an URL Search Query and as cookie name, e.g. LOREMIPSUM>' as const;
```

Then using the symbolic name elsewhere in the code;

```ts
// Somewhere else where we need to check the toggle

import {
	hasCookie,
  TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM, // Example of a toggle cookie name to check for existence
} from '@/lib/feature-toggling';

// This test is about whether the cookie name exists as a boolean check where existence means enabled.
const hasToggleLoremIpsum: boolean = hasCookie(TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM)
```

Enable a toggle in the DevTools console, then reload the page:

```js
document.cookie = 'LOREMIPSUM=yes'; // 
```

## From a URL

Someone who does not write JavaScript can set the same cookie from the address bar.
The parameter has the same name as the cookie.
Use `1` to add the cookie and `0` to remove it.

```
https://climatedata.ca/maps/?…&LOREMIPSUM=1
https://donneesclimatiques.ca/cartes/?…&LOREMIPSUM=0
```

Any other value does nothing.
The parameter is removed from the URL after it is read.
A link copied afterwards therefore does not pass the toggle to someone who did not ask for it.

`enableCookieToggle(name)` and `disableCookieToggle(name)` write the cookie.

## Three checks

Current implementation only supports boolean toggles.
We can make variations of enabling/disabling some code path by using negative or positive terms, e.g. `NO_LOREMIPSUM` vs `LOREMIPSUM`.

| Function | True when |
|---|---|
| `hasCookie(name)` | The cookie is set, whatever its value. |
| `isCookieTrue(name)` | The cookie is set and its value is exactly `true`. |
| `isCookieFalse(name)` | The cookie is set and its value is exactly `false`. |

Choose the check that matches the behaviour you are fencing.
Use `hasCookie` when the worst outcome is a longer dropdown.
Use `isCookieTrue` when the feature must stay off unless someone explicitly enables it.
An absent or unreadable value then counts as "no".

These checks do not establish trust.
Anyone can set these cookies from the console, so do not use them to gate data.


### Non-Implemented Toggles

- Non scalar objects (e.g. `{ "enabled": true }`, `["foo", "bar"]`) description and checking values inside
- More than one value for one toggle name
- Parsing the value directly from the cookie string (e.g. `LOREMIPSUM=TrUe`, `LOREMIPSUM=4`), and normalizing it to a boolean (e.g. as boolean `true`, as number `4`) -- Cookies are always strings (unless we add parsing).

### Limitations

- No parsing of cookie values (e.g. `LOREMIPSUM=TrUe`) and the current implementation would only support for existence (`) .

## Testing

`parseCookieString` is pure and does not touch the DOM.
Each check accepts parsed entries as an optional second argument, so tests remain
plain unit tests:

```ts
expect(isCookieTrue('LOREMIPSUM', parseCookieString('LOREMIPSUM=true'))).toBe(true);
```
