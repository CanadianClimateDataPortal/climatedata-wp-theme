import React from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import Dropdown from '@/components/ui/dropdown';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';

import { useClimateVariable } from "@/hooks/use-climate-variable";

/**
 * Variable options step
 */
const StepVariableOptions: React.FC = () => {
	const { __ } = useI18n();
	const { climateVariable, setVersion, setAnalysisFieldValue } = useClimateVariable();

	const analysisFields = climateVariable?.getAnalysisFields()?.map(({ key, type, label, description, help, attributes}) => {
		const { type: attributeType, placeholder } = attributes || {};
		const value = climateVariable?.getAnalysisFieldValue(key);

		return (
			<div className="mb-4" key={key}>
				{description && <div className="text-sm text-neutral-grey-medium max-w-lg">
					{__(
						description,
					)}
				</div>}
				<div className="flex items-center">
					<ControlTitle
						title={__(label)}
						tooltip={help ? __(help) : null}
					/>
				</div>
				{type === "input" && <Input
					className="sm:w-64"
					value={value ?? ''}
					onChange={(e) => {
						setAnalysisFieldValue(key, e.target.value)
					}}
					type={attributeType ? attributeType : 'text'}
					placeholder={placeholder ? __(placeholder) : undefined}
				/>}
			</div>
		);
	}) ?? [];

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				{__('Please set your variables options to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
				<div className="mb-8">
					<Dropdown
						className="sm:w-64"
						placeholder={__('Select an option')}
						options={climateVariable?.getVersions() ?? []}
						value={climateVariable?.getVersion() ?? undefined}
						label={__('Versions of the dataset')}
						tooltip={__('Select a version for the dataset')}
						onChange={setVersion}
					/>
				</div>
				{analysisFields.length > 0 && <div>
					{analysisFields}
				</div>}
			</div>
		</StepContainer>
	);
};
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
