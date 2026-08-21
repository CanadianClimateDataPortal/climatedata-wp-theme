# feature-toggling

Hides unfinished or unproven behaviour behind a cookie.
The code ships to production, but the behaviour stays hidden until we enable it.

```ts
import { hasCookie } from '@/lib/feature-toggling';

const options = hasCookie('S2D_FREQUENCIES_TO_ADD_SUPPORT')
	? OPTIONS_WITH_THE_NEW_THING
	: OPTIONS;
```

Enable a toggle in the DevTools console, then reload the page:

```js
document.cookie = 'S2D_FREQUENCIES_TO_ADD_SUPPORT=yes';
```

## Three checks

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

## Why there is no polling

`readCookieEntries()` compares the current `document.cookie` string with the last
string it parsed, and parses it again only when the string changes.
There is no timer or subscription to keep in sync.
Calling a check on every React render uses one native getter and one string comparison.

`cookieStore`'s `change` event could provide an event-driven version.
It is asynchronous and Chromium-only, so it is not used here.

## Testing

`parseCookieString` is pure and does not touch the DOM.
Each check accepts parsed entries as an optional second argument, so tests remain
plain unit tests:

```ts
expect(isCookieTrue('FLAG', parseCookieString('FLAG=true'))).toBe(true);
```

Introduced for CLIM-1447, the first of several S2D map views.
