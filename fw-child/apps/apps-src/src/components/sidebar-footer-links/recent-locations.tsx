/**
 * Recent Locations link and panel components.
 *
 * This component provides a link to open a panel that displays a list of recent locations.
 */
import React from "react";
import { History, ArrowRight } from "lucide-react";
import { useI18n } from "@wordpress/react-i18n";

// componennts
import { Button } from "@/components/ui/button";
import { SidebarPanel, useSidebar } from "@/components/ui/sidebar";

// other
import { useAppSelector } from "@/app/hooks";
import { MapLocation } from "@/types/types";
import { SEARCH_DEFAULT_ZOOM } from "@/lib/constants";
import { useMapContext } from "@/context/map-provider";
import { cn } from "@/lib/utils";

// link and panel slug
const slug = 'recent-locations';

/**
 * A menu item link component that opens the recent locations panel.
 */
const RecentLocationsLink: React.FC = () => {
  const { togglePanel, isPanelActive } = useSidebar();
  const { __ } = useI18n();

  return (
    <Button
      variant="link"
      onClick={() => togglePanel(slug)}
      className="justify-start p-2 text-dark-purple hover:-underline"
    >
      <History size={16} />
      <span
        className={cn(
          "hover:text-dark-purple",
          isPanelActive(slug)
            ? 'text-dark-purple'
            : 'text-brand-blue'
        )}>
        {__('Recent locations')}
      </span>
    </Button>
  );
};
RecentLocationsLink.displayName = "RecentLocationsLink";

/**
 * A panel component that displays a list of recent locations.
 */
const RecentLocationsPanel: React.FC = () => {
  const { __ } = useI18n();

  const { map } = useMapContext();
  const { recentLocations } = useAppSelector(state => state.map);

  if (! recentLocations) {
    return null;
  }

  const moveToLocation = (location: MapLocation) => {
    map.setView(location, SEARCH_DEFAULT_ZOOM);
  }

  return (
    <SidebarPanel
      id={slug}
      className="w-64 h-full border-l-2 border-[hsl(var(--border))] bg-neutral-grey-light"
    >
      <div className="flex flex-row items-center gap-2 p-4">
        <History size={24} className="text-dark-purple" />
        <span className="font-semibold text-xl text-zinc-900">{__('Recent locations')}</span>
      </div>
      <div className="px-4 pt-0">
        {recentLocations.map((location, index) => (
          <Button
            key={index}
            variant="link"
            onClick={() => moveToLocation(location)}
            className="text-sm text-brand-blue-medium text-wrap text-start justify-between w-full ps-0 h-auto"
          >
            {location.title}
            <ArrowRight size={20} />
          </Button>
        ))}
      </div>
    </SidebarPanel>
  );
};
RecentLocationsPanel.displayName = "RecentLocationsPanel";

export { RecentLocationsLink, RecentLocationsPanel };