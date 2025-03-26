/**
 * Main entry point for the download app
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from '@/components/download/app';
import { store } from '@/app/store';
import SectionContext from "@/context/section-provider";

import '@/Global.css';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider store={store}>
			<SectionContext.Provider value={'download'}>
				<ClimateVariableProvider>
					<App />
				</ClimateVariableProvider>
			</SectionContext.Provider>
		</Provider>
	</StrictMode>
);
