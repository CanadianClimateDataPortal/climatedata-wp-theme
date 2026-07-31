import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/context/sidebar-provider';
import Header from '@/components/header';
import MapWrapper from '@/components/map-wrapper';
import { MapProvider } from '@/context/map-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

import { useLeaflet } from '@/hooks/use-leaflet';
import { useUrlSync } from '@/hooks/use-url-sync';

import '@/App.css';

function App() {
	useUrlSync();
	useLeaflet();

	return (
		<ClimateVariableProvider>
			<MapProvider>
				<AnimatedPanelProvider>
					{/*
					On the map SPA, when choosing "Download" to get a screenshot of the current map.
					Some things that are normally shown don't need to be shown in a PNG
					capture (or shown more than once, see `Global.css`).

					`html[data-raster="true"]` is the *mode* flag to adapt for making a screenshot
					and what aspects to adjust so that we can optimize what's displayed in the image.
					There are elements we have to remove (the aside, the menu) and to remove them,
					we use `[data-raster="false"]`.

					Raster mode is not React or Redux state. `prepareRaster` (`lib/prepare-raster.ts`)
					sets `data-raster="true"` directly on `<html>` after removing the chrome elements
					marked `[data-raster="false"]`. `Global.css` and the export-only info pills key
					off that attribute directly, with no React commit to wait on and no ordering
					between them to guarantee.
					*/}
					<SidebarProvider>
						<AppSidebar />
						<main className="flex flex-col h-screen">
							<Header trailing={<SidebarTrigger className="[&_svg]:size-6" />} />
							<MapWrapper />
						</main>
					</SidebarProvider>
				</AnimatedPanelProvider>
			</MapProvider>
		</ClimateVariableProvider>
	);
}

export default App;
