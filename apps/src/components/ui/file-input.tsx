import React, { useEffect, useRef } from 'react';
import { CircleX } from 'lucide-react';

import { cn } from '@/lib/utils';
import { __ } from '@/context/locale-provider';
import { Spinner } from '@/components/ui/spinner';

type FileInputProps = {
	file?: File | null;
	isInvalid?: boolean;
	isProcessing?: boolean;
	className?: string;
	accept?: string;
	disabled?: boolean;
	onChange?: (file: File | null) => void;
	onClear?: () => void;
	locale?: string;
}

/**
 * File input field.
 *
 * @param file - The currently selected file object. Its name will be displayed.
 * @param className - Custom CSS classes for the container.
 * @param accept - Accept attribut of the file input.
 * @param isInvalid - If the selected file is considered "invalid".
 * @param isProcessing - If the selected file is being processed.
 * @param onChange - Callback when the selected file changes. The file can be null.
 * @param onClear - When the user clicks on the "clear" button.
 * @param disabled - If the field must be disabled.
 */
export default function FileInput({
	file,
	className,
	accept,
	isInvalid,
	isProcessing,
	onChange,
	onClear,
	disabled,
}: FileInputProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			const file = event.target.files?.[0];
			onChange(file || null);
		}
	}

	const displayedFileName = file?.name ?? __('No file selected');
	const hasFile = !!file;
	const hasIcon = isProcessing || hasFile;
	const effectiveIsDisabled = disabled || isProcessing;

	/**
	 * If the file value was cleared, make sure to clear the file input's value
	 */
	useEffect(() => {
		if (!file && fileInputRef.current) {
			if (fileInputRef.current.value) {
				fileInputRef.current.value = '';
			}
		}
	}, [file]);

	return (
		<div className={cn(
			'w-full h-10',
			'rounded-md border border-input',
			'relative',
			'bg-background',
			isInvalid && 'border-red-600',
			'p-1',
			hasIcon && 'pr-9',
		)}>
			<label className={cn(
				'flex flex-row gap-3 items-center',
				'w-full h-full',
				'text-sm',
				effectiveIsDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
				className,
			)}>
				<div className={cn(
					'flex flex-col items-center justify-center self-stretch',
					'whitespace-nowrap',
					'bg-dark-purple text-primary-foreground',
					!effectiveIsDisabled && 'hover:bg-brand-blue',
					effectiveIsDisabled && 'opacity-50',
					'rounded-sm',
					'transition-colors duration-100',
					'px-4',
				)}>
					{__('Choose file')}
				</div>
				<div className={cn(
					'grow',
					'text-ellipsis overflow-hidden whitespace-nowrap',
					effectiveIsDisabled && 'opacity-50',
					!file && 'text-neutral-grey-medium',
				)}>
					{displayedFileName}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					accept={accept}
					disabled={effectiveIsDisabled}
					onChange={handleFileSelected}
				/>
			</label>
			{isProcessing && (
				<div className="absolute right-2 top-1/2 -translate-y-1/2">
					<Spinner size="20px" />
				</div>
			)}
			{(!isProcessing && hasFile) && (
				<div className="absolute right-2 top-1/2 -translate-y-1/2">
					<CircleX
						size={20}
						onClick={onClear}
						className="cursor-pointer text-neutral-grey-medium hover:text-dark-purple"
					/>
				</div>
			)}
		</div>
	);
}
