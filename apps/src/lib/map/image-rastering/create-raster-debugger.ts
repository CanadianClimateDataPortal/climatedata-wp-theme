import L from 'leaflet';

import { createFetchRequestInitOptions } from './create-fetch-request-init-options';
import { createFetchTargetToRasterWithEncodedUrl } from './create-fetch-target-to-raster-with-encoded-url';
import { createPrepareRasterPostHttpPayload } from './create-prepare-raster-post-http-payload';
import { warnOnTrailingSlashInInjectedUrls } from './warn-on-trailing-slash-in-injected-urls';

import type { SignalReady } from './signal-raster-ready';
import type { PrepareRasterPostHttpPayload } from './types';

type PlaceItem = {
	name: string;
	windowLocation: string;
	latlng: L.LatLng;
	/**
	 * The payload {@link createPrepareRasterPostHttpPayload} computed at the moment this
	 * place was recorded — captured once, so replaying it later via {@link PrepareRasterPostHttpPayloadDebugger.createFetchFor}
	 * does not re-scrape whatever LocationModal happens to be open by then.
	 */
	payload: PrepareRasterPostHttpPayload | undefined;
};

type SetupState = {
		hold: boolean,
		urlHost: string,
		dataUrl: string,
		salt: string,
};

/**
 * Console helper for exercising the screenshot service by hand.
 *
 * The service lives at whatever `window.DATA_URL` names, and requests to it are
 * signed with `window.URL_ENCODER_SALT`. Both are stamped into the page by the
 * WordPress template, so pointing this browser at a different deployment means
 * overwriting them — which is what {@link PrepareRasterPostHttpPayloadDebugger.setup}
 * is for.
 *
 * @remark Where does this run?: In the user's browser.
 *
 * @example Usage example
 *
 * ```js
 * // 1. From any map page, open the browser's developer console.:
 *
 * // 1.1. Paste and the following:
 * window.mapPrepareRasterPostHttpPayload = null;
 *
 * // The above enables the debugger and starts loading this module. It lands moments
 * // later, so run 1.2 as its own paste rather than on the same line as 1.1.
 *
 * // 1.2. Hold at signal, retarget another deployment, or both.
 * window.mapPrepareRasterPostHttpPayloadDebugger.setup(true);
 * // hold at signal, current deployment untouched
 *
 * window.mapPrepareRasterPostHttpPayloadDebugger.setup(false, 'uat.climatedata.ca', 'https://dataclimatedata.crim.ca', 'override-me');
 * // retarget staging, no hold
 *
 * // 2. Click around — each LocationModal open overwrites window.mapPrepareRasterPostHttpPayload
 * // with what it captured, and records it under `places` for later replay by index.
 *
 * // 2.1. Optionally hand-author the payload instead of using a captured one. A manually
 * // assigned value here always wins over an automatically-captured one, for both the
 * // Download button and `createFetchFor` below, until it is reassigned again.
 * window.mapPrepareRasterPostHttpPayload = {
 *   locationPopupHtml: ['<div>…</div>'],
 *   markerLatLon: [45.51308360513238, -72.31819152832033],
 * };
 *
 * // 3. Export — either click the "Download" button on the map page, or call this
 * // debugger's thunk directly for a previously recorded place:
 * window.mapPrepareRasterPostHttpPayloadDebugger.createFetchFor(0)?.();
 * ```
 */
export class PrepareRasterPostHttpPayloadDebugger {
	#urlHost: string | '' = '';

	#hold: boolean = false;

	#places: PlaceItem[] = [];

	get isSetup(): boolean {
		return this.#urlHost !== '';
	}

	/**
	 * Debug mode is on whenever `window.mapPrepareRasterPostHttpPayload` holds a
	 * defined value — including `null`, since assigning `null` is what enables
	 * debug mode from the console.
	 * `installDebugPayloadAccessor` keeps the property present on `window` at all
	 * times, so testing its value is what separates debug mode from production —
	 * an `in` check is permanently true and answers nothing.
	 * Every debug-only branch on this class reads this getter rather than
	 * repeating the check.
	 */
	get isDebugMode(): boolean {
		return window.mapPrepareRasterPostHttpPayload !== undefined;
	}

	/** Recorded `LocationModal` locations. Use the index with `createFetchFor` to replay one. */
	get places(): PlaceItem[] {
		return [...this.#places.map((place) => ({ ...place }))];
	}

	get setupState(): SetupState {
		return {
			hold: this.#hold,
			urlHost: this.#urlHost,
			dataUrl: window.DATA_URL,
			salt: window.URL_ENCODER_SALT,
		};
	}

	/**
	 * Configures the debugger. `urlHost`, `dataUrl`, and `salt` are each applied only
	 * when provided — omitting one leaves the current deployment untouched, so a caller
	 * can hold at signal without also having to restate a retarget it already made.
	 *
	 * @param hold - When true, {@link resolveSignalReady} withholds the readiness class
	 * instead of returning `fallback`, freezing the page at capture state for inspection.
	 * @param urlHost - Screenshot-service host to rewrite requests to. Omit to leave {@link fixUrlHost} inactive.
	 * @param dataUrl - Overrides `window.DATA_URL`. Omit to leave the current deployment's value.
	 * @param salt - Overrides `window.URL_ENCODER_SALT`. Omit to leave the current deployment's value.
	 */
	setup(
		hold: boolean,
		urlHost?: string,
		dataUrl?: string,
		salt?: string,
	) {
		if (!this.isDebugMode) {
			window.mapPrepareRasterPostHttpPayload = null;
		}
		this.#hold = hold;
		if (urlHost !== undefined) {
			this.#urlHost = urlHost;
		}
		if (dataUrl !== undefined) {
			window.DATA_URL = dataUrl;
		}
		if (salt !== undefined) {
			window.URL_ENCODER_SALT = salt;
		}

		const applied: Record<string, boolean | string> = {
			hold,
		};
		if (urlHost !== undefined) {
			applied.urlHost = urlHost;
		}
		if (dataUrl !== undefined) {
			applied.dataUrl = dataUrl;
		}
		if (salt !== undefined) {
			applied.salt = salt;
		}
		console.log('DebugPrepareRasterPostHttpPayload: setup', applied);

		// This method assigns the injected URL globals, so it re-runs the check the
		// page ran at load.
		// A deployment address typed here by hand is the one route by which a trailing
		// slash reaches those globals after the module-scope check has already passed.
		warnOnTrailingSlashInInjectedUrls();
	}

	fixUrlHost(
		url: URL,
	) {
		if (!this.isDebugMode) {
			return;
		}
		if (url.host !== this.#urlHost) {
			const previousHost = url.host;
			url.host = this.#urlHost;
			console.warn(
				`fixUrlHost fixed from ${previousHost} to be ${this.#urlHost} (${url.href})`
			);
		}
	}

	/**
	 * Resolves the payload to actually send for an export, applying the debug-mode
	 * override precedence shared by {@link DownloadMapModal}'s `handleDownloadClick`
	 * and {@link createFetchFor}.
	 *
	 * Outside debug mode, always returns `fallback` unchanged — production behaviour
	 * is untouched. In debug mode, `window.mapPrepareRasterPostHttpPayload` — whatever
	 * {@link addLocationModalOpenItem} last captured, or whatever was hand-authored
	 * directly in the console — always wins over `fallback`, including when it is
	 * explicitly `null` (send no payload).
	 *
	 * @param fallback - What would be sent outside debug mode: the live popup/location
	 * scrape for the Download button, or a place's own stored capture for `createFetchFor`.
	 */
	resolvePostHttpPayload(
		fallback: PrepareRasterPostHttpPayload | undefined,
	): PrepareRasterPostHttpPayload | undefined {
		if (!this.isDebugMode) {
			return fallback;
		}
		return window.mapPrepareRasterPostHttpPayload ?? undefined;
	}

	/**
	 * Resolves the readiness signal `prepareRaster` should call, applying the debug-mode
	 * hold shared with {@link DownloadMapModal}'s production call site.
	 *
	 * Outside debug mode, or when `hold` is false, always returns `fallback` unchanged —
	 * production behaviour is untouched. In debug mode with `hold` true, returns an
	 * implementation that logs instead of adding the readiness class, so the page stays
	 * frozen in exactly the state the screenshot service would have captured.
	 *
	 * @param fallback - What would signal readiness outside debug mode: `signalRasterReady`.
	 */
	resolveSignalReady(
		fallback: SignalReady,
	): SignalReady {
		if (!this.isDebugMode || !this.#hold) {
			return fallback;
		}
		return (): void => {
			console.log(
				'DebugPrepareRasterPostHttpPayload: withholding readiness — page frozen at capture state for inspection.',
			);
		};
	}

	/**
	 * Records one `LocationModal` opening, so that place can be sent to the screenshot
	 * service later.
	 *
	 * Overwrites `window.mapPrepareRasterPostHttpPayload` and appends to `places`, both
	 * only in debug mode.
	 * Storing the payload here — rather than recomputing it later — is what lets
	 * {@link createFetchFor} replay this exact place even after a different
	 * LocationModal has since been opened.
	 *
	 * @remark To enable, set `window.mapPrepareRasterPostHttpPayload = null` in the browser's console before clicking on a location modal.
	 */
	addLocationModalOpenItem(
		name: string,
		windowLocation: string,
		latlng: L.LatLng,
	) {
		if (!this.isDebugMode) {
			return;
		}

		const payload = createPrepareRasterPostHttpPayload(latlng);
		if (payload) {
			console.info(
				'For Manual testing against screenshot service: window.mapPrepareRasterPostHttpPayload = ',
				payload
			);
			window.mapPrepareRasterPostHttpPayload = window.structuredClone(payload);
		} else {
			console.info(
				'For Manual testing against screenshot service: window.mapPrepareRasterPostHttpPayload = null'
			);
			window.mapPrepareRasterPostHttpPayload = null;
		}

		this.#places.push({
			name,
			windowLocation,
			latlng,
			payload,
		});
	}

	/**
	 * Doing the same as {@link DownloadMapModal}'s `handleDownloadClick` but for debugging.
	 */
	createFetchFor(
		index: number,
	): (() => ReturnType<typeof fetch>) | undefined {
		if (!this.isDebugMode) {
			return;
		}
		const place = this.#places[index];
		if (!place) {
			const message = `createFetchFor: no place at index ${index}`;
			throw new Error(message);
		}
		const { windowLocation } = place;
		const payload = this.resolvePostHttpPayload(place.payload);
		const fetchInit = createFetchRequestInitOptions(payload);
		console.log(`createFetchFor(${index})`, { payload, fetchInit, place });
		const mapUrl = new URL(windowLocation);
		// The hash is client-side state the service has no use for.
		mapUrl.hash = '';
		if (this.isSetup) {
			// When trying to test another remote screenshot service
			this.fixUrlHost(mapUrl);
		}
		// Always the encoded-URL target, never `resolveRasterFetchTarget`: retargeting
		// another deployment means addressing that deployment's service by host, and the
		// same-origin proxy branch can only ever reach the one serving this page.
		const fetchTarget = createFetchTargetToRasterWithEncodedUrl(mapUrl.href);
		return (): Promise<Response> => {
			this.preFetchConsoleLog(fetchTarget, fetchInit);
			return fetch(fetchTarget, fetchInit);
		};
	}

	/**
	 * Logs the equivalent `curl` command for a request, so the same call can be repeated
	 * from a shell.
	 *
	 * Prints `reqInit.body` itself — the exact bytes {@link createFetchFor} and
	 * `handleDownloadClick` send on the wire — rather than re-reading
	 * `window.mapPrepareRasterPostHttpPayload`, which can differ from the request
	 * body once anything overrides the resolved payload.
	 */
	preFetchConsoleLog(
		reqUrl: string,
		reqInit: RequestInit,
	) {
		if (!this.isDebugMode) {
			return;
		}

		let cURL = `curl '${String(reqUrl)}'`;
		if (!reqInit.body) {
			// No modal was open when this was built, so there is no data to send.
			console.log(
				'For Manual testing against screenshot service (without any data):\n',
				cURL
			);
		} else {
			cURL += ` --request POST --header 'Content-Type: application/json' --data '${String(reqInit.body)}'`;
			console.log('For Manual testing against screenshot service:\n', cURL);
		}
	}
}

/**
 * Factory for {@link PrepareRasterPostHttpPayloadDebugger}, so this namespace's
 * verb-first file-naming convention holds and a later lazy `import()` of this
 * module has a function to call rather than a bare class construction.
 */
export const createRasterDebugger = (): PrepareRasterPostHttpPayloadDebugger => new PrepareRasterPostHttpPayloadDebugger();
