import { expect, test, describe } from 'vitest'
import { doyFormatter, MonthFormat } from './format';

describe('doyFormatter', () => {
    describe('when 0 corresponds to January 1st', () => {
        test('returns correct first day of the year', () => {
            const output = doyFormatter(1, 'fr-CA');
            expect(output).toEqual('1 janvier');
        });

        test('returns correct last day of the year', () => {
            const output = doyFormatter(365, 'fr-CA');
            expect(output).toEqual('31 décembre');
        });

        test.each([0, -20])('returns first day if lower than minimum (%s)', (value) => {
            const output = doyFormatter(value, 'en-CA');
            expect(output).toEqual('January 1');
        });

        test.each([366, 890])('returns last day if exceeding (%s)', (value) => {
            const output = doyFormatter(value, 'en-CA');
            expect(output).toEqual('December 31');
        });

        test("doesn't consider the year to be a leap year", () => {
            // If the year is a leap year, the 60th day would be February 29
            const output = doyFormatter(60, 'fr-CA');
            expect(output).toEqual('1 mars');
        });

        test('outputs in English', () => {
            const output = doyFormatter(99, 'en-CA');
            expect(output).toEqual('April 9');
        });

        test('outputs in French', () => {
            const output = doyFormatter(101, 'fr-CA');
            expect(output).toEqual('11 avril');
        });

        test('default format is "long"', () => {
            const output_default = doyFormatter(268, 'en-CA');
            const output_long = doyFormatter(268, 'en-CA', false, 'long');
            expect(output_default).toEqual(output_long);
        });

        test.each([
            ['long', 'April 11'],
            ['2-digit', '04-11'],
            // Because of the underlying library used, "2-digit" and "numeric" output the same value
            ['numeric', '04-11'],
            ['short', 'Apr 11'],
            ['narrow', 'A 11'],
        ])('returns "%s" format', (format, expected) => {
            const output = doyFormatter(101, 'en-CA', false, format as MonthFormat);
            expect(output).toEqual(expected);
        });
    });

    describe('when 0 corresponds to July 1st', () => {
        test('returns correct first day of the year', () => {
            const output = doyFormatter(1, 'fr-CA', true);
            expect(output).toEqual('1 juillet');
        });

        test('returns correct last day of the year', () => {
            const output = doyFormatter(365, 'fr-CA', true);
            expect(output).toEqual('30 juin');
        });

        test.each([366, 409])('returns last day if exceeding (%s)', (value) => {
            const output = doyFormatter(value, 'en-CA', true);
            expect(output).toEqual('June 30');
        });

        test.each([0, -8])('returns first day if lower than minimum (%s)', (value) => {
            const output = doyFormatter(value, 'en-CA', true);
            expect(output).toEqual('July 1');
        });

        test.each([
            ['long', 'September 19'],
            ['2-digit', '09-19'],
            // Because of the underlying library used, "2-digit" and "numeric" output the same value
            ['numeric', '09-19'],
            ['short', 'Sep 19'],
            ['narrow', 'S 19'],
        ])('returns "%s" format', (format, expected) => {
            const output = doyFormatter(81, 'en-CA', true, format as MonthFormat);
            expect(output).toEqual(expected);
        });
    });
});
