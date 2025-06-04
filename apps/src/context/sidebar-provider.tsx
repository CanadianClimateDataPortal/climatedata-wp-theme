/**
 * SidebarProvider is a context provider that controls the state of the sidebar.
 */
import React, { useEffect, useState } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContext = {
	state: 'expanded' | 'collapsed';
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
	activePanel: string | null;
	isPanelActive: (id: string) => boolean;
	togglePanel: (id: string) => void;
	openPanel: (id: string) => void;
	closePanel: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<'div'> & {
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}
>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange: setOpenProp,
			className,
			style,
			children,
			...props
		},
		ref
	) => {
		const isMobile = useIsMobile();
		const [openMobile, setOpenMobile] = useState(false);

		// controls the sidebar sliding panels open state
		const [activePanel, setActivePanel] = useState<string | null>(null);

		const isPanelActive = React.useCallback(
			(id: string) => {
				return activePanel === id;
			},
			[activePanel]
		);

		const openPanel = React.useCallback((id: string) => {
			setActivePanel(id);
		}, []);

		const closePanel = React.useCallback(() => {
			setActivePanel(null);
		}, []);

		const togglePanel = React.useCallback((id: string) => {
			setActivePanel((prev) => (prev === id ? null : id));
		}, []);

		// This is the internal state of the sidebar.
		// We use openProp and setOpenProp for control from outside the component.
		const [_open, _setOpen] = useState(defaultOpen);
		const open = openProp ?? _open;
		const setOpen = React.useCallback(
			(value: boolean | ((value: boolean) => boolean)) => {
				if (setOpenProp) {
					return setOpenProp?.(
						typeof value === 'function' ? value(open) : value
					);
				}

				_setOpen(value);

				// This sets the cookie to keep the sidebar state.
				document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
			},
			[setOpenProp, open]
		);

		// Helper to toggle the sidebar.
		const toggleSidebar = React.useCallback(() => {
			return isMobile
				? setOpenMobile((open) => !open)
				: setOpen((open) => !open);
		}, [isMobile, setOpen, setOpenMobile]);

		// Adds a keyboard shortcut to toggle the sidebar.
		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (
					event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
					(event.metaKey || event.ctrlKey)
				) {
					event.preventDefault();
					toggleSidebar();
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}, [toggleSidebar]);

		// We add a state so that we can do data-state="expanded" or "collapsed".
		// This makes it easier to style the sidebar with Tailwind classes.
		const state = open ? 'expanded' : 'collapsed';

		const contextValue = React.useMemo<SidebarContext>(
			() => ({
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				setOpenMobile,
				toggleSidebar,
				activePanel,
				isPanelActive,
				openPanel,
				closePanel,
				togglePanel,
			}),
			[
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				setOpenMobile,
				toggleSidebar,
				activePanel,
				isPanelActive,
				openPanel,
				closePanel,
				togglePanel,
			]
		);

		return (
			<SidebarContext.Provider value={contextValue}>
				<TooltipProvider delayDuration={0}>
					<div
						style={
							{
								'--sidebar-width': SIDEBAR_WIDTH,
								'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
								...style,
							} as React.CSSProperties
						}
						className={cn(
							'group/sidebar-wrapper lg:flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
							className
						)}
						ref={ref}
						{...props}
					>
						{children}
					</div>
				</TooltipProvider>
			</SidebarContext.Provider>
		);
	}
);

export { SidebarProvider, SidebarContext };
