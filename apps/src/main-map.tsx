import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';

import { LocaleProvider } from '@/context/locale-provider';
import { store } from '@/app/store';

import App from '@/App';

import '@/Global.css';
import SectionContext from "@/context/section-provider";

const i18n = createI18n();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<I18nProvider i18n={i18n}>
				<SectionContext.Provider value={'map'} >
					<LocaleProvider>
						<App />
					</LocaleProvider>
				</SectionContext.Provider>
			</I18nProvider>
		</Provider>
	</StrictMode>
);
