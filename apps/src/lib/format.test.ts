import { expect, test, describe } from 'vitest'
import { doyFormatter, MonthFormat } from './format';

describe('doyFormatter', () => {
    test('returns correct first day of the year', () => {
        const output = doyFormatter(0, 'fr-CA');
        expect(output).toEqual('1 janvier');
    });
    
    test('returns correct last day of the year', () => {
        const output = doyFormatter(364, 'fr-CA');
        expect(output).toEqual('31 décembre');
    });
    
    test("doesn't consider the year to be a leap year", () => {
        // If the year is a leap year, the 60th day would be february 29
        const output = doyFormatter(59, 'fr-CA');
        expect(output).toEqual('1 mars');
    });
    
    test('outputs in English', () => {
        const output = doyFormatter(100, 'en-CA');
        expect(output).toEqual('April 11');
    });
    
    test('outputs in French', () => {
        const output = doyFormatter(100, 'fr-CA');
        expect(output).toEqual('11 avril');
    });
    
    test('default format is "long"', () => {
        const output_default = doyFormatter(268, 'en-CA');
        const output_long = doyFormatter(268, 'en-CA');
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
        const output = doyFormatter(100, 'en-CA', format as MonthFormat);
        expect(output).toEqual(expected);
    });
});
