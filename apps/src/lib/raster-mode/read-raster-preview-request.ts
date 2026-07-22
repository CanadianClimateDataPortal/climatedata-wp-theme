import {
	PROD_APEX_HOST_EN,
	PROD_APEX_HOST_FR,
} from '@/lib/language-switch';

/**
 * Query parameter that asks for the raster-mode preview, e.g. `?raster=1`.
 *
 * Intentionally NOT registered in the `URL_PARAMS` registry
 * (`lib/url-params/param-names.ts`) and never emitted by `buildMapUrlParams`.
 * Registering it would make the preview a shareable, persisted piece of app
 * state, which is the opposite of what it is.
 *
 * The consequence is that the key's survival in the address bar is not
 * guaranteed. `useUrlSync` (`hooks/use-url-sync.ts`) has two debounced writers
 * that share one timer, and they disagree about unknown keys: the settings
 * writer rebuilds the query string from a fresh, empty `URLSearchParams` (so it
 * drops anything unregistered), while the map-movement writer starts from the
 * current `window.location.search` and only overwrites lat/lng/zoom (so it keeps
 * it). Whichever fires last within a few hundred milliseconds of boot decides.
 *
 * That is why the read is a mount-time one-shot rather than URL-synced state:
 * consuming the parameter once, before either writer can land, is correct under
 * both outcomes and does not depend on which one wins.
 */
export const RASTER_PREVIEW_PARAM = 'raster';

/** The exact parameter value that counts as opting in. */
const RASTER_PREVIEW_OPT_IN = '1';

/**
 * The hosts on which the preview is refused: the two production apex hosts.
 *
 * Sourced from the language-switch namespace rather than re-typed, so a
 * production hostname is written down in exactly one place. Its `HOST_PAIRS`
 * table is deliberately not used here — it is module-private, and it contains
 * the production pair alongside every non-production pair, so matching against
 * it would deny the dev, UAT, QA and pre-production hosts this preview exists to
 * serve.
 *
 * No `www.` variants: production answers `www.` with a redirect to the bare apex
 * before this bundle is parsed, so the app only ever runs on the bare host.
 */
const DENIED_HOSTS: ReadonlyArray<string> = [
	PROD_APEX_HOST_EN,
	PROD_APEX_HOST_FR,
];

/**
 * Whether the raster-mode preview may be entered on `hostname`.
 *
 * The preview is a development affordance, not a product feature: it renders the
 * page as the downloadable image will look, which on a live site would show a
 * visitor export furniture instead of the app. It exists because this app has no
 * usable dev server — the React bundle can only be viewed through WordPress —
 * so every host a developer can actually reach has to keep working, and only the
 * two public production hosts are refused.
 *
 * @param hostname - `window.location.hostname`, e.g. `dev-en.climatedata.ca`.
 * @returns `true` on any host except the two production apex hosts.
 *
 * @example
 * ```typescript
 * isRasterPreviewAllowed('dev-en.climatedata.ca'); // true
 * isRasterPreviewAllowed('climatedata.ca');        // false
 * ```
 */
export const isRasterPreviewAllowed = (
	hostname: string,
): boolean => !DENIED_HOSTS.includes(hostname);

/**
 * Whether this page load is asking for the raster-mode preview.
 *
 * Pure by design — it takes the query string and the hostname instead of reading
 * `window`, so the opt-in rule and the host refusal are both directly testable.
 * The caller supplying `window.location` is `useRasterMode`
 * (`hooks/use-raster-mode.ts`).
 *
 * The opt-in is the exact value `1`, nothing looser: a valueless or
 * differently-valued key is not an opt-in, so a stray `?raster` surviving in a
 * shared or bookmarked URL cannot silently produce an export-shaped page.
 *
 * @param search - `window.location.search`, with or without its leading `?`.
 * @param hostname - `window.location.hostname`.
 * @returns `true` only when the parameter opts in AND the host allows it.
 *
 * @example
 * ```typescript
 * readRasterPreviewRequest('?raster=1', 'dev-en.climatedata.ca'); // true
 * readRasterPreviewRequest('?raster=1', 'climatedata.ca');        // false — production
 * readRasterPreviewRequest('?raster', 'dev-en.climatedata.ca');   // false — not `1`
 * ```
 */
export const readRasterPreviewRequest = (
	search: string,
	hostname: string,
): boolean => {
	const params = new URLSearchParams(search);
	const isRequested = params.get(RASTER_PREVIEW_PARAM) === RASTER_PREVIEW_OPT_IN;
	if (!isRequested) {
		return false;
	}
	return isRasterPreviewAllowed(hostname);
};
