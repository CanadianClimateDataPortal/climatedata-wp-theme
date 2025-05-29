import React, { useState, useEffect } from 'react';
import { __ } from '@/context/locale-provider';

import { StepContainer, StepContainerDescription, } from '@/components/download/step-container';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { cn, isValidEmail } from '@/lib/utils';
import { DownloadType, FileFormatType } from "@/types/climate-variable-interface";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setEmail, setSubscribe, setCaptchaValue, setRequestError } from '@/features/download/download-slice';
import { StepComponentRef } from "@/types/download-form-interface";
import Dropdown from "@/components/ui/dropdown.tsx";
import { normalizeDropdownOptions } from "@/lib/format.ts";

/**
 * Captcha component for download verification
 */
const Captcha: React.FC<{
	analysisNamespace: string;
	captchaValue: string;
	captchaRefresh: number;
	setCaptchaRefresh: (value: number) => void;
	dispatch: any;
	__: (text: string) => string;
}> = ({ analysisNamespace, captchaValue, captchaRefresh, setCaptchaRefresh, dispatch, __ }) => (
	<div className="mb-4">
		<p className="text-sm text-neutral-grey-medium leading-5 mb-2">
			{__('Enter the characters shown:')}
		</p>
		<div className="flex items-center space-x-3">
			<img
				id="captcha_img"
				src={`/assets/themes/fw-child/resources/php/securimage/securimage_show.php?namespace=${analysisNamespace}&${captchaRefresh}`}
				alt="CAPTCHA"
				className="w-20 h-10 border border-gray-300 rounded"
			/>
			<button
				type="button"
				className="px-2 border rounded text-xl"
				onClick={() => {
					setCaptchaRefresh(Math.random());
					dispatch(setCaptchaValue(''));
					dispatch(setRequestError(null));
				}}
				title={__('Refresh Captcha')}
			>
				↻
			</button>
			<input
				type="text"
				placeholder="XXXX"
				value={captchaValue}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					dispatch(setCaptchaValue(e.target.value))
				}
				className="border bg-white border-gray-300 rounded px-2 py-1 text-sm placeholder:text-neutral-grey-medium"
			/>
		</div>
	</div>
);
Captcha.displayName = 'Captcha';

/**
 * Send download request step
 */
const StepSendRequest = React.forwardRef<StepComponentRef>((_, ref) => {
	const captchaValue = useAppSelector((state) => state.download.captchaValue) || '';
	const [captchaRefresh, setCaptchaRefresh] = useState(Math.random());
	const { climateVariable, setFileFormat, setDecimalPlace } = useClimateVariable();

	const { email, subscribe, requestStatus, requestError } = useAppSelector(
		(state) => state.download
	);
	const dispatch = useAppDispatch();

	// get the download type
	const downloadType = climateVariable?.getDownloadType();

	React.useImperativeHandle(ref, () => ({
		isValid: () => {
			if (!climateVariable) {
				return false;
			}

			const fileFormat = climateVariable.getFileFormat();
			const validations = [
				// File format is always required
				Boolean(fileFormat),
			];

			// For analyzed downloads, add email validation
			if (downloadType === DownloadType.ANALYZED) {
				validations.push(
					// Email is required and must be valid
					Boolean(email && isValidEmail(email))
				);
			}

			return validations.every(Boolean);
		},
		getResetPayload: () => {
			// reset the email and subscribe state from the download slice
			dispatch(setEmail(''));
			dispatch(setSubscribe(false));

			return {};
		}
	}), [climateVariable, email]);


	const formatOptions = [
		{ value: FileFormatType.CSV, label: 'CSV' },
		{ value: FileFormatType.JSON, label: 'JSON' },
		{ value: FileFormatType.NetCDF, label: 'NetCDF' },
		{ value: FileFormatType.GeoJSON, label: 'GeoJSON' },
	].filter((option) =>
		climateVariable?.getFileFormatTypes()?.includes(option.value)
	);

	const analysisNamespace = climateVariable?.getDatasetType() === 'ahccd' ? 'analyze-stations' : 'analyze';
	const fileFormat = climateVariable?.getFileFormat() ?? undefined;

	// Get the maximum number of decimals.
	const maxDecimalsValue = climateVariable?.getMaxDecimals();
	// If maxDecimalsValue is 0 or null, set it to 10
	const maxDecimals = maxDecimalsValue === 0 || maxDecimalsValue == null ? 10 : maxDecimalsValue;
	const decimalPlace = climateVariable?.getDecimalPlace() ?? 0;
	const decimalPlaceOptions = normalizeDropdownOptions(
		[...Array(maxDecimals + 1).keys()].map((value) => ({value, label: String(value)}))
	);

	const isEmailValid = isValidEmail(email);

	/**
	 * Shows captcha for analysis variables (those that make requests to Finch).
	 * Exception: Daily AHCCD Temperature and Precipitation does not show captcha
	 */
	const shouldShowCaptcha = () => {
		if (!climateVariable) return false;
		
		if (climateVariable.getId() === 'daily_ahccd_temperature_and_precipitation') {
			return false;
		}
		
		return climateVariable.getClass() === 'RasterAnalyzeClimateVariable';
	};

	useEffect(() => {
		// Reset decimalPlace if fileFormat is changed away from CSV.
		if (fileFormat !== FileFormatType.CSV && decimalPlace !== 0) {
			setDecimalPlace(0);
		}
	}, [fileFormat, decimalPlace, setDecimalPlace]);

	return (
		<StepContainer title={__('Select file parameters')} isLastStep>
			<StepContainerDescription>
				<p>
					{__(
						'Data processing starts after you "Send Request". It may take 30 to 90 minutes to complete, depending on available resources.'
					)}
				</p>
				<p>
					{__(
						"You will be notified by email when your request has been processed and the data are available. Don't forget to check your spam folder."
					)}
				</p>
			</StepContainerDescription>

			<RadioGroupFactory
				title={__('Format')}
				name="format"
				className="mb-8"
				value={fileFormat}
				options={formatOptions}
				onValueChange={setFileFormat}
			/>

			{downloadType === DownloadType.ANALYZED &&
				fileFormat === FileFormatType.CSV && (
				<Dropdown
					className="sm:w-64 mb-8"
					label={__('Decimal Place')}
					value={decimalPlace}
					options={decimalPlaceOptions}
					onChange={setDecimalPlace}
				/>
			)}

			{downloadType === DownloadType.ANALYZED && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-neutral-grey-medium">
						{__(
							'Please enter your email address to receive your download link.'
						)}
					</p>
					<ControlTitle title={__('Email Address')} className="mb-0"/>
					<Input
						type="email"
						className="sm:w-64 mb-2"
						placeholder={__('john.doe@gmail.com')}
						value={email}
						onChange={(e) => {
							dispatch(setEmail(e.target.value));
						}}
					/>
					<label
						htmlFor="newsletter"
						className={cn(
							'inline-flex items-center space-x-2 mb-8',
							isEmailValid ? '' : 'opacity-50 cursor-not-allowed'
						)}
					>
						<Checkbox
							id="newsletter"
							className="text-brand-red"
							disabled={!isEmailValid}
							checked={subscribe}
							onCheckedChange={() => {
								dispatch(setSubscribe(!subscribe));
							}}
						/>
						<span
							className={cn(
								'text-sm font-medium leading-none',
								isEmailValid
									? 'cursor-pointer'
									: 'opacity-75 cursor-not-allowed'
							)}
						>
							{__(
								'I would like to subscribe to ClimateData Newsletter'
							)}
						</span>
					</label>
				</div>
			)}

			{shouldShowCaptcha() && (
				<Captcha
					analysisNamespace={analysisNamespace}
					captchaValue={captchaValue}
					captchaRefresh={captchaRefresh}
					setCaptchaRefresh={setCaptchaRefresh}
					dispatch={dispatch}
					__={__}
				/>
			)}

			{requestStatus === 'error' && <div className="text-red-600 text-sm mt-2">{requestError}</div>}
		</StepContainer>
	);
});
StepSendRequest.displayName = 'StepSendRequest';

export default StepSendRequest;
