import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/context/sidebar-provider';
import Header from '@/components/header';
import MapWrapper from '@/components/map-wrapper';
import { MapProvider } from '@/context/map-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

import { useAppSelector } from '@/app/hooks';
import { selectIsRasterMode } from '@/features/map/map-slice';
import { useLeaflet } from '@/hooks/use-leaflet';
import { useUrlSync } from '@/hooks/use-url-sync';

import '@/App.css';

function App() {
	useUrlSync();
	useLeaflet();

	const isRasterMode = useAppSelector(selectIsRasterMode);

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

					The screenshot is just an image, and a Sidebar holds buttons that we can interact
					with and they aren't useful as part of an image.
					To remove the Sidebar we can use the `SidebarProvider` which will spread remainder
					of the props onto a real `div` classed `group/sidebar-wrapper`,
					an ancestor of the sidebar, both headers, and the `#map-root`.

					There is a technique that leverages Tailwind's native "data-attribute" variant syntax;
					`group-data-[raster=true]/sidebar-wrapper:…`; which saves us from adding a plugin.

					Two things this `<SidebarProvider data-raster>` helps us with:

					1. Visibility. The screenshot service is designed to wait for its target element to
					be visible before capturing.

					2. Ordering. The caller flushes this attribute's React commit
					synchronously before calling `prepareRaster` (`lib/prepare-raster.ts`),
					so every rule keyed off `[data-raster]` on an element has already applied by the time
					`prepareRaster`'s own DOM changes run.
					*/}
					<SidebarProvider data-raster={isRasterMode ? 'true' : undefined}>
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
