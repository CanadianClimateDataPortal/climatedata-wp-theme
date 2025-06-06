import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/context/sidebar-provider';
import Header from '@/components/header';
import { MapWrapper } from "@/components/map-wrapper";
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
					<SidebarProvider>
						<AppSidebar />
						<SidebarTrigger className="lg:hidden absolute top-4 right-4 [&_svg]:size-6" />
						<main className="flex flex-col h-screen">
							<Header />
							<MapWrapper />
						</main>
					</SidebarProvider>
				</AnimatedPanelProvider>
			</MapProvider>
		</ClimateVariableProvider>
	);
}

export default App;
