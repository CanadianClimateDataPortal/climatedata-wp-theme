import React from 'react';
import { LogOut } from 'lucide-react';

import { __ } from '@/context/locale-provider';

import Logo from '@/assets/logo.svg';
import HeaderLanguageLinks from '@/components/header-language-links';

const AppHeader = (): React.ReactNode => {
	return (
		<header id="header" className="flex items-center justify-between px-4 py-1.5">
			<div className="flex items-center">
				<a href="/"><img src={Logo} alt={__('Climate Data')} /></a>
				<a href="/">
					<h2 className="py-2 px-4 text-zinc-900 text-base font-light leading-tight">
						{__('Climate Data')}
					</h2>
				</a>
			</div>
			<div className="gap-x-4 px-4 py-2 flex items-center">
				<a href="/" className="flex gap-2">
					<span className="underline text-sm">
						{__('Go back to the main website')}
					</span>
					<LogOut />
				</a>
				<span
					aria-hidden="true"
					className="hidden lg:block w-px h-5 bg-zinc-300"
				/>
				<HeaderLanguageLinks />
			</div>
		</header>
	);
};

AppHeader.displayName = 'AppHeader'; // Explicit string literal, or this name would be lost in production.

export default AppHeader;
