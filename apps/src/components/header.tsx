import { LogOut } from 'lucide-react';
import { __ } from '@/context/locale-provider';
import Logo from '@/assets/logo.svg';

export default function Header(): JSX.Element {
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
			<a href="/" className="hidden lg:flex gap-x-2 px-4 py-2">
				<span className="underline text-sm">
					{__('Go back to the main website')}
				</span>
				<LogOut />
			</a>
		</header>
	);
}
