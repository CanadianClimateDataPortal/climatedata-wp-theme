import React from "react";
import { useI18n } from "@wordpress/react-i18n";
import { ChevronRight } from "lucide-react";

import { StepContainer, StepContainerDescription } from "@/components/download/step-container";
import Dropdown from "@/components/ui/dropdown";
import { ControlTitle } from "@/components/ui/control-title";
import { Input } from "@/components/ui/input";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setVersion, setDegrees } from "@/features/download/download-slice";

/**
 * Variable options step
 */
const StepVariableOptions: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const { version, degrees } = useAppSelector(state => state.download);

	const options = [
		'CMIP5',
		'CMIP6',
	];

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				Please set your variables options to your needs.
			</StepContainerDescription>
			<div className="gap-4">
				<div className="mb-8">
					<div className="text-sm text-neutral-grey-medium max-w-lg">
						{__('This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below:')}
					</div>
					<Dropdown
						className="sm:w-64"
						placeholder={__('Select an option')}
						options={options}
						value={version}
						label={__('Versions of the dataset')}
						tooltip={__('Select a version for the dataset')}
						onChange={(value) => {
							dispatch(setVersion(value));
						}}
					/>
				</div>

				<div className="mb-4">
					<div className="text-sm text-neutral-grey-medium max-w-lg">
						{__('This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below:')}
					</div>
					<div className="flex items-center">
						<ChevronRight size={16} />
						<ControlTitle title={__('Degree Celsius')} tooltip={__('Enter a number')} />
					</div>
					<Input
						className="sm:w-64"
						type="number"
						placeholder="3"
						value={degrees}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							dispatch(setDegrees(parseInt(e.target.value)));
						}}
					/>
				</div>
			</div>

		</StepContainer>
	);
};
StepVariableOptions.displayName = "StepVariableOptions";

export default StepVariableOptions;