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
	if (payload) {
		fetchOptions.body = JSON.stringify(payload);
	}
	return fetchOptions;
};
