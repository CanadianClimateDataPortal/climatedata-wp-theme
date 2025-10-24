import 'react';

import { type GlobalProvider } from '@ladle/react';

import Header from '@/components/header';

import '@/App.css';
import '@/Global.css';

export const Provider: GlobalProvider = ({ children }) => {
	return (
		<div className="container relative grid grid-flow-row gap-8 mx-auto columns-1 auto-rows-max">
			<div className="mb-8">
				<Header />
			</div>
			<div className="mb-8">
				<div
					style={{
						borderBottom: '1px solid hsl(var(--border))'
					}
				}></div>
			</div>
			<div className="relative flex justify-center">
				{children}
			</div>
		</div>
	);
};
