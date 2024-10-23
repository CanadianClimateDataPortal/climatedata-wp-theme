import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import './App.css'

function App() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main>
        <h1>Here goes the map</h1>
      </main>
    </SidebarProvider>
  )
}

export default App
