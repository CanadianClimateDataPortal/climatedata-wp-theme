/**
 * Input Component
 *
 * A simple input component with some default styles applied.
 */
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'input',
				'flex h-10 w-full rounded-md border border-input',
				'bg-background px-3 py-2',
				'text-sm ring-offset-background',
				'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
				'text-neutral-grey-medium placeholder:text-neutral-grey-medium',
				'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue',
				'disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = 'Input';

export { Input };
