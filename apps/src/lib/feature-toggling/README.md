# feature-toggling

Keeps an unfinished feature out of the interface while its code already ships.

`toggle-names.ts` declares no toggle today. The library stays in place for the next one.

## What a toggle is for

A toggle controls the entry point, not the capability.
It adds the buttons a feature normally gets once it is complete.
Until then the code is in place and not visible.

A toggle is not a security boundary, and it promises nothing about URLs.
Anyone can put any query parameter into any URL, and the interface may then look off.
People reach a feature by clicking a button, and that button is what a toggle controls.

A toggle is a browser cookie, read at runtime.
Nothing else feeds it: no WordPress setting, no environment variable, no Redux state, no build flag.

## Usage

Declare the name once, in `toggle-names.ts`.
Use letters, digits and underscores only.
The name must be valid both as a cookie name and as a URL parameter.

```ts
// File: `src/lib/feature-toggling/toggle-names.ts`

export const TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM = 'LOREMIPSUM' as const;
```

Then use the symbolic name elsewhere in the code:

```ts
// Somewhere else where we need to check the toggle

import {
	hasCookie,
	TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM, // Example of a toggle cookie name to check for existence
} from '@/lib/feature-toggling';

// The toggle is on when a cookie with this name exists, whatever its value.
const hasToggleLoremIpsum: boolean = hasCookie(TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM);
```

Set the toggle from the URL, as the next section describes.

## From a URL

The supported way to set a toggle is a URL query parameter.
It is the only supported way, and it stays this simple on purpose.
The parameter has the same name as the cookie.
`?NAME=1` creates the cookie, and `?NAME=0` deletes it.

```
https://climatedata.ca/maps/?…&LOREMIPSUM=1
https://donneesclimatiques.ca/cartes/?…&LOREMIPSUM=0
```

`src/hooks/use-url-sync.ts` already calls `applyFeatureToggleFromUrl()` on every Maps page load, before the other URL processing.
That hook runs in the Maps app only, so the route works on Maps pages only.

The handler reads only the names listed in `URL_FEATURE_TOGGLES`, in `toggle-names.ts`.
That list is empty today, so no URL parameter sets a toggle.
To enable the route for a toggle, declare its name in `toggle-names.ts`, then add it to the list.

```ts
// File: `src/lib/feature-toggling/toggle-names.ts`

export const URL_FEATURE_TOGGLES: readonly string[] = [TOGGLE_COOKIE_NAME_BOOLEAN_LOREM_IPSUM];
```

Any other value does nothing.
The handler removes the parameter from the URL after it reads it, and keeps the hash.
It rewrites the URL once, and only when it removed at least one parameter.
A link copied afterwards therefore does not pass the toggle to someone who did not ask for it.

`enableCookieToggle(name)` and `disableCookieToggle(name)` write the cookie.
`enableCookieToggle` creates the cookie with `path=/` and a lifetime of 90 days.
`disableCookieToggle` deletes the cookie on `path=/`.
Check a toggle set this way with `hasCookie`.
The check asks only whether the cookie exists. Its value does not matter.

## Three checks

Each check returns a boolean.
The library parses cookies in the simplest way, on purpose, to stay simple.

- `hasCookie` checks only that the cookie exists. It never reads the value.
- `isCookieTrue` matches only the exact string `NAME=true`.
- `isCookieFalse` matches only the exact string `NAME=false`.

No other value counts: not `1`, not `TRUE`.
The library applies no truthiness rules, in the style of Perl or JavaScript.

The boolean checks exist for a future way of setting a toggle, other than the URL route.
No such way exists today, and none is needed now.

| Function | True when |
|---|---|
| `hasCookie(name)` | The cookie is set, whatever its value. |
| `isCookieTrue(name)` | The cookie is set and its value is exactly `true`. |
| `isCookieFalse(name)` | The cookie is set and its value is exactly `false`. |

Choose the check that matches the behaviour you are fencing.
Use `hasCookie` for a toggle set from the URL. This is the supported case.
It asks only whether the cookie exists. Its value does not matter.
Use `isCookieTrue` only when the feature must stay off unless a developer sets the cookie to exactly `true` by hand.
An absent or unreadable value then counts as "no".

A developer can exercise the boolean checks from the DevTools console, then reload the page.
This is a developer convenience, not a supported way to set a toggle.

```js
// `path=/` matches the writers, so `disableCookieToggle` can delete this cookie later.
document.cookie = 'LOREMIPSUM=true; path=/';
```

To fence the opposite behaviour, give it a name of its own, for example `NO_LOREMIPSUM` beside `LOREMIPSUM`.
This is a naming convention only. The library gives `NO_` no meaning.

These checks do not establish trust.
Anyone can set these cookies from the console, so do not use them to gate data.

### Non-Implemented Toggles

- Values that are not scalar, such as `{ "enabled": true }` or `["foo", "bar"]`, and checks on the values inside them.
- More than one value for one toggle name.
- Value normalisation, such as reading `LOREMIPSUM=TrUe` as `true` or `LOREMIPSUM=4` as the number `4`. Cookie values stay strings.

### Limitations

- **Listed names only.** `applyFeatureToggleFromUrl()` handles only the names in `URL_FEATURE_TOGGLES`, and that list is empty today. `src/hooks/use-url-sync.ts` already calls it. To get the `?NAME=1` and `?NAME=0` route for a toggle, add its name to that list.
- **Per browser, at runtime.** A toggle lives in one browser. It is not per user, not server-side, and not a build-time switch. PHP cannot see it.
- **Maps app only, for the URL.** Only the Maps app runs `use-url-sync.ts`. The Download app never reads the URL parameter.
- **No change event.** Nothing announces a change to the cookie. Code sees the new value on its next read, so reload the page after a change.
- **The URL route is an existence toggle.** `?NAME=1` creates the cookie, and `?NAME=0` deletes it. `hasCookie` checks only that the cookie exists, and its value does not matter.
- **Cookie values have no type.** A browser stores every cookie value as a string. `isCookieTrue` and `isCookieFalse` compare that string to exactly `true` or `false`, and nothing else. The URL route cannot reach either one, because it only creates or deletes the cookie. This is the cost of letting a non-developer remove a toggle without DevTools.
- **Names are plain strings.** A typo in a name still compiles, and the check silently returns `false`. Import the constant from `toggle-names.ts` rather than retype the string.
- **No tests ship** with this library.
- **DevTools cookies need `path=/`.** This applies to the developer convenience above. Without it, the browser gives the cookie the current path. `disableCookieToggle` deletes on `path=/`, so it can fail to delete that cookie. Use `document.cookie = "NAME=true; path=/"`.
- **Shared cache.** `readCookieEntries` caches the parsed cookies at module level. Tests that rely on the default `entries` argument share that state.

## Testing

`parseCookieString` is pure and does not touch the DOM.
Each check accepts parsed entries as an optional second argument, so tests remain
plain unit tests:

```ts
expect(isCookieTrue('LOREMIPSUM', parseCookieString('LOREMIPSUM=true'))).toBe(true);
```

Pass the entries explicitly in tests, to avoid the shared cache described above.
