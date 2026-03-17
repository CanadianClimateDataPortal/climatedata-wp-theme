import { InfoIcon } from 'lucide-react';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export type PopoverContentSideProp = 'left' | 'right' | 'bottom' | 'top';

export interface TooltipWidgetProps {
	tooltip: React.ReactNode
	side?: PopoverContentSideProp
}

/**
 * Circle with an "i" icon that shows a tooltip when hovered or clicked.
 */
export default function TooltipWidget({
	tooltip,
	side
}: TooltipWidgetProps) {
	return (
		<>
			<Popover>
				<PopoverTrigger className="text-dark-purple">
					<InfoIcon size={16} />
				</PopoverTrigger>
				<PopoverContent side={side ?? undefined}>
					{tooltip}
				</PopoverContent>
			</Popover>
		</>
	);
}
