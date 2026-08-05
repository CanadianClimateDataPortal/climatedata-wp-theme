// Looking for `window.$.fn.prepare_raster`?
//
// The `prepare_raster` name also appears outside `apps/`; this entry point owns
// the definition the screenshot service actually reaches.
// `installPrepareRasterStub()` below claims the global first, so a call landing
// before React mounts is held and replayed once `DownloadMapModal` registers
// the real implementation.
// It is defence in depth against a registration race that is real in principle
// and unmeasured on a cold load: registration takes roughly 34ms on a warm
// load, against the service's one-second wait.
// `lib/map/image-rastering/install-prepare-raster-stub.ts` carries that
// measurement and the unmount defect the same stub closes.
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

// Runs while this module is still evaluating, ahead of the React render below.
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
