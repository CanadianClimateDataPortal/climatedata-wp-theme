import L from 'leaflet';
import type { LatLngExpression, LatLngBounds } from 'leaflet';
import { ColourScheme, DatasetKey, EmissionScenarioKey } from '@/types/types';

export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export const GEOSERVER_BASE_URL: string = 'https://dataclimatedata.crim.ca';
// TODO: this should probably be a L.latLng object instead
export const CANADA_CENTER: LatLngExpression = [
	62.51231793838694, -98.48144531250001,
];
export const CANADA_BOUNDS: LatLngBounds = L.latLngBounds(
	L.latLng(41, -141.1),
	L.latLng(83.6, -49.9)
);

export const DEFAULT_ZOOM: number = 4;
export const DEFAULT_MIN_ZOOM: number = 3;
export const DEFAULT_MAX_ZOOM: number = 11;

/**
 * "29" as the length of the year window. Used in the timeControl slider component
 */
export const SLIDER_YEAR_WINDOW_SIZE: number = 29;
export const SLIDER_MIN_YEAR: number = 1950;
export const SLIDER_MAX_YEAR: number = 2100;
export const SLIDER_STEP: number = 1;
export const SLIDER_DEFAULT_YEAR_VALUE: number = 1971;

export const SEARCH_PLACEHOLDER: string =
	'Zoom to a location, region, city, coordinates...';
export const SEARCH_DEFAULT_ZOOM: number = 10;
export const LOCATION_SEARCH_ENDPOINT: string =
	'/wp-json/cdc/v2/location_search/?q={s}';
export const OWS_FORMAT: string = 'image/png';

export const REGION_GRID: string = 'gridded_data';
export const REGION_CENSUS: string = 'census';
export const REGION_HEALTH: string = 'health';
export const REGION_WATERSHED: string = 'watershed';

const rootElement = document.getElementById('root');
export const WP_API_DOMAIN = (rootElement?.getAttribute('data-wp-home-url')) ?? 'https://dev-en.climatedata.ca';

// TODO: these will come from the API..
//  also, "high" key has the value that in the figma designs is set for "very-high", and
//  the value for "high" from the designs doesn't seem to work, so these below are the
//  ones used in the original implementation
export const SCENARIO_NAMES: Record<
	DatasetKey,
	Record<EmissionScenarioKey, string>
> = {
	cmip5: {
		low: 'RCP 2.6',
		medium: 'RCP 4.5',
		high: 'RCP 8.5',
	},
	cmip6: {
		low: 'SSP 1–2.6',
		medium: 'SSP 2–4.5',
		high: 'SSP 5–8.5',
	},
	humidex: {
		low: 'SSP 1–2.6',
		medium: 'SSP 2–4.5',
		high: 'SSP 5–8.5',
	},
};

// TODO: these will come from the API
export const DATASETS: Record<
	DatasetKey,
	{
		layer_prefix?: string;
		scenarios: {
			name: string;
			label: string;
			chart_color: string;
			correlations?: Partial<Record<DatasetKey, string>>;
		}[];
		grid: string;
		finch_name: string;
		model_lists: {
			name: string;
			label: string;
		}[];
	}
> = {
	cmip5: {
		scenarios: [
			{
				name: 'rcp26',
				label: 'RCP 2.6',
				chart_color: '#00F',
				correlations: {
					cmip6: 'ssp126',
				},
			},
			{
				name: 'rcp45',
				label: 'RCP 4.5',
				chart_color: '#00640c',
				correlations: {
					cmip6: 'ssp245',
				},
			},
			{
				name: 'rcp85',
				label: 'RCP 8.5',
				chart_color: '#F00',
				correlations: {
					cmip6: 'ssp585',
				},
			},
		],
		layer_prefix: '',
		grid: 'canadagrid',
		finch_name: 'candcs-u5',
		model_lists: [
			{ name: 'pcic12', label: 'PCIC12 (Ensemble)' },
			{ name: '24models', label: 'All models' },
		],
	},
	cmip6: {
		scenarios: [
			{
				name: 'ssp126',
				label: 'SSP1-2.6',
				chart_color: '#00F',
				correlations: {
					cmip5: 'rcp26',
				},
			},
			{
				name: 'ssp245',
				label: 'SSP2-4.5',
				chart_color: '#00640c',
				correlations: {
					cmip5: 'rcp45',
				},
			},
			{
				name: 'ssp585',
				label: 'SSP5-8.5',
				chart_color: '#F00',
				correlations: {
					cmip5: 'rcp85',
				},
			},
		],
		layer_prefix: 'cmip6-',
		grid: 'canadagrid',
		finch_name: 'candcs-u6',
		model_lists: [{ name: '26models', label: 'All models' }],
	},
	humidex: {
		scenarios: [
			{
				name: 'ssp126',
				label: 'SSP1-2.6',
				chart_color: '#00F',
			},
			{
				name: 'ssp245',
				label: 'SSP2-4.5',
				chart_color: '#00640c',
			},
			{
				name: 'ssp585',
				label: 'SSP5-8.5',
				chart_color: '#F00',
			},
		],
		layer_prefix: '',
		grid: 'era5landgrid',
		finch_name: 'humidex-daily',
		model_lists: [{ name: 'humidex_models', label: 'All models' }],
	},
};

export const DEFAULT_COLOUR_SCHEMES: Record<string, ColourScheme> = {
	temp_seq: {
		type: 'sequential',
		colours: ["#FEFECB", "#FDF6B5", "#FBED9E", "#F9E286", "#F5D470", "#F1C35F", "#EEB257", "#EAA253", "#E79352", "#E38450", "#DE744F", "#D3644D", "#C25449", "#AC4944", "#95413D", "#7E3B34", "#68342A", "#522D1F", "#3E2616", "#2B200D", "#191900"],
	},
	prec_seq: {
		type: 'sequential',
		colours: ["#FFFFE5", "#EEF6DD", "#DDEDD6", "#CCE4CF", "#BBDCC8", "#AAD3C1", "#9ACBBA", "#89C2B2", "#78B9AB", "#67B1A4", "#56A89D", "#459F96", "#34968E", "#2E8B83", "#278077", "#21746B", "#1A695F", "#135E53", "#0D5247", "#06473B", "#003C30"],
	},
	misc_seq_3: {
		type: 'sequential',
		colours: ["#001959", "#07265B", "#0D335D", "#11415F", "#184E61", "#225B5F", "#32665A", "#446F51", "#577547", "#6A7B3C", "#7F8133", "#97872D", "#B28D32", "#CC9241", "#E39757", "#F39E71", "#FBA68D", "#FDAFA7", "#FDB8C2", "#FCC2DD", "#FACCFA"],
	},
	temp_div: {
		type: 'divergent',
		colours: ["#053061", "#144879", "#246192", "#337AAA", "#4393C3", "#61A3CB", "#7FB5D4", "#9EC6DE", "#BCD6E6", "#DAE8F0", "#F8F8F8", "#F3DFDC", "#EDC5BF", "#E7ACA3", "#E19286", "#DB7969", "#D6604C", "#BA4841", "#9E3036", "#82182A", "#67001F"],
	},
	prec_div: {
		type: 'divergent',
		colours: ["#543005", "#6E440F", "#895819", "#A46C23", "#BF812C", "#C8944F", "#D2A971", "#DCBD93", "#E5D1B4", "#EFE4D7", "#F8F8F7", "#D8E8E7", "#B7D8D5", "#97C8C3", "#76B7B2", "#55A7A0", "#35978F", "#278077", "#1A695F", "#0D5247", "#003C30"],
	},
	misc_div: {
		type: 'divergent',
		colours: ["#081D58", "#1F2F88", "#234DA0", "#1F72B1", "#2498C0", "#41B6C3", "#73C8BC", "#AADEB6", "#D6EFB2", "#F0F9B9", "#FEFED1", "#FFF0A9", "#FEE187", "#FEC965", "#FDAA48", "#FD8D3C", "#FC5A2D", "#ED2F21", "#D30F1F", "#B00026", "#800026"],
	},
}
