import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import Dropdown from '@/components/ui/dropdown';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';

import { useDownload } from '@/hooks/use-download';

/**
 * Variable options step
 */
const StepVariableOptions: React.FC = () => {
	const { __ } = useI18n();

	const { setField, fields } = useDownload();
	const { version, degrees } = fields;

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
							setField('version', value);
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
						value={degrees !== undefined ? degrees : ''} // fixes controlled/uncontrolled input warning
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							const newValue = e.target.value.trim()
								? parseInt(e.target.value)
								: undefined;
							setField('degrees', newValue);
						}}
					/>
				</div>
			</div>
		</StepContainer>
	);
};
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
