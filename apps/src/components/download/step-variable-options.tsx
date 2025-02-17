import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import Dropdown from '@/components/ui/dropdown';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDegrees, setVersion } from '@/features/download/download-slice';

/**
 * Variable options step
 */
const StepVariableOptions: React.FC = () => {
	const { __ } = useI18n();

	const { version, degrees } = useAppSelector((state) => state.download);
	const dispatch = useAppDispatch();

	const options = ['CMIP5', 'CMIP6'];

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				{__('Please set your variables options to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
				<div className="mb-8">
					<div className="text-sm text-neutral-grey-medium max-w-lg">
						{__(
							'This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below:'
						)}
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
						{__(
							'This variable returns the number of degree days accumulated when daily mean temperature are above a certain temperature. Please set one below:'
						)}
					</div>
					<div className="flex items-center">
						<ControlTitle
							title={__('> Degree Celsius')}
							tooltip={__('Enter a number')}
						/>
					</div>
					<Input
						className="sm:w-64"
						type="number"
						value={degrees}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							const parsedNumber = parseInt(e.target.value);
							const newValue = !isNaN(parsedNumber)
								? parsedNumber
								: 0;
							dispatch(setDegrees(newValue));
						}}
					/>
				</div>
			</div>
		</StepContainer>
	);
};
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
