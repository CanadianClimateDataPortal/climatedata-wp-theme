import { describe, expect, test } from 'vitest';

import { createFetchRequestInitOptions } from './create-fetch-request-init-options';
import { EXAMPLE_PREPARE_RASTER_POST_PAYLOAD } from './types.examples';

describe('createFetchRequestInitOptions', () => {
	test.each([
		{ label: 'without a payload', payload: undefined },
		{ label: 'with a payload', payload: EXAMPLE_PREPARE_RASTER_POST_PAYLOAD },
	])(
		'sets method POST and Content-Type application/json $label',
		({ payload }) => {
			const options = createFetchRequestInitOptions(payload);

			expect(options.method).toBe('POST');
			expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
		},
	);

	test('omits the request body when no payload is given', () => {
		const options = createFetchRequestInitOptions();

		expect(options.body).toBeUndefined();
	});

	test('serializes the payload as the JSON request body', () => {
		const options = createFetchRequestInitOptions(EXAMPLE_PREPARE_RASTER_POST_PAYLOAD);

		expect(options.body).toBe(JSON.stringify(EXAMPLE_PREPARE_RASTER_POST_PAYLOAD));
	});
});
