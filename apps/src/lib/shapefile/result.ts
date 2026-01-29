/**
 * Generic Result type for explicit error handling.
 *
 * Not shapefile-specific — reusable across the project.
 * Provides a discriminated union that forces explicit error handling
 * without relying on try-catch blocks.
 *
 * @example
 * ```typescript
 * const result = await validate(data);
 * if (result.ok) {
 *   console.log('Valid:', result.value);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */

/**
 * Success result wrapper.
 */
export interface Ok<T> {
  ok: true;
  value: T;
}

/**
 * Failure result wrapper.
 */
export interface Err<E extends Error> {
  ok: false;
  error: E;
}

/**
 * Result type for operations that can fail.
 *
 * The `ok` property acts as a type guard, allowing TypeScript
 * to narrow the type to either the success value or the error.
 */
export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;
