/**
 * Main entry point for the download app
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';

import App from '@/components/download/app';
import { store } from '@/app/store';
import SectionContext from "@/context/section-provider";

import '@/Global.css';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

const i18n = createI18n();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<I18nProvider i18n={i18n}>
				<SectionContext.Provider value={'download'}>
					<ClimateVariableProvider>
						<App />
					</ClimateVariableProvider>
				</SectionContext.Provider>
			</I18nProvider>
		</Provider>
	</StrictMode>
);