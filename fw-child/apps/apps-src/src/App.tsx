import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
import MapWrapper from "@/components/map-wrapper";

import { MapProvider } from "@/context/map-provider";
import { LocaleProvider } from "@/context/locale-provider";
import { AnimatedPanelProvider } from "@/context/animated-panel-provider";

import { useLeaflet } from "@/hooks/use-leaflet";

import "@/App.css";

function App() {
  // making leaflet features available everywhere through the app
  useLeaflet();

  return (
    <LocaleProvider>
      <AnimatedPanelProvider>
        <MapProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <main>
              <Header />
              <MapWrapper />
            </main>
          </SidebarProvider>
        </MapProvider>
      </AnimatedPanelProvider>
    </LocaleProvider>
  );
}

export default App;
