// Looking for `window.$.fn.prepare_raster`?
//
// Anything outside `apps/` relating to `prepare_raster` and Map Image Download
// that uses the same name is effectively not used.
// installPrepareRasterStub() below occupies it first, so a screenshot-service
// call arriving before DownloadMapModal registers the real implementation is
// captured and forwarded instead of crashing. See
// lib/map/image-rastering/install-prepare-raster-stub.ts.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';

import { LocaleProvider } from '@/context/locale-provider';
import { store } from '@/app/store';
import { installPrepareRasterStub } from '@/lib/map/image-rastering';

import App from '@/App';

import '@/Global.css';
import SectionContext from "@/context/section-provider";

// As early as possible: before the bundle finishes parsing this file, before
// React mounts anything below.
installPrepareRasterStub();

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
