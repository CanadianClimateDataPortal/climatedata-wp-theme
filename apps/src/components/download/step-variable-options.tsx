import React, { useMemo } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import Dropdown from '@/components/ui/dropdown';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';

import { useClimateVariable } from "@/hooks/use-climate-variable";
import appConfig from "@/config/app.config";

/**
 * Variable options step
 */
const StepVariableOptions = React.forwardRef((_, ref) => {
	const { __ } = useI18n();
	const { climateVariable, setVersion, setAnalysisFieldValue } = useClimateVariable();

	// expose isValid method to parent component
	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}

			const version = climateVariable.getVersion() ?? null;
			const fields = climateVariable.getAnalysisFields() ?? [];
			const values = climateVariable.getAnalysisFieldValues() ?? {};

			const validations = [
				version,
				...fields
					.filter(f => f.required !== false) // fields are required by default unless explicitly marked as not required
					.map(f => values?.[f.key] != null && values?.[f.key] !== '')
			];

			return validations.every(Boolean);
		}
	}), [climateVariable]);

	const versionOptions = appConfig.versions.filter((version) =>
		climateVariable?.getVersions()?.includes(version.value)
	);

	const analysisFields = useMemo(() => {
		if (!climateVariable) {
			return [];
		}

		return climateVariable.getAnalysisFields()?.map(({ key, type, label, description, help, attributes }) => {
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
					{type === "input" && (
						<Input
							className="sm:w-64"
							value={value ?? ''}
							onChange={(e) => {
								setAnalysisFieldValue(key, e.target.value)
							}}
							type={attributeType ? attributeType : 'text'}
							placeholder={placeholder ? __(placeholder) : undefined}
						/>
					)}
				</div>
			);
		}) ?? [];
	}, [climateVariable, setAnalysisFieldValue, __]);

	return (
		<StepContainer title={__('Set your variable options')}>
			<StepContainerDescription>
				{__('Please set your variables options to your needs.')}
			</StepContainerDescription>
			<div className="gap-4">
				{climateVariable?.getDatasetType() !== 'ahccd'
					&& <div className="mb-8">
						<Dropdown
							className="sm:w-64"
							placeholder={__('Select an option')}
							options={versionOptions}
							value={climateVariable?.getVersion() ?? undefined}
							label={__('Versions of the dataset')}
							tooltip={__('Select a version for the dataset')}
							onChange={setVersion}
						/>
					</div>
				}
				{analysisFields.length > 0 && <div>
					{analysisFields}
				</div>}
			</div>
		</StepContainer>
	);
});
StepVariableOptions.displayName = 'StepVariableOptions';

export default StepVariableOptions;
