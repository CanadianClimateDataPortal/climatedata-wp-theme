import React from 'react';
import { LogOut } from 'lucide-react';

import { __ } from '@/context/locale-provider';

import Logo from '@/assets/logo.svg';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderLanguageLinks from '@/components/header-language-links';

const AppHeader = (): React.ReactNode => {
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
			<div className="lg:gap-x-4 lg:px-4 gap-x-2 px-2 py-2 flex items-center">
				<span>
					<a href="/" className="flex lg:gap-2">
						<span className="underline text-xs lg:text-sm text-right pe-2 font-light leading-tight">
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
			<div className="lg:hidden">
				<SidebarTrigger className="[&_svg]:size-6" />
			</div>
		</header>
	);
};

AppHeader.displayName = 'AppHeader'; // Explicit string literal, or this name would be lost in production.

export default AppHeader;
