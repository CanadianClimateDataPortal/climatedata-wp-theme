import {
	memo,
	type ReactNode,
} from 'react';

import {
	formatValueTemperature,
	type TemperatureUnit,
	type ValueTemperatureProps,
} from '@/lib/value-temperature';

export {
	formatValueTemperature,
	type TemperatureUnit,
	type ValueTemperatureProps,
};

export default memo(function ValueTemperatureFn({
	locale = 'fr-CA',
	unit = 'celsius',
	value,
}: ValueTemperatureProps): ReactNode {
	const formatted = formatValueTemperature({
		locale,
		unit,
		value,
	});
	return (
		<data value={value} data-unit={unit}>{
			formatted
		}</data>
	);
});
