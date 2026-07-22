import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/context/sidebar-provider';
import Header from '@/components/header';
import { MapWrapper } from "@/components/map-wrapper";
import { MapProvider } from '@/context/map-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

import { useAppSelector } from '@/app/hooks';
import { selectIsRasterMode } from '@/features/map/map-slice';
import { useLeaflet } from '@/hooks/use-leaflet';
import { useRasterMode } from '@/hooks/use-raster-mode';
import { useUrlSync } from '@/hooks/use-url-sync';

import '@/App.css';

function App() {
	// Ahead of `useUrlSync`: this consumes `?raster=1` once on mount, before URL
	// sync's debounced writers can rewrite the query string. Effects run in call
	// order, so the ordering here is the guarantee.
	useRasterMode();
	useUrlSync();
	useLeaflet();

	const isRasterMode = useAppSelector(selectIsRasterMode);

	return (
		<ClimateVariableProvider>
			<MapProvider>
				<AnimatedPanelProvider>
					{/*
					  * `data-raster` is the raster-mode flag carrier. `SidebarProvider`
					  * spreads unknown props onto a real `div` classed
					  * `group/sidebar-wrapper`, and that div is an ancestor of the
					  * sidebar, both headers AND the map wrapper — the only element
					  * that dominates every part the export has to restyle. Descendants
					  * key off it with Tailwind's native data-attribute variant,
					  * `group-data-[raster=true]/sidebar-wrapper:…`; no plugin needed.
					  *
					  * The attribute is omitted rather than set to `"false"` so the
					  * normal DOM is byte-for-byte unchanged.
					  *
					  * HARD CONSTRAINT for any rule written against this attribute: the
					  * screenshot service waits for its target element to be *visible*
					  * (non-zero box, and every ancestor likewise) before capturing. No
					  * raster rule may hide or zero-size this div, or any ancestor of
					  * the map wrapper — doing so does not hide chrome, it makes the
					  * whole export time out and return no image. Hide chrome by hiding
					  * the chrome itself.
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
