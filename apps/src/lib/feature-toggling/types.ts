/**
 * A parsed cookie jar.
 *
 * Cookie names map to their values.
 * The map is read-only because a caller never writes a cookie through it.
 */
export type CookieEntries = ReadonlyMap<string, string>;
