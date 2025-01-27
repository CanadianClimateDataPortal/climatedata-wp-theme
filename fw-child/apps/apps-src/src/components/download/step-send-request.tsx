import React, { useState } from "react";
import { useI18n } from "@wordpress/react-i18n";

import { StepContainer, StepContainerDescription } from "@/components/download/step-container";
import { RadioGroupFactory } from "@/components/ui/radio-group";
import { ControlTitle } from "@/components/ui/control-title";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setFormat, setEmail, setSubscribe } from "@/features/download/download-slice";

/**
 * Send download request step
 */
const StepSendRequest: React.FC = () => {
	const [captchaValue, setCaptchaValue] = useState<string>('');

	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const { format, email, subscribe } = useAppSelector(state => state.download);

	const formatOptions = [
		{ value: 'csv', label: 'CSV' },
		{ value: 'netcdf', label: 'NetCDF' },
	];

	return (
		<StepContainer title="Download your file" isLastStep>
			<StepContainerDescription>
				<p>{__('Data processing starts after you “Send Request”. It may take 30 to 90 minutes to complete, depending on available resources.')}</p>
				<p>{__('You will be notified by email when your request has been processed and the data are available. Don’t forget to check your spam folder.')}</p>
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

			<div className="flex flex-col gap-2">
				<p>{__('Please enter your email address to receive your download link.')}</p>
				<ControlTitle title={__('Email Address')} />
				<Input
					type="email"
					className="sm:w-64 mb-2"
					placeholder={__('john.doe@gmail.com')}
					value={email}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						dispatch(setEmail(e.target.value));
					}}
				/>
				<label htmlFor="newsletter" className="inline-flex items-center space-x-2 mb-8 cursor-pointer">
					<Checkbox
						id="newsletter"
						className="text-brand-red"
						checked={subscribe}
						onCheckedChange={() => {
							dispatch(setSubscribe(! subscribe));
						}}
					/>
					<span className="text-sm font-medium leading-none cursor-pointer">
						{__('I would like to subscribe to ClimateData Newsletter')}
					</span>
				</label>
			</div>

			{/* TODO: make this look good at least */}
			<div className="mb-4">
				<p className="text-sm font-semibold mb-1">
					Enter the characters shown:
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
						className="border bg-white border-gray-300 rounded px-2 py-1 text-sm"
					/>
				</div>
			</div>

		</StepContainer>
	);
};
StepSendRequest.displayName = "StepSendRequest";

export default StepSendRequest;