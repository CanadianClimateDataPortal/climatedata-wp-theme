/**
 * Location info panel component.
 *
 * This component displays location info in the form of a highcharts chart.
 */
import React from 'react';

// components
import ClimateDataChart from '@/components/climate-data-chart';

// other
import { ClimateDataProps } from '@/types/types';

import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';

/**
 * LocationInfoPanel component, displaying details such as description and related data
 * for the selected variable.
 */
const LocationInfoPanel: React.FC<{
	title: string;
	latlng: L.LatLng;
	featureId: number;
	data: ClimateDataProps;
}> = ({ title, latlng, featureId, data }) => {
	return (
		<div className="location-info-panel !w-full xl:!w-auto">
			<ClimateDataChart title={title} latlng={latlng} featureId={featureId} data={data} />
		</div>
	);
};
LocationInfoPanel.displayName = 'LocationInfoPanel';

export default LocationInfoPanel;
