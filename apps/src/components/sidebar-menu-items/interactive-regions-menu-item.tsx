/**
 * A menu item that shows the InteractiveRegionSelect component.
 */
import React from 'react';

// components
import { SidebarMenuItem } from '@/components/ui/sidebar';
import InteractiveRegionSelect from '@/components/interactive-region-select';
import { InteractiveRegionDisplay } from '@/types/climate-variable-interface';

const InteractiveRegionsMenuItem: React.FC = () => {
	return (
		<SidebarMenuItem>
			<InteractiveRegionSelect
				displayMode={InteractiveRegionDisplay.MAP}
			/>
		</SidebarMenuItem>
	);
};
InteractiveRegionsMenuItem.displayName = 'InteractiveRegionsMenuItem';

export { InteractiveRegionsMenuItem };
