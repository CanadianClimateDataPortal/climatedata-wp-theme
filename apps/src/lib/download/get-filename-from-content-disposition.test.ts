import { describe, expect, test } from 'vitest';
import { getFilenameFromContentDisposition } from './get-filename-from-content-disposition';

describe('getFilenameFromContentDisposition', () => {
	test('keeps `=`, `&` and spaces of a quoted screenshot-service name', () => {
		const filename =
			'climatedata.ca - maps - var=max_5d_total_precipitation&th=rx5day&scen=rcp85&ver=cmip5&dataset=216&dataOpacity=100&labelOpacity=100&lat=45.50009&lng=-72.31613&zoom=10.png';
		expect(
			getFilenameFromContentDisposition(`attachment; filename="${filename}"`),
		).toBe(filename);
	});

	test.each([
		[`attachment; filename="plain.png"; filename*=UTF-8''%C3%A9t%C3%A9%20map.png`],
		[`attachment; filename*=UTF-8''%C3%A9t%C3%A9%20map.png; filename="plain.png"`],
	])('prefers `filename*=` over `filename=` in either order (%s)', (header) => {
		expect(getFilenameFromContentDisposition(header)).toBe('été map.png');
	});

	test('accepts a lowercase charset and a language tag', () => {
		expect(
			getFilenameFromContentDisposition(`attachment; filename*=utf-8'en'a%20b.png`),
		).toBe('a b.png');
	});

	test('falls back to `filename=` when `filename*=` has bad percent-encoding', () => {
		expect(
			getFilenameFromContentDisposition(
				`attachment; filename*=UTF-8''%E0%A4%A; filename="fallback.png"`,
			),
		).toBe('fallback.png');
	});

	test('stops an unquoted value at the next parameter', () => {
		expect(
			getFilenameFromContentDisposition('attachment; filename=foo.png; size=123'),
		).toBe('foo.png');
	});

	// A file name may contain `;` and `"` even though both are special in this
	// header. Inside a quoted value (RFC 6266, HTTP quoted-string), `;` is part
	// of the name and `\"` is an escaped quote, so neither ends the value.
	test('keeps `;` and `"` from a quoted file name, once unescaped', () => {
		expect(
			getFilenameFromContentDisposition('attachment; filename="a;b \\"c\\".png"'),
		).toBe('a;b "c".png');
	});

	test('drops the opening quote of a value that never closes', () => {
		expect(
			getFilenameFromContentDisposition('attachment; filename="abc.png'),
		).toBe('abc.png');
	});

	test('tolerates extra whitespace and a mixed-case parameter name', () => {
		expect(
			getFilenameFromContentDisposition('attachment ;  FileName = "x.png" '),
		).toBe('x.png');
	});

	test.each([
		[null],
		[''],
		['attachment'],
		['inline'],
		['attachment; filename=""'],
		['attachment; filename='],
	])('returns null when no file name is given (%s)', (header) => {
		expect(getFilenameFromContentDisposition(header)).toBeNull();
	});
});
