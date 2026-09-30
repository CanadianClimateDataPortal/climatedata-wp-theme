/**
 * @file TimePeriodsControl Examples and Fixtures
 *
 * Static illustrative data for the time periods slider family, used by Ladle
 * stories, and later by vitest tests and documentation.
 *
 * The family has one component per kind of climate variable:
 * - `time-periods-control.tsx` - the default, a range of years
 * - `time-periods-control-single.tsx` - a single year
 * - `time-periods-control-for-sea-level.tsx` - sea level
 * - `time-periods-control-s2d.tsx` - S2D forecasts (seasonal to decadal)
 *
 * Only the S2D decadal case has examples so far. Another variant adds its own
 * section below, with a banner and `EXAMPLE_<VARIANT>_*` constants, following
 * the same pattern.
 *
 * This file holds data only. Anything that writes to the Redux store, such as
 * seeding the release date cache, stays in the story that needs it.
 *
 * SECTIONS:
 * - @see EXAMPLE_S2D_CLIMATE_VARIABLE_ID - S2D decadal
 */

// ============================================================================
// S2D DECADAL (time-periods-control-s2d.tsx, with a DECADAL_* frequency)
// ============================================================================

/**
 * Climate variable id of an S2D variable that offers decadal frequencies.
 *
 * It is the `id` of an entry in `@/config/climate-variables.config.ts`, the
 * value `climateVariable.getId()` returns, and the `var=` URL parameter.
 *
 * @example 's2d_air_temp' → the mean temperature forecast
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
