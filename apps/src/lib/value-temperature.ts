const UNITS = ['celsius', 'fahrenheit'] as const;

export type TemperatureUnit = (typeof UNITS)[number];

export interface ValueTemperatureProps {
	/**
	 * Which unit to use
	 *
	 * @default 'celcius'
	 */
	unit?: TemperatureUnit;
	value: string;
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
	if (!UNITS.includes(unit)) {
		const message = `Invalid unit "${unit}`;
		throw new Error(message);
	}
	const initialValue = `${value} °${unit[0].toUpperCase()}`;
	let formatted = initialValue;
	try {
		/**
		 * @see {@link https://v8.dev/features/intl-numberformat#units}
		 */
		const formatter = new Intl.NumberFormat(locale, {
			style: 'unit',
			unit,
		});
		const attempt = formatter.format(value);
		formatted = attempt;
	} catch {
		// Nothing
	}

	return formatted;
};
