import { InfoIcon } from 'lucide-react';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

/**
 * Circle with an "i" icon that shows a tooltip when hovered or clicked.
 */
export default function TooltipWidget({
	tooltip,
}: {
	tooltip: string | React.ReactNode;
}) {
	return (
		<>
			<Popover>
				<PopoverTrigger className="text-dark-purple">
					<InfoIcon size={16} />
				</PopoverTrigger>
				<PopoverContent>
					{tooltip}
				</PopoverContent>
			</Popover>
		</>
	);
}
