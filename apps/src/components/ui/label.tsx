import * as React from 'react';
import { cn } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {
	label: string;
	tooltip?: React.ReactNode;
}

const Label = React.forwardRef<HTMLDivElement, LabelProps>(
	({ label, tooltip, className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn('flex flex-row gap-2 my-2 text-[#657092]', className)}
			{...props}
		>
			<div className="text-sm font-semibold uppercase">{label}</div>
			{tooltip && (
				<Popover>
					<PopoverTrigger>
						<InfoIcon size={16} />
					</PopoverTrigger>
					<PopoverContent>{tooltip}</PopoverContent>
				</Popover>
			)}
		</div>
	)
);

Label.displayName = 'Label';

export { Label };
