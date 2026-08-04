import L from 'leaflet';

import { createFetchRequestInitOptions } from './create-fetch-request-init-options';
import { createFetchTargetToRasterWithEncodedUrl } from './create-fetch-target-to-raster-with-encoded-url';
import { createPrepareRasterPostHttpPayload } from './create-prepare-raster-post-http-payload';

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

/**
 * In order to test the screenshot service, we need to set the DATA_URL and URL_ENCODER_SALT in the browser's window object.
 * This is because the screenshot service is a separate service that needs to know where to send the request to get the data.
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
 * // The above enables the debugger and will make the code to write the payload info to be written to the window object.
 *
 * // 1.2. Adjust the debugger to point to ANOTHER deployed screenshot service.
 * window.mapPrepareRasterPostHttpPayloadDebugger.setup('staging.climatedata.ca', 'https://staging-data.example.org', '<salt to use>' );
 *
 * // The above adjusts what's needed so that we can use our local frontend app as if it was deployed at the same environment.
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

	#places: PlaceItem[] = [];

	get isSetup(): boolean {
		return this.#urlHost !== '';
	}

	/**
	 * Debug mode is on for as long as `window.mapPrepareRasterPostHttpPayload` exists as a
	 * property — even when its value is `null`. Creating the property is what turns it on;
	 * there is no separate flag. Every debug-only branch on this class reads this getter
	 * rather than repeating the `in` check.
	 */
	get isDebugMode(): boolean {
		return 'mapPrepareRasterPostHttpPayload' in window;
	}

	get places(): PlaceItem[] {
		return [...this.#places.map((place) => ({ ...place }))];
	}

	setup(
		urlHost: string,
		dataUrl: string,
		salt: string,
	) {
		if (!this.isDebugMode) {
			window.mapPrepareRasterPostHttpPayload = null;
		}
		this.#urlHost = urlHost;
		window.DATA_URL = dataUrl;
		window.URL_ENCODER_SALT = salt;
		console.log('DebugPrepareRasterPostHttpPayload: setup', {
			urlHost,
			dataUrl,
			salt,
		});
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
	 * Utility to instrument each time we open a location modal during debugging to visualize on a screenshot service.
	 *
	 * This will mutate `window.mapPrepareRasterPostHttpPayload`, and record the payload
	 * alongside where we've clicked, only when we are in debugging mode. Storing the
	 * payload here — rather than recomputing it later — is what lets {@link createFetchFor}
	 * replay this exact place even after a different LocationModal has since been opened.
	 *
	 * @remark To enable, set `window.mapPrepareRasterPostHttpPayload = null` in the browser's console before clicking on a location modal.
	 */
	addLocationModalOpenItem(
		name: string,
		windowLocation: string,
		latlng: L.LatLng,
	) {
		if (!this.isDebugMode) {
			// Do not execute if we're not in debug mode.
			// This is intended only when we need the debugger.
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
			// Do not execute if we're not in debug mode.
			// This is intended only when we need the debugger.
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
		// Make sure to remove addition hashes.
		mapUrl.hash = '';
		if (this.isSetup) {
			// When trying to test another remote screenshot service
			this.fixUrlHost(mapUrl);
		}
		const fetchTarget = createFetchTargetToRasterWithEncodedUrl(mapUrl.href);
		return (): Promise<Response> => {
			this.preFetchConsoleLog(fetchTarget, fetchInit);
			return fetch(fetchTarget, fetchInit);
		};
	}

	/**
	 * Add console.log line when in debugging mode to show the cURL command that can be used to test the screenshot service.
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
			// Do not execute if we're not in debug mode.
			// This is intended only when we need the debugger.
			return;
		}

		// Normally, we do not want this. But when we do, what do the following mean:
		let cURL = `curl '${String(reqUrl)}'`;
		if (!reqInit.body) {
			// We do not have a modal opened, no data to send
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
