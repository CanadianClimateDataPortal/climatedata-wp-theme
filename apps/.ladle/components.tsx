import 'react';

import { type GlobalProvider } from '@ladle/react';

import Header from '@/components/header';

import '@/App.css';
import '@/Global.css';

export const Provider: GlobalProvider = ({ children }) => {
	return (
		<>

			<main className="relative flex flex-col">

				<Header />

				<div className="relative flex-1">
					<>
						{children}
					</>
				</div>

			</main>

		</>
	);
};


