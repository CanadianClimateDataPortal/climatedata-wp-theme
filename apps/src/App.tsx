import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/context/sidebar-provider';
import Header from '@/components/header';
import { MapWrapper } from "@/components/map-wrapper";
import { MapProvider } from '@/context/map-provider';
import { LocaleProvider } from '@/context/locale-provider';
import { AnimatedPanelProvider } from '@/context/animated-panel-provider';
import { ClimateVariableProvider } from "@/context/climate-variable-provider";

import { useLeaflet } from '@/hooks/use-leaflet';

import '@/App.css';

function App() {
	// making leaflet features available everywhere through the app
	useLeaflet();

	return (
		<LocaleProvider>
			<ClimateVariableProvider>
				<MapProvider>
					<AnimatedPanelProvider>
						<SidebarProvider>
							<AppSidebar />
							<SidebarTrigger />
							<main className="flex flex-col h-screen">
								<Header />
								<MapWrapper />
							</main>
						</SidebarProvider>
					</AnimatedPanelProvider>
				</MapProvider>
			</ClimateVariableProvider>
		</LocaleProvider>
	);
}

export default App;
