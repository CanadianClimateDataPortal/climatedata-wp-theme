import { BookOpenText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	type PopoverContentSide,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export interface ModalSummaryPopoverProps {
	buttonTitle?: string;
	children?: React.ReactNode[] | React.ReactNode;
	popoverContentClassName?: string;
	popoverContentSide?: PopoverContentSide;
}

const CN_BUTTON_EFFECTS = [
	`bg-brand-blue`,
	`focus:outline-none`,
	`focus:ring-brand-blue/90`,
	`focus:ring`,
	`focus:bg-brand-blue`,
	`hover:bg-brand-blue/75`,
	`rounded-full`,
	`transition-colors`,
] as const;

const CN_ROUNDED_BIG_BUTTON_TEXT = [
	`font-bold`,
	`hover:text-white`,
	`text-md`,
	`text-white`,
	`tracking-[0.8px]`,
	`uppercase`,
] as const;

export const ModalSummaryPopover = (
	props: ModalSummaryPopoverProps,
): React.ReactNode => {
	const {
		popoverContentClassName,
		buttonTitle = '',
		popoverContentSide = 'top',
		children,
	} = props;

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							'mr-1',
							CN_BUTTON_EFFECTS,
							CN_ROUNDED_BIG_BUTTON_TEXT,
						)}
						title={buttonTitle !== '' ? buttonTitle : undefined}
					>
						<BookOpenText size={16} />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className={cn('w-auto', popoverContentClassName)}
					side={popoverContentSide ?? undefined}
					sideOffset={1}
				>
					{children}
				</PopoverContent>
			</Popover>
		</>
	);
};

ModalSummaryPopover.displayName = 'ModalSummaryPopover';
