import React, { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

import { StepContainer, StepContainerDescription, } from '@/components/download/step-container';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import { ControlTitle } from '@/components/ui/control-title';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { cn, isValidEmail } from '@/lib/utils';
import { setDecimalPlace, setEmail, setFormat, setSubscribe, } from '@/features/download/download-slice';
import { FileFormatType } from "@/types/climate-variable-interface";
import { useClimateVariable } from "@/hooks/use-climate-variable";
import Dropdown from "@/components/ui/dropdown.tsx";
import { normalizeDropdownOptions } from "@/lib/format.ts";

/**
 * Send download request step
 */
const StepSendRequest: React.FC = () => {
	const [captchaValue, setCaptchaValue] = useState<string>('');
	const { climateVariable } = useClimateVariable();
	const { __ } = useI18n();

	const { format, email, subscribe, decimalPlace } = useAppSelector(
		(state) => state.download
	);
	const dispatch = useAppDispatch();

	const formatOptions = [
		{ value: FileFormatType.CSV, label: 'CSV' },
		{ value: FileFormatType.JSON, label: 'JSON' },
		{ value: FileFormatType.NetCDF, label: 'NetCDF' },
	].filter((option) =>
		climateVariable?.getFileFormatTypes()?.includes(option.value)
	);

	const decimalPlaceOptions = normalizeDropdownOptions(
		[0, 2].map((value) => ({ value, label: String(value) }))
	);

	const isEmailValid = isValidEmail(email);

	return (
		<StepContainer title={__('Download your file')} isLastStep>
			<StepContainerDescription>
				<p>
					{__(
						'Data processing starts after you “Send Request”. It may take 30 to 90 minutes to complete, depending on available resources.'
					)}
				</p>
				<p>
					{__(
						'You will be notified by email when your request has been processed and the data are available. Don’t forget to check your spam folder.'
					)}
				</p>
			</StepContainerDescription>

			<RadioGroupFactory
				title={__('Format')}
				name="format"
				className="mb-8"
				value={format}
				options={formatOptions}
				onValueChange={(value) => {
					dispatch(setFormat(value));
				}}
			/>

			<Dropdown
				className="sm:w-64 mb-8"
				label={__('Decimal Place')}
				value={decimalPlace}
				options={decimalPlaceOptions}
				onChange={(value) => {
					dispatch(setDecimalPlace(value));
				}}
			/>

			{climateVariable?.getDownloadType() === "analyzed" && <>
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
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

				{/* TODO: make this look good at least */}
				<div className="mb-4">
					<p className="text-sm text-neutral-grey-medium leading-5 mb-2">
						{__('Enter the characters shown:')}
					</p>
					<div className="flex items-center space-x-3">
						{/* Captcha display */}
						<div className="w-20 h-10 bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
							h5qj
						</div>
						{/* Captcha input */}
						<input
							type="text"
							placeholder="XXXX"
							value={captchaValue}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setCaptchaValue(e.target.value)
							}
							className="border bg-white border-gray-300 rounded px-2 py-1 text-sm placeholder:text-neutral-grey-medium"
						/>
					</div>
				</div>
			</>}
		</StepContainer>
	);
};
StepSendRequest.displayName = 'StepSendRequest';

export default StepSendRequest;
