import {
	describe,
	expect,
	test,
} from 'vitest';
import {
	buildSwitchUrl,
	PROD_APEX_HOST_EN,
	PROD_APEX_HOST_FR,
	resolveAlternateOrigin,
	resolveAlternatePath,
} from '@/lib/language-switch';

describe('resolveAlternateOrigin (D1b origin transform)', () => {
	test.each([
		['dev-en.climatedata.ca', 'https:', 'https://dev-fr.climatedata.ca'],
		['dev-fr.climatedata.ca', 'https:', 'https://dev-en.climatedata.ca'],
		['uat-en.climatedata.ca', 'https:', 'https://uat-fr.climatedata.ca'],
		['uat-fr.climatedata.ca', 'https:', 'https://uat-en.climatedata.ca'],
		['climatedata.ca', 'https:', 'https://donneesclimatiques.ca'],
		['donneesclimatiques.ca', 'https:', 'https://climatedata.ca'],
	])('swaps %s → %s', (hostname, protocol, expected) => {
		expect(resolveAlternateOrigin(hostname, protocol)).toBe(expected);
	});

	test('carries the scheme over verbatim (http)', () => {
		expect(resolveAlternateOrigin('dev-en.climatedata.ca', 'http:')).toBe(
			'http://dev-fr.climatedata.ca',
		);
	});

	test('falls back to the current host when unknown (e.g. localhost)', () => {
		expect(resolveAlternateOrigin('localhost', 'https:')).toBe(
			'https://localhost',
		);
	});
});

describe('prod apex pair (DI3)', () => {
	test('is the bare-apex cross-origin pair, NO www. prefix', () => {
		expect(PROD_APEX_HOST_EN).toBe('climatedata.ca');
		expect(PROD_APEX_HOST_FR).toBe('donneesclimatiques.ca');
		expect(PROD_APEX_HOST_EN).not.toMatch(/^www\./);
		expect(PROD_APEX_HOST_FR).not.toMatch(/^www\./);
	});
});

describe('resolveAlternatePath (path table)', () => {
	test.each([
		['map', 'en', '/maps/'],
		['map', 'fr', '/cartes/'],
		['download', 'en', '/download/'],
		['download', 'fr', '/telechargement/'],
	] as const)('section %s + locale %s → %s', (section, locale, expected) => {
		expect(resolveAlternatePath(section, locale)).toBe(expected);
	});
});

describe('buildSwitchUrl (origin + path + query carry)', () => {
	test('dev-en Map → dev-fr /cartes/ carrying the query', () => {
		const url = buildSwitchUrl({
			hostname: 'dev-en.climatedata.ca',
			protocol: 'https:',
			section: 'map',
			targetLocale: 'fr',
			search: 'var=hottest_day&region=census',
		});
		expect(url).toBe(
			'https://dev-fr.climatedata.ca/cartes/?var=hottest_day&region=census',
		);
	});

	test('prod FR Download → EN apex /download/ (bare apex, cross-origin)', () => {
		const url = buildSwitchUrl({
			hostname: PROD_APEX_HOST_FR,
			protocol: 'https:',
			section: 'download',
			targetLocale: 'en',
			search: 'dataset=215&var=daily_ahccd_temperature_and_precipitation',
		});
		expect(url).toBe(
			'https://climatedata.ca/download/?dataset=215&var=daily_ahccd_temperature_and_precipitation',
		);
	});

	test('empty query yields no trailing "?"', () => {
		const url = buildSwitchUrl({
			hostname: 'dev-fr.climatedata.ca',
			protocol: 'https:',
			section: 'map',
			targetLocale: 'en',
			search: '',
		});
		expect(url).toBe('https://dev-en.climatedata.ca/maps/');
	});

	test('a query set after mount is carried (guards CI-16 staleness)', () => {
		// The header derives `search` from Redux state, so a param changed after
		// mount is present here even though the URL bar may lag the debounce.
		const url = buildSwitchUrl({
			hostname: 'dev-en.climatedata.ca',
			protocol: 'https:',
			section: 'map',
			targetLocale: 'fr',
			search: 'var=tx_max&region=watershed&dataset=216',
		});
		expect(url).toBe(
			'https://dev-fr.climatedata.ca/cartes/?var=tx_max&region=watershed&dataset=216',
		);
	});
});
