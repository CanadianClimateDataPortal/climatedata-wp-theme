/**
 * @file TimePeriodsControl Examples and Fixtures
 *
 * Static illustrative data for the time periods slider family, used by Ladle
 * stories, and also available for vitest tests and documentation.
 */

// ============================================================================
// S2D DECADAL (time-periods-control-s2d.tsx, with a DECADAL_* frequency)
// ============================================================================

/**
 * Climate variable id of an S2D variable that offers decadal frequencies.
 *
 * It is the `id` of an entry in `@/config/climate-variables.config.ts`, the
 * value `climateVariable.getId()` returns, and the `var=` {@link URL_PARAMS.VARIABLE_ID}
 * URL parameter.
 */
export const EXAMPLE_S2D_CLIMATE_VARIABLE_ID = 's2d_air_temp';

/**
 * Release date the S2D API returns for a decadal frequency.
 *
 * For a decadal frequency the release date is always the first day of a year.
 * `getPeriods()` then starts the first period on that day, as on the live
 * portal.
 *
 * Kept as a 'YYYY-MM-DD' string, because the release date cache in the s2d
 * Redux slice stores strings. Parse it with `utc()` from `@/lib/utils` before
 * passing it to `getPeriods()`.
 */
export const EXAMPLE_S2D_DECADAL_RELEASE_DATE = '2026-01-01';
