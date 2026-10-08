# feature-toggling

Keeps an unfinished feature out of the interface while its code already ships.

The library stays in place even when `toggle-names.ts` declares no toggle.

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

export const TOGGLE_EXAMPLE_FEATURE = 'TRY_NEW_THING' as const;
```

The constant name and the toggle name are two different things.
Code imports the constant, and the cookie and the URL parameter use the string.

Then use the symbolic name elsewhere in the code:

```ts
// Somewhere else where we need to check the toggle

import {
	hasCookie,
	TOGGLE_EXAMPLE_FEATURE, // Example of a toggle cookie name to check for existence
} from '@/lib/feature-toggling';

const hasToggleExampleFeature: boolean = hasCookie(TOGGLE_EXAMPLE_FEATURE);
```

Set the toggle from the URL, as the next section describes.

## From a URL

The supported way to set a toggle is a URL query parameter.
It is the only supported way, and it stays this simple on purpose.
The parameter has the same name as the cookie.
`?NAME=1` creates the cookie, and `?NAME=0` deletes it.
Any other value of the parameter, such as `?NAME=true`, leaves the cookie unchanged.

```
https://climatedata.ca/maps/?…&TRY_NEW_THING=1
https://donneesclimatiques.ca/cartes/?…&TRY_NEW_THING=0
```

`src/hooks/use-url-sync.ts` calls `applyFeatureToggleFromUrl()` on every Maps page load, before the other URL processing.
That hook runs in the Maps app only, so the route works on Maps pages only.

The handler reads only the names listed in `URL_FEATURE_TOGGLES`, in `toggle-names.ts`.
When the list is empty, no URL parameter sets a toggle.
To enable the route for a toggle, declare its name in `toggle-names.ts`, then add it to the list.

```ts
// File: `src/lib/feature-toggling/toggle-names.ts`

// At the bottom, after the other (possible) feature toggle names.

export const URL_FEATURE_TOGGLES: readonly string[] = [
	TOGGLE_EXAMPLE_FEATURE,
];
```

The handler removes the parameter from the URL after it reads it, whatever its value, and keeps the hash.
It rewrites the URL once, and only when it removed at least one parameter.
`use-url-sync.ts` keeps the app state in the URL, but a toggle is not app state.
So the handler runs first and removes its parameter, and the toggle parameter does not stay in the URL.

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
A browser gives URL parameter values and cookie values as plain strings, with no type.
The library does not parse them into typed values.
The URL handler compares the parameter to exactly the strings `'1'` and `'0'`.
`isCookieTrue` and `isCookieFalse` compare the cookie to exactly the strings `'true'` and `'false'`.

The boolean checks exist for a way of setting a toggle other than the URL route.
Only a cookie set by hand reaches them, as the DevTools example below shows.

| Function | True when |
|---|---|
| `hasCookie(name)` | The cookie is set, whatever its value. |
| `isCookieTrue(name)` | The cookie is set and its value is exactly `true`. |
| `isCookieFalse(name)` | The cookie is set and its value is exactly `false`. |

Choose the check that matches the behaviour you are fencing.
Use `hasCookie` for a toggle set from the URL. This is the supported case.
Use `isCookieTrue` only when the feature must stay off unless a developer sets the cookie to exactly `true` by hand.
An absent or unreadable value then counts as "no".

A developer can exercise the boolean checks from the DevTools console, then reload the page.
This is a developer convenience, not a supported way to set a toggle.

```js
document.cookie = 'TRY_NEW_THING=true; path=/';
```

The same code serves two domains, climatedata.ca and donneesclimatiques.ca.
The apps live at a different path per language, for example `/maps/`, `/cartes/` or `/download/`.
So the writers set the cookie with `path=/` and with no domain attribute.
A cookie set by hand must use `path=/` too.
Without it, the browser gives the cookie the current path, and `disableCookieToggle` cannot delete it.

To fence the opposite behaviour, give it a name of its own, for example `NO_TRY_NEW_THING` beside `TRY_NEW_THING`.
This is a naming convention only. The library gives `NO_` no meaning.

These checks do not establish trust.
Anyone can set these cookies from the console, so do not use them to gate data.

### Non-implemented toggles

- Values that are not scalar, such as `{ "enabled": true }` or `["foo", "bar"]`, and checks on the values inside them.
- More than one value for one toggle name.
- Value normalisation, such as reading `TRY_NEW_THING=TrUe` as `true` or `TRY_NEW_THING=4` as the number `4`. Cookie values stay strings.

### Limitations

- **Listed names only.** The URL route covers only the names in `URL_FEATURE_TOGGLES`. See [From a URL](#from-a-url).
- **Per browser, at runtime.** A toggle lives in one browser. It is not per user, not server-side, and not a build-time switch. PHP cannot see it.
- **Maps app only, for the URL.** Only the Maps app runs `use-url-sync.ts`. The Download app never reads the URL parameter.
- **No change event.** Nothing announces a change to the cookie. Code sees the new value on its next read, so reload the page after a change.
- **The URL route is an existence toggle.** `?NAME=1` creates the cookie, and `?NAME=0` deletes it. `hasCookie` checks only that the cookie exists, and its value does not matter.
- **Cookie values have no type.** The URL route cannot reach `isCookieTrue` or `isCookieFalse`, because it only creates or deletes the cookie. This is the cost of letting a non-developer remove a toggle without DevTools.
- **Names are plain strings.** A typo in a name still compiles, and the check silently returns `false`. Import the constant from `toggle-names.ts` rather than retype the string.
- **No tests ship** with this library.

## Testing

`parseCookieString` is pure and does not touch the DOM.
Each check accepts parsed entries as an optional second argument, so tests remain
plain unit tests:

```ts
expect(isCookieTrue('TRY_NEW_THING', parseCookieString('TRY_NEW_THING=true'))).toBe(true);
```

Pass `entries` explicitly in tests, so that each test controls its own cookies.
