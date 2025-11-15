import { __ } from '@/context/locale-provider';

import {
	type ForecastType,
} from '@/types/climate-variable-interface';

import Dropdown from '@/components/ui/dropdown';
import {useClimateVariable} from '@/hooks/use-climate-variable';

import {
	fieldForecastTypes,
	SelectAnOptionLabel,
	tooltipForecastTypes,
} from '@/lib/s2d-variable-fields';

export const ForecastTypeFields = () => {
	const {
		climateVariable,
		setForecastType
	} = useClimateVariable();

	const forecastType = climateVariable?.getForecastType();

	return (
		<Dropdown<ForecastType>
			className="sm:w-64"
			key={fieldForecastTypes.key}
			placeholder={SelectAnOptionLabel}
			options={fieldForecastTypes.options}
			label={fieldForecastTypes.label}
			value={forecastType ?? undefined}
			tooltip={tooltipForecastTypes}
			onChange={setForecastType}
		/>
	);
};

ForecastTypeFields.displayName = 'ForecastTypeFields';

