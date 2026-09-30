import 'react';

import { type GlobalProvider } from '@ladle/react';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/app/store';
import { LocaleProvider } from '@/context/locale-provider';

import Header from '@/components/header';

import '@/App.css';
import '@/Global.css';

/**
 * `<Header />` renders `<HeaderLanguageLinks />`, which reads the locale
 * (`useLocale()`) and the Redux store (`useAppSelector`). Both throw without
 * their provider, and the error blanks every story. The providers mirror the
 * ones `src/main-map.tsx` mounts. A story that wraps itself in
 * `LadleMockLocaleProvider` still overrides the locale for its own subtree.
 */
export const Provider: GlobalProvider = ({ children }) => {
	return (
		<ReduxProvider store={store}>
			<LocaleProvider>
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
			</LocaleProvider>
		</ReduxProvider>
	);
};
