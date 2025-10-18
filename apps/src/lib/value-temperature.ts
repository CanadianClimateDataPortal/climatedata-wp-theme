const TEMPERATURE_UNITS = [
	/*                    */
	'celsius',
	'fahrenheit',
] as const;

export type NumberFormatStyleUnitTemperature =
	(typeof TEMPERATURE_UNITS)[number];

export interface ValueTemperatureProps {
	/**
	 * Which unit to use
	 *
	 * @default 'celcius'
	 */
	unit?: NumberFormatStyleUnitTemperature;
	value: number;
	/**
	 * Which locale to format the value
	 *
	 * @default 'fr-CA'
	 */
	locale?: Intl.LocalesArgument;
}

export const formatValueTemperature = ({
	locale = 'fr-CA',
	unit = 'celsius',
	value,
}: ValueTemperatureProps): string => {
	if (!TEMPERATURE_UNITS.includes(unit)) {
		const message = `Invalid unit "${unit}`;
		throw new Error(message);
	}
	const initialValue = `${value} °${unit[0].toUpperCase()}`;
	let formatted = initialValue;
	try {
		/**
		 * @see {@link https://v8.dev/features/intl-numberformat#units}
		 */
		const numberFormatOptions: Intl.NumberFormatOptions = {
			style: 'unit',
			unit,
		};
		const formatter = new Intl.NumberFormat(locale, numberFormatOptions);
		const attempt = formatter.format(value);
		formatted = attempt;
	} catch {
		// Nothing
	}

	return formatted;
};
