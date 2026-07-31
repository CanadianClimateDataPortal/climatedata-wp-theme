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
					`data-raster` is the raster-mode flag carrier. `SidebarProvider`
					spreads unknown props onto a real `div` classed
					`group/sidebar-wrapper`, an ancestor of the sidebar, both headers,
					and the map wrapper — the only element that dominates everything
					the export has to restyle. Descendants key off it with Tailwind's
					native data-attribute variant,
					`group-data-[raster=true]/sidebar-wrapper:…`; no plugin needed.

					Omitted rather than set to `"false"` so a normal page load's DOM
					is unchanged.

					Two constraints for whoever writes the first rule against it:

					Visibility. The screenshot service waits for its target element to
					be visible — non-zero box, and every ancestor likewise — before
					capturing. No raster rule may hide or zero-size this div or any
					ancestor of the map wrapper; doing so does not hide chrome, it makes
					the export time out with no image. Hide chrome by hiding the chrome
					itself.

					Ordering. The caller flushes this attribute's React commit
					synchronously before calling `prepareRaster`
					(`lib/prepare-raster.ts`), so every rule keyed off `data-raster` has
					already applied by the time `prepareRaster`'s own DOM changes run.

					Persistence. Rules that key off descendant `data-raster="false"`
					markers (see `Global.css`) hide those elements rather than removing
					them: the map legend renders into a React root of its own, and
					detaching a node behind React's back can take down that whole root
					on its next commit, not just the one element.
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
