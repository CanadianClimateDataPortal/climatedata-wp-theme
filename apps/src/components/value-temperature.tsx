import {
	memo,
	type ReactNode,
} from 'react';

import {
	formatValueTemperature,
	type ValueTemperatureProps,
} from '@/lib/value-temperature';

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
	// Since we won't translate this now, let's add [lang=en] attribute.
	const englishOnlyTitle = `${value} degrees ${unit}`;
	return (
		<data
			lang="en"
			value={value}
			data-unit={unit}
			title={englishOnlyTitle}
		>{
			formatted
		}</data>
	);
});
