import type { PrepareRasterPostHttpPayload } from './types';

/**
 * Wraps the payload as the POST `fetch` init.
 *
 * @remark Where does this run?: In the user's browser.
 */
export const createFetchRequestInitOptions = (
	payload?: PrepareRasterPostHttpPayload,
): RequestInit => {
	const fetchOptions: RequestInit = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	// Always send a JSON body, and send `{}` when there is no payload.
	// By the HTTP spec, a POST with no body and no `Content-Type` is correct.
	// But the climatedata-api `/raster` route answers 415 to it.
	// The route calls Flask's `request.get_json()` on every POST.
	// We cope with that here: the route reads `{}` as "no popup, no marker".
	// Do not send `Content-Type: application/json` with an empty body.
	// An empty string is not valid JSON (RFC 8259), and the route answers 400.
	//
	// No try/catch: `JSON.stringify` throws only on a BigInt or a circular reference.
	// This payload holds only strings and numbers.
	// Revisit this if the payload type gains another kind of value.
	fetchOptions.body = JSON.stringify(payload ?? {});
	return fetchOptions;
};
