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
 * @see {@link https://www.radix-ui.com/primitives/docs/components/popover#content Radix UI Popover Content API}
 */
type PopoverContentSide = NonNullable<
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>['side']
>;

/**
 * Popover content wrapper over `@radix-ui/react-popover`.
 *
 * All Radix PopoverContent props are forwarded via `{...props}`.
 * Positioning-related props available:
 *
 * - `side` (`PopoverContentSide`, default `'bottom'`) —
 *   The preferred side of the anchor to render against when open.
 *   Will be reversed when collisions occur and `avoidCollisions` is enabled.
 *
 * - `sideOffset` (`number`, default `4` — Radix default is `0`) —
 *   The distance in pixels from the anchor.
 *
 * - `align` (`'start' | 'center' | 'end'`, default `'center'`) —
 *   The preferred alignment against the anchor.
 *   May change when collisions occur.
 *
 * - `alignOffset` (`number`, default `0`) —
 *   An offset in pixels from the `'start'` or `'end'` alignment options.
 *
 * - `collisionBoundary` (`Element | Element[] | null`, default: viewport) —
 *   The element(s) used as the collision boundary.
 *   By default this is the viewport.
 *
 * - `sticky` (`'partial' | 'always'`, default `'partial'`) —
 *   `'partial'` keeps content visible while the trigger is at least partially in view;
 *   `'always'` keeps content visible regardless of trigger position.
 *
 * @see {@link https://www.radix-ui.com/primitives/docs/components/popover#content Radix UI Popover Content API}
 */
const PopoverContent = forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
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
