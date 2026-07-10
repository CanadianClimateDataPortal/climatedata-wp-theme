import {
	describe,
	expect,
	test,
} from 'vitest';
import {
	buildSwitchUrl,
	type BuildSwitchUrlInput,
} from './build-switch-url';
import {
	PROD_APEX_HOST_EN,
	PROD_APEX_HOST_FR,
	resolveOriginForLocale,
} from './resolve-origin-for-locale';
import {
	resolveAlternatePath,
} from './resolve-alternate-path';

describe('resolveOriginForLocale (locale-addressed origin resolution)', () => {
	// Cross-locale: the current host is on one side of a pair and the requested
	// locale is the other — resolves to the sibling host (the switcher's job).
	test.each([
		['dev-en.climatedata.ca', 'https:', 'fr', 'https://dev-fr.climatedata.ca'],
		['dev-fr.climatedata.ca', 'https:', 'en', 'https://dev-en.climatedata.ca'],
		['uat.donneesclimatiques.ca', 'https:', 'en', 'https://uat.climatedata.ca'],
		['uat.climatedata.ca', 'https:', 'fr', 'https://uat.donneesclimatiques.ca'],
		['qa.donneesclimatiques.ca', 'https:', 'en', 'https://qa.climatedata.ca'],
		['qa.climatedata.ca', 'https:', 'fr', 'https://qa.donneesclimatiques.ca'],
		['preprod.donneesclimatiques.ca', 'https:', 'en', 'https://preprod.climatedata.ca'],
		['preprod.climatedata.ca', 'https:', 'fr', 'https://preprod.donneesclimatiques.ca'],
		['climatedata.ca', 'https:', 'fr', 'https://donneesclimatiques.ca'],
		['donneesclimatiques.ca', 'https:', 'en', 'https://climatedata.ca'],
	] as const)(
		'%s + locale %s → %s (sibling host)',
		(hostname, protocol, targetLocale, expected) => {
			expect(resolveOriginForLocale(hostname, protocol, targetLocale)).toBe(
				expected,
			);
		},
	);

	// Same-locale: the requested locale matches the current host's side, so the
	// origin resolves to the current host itself (self), covering both sides of
	// dev, apex, and a subdomain pair.
	test.each([
		['dev-en.climatedata.ca', 'https:', 'en', 'https://dev-en.climatedata.ca'],
		['dev-fr.climatedata.ca', 'https:', 'fr', 'https://dev-fr.climatedata.ca'],
		['uat.climatedata.ca', 'https:', 'en', 'https://uat.climatedata.ca'],
		['climatedata.ca', 'https:', 'en', 'https://climatedata.ca'],
		['donneesclimatiques.ca', 'https:', 'fr', 'https://donneesclimatiques.ca'],
	] as const)(
		'%s + locale %s → %s (self)',
		(hostname, protocol, targetLocale, expected) => {
			expect(resolveOriginForLocale(hostname, protocol, targetLocale)).toBe(
				expected,
			);
		},
	);

	test('carries the scheme over verbatim (http)', () => {
		expect(resolveOriginForLocale('dev-en.climatedata.ca', 'http:', 'fr')).toBe(
			'http://dev-fr.climatedata.ca',
		);
	});

	// Unknown host (localhost, a staging box) has no pair, so the current host is
	// returned regardless of the requested locale.
	test.each([
		['localhost', 'https:', 'en', 'https://localhost'],
		['localhost', 'https:', 'fr', 'https://localhost'],
	] as const)(
		'falls back to the current host when unknown: %s + locale %s → %s',
		(hostname, protocol, targetLocale, expected) => {
			expect(resolveOriginForLocale(hostname, protocol, targetLocale)).toBe(
				expected,
			);
		},
	);
});

describe('prod apex pair — bare-apex cross-origin, hardcoded', () => {
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

	// Invariant: buildSwitchUrl output is changed to another locale
	// via the `targetLocale` property.
	// The current hostname is used ONLY to find the host pair.
	// So the two sides of a pair (dev-en / dev-fr) are interchangeable
	// for the same target locale.
	test.each([
		['dev-en.climatedata.ca', 'en', 'https://dev-en.climatedata.ca/maps/'],
		['dev-fr.climatedata.ca', 'en', 'https://dev-en.climatedata.ca/maps/'],
		['dev-en.climatedata.ca', 'fr', 'https://dev-fr.climatedata.ca/cartes/'],
		['dev-fr.climatedata.ca', 'fr', 'https://dev-fr.climatedata.ca/cartes/'],
	] as const)(
		'%s + locale %s → %s (side-invariant: host + path follow targetLocale)',
		(hostname, targetLocale, expected) => {
			const base = {
				protocol: 'https:',
				section: 'map',
				search: '',
			} as const satisfies Omit<BuildSwitchUrlInput, 'hostname' | 'targetLocale'>;
			expect(buildSwitchUrl({ ...base, hostname, targetLocale })).toBe(
				expected,
			);
		},
	);

	test('a query set after mount is carried (guards against a stale URL query)', () => {
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
