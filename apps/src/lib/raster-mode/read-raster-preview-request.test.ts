import {
	describe,
	expect,
	test,
} from 'vitest';
import {
	isRasterPreviewAllowed,
	RASTER_PREVIEW_PARAM,
	readRasterPreviewRequest,
} from './read-raster-preview-request';

describe('isRasterPreviewAllowed (production host gate)', () => {
	// The two production apex hosts are the ONLY denied hosts. They are read from
	// the language-switch namespace so there is a single place where a production
	// hostname is written down.
	test.each([
		['climatedata.ca'],
		['donneesclimatiques.ca'],
	] as const)('%s is denied — production apex', (hostname) => {
		expect(isRasterPreviewAllowed(hostname)).toBe(false);
	});

	// Everything that is not a production apex is allowed: the preview exists
	// because this app has no usable dev server, so every non-production host a
	// developer can reach has to keep working.
	test.each([
		['dev-en.climatedata.ca'],
		['dev-fr.climatedata.ca'],
		['uat.climatedata.ca'],
		['qa.donneesclimatiques.ca'],
		['preprod.climatedata.ca'],
		['localhost'],
	] as const)('%s is allowed — not a production apex', (hostname) => {
		expect(isRasterPreviewAllowed(hostname)).toBe(true);
	});

	// `www.` is deliberately NOT handled: production answers `www.` with a 301 to
	// the bare apex before this bundle is ever parsed, so the app only ever runs
	// on the bare host. Pinned as a test so the decision is visible rather than
	// looking like an oversight.
	test('www. of a production apex is not special-cased', () => {
		expect(isRasterPreviewAllowed('www.climatedata.ca')).toBe(true);
	});
});

describe('readRasterPreviewRequest (query string + host gate)', () => {
	const DEV_HOST = 'dev-en.climatedata.ca';

	test('the parameter key is `raster`', () => {
		expect(RASTER_PREVIEW_PARAM).toBe('raster');
	});

	test.each([
		{ shape: 'the bare opt-in', search: '?raster=1' },
		{ shape: 'without the leading question mark', search: 'raster=1' },
		{ shape: 'alongside other parameters', search: '?var=hottest_day&raster=1' },
	])('$search requests the preview — $shape', ({ search }) => {
		expect(readRasterPreviewRequest(search, DEV_HOST)).toBe(true);
	});

	// The opt-in is the exact value `1`, nothing looser. A valueless or
	// differently-valued key is not an opt-in, so a stray `?raster` in a shared
	// URL cannot silently produce an export-shaped page.
	test.each([
		{ shape: 'no query string at all', search: '' },
		{ shape: 'explicitly off', search: '?raster=0' },
		{ shape: 'valueless key', search: '?raster' },
		{ shape: 'truthy-looking but not `1`', search: '?raster=true' },
		{ shape: 'unrelated parameters only', search: '?var=hottest_day' },
	])('$search does not request the preview — $shape', ({ search }) => {
		expect(readRasterPreviewRequest(search, DEV_HOST)).toBe(false);
	});

	// The host gate wins over the query string: a production `?raster=1` is a
	// no-op, never an error.
	test.each([
		['climatedata.ca'],
		['donneesclimatiques.ca'],
	] as const)('?raster=1 on %s is refused', (hostname) => {
		expect(readRasterPreviewRequest('?raster=1', hostname)).toBe(false);
	});
});
