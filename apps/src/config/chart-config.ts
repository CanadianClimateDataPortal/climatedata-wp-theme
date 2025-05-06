import { SeriesLineOptions, SeriesArearangeOptions, SeriesColumnOptions } from 'highcharts';
import { ClimateDataProps } from '@/types/types.ts';
import { useI18n } from '@wordpress/react-i18n';

// Helper to sort an array of tuples by the first element (x-value / timestamp).
const sortByTimestamp = (
	seriesData: number[][] | Record<string, number[]> | number[] | undefined
) => {
	return Array.isArray(seriesData)
		? seriesData.slice().sort((a, b) => (a as number[])[0] - (b as number[])[0])
		: [];
};

export type ChartDataOption = {
	name: string;
	color: string;
	type: string;
};

export type ChartDataOptions = {
	[key: string]: ChartDataOption;
};

export const getChartDataOptions = (
	__: ReturnType<typeof useI18n>['__']
): ChartDataOptions => ({
	observations: {
		name: __('Gridded Historical Data'),
		color: 'gray',
		type: 'line',
	},
	modeled_historical_median: {
		name: __('Modeled Historical'),
		color: 'black',
		type: 'line',
	},
	modeled_historical_range: {
		name: __('Historical Range'),
		color: 'gray',
		type: 'arearange',
	},
	ssp126_median: {
		name: __('SSP1-2.6 Median'),
		color: '#0000ff',
		type: 'line',
	},
	ssp126_range: {
		name: __('SSP1-2.6 Range'),
		color: '#0000ff',
		type: 'arearange',
	},
	ssp245_median: {
		name: __('SSP2-4.5 Median'),
		color: '#00640c',
		type: 'line',
	},
	ssp245_range: {
		name: __('SSP2-4.5 Range'),
		color: '#00640c',
		type: 'arearange',
	},
	ssp370_median: {
		name: __('SSP3-7.0 Median'),
		color: '#f16f0c',
		type: 'line',
	},
	ssp370_range: {
		name: __('SSP3-7.0 Range'),
		color: '#f16f0c',
		type: 'arearange',
	},
	ssp585_median: {
		name: __('SSP5-8.5 Median'),
		color: '#ff0000',
		type: 'line',
	},
	ssp585_range: {
		name: __('SSP5-8.5 Range'),
		color: '#ff0000',
		type: 'arearange',
	},
	rcp26_median: {
		name: __('RCP 2.6 Median'),
		color: '#0000ff',
		type: 'line',
	},
	rcp26_range: {
		name: __('RCP 2.6 Range'),
		color: '#0000ff',
		type: 'arearange',
	},
	rcp45_median: {
		name: __('RCP 4.5 Median'),
		color: '#00640c',
		type: 'line',
	},
	rcp45_range: {
		name: __('RCP 4.5 Range'),
		color: '#00640c',
		type: 'arearange',
	},
	rcp85_median: {
		name: __('RCP 8.5 Median'),
		color: '#ff0000',
		type: 'line',
	},
	rcp85_range: {
		name: __('RCP 8.5 Range'),
		color: '#ff0000',
		type: 'arearange',
	},
	rcp85_enhanced: {
		name: __('RCP 8.5 Enhanced scenario'),
		color: '#b97800',
		type: 'line',
	},
	daily_average_temperature: {
		name: __('Daily Average Temperature'),
		color: '#000000',
		type: 'line',
	},
	daily_maximum_temperature: {
		name: __('Daily Maximum Temperature'),
		color: '#ff0000',
		type: 'line',
	},
	daily_minimum_temperature: {
		name: __('Daily Minimum Temperature'),
		color: '#0000ff',
		type: 'line',
	},
	precipitation: {
		name: __('Precipitation'),
		color: '#66ff66',
		type: 'column',
	},
});

export const getSeriesObject = (
	data: ClimateDataProps,
	version: string | undefined | null,
	climateVariableId: string | undefined,
	chartDataOptions: ChartDataOptions
): (SeriesLineOptions | SeriesArearangeOptions | SeriesColumnOptions)[] => {
	// Sea levels series
	if (climateVariableId === 'sea_level') {
		return [
			{
				custom: { key: 'rcp26_median' },
				name: chartDataOptions['rcp26_median'].name,
				type: chartDataOptions['rcp26_median'].type,
				data: sortByTimestamp(data.rcp26_median),
				color: chartDataOptions['rcp26_median'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'rcp26_range' },
				name: chartDataOptions['rcp26_range'].name,
				type: chartDataOptions['rcp26_range'].type,
				data: sortByTimestamp(data.rcp26_range),
				color: chartDataOptions['rcp26_range'].color,
				fillOpacity: 0.2,
				lineWidth: 0,
			} as SeriesArearangeOptions,
			{
				custom: { key: 'rcp45_median' },
				name: chartDataOptions['rcp45_median'].name,
				type: chartDataOptions['rcp45_median'].type,
				data: sortByTimestamp(data.rcp45_median),
				color: chartDataOptions['rcp45_median'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'rcp45_range' },
				name: chartDataOptions['rcp45_range'].name,
				type: chartDataOptions['rcp45_range'].type,
				data: sortByTimestamp(data.rcp45_range),
				color: chartDataOptions['rcp45_range'].color,
				fillOpacity: 0.2,
				lineWidth: 0,
			} as SeriesArearangeOptions,
			{
				custom: { key: 'rcp85_median' },
				name: chartDataOptions['rcp85_median'].name,
				type: chartDataOptions['rcp85_median'].type,
				data: sortByTimestamp(data.rcp85_median),
				color: chartDataOptions['rcp85_median'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'rcp85_range' },
				name: chartDataOptions['rcp85_range'].name,
				type: chartDataOptions['rcp85_range'].type,
				data: sortByTimestamp(data.rcp85_range),
				color: chartDataOptions['rcp85_range'].color,
				fillOpacity: 0.2,
				lineWidth: 0,
			} as SeriesArearangeOptions,
			{
				custom: { key: 'rcp85_enhanced' },
				name: chartDataOptions['rcp85_enhanced'].name,
				type: chartDataOptions['rcp85_enhanced'].type,
				data: sortByTimestamp(data.rcp85_enhanced),
				color: chartDataOptions['rcp85_enhanced'].color,
				fillOpacity: 0.2,
				lineWidth: 0,
			} as SeriesLineOptions,
		];
	} else if(climateVariableId === 'msc_climate_normals') {
		return [
			{
				custom: { key: 'daily_average_temperature' },
				name: chartDataOptions['daily_average_temperature'].name,
				type: chartDataOptions['daily_average_temperature'].type,
				data: sortByTimestamp(data.daily_average_temperature),
				color: chartDataOptions['daily_average_temperature'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'daily_maximum_temperature' },
				name: chartDataOptions['daily_maximum_temperature'].name,
				type: chartDataOptions['daily_maximum_temperature'].type,
				data: sortByTimestamp(data.daily_maximum_temperature),
				color: chartDataOptions['daily_maximum_temperature'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'daily_minimum_temperature' },
				name: chartDataOptions['daily_minimum_temperature'].name,
				type: chartDataOptions['daily_minimum_temperature'].type,
				data: sortByTimestamp(data.daily_minimum_temperature),
				color: chartDataOptions['daily_minimum_temperature'].color,
				lineWidth: 2,
			} as SeriesLineOptions,
			{
				custom: { key: 'precipitation' },
				name: chartDataOptions['precipitation'].name,
				type: chartDataOptions['precipitation'].type,
				data: sortByTimestamp(data.precipitation),
				color: chartDataOptions['precipitation'].color,
				lineWidth: 2,
			} as SeriesColumnOptions,
		]
	} else {
		// Other variables series (for CMPIP5 then CMIP6)
		switch (version) {
			case 'cmip5':
				return [
					{
						custom: { key: 'observations' },
						name: chartDataOptions['observations'].name,
						type: chartDataOptions['observations'].type,
						data: sortByTimestamp(data.observations),
						color: chartDataOptions['observations'].color,
						lineWidth: 1.5,
						dashStyle: 'ShortDash',
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_median' },
						name: chartDataOptions['modeled_historical_median'].name,
						type: chartDataOptions['modeled_historical_median'].type,
						data: sortByTimestamp(data.modeled_historical_median),
						color: chartDataOptions['modeled_historical_median']
							.color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_range' },
						name: chartDataOptions['modeled_historical_range'].name,
						type: chartDataOptions['modeled_historical_range'].type,
						data: sortByTimestamp(data.modeled_historical_range),
						color: chartDataOptions['modeled_historical_range']
							.color,
						fillOpacity: 0.5,
						lineWidth: 0,
						zIndex: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp26_median' },
						name: chartDataOptions['rcp26_median'].name,
						type: chartDataOptions['rcp26_median'].type,
						data: sortByTimestamp(data.rcp26_median),
						color: chartDataOptions['rcp26_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp26_range' },
						name: chartDataOptions['rcp26_range'].name,
						type: chartDataOptions['rcp26_range'].type,
						data: sortByTimestamp(data.rcp26_range),
						color: chartDataOptions['rcp26_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp45_median' },
						name: chartDataOptions['rcp45_median'].name,
						type: chartDataOptions['rcp45_median'].type,
						data: sortByTimestamp(data.rcp45_median),
						color: chartDataOptions['rcp45_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp45_range' },
						name: chartDataOptions['rcp45_range'].name,
						type: chartDataOptions['rcp45_range'].type,
						data: sortByTimestamp(data.rcp45_range),
						color: chartDataOptions['rcp45_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp85_median' },
						name: chartDataOptions['rcp85_median'].name,
						type: chartDataOptions['rcp85_median'].type,
						data: sortByTimestamp(data.rcp85_median),
						color: chartDataOptions['rcp85_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp85_range' },
						name: chartDataOptions['rcp85_range'].name,
						type: chartDataOptions['rcp85_range'].type,
						data: sortByTimestamp(data.rcp85_range),
						color: chartDataOptions['rcp85_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
				];
			case 'cmip6':
				return [
					{
						custom: { key: 'observations' },
						name: chartDataOptions['observations'].name,
						type: chartDataOptions['observations'].type,
						data: sortByTimestamp(data.observations),
						color: chartDataOptions['observations'].color,
						lineWidth: 1.5,
						dashStyle: 'ShortDash',
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_median' },
						name: chartDataOptions['modeled_historical_median'].name,
						type: chartDataOptions['modeled_historical_median'].type,
						data: sortByTimestamp(data.modeled_historical_median),
						color: chartDataOptions['modeled_historical_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_range' },
						name: chartDataOptions['modeled_historical_range'].name,
						type: chartDataOptions['modeled_historical_range'].type,
						data: sortByTimestamp(data.modeled_historical_range),
						color: chartDataOptions['modeled_historical_range'].color,
						fillOpacity: 0.3,
						lineWidth: 0,
						zIndex: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp126_median' },
						name: chartDataOptions['ssp126_median'].name,
						type: chartDataOptions['ssp126_median'].type,
						data: sortByTimestamp(data.ssp126_median),
						color: chartDataOptions['ssp126_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp126_range' },
						name: chartDataOptions['ssp126_range'].name,
						type: chartDataOptions['ssp126_range'].type,
						data: sortByTimestamp(data.ssp126_range),
						color: chartDataOptions['ssp126_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp245_median' },
						name: chartDataOptions['ssp245_median'].name,
						type: chartDataOptions['ssp245_median'].type,
						data: sortByTimestamp(data.ssp245_median),
						color: chartDataOptions['ssp245_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp245_range' },
						name: chartDataOptions['ssp245_range'].name,
						type: chartDataOptions['ssp245_range'].type,
						data: sortByTimestamp(data.ssp245_range),
						color: chartDataOptions['ssp245_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp370_median' },
						name: chartDataOptions['ssp370_median'].name,
						type: chartDataOptions['ssp370_median'].type,
						data: sortByTimestamp(data.ssp370_median),
						color: chartDataOptions['ssp370_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp370_range' },
						name: chartDataOptions['ssp370_range'].name,
						type: chartDataOptions['ssp370_range'].type,
						data: sortByTimestamp(data.ssp370_range),
						color: chartDataOptions['ssp370_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp585_median' },
						name: chartDataOptions['ssp585_median'].name,
						type: chartDataOptions['ssp585_median'].type,
						data: sortByTimestamp(data.ssp585_median),
						color: chartDataOptions['ssp585_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp585_range' },
						name: chartDataOptions['ssp585_range'].name,
						type: chartDataOptions['ssp585_range'].type,
						data: sortByTimestamp(data.ssp585_range),
						color: chartDataOptions['ssp585_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
				];
			default:
				return [];
		}
	}
};
