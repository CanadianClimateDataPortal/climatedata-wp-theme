/**
 * Popover Component
 *
 * A customizable popover built with Radix UI's Popover primitives. This component provides
 * a flexible API for displaying content in an overlay triggered by a user interaction.
 *
 * ## Components
 * - `Popover`: The root component that manages the popover's state.
 * - `PopoverTrigger`: The element that toggles the popover's visibility.
 * - `PopoverContent`: The container for the popover's content with advanced positioning and animations.
 *
 */
import React, { forwardRef } from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Derived from `@radix-ui/react-popover` Content `side` prop.
 *
 * `'top' | 'right' | 'bottom' | 'left'` — which side of the trigger to
 * prefer when open. Reverses on collision when `avoidCollisions` is enabled.
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/popover#content Radix UI Popover Content API}
 */
type PopoverContentSide = NonNullable<
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>['side']
>;

type PopoverContentProps = React.ComponentPropsWithoutRef<
	typeof PopoverPrimitive.Content
>;

/**
 * Popover content wrapper over `@radix-ui/react-popover`.
 *
 * All Radix {@link PopoverContentProps} are forwarded via `{...props}`.
 *
 * @see {@link PopoverContentSide} for the `side` prop type
 * @see {@link https://www.radix-ui.com/primitives/docs/components/popover#content Radix UI Popover Content API}
 */
const PopoverContent = forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(({
	className,
	align = 'center',
	side = 'bottom' satisfies PopoverContentSide,
	sideOffset = 4,
	...props
}, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			side={side}
			sideOffset={sideOffset}
			className={cn(
				'popover-content z-50',
				'p-4 rounded-md border',
				'text-sm text-popover-foreground',
				'bg-popover text-popover-foreground shadow-md outline-none',
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
				'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				className
			)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export {
	Popover,
	PopoverContent,
	type PopoverContentSide,
	PopoverTrigger,
};
