// Looking for `window.$.fn.prepare_raster`?
// It is assigned in `apps/src/lib/utils.ts`
//
// Anything outside `apps/` relating to `prepare_raster` and Map Image Download
// that uses the same name is effectively not used.
//
// The caller is outside this app. The server-side screenshot service
// (<https://github.com/CanadianClimateDataPortal/climatedata-api>,
// file: `climatedata_api/raster.py`) loads this page in a
// headless browser, evaluates `$.fn.prepare_raster()` to strip interactive
// UI, then captures the "Save map as image" PNG.
//
// Code unused, time lost following dead-end:
// `fw-child/resources/js/map.js` also defines `$.fn.prepare_raster`;
// is the legacy implementation that will eventually be deleted.

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
