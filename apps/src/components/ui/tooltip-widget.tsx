import { InfoIcon } from 'lucide-react';

import {
	Popover,
	PopoverContent,
	type PopoverContentSide,
	PopoverTrigger,
} from '@/components/ui/popover';

export interface TooltipWidgetProps {
	tooltip: React.ReactNode
	side?: PopoverContentSide
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
