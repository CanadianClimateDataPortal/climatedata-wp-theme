/**
 * Recent Locations link and panel components.
 *
 * This component provides a link to open a panel that displays a list of recent locations.
 */
import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { __ } from '@/context/locale-provider';

// components
import { Button } from '@/components/ui/button';
import { SidebarPanel } from '@/components/ui/sidebar';

// other
import { useAppSelector } from '@/app/hooks';
import { MapLocation } from '@/types/types';
import { SEARCH_DEFAULT_ZOOM } from '@/lib/constants';
import { useMap } from '@/hooks/use-map';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import L from 'leaflet';

// link and panel slug
const slug = 'recent-locations';

/**
 * A menu item link component that opens the recent locations panel.
 */
const RecentLocationsLink: React.FC = () => {
	const { togglePanel, isPanelActive } = useSidebar();

	return (
		<Button
			variant="link"
			onClick={() => togglePanel(slug)}
			className="justify-start p-2 text-dark-purple hover:-underline font-normal"
		>
			<History size={16} />
			<span
				className={cn(
					'hover:text-dark-purple',
					isPanelActive(slug) ? 'text-dark-purple' : 'text-brand-blue'
				)}
			>
				{__('Recent locations')}
			</span>
		</Button>
	);
};
RecentLocationsLink.displayName = 'RecentLocationsLink';

/**
 * A panel component that displays a list of recent locations.
 */
const RecentLocationsPanel: React.FC = () => {
	const { map } = useMap();
	const { recentLocations } = useAppSelector((state) => state.map);

	if (!recentLocations || !map) {
		return null;
	}

	const moveToLocation = (location: MapLocation) => {
		map.setView(location, SEARCH_DEFAULT_ZOOM);
		let vectorLayer: any;

		// Find our vector layer.
		map.eachLayer(layer => {
			// @ts-expect-error: suppress leaflet typescript error
			if (layer instanceof L.VectorGrid) {
				vectorLayer = layer;
			}
		});

		if (vectorLayer) {
			vectorLayer.fire('click', {
				latlng: {
					lat: location.lat,
					lng: location.lng
				}
			})
		}
	};

	return (
		<SidebarPanel
			id={slug}
			className="w-64 h-full border-l-2 border-[hsl(var(--border))] bg-neutral-grey-light"
		>
			<div className="flex flex-row items-center gap-2 p-4">
				<History size={24} className="text-dark-purple" />
				<span className="font-semibold text-xl text-zinc-900">
					{__('Recent locations')}
				</span>
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
RecentLocationsPanel.displayName = 'RecentLocationsPanel';

export { RecentLocationsLink, RecentLocationsPanel };
