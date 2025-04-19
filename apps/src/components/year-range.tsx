import { useCallback } from "react";
import Dropdown from "@/components/ui/dropdown";
import { DateRangeConfig } from "@/types/climate-variable-interface";

interface YearFieldProps {
	label: string;
	value?: string;
}

interface YearRangeProps {
	startYear: YearFieldProps;
	endYear: YearFieldProps;
	config: DateRangeConfig;
	onChange: (value: string[]) => void;
}

const YearRange = ({
	startYear,
	endYear,
	config,
	onChange,
}: YearRangeProps) => {
	const { min, max, interval } = config;
	const startYearValue = startYear.value ?? '';
	const endYearValue = endYear.value ?? '';

	const generateOptions = useCallback((): string[] => {
		const options: string[] = [];
		for (let year = parseInt(min); year <= parseInt(max); year += interval) {
			options.push(year.toString());
		}
		return options;
	}, [min, max, interval]);

	const handleStartYearChange = useCallback((value: string) => {
		if (value !== startYearValue) {
			onChange([value, endYearValue]);
		}
	}, [startYearValue, endYearValue, onChange]);

	const handleEndYearChange = useCallback((value: string) => {
		if (value !== endYearValue) {
			onChange([startYearValue, value]);
		}
	}, [startYearValue, endYearValue, onChange]);

	// Generate a list of year options based on the min, max, and interval in the DateRangeConfig.
	const endYearOptions = generateOptions().filter(
		(year) => parseInt(year) >= parseInt(startYearValue || min)
	);

	return (
		<div className="flex gap-4 sm:gap-8 mb-6">
			<Dropdown
				className="w-1/2 sm:w-52"
				label={startYear.label}
				value={startYearValue}
				options={generateOptions()}
				onChange={handleStartYearChange}
			/>
			<Dropdown
				className="w-1/2 sm:w-52"
				label={endYear.label}
				value={endYearValue}
				options={endYearOptions}
				onChange={handleEndYearChange}
			/>
		</div>
	)
}

export {
	YearRange,
}
