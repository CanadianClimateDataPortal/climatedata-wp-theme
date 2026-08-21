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
string it parsed, and parses it again only when that string changes.
Calling a check on every React render uses one native getter and one string
comparison.

Nothing reports cookie changes, and nothing needs to.
The toggle takes effect when someone edits the cookie and reloads the page.
For information about updating the interface without a reload, see the note at
the end of `cookie-jar.ts`.

## Testing

`parseCookieString` is pure and does not touch the DOM.
Each check accepts parsed entries as an optional second argument, so tests remain
plain unit tests:

```ts
expect(isCookieTrue('FLAG', parseCookieString('FLAG=true'))).toBe(true);
```

Introduced for CLIM-1447, the first of several S2D map views.
