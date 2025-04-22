import React from 'react';

import StepSummary from '@/components/download/step-summary';
import Steps from '@/components/download/steps';

import { MapProvider } from '@/context/map-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { DownloadProvider } from '@/context/download-provider';
import { LocaleProvider } from '@/context/locale-provider';
import { useLeaflet } from '@/hooks/use-leaflet';

const App: React.FC = () => {
	useLeaflet();

	return (
		<LocaleProvider>
			<MapProvider>
				<AnimatedPanelProvider>
					<DownloadProvider>
						<div className="min-h-screen bg-cold-grey-1">
							<div className="max-w-6xl mx-auto py-10">
								<div className="flex flex-col sm:flex-row gap-4">
									<div className="flex-1">
										<Steps/>
									</div>
									<div className="w-full sm:w-72">
										<StepSummary/>
									</div>
								</div>
							</div>
						</div>
					</DownloadProvider>
				</AnimatedPanelProvider>
			</MapProvider>
		</LocaleProvider>
	)
};
App.displayName = 'DownloadApp';

export default App;