import { expect, test, describe } from 'vitest'
import { doyFormatter, MonthFormat } from './format';

describe('doyFormatter', () => {
    describe('when the first day is January 1st', () => {
        test('returns correct first day of the year', () => {
            const output = doyFormatter(1, 'fr-CA');
            expect(output).toEqual('1 janvier');
        });

        test('returns correct last day of the year', () => {
            const output = doyFormatter(365, 'fr-CA');
            expect(output).toEqual('31 décembre');
        });

        test.each([
            [0, 'December 31'],
            [-1, 'December 30'],
            [-42, 'November 19'],
            [-1708, 'April 27'],  // At least 4 years to ensure no issue with leap years
        ])('works with value below 1 (%s)', (value, expected) => {
            const output = doyFormatter(value, 'en-CA');
            expect(output).toEqual(expected);
        });

    test.each([
        [366, 'January 1'],
        [417, 'February 21'],
        [1708, 'September 5'], // At least 4 years to ensure no issue with leap years
    ])('works with value above 365 (%s)', (value, expected) => {
        const output = doyFormatter(value, 'en-CA');
        expect(output).toEqual(expected);
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

    describe('when first day is July 1st', () => {
        test('returns correct first day of the year', () => {
            const output = doyFormatter(1, 'fr-CA', true);
            expect(output).toEqual('1 juillet');
        });

        test('returns correct last day of the year', () => {
            const output = doyFormatter(365, 'fr-CA', true);
            expect(output).toEqual('30 juin');
        });

        test.each([
            [0, 'June 30'],
            [-1, 'June 29'],
            [-42, 'May 19'],
            [-1708, 'October 25'], // At least 4 years to ensure no issue with leap years
        ])('works with value below 1 (%s)', (value, expected) => {
            const output = doyFormatter(value, 'en-CA', true);
            expect(output).toEqual(expected);
        });

        test.each([
            [366, 'July 1'],
            [417, 'August 21'],
            [1708, 'March 5'], // At least 4 years to ensure no issue with leap years
        ])('works with value above 365 (%s)', (value, expected) => {
        const output = doyFormatter(value, 'en-CA', true);
        expect(output).toEqual(expected);
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
