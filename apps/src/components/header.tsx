import React from 'react';
import { LogOut } from 'lucide-react';

import { __ } from '@/context/locale-provider';

import Logo from '@/assets/logo.svg';

import HeaderLanguageLinks from '@/components/header-language-links';

interface AppHeaderProps {
	/**
	 * Optional trailing slot, rendered at the mobile-only end of the header
	 * (`lg:hidden`).
	 *
	 * This is a caller-supplied slot rather than a hardcoded child because the
	 * header is shared by BOTH the Map and Download apps — anything mounted here
	 * runs in both trees. The Map app passes its `<SidebarTrigger />`, which calls
	 * `useSidebar()` and so requires the Map-only `SidebarProvider` context; the
	 * Download app wraps no such provider and passes nothing. Keeping it a slot
	 * means a provider-dependent component is only ever mounted by the tree that
	 * owns its provider, so it can never crash the provider-less Download tree.
	 */
	trailing?: React.ReactNode;
}

const AppHeader = (
	props: AppHeaderProps
): React.ReactNode => {
	const { trailing } = props;

	return (
		<header id="header" className="flex items-center justify-between px-4 py-1.5">
			<div className="flex items-center grow">
				<a href="/"><img src={Logo} alt={__('Climate Data')} /></a>
				<a href="/">
					<h2 className="py-2 px-4 text-zinc-900 text-base font-light leading-tight text-nowrap">
						{__('Climate Data')}
					</h2>
				</a>
			</div>
			<div className="hidden lg:flex gap-x-4 px-4 py-2 items-center">
				<span>
					<a href="/" className="flex gap-2">
						<span className="underline text-sm text-right pe-2 font-light leading-tight">
							{__('Go back to the main website')}
						</span>
						<LogOut />
					</a>
				</span>
				<span
					aria-hidden="true"
					className="w-px h-5 bg-zinc-300"
				/>
				<span>
					<HeaderLanguageLinks />
				</span>
			</div>
			{trailing ? (
				<div className="lg:hidden">{trailing}</div>
			) : null}
		</header>
	);
};

AppHeader.displayName = 'AppHeader'; // Explicit string literal, or this name would be lost in production.

export default AppHeader;
