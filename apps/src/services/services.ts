// Any kind of service that you want to use in your application should be defined here.
// For example, any external request to an API, or any kind of data manipulation.

import {
	ApiPostData,
	ChartDataOptions,
	ChoroValuesOptions,
	DeltaValuesOptions,
	FetchOptions,
	MapInfoData,
	Sector,
	TaxonomyData,
	WMSLegendData,
} from '@/types/types';
import L from 'leaflet';

import {
	GEOSERVER_BASE_URL,
	WP_API_DOMAIN,
	WP_API_LOCATION_BY_COORDS_PATH,
	WP_API_VARIABLE_PATH,
} from '@/lib/constants';
import {
	FrequencyType,
	InteractiveRegionOption,
	S2DFrequencyType,
} from '@/types/climate-variable-interface';
import {
	normalizeForApiFrequencyName,
	normalizeForApiVariableId,
	LocationS2DData,
} from '@/lib/s2d';
import { AbstractError } from '@/lib/errors';

// Cache for API responses to avoid duplicate requests
const apiCache = new Map<string, unknown>();

/**
 * Checks if a fetch request was aborted, using its fetchOptions.
 *
 * @param fetchOptions - The fetchOptions object passed to the fetch request.
 *   Can be undefined.
 */
const isAborted = (fetchOptions?: FetchOptions): boolean => {
	return fetchOptions?.signal?.aborted ?? false;
}

/**
 * Error returned by fetch functions of this module in case of a request error.
 */
export class FetchError extends AbstractError {
 constructor(message: string, options?: ErrorOptions) {
   super(message, options);
   this.name = 'FetchError';
 }
}

/**
 * Send a GET JSON request and return the parsed JSON response.
 *
 * If the request is aborted (e.g. through a `signal` in `fetchOptions`), the
 * function will return `null` immediately. No error will be thrown.
 *
 * @param url - The URL to fetch. GET parameters can be specified in the
 *              `params` parameter.
 * @param params - GET parameters to set in the URL.
 * @param fetchOptions - Additional options to pass to the fetch request.
 * @returns A promise that resolves to the parsed JSON response. If the request
 *     is aborted, the promise resolves to `null`.
 * @throws FetchError - If the request failed.
 */
export const fetchJSON = async <T = any>(
	url: string,
	params?: Record<string, string>,
	fetchOptions?: FetchOptions,
): Promise<T | null> => {
	let fetchUrl = url;
	let response: Response;

	if (params) {
		fetchUrl += `?${new URLSearchParams(params).toString()}`;
	}

	try {
		response = await fetch(
			fetchUrl,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				...fetchOptions,
			}
		);

		if (!response.ok) {
			throw new Error(
				`HTTP error ${response.status}: ${response.statusText}`
			);
		}

		return await response.json() as T;
	} catch (error) {
		const originalError = error as Error;
		// In case of fetch abort, we return null immediately, we don't throw
		// an error.
		if (originalError.name === 'AbortError') {
			return null;
		} else {
			throw new FetchError(
				`Error fetching and parsing ${url}`,
				{ cause: originalError },
			);
		}
	}
}

/**
 * Send a GET JSON request to the WordPress API and return the parsed JSON response.
 *
 * @param endpoint - The endpoint to query, e.g. /wp-json/wp/v2/posts
 * @param params - GET parameters to set in the URL.
 * @param fetchOptions - Additional options to pass to the fetch request.
 * @returns A promise that resolves to the parsed JSON response. If the request
 *     is aborted, the promise resolves to `null`.
 */
export const queryWordPressAPI = async <T = any>(
	endpoint: string,
	params?: Record<string, string>,
	fetchOptions?: FetchOptions,
): Promise<T | null> => {
	let fetchEndpoint = endpoint;

	if (!fetchEndpoint.startsWith('/')) {
		fetchEndpoint = `/${fetchEndpoint}`;
	}

	return await fetchJSON<T>(
		`${WP_API_DOMAIN}${fetchEndpoint}`,
		params,
		fetchOptions,
	);
}

/**
 * Send a GET JSON request to the "Data"" API and return the parsed JSON response.
 *
 * @param endpoint - The endpoint to query, e.g. /generate-charts/
 * @param params - GET parameters to set in the URL.
 * @param fetchOptions - Additional options to pass to the fetch request.
 * @returns A promise that resolves to the parsed JSON response. If the request
 *     is aborted, the promise resolves to `null`.
 */
export const queryDataAPI = async <T = any>(
	endpoint: string,
	params?: Record<string, string>,
	fetchOptions?: FetchOptions,
): Promise<T | null> => {
	let fetchEndpoint = endpoint;

	if (!fetchEndpoint.startsWith('/')) {
		fetchEndpoint = `/${fetchEndpoint}`;
	}

	return await fetchJSON<T>(
		`${window.DATA_URL}${fetchEndpoint}`,
		params,
		fetchOptions,
	);
}

/**
 * Fetches WordPress variable data by post ID from the custom WP REST API endpoint.
 * Processes and normalizes the response into a structured MapInfoData object,
 * including sectors, trainings, featured image, and dataset taxonomy terms.
 */
export const fetchMapInfoData = async (
	postId: number,
	fetchOptions?: FetchOptions,
): Promise<MapInfoData | null> => {
	const cacheKey = `wp_data_${postId}`;

	// Check cache first
	if (apiCache.has(cacheKey)) {
		return apiCache.get(cacheKey) as MapInfoData;
	}

	// Make the Fetch request.
	const data = await queryWordPressAPI(
		WP_API_VARIABLE_PATH,
		{ post_id: String(postId) },
		fetchOptions,
	);

	if (isAborted(fetchOptions)) {
		return null;
	}

	const content = data?.variable?.meta?.content;
	const taxonomy = data?.variable?.meta?.taxonomy;
	// @todo Add fallback for empty dataset.
	const dataset = taxonomy?.['variable-dataset']?.terms;

	// Map sectors if available and valid.
	// @todo Add dynamic lear URL and slug.
	const baseLearnUrl = '/learn/?q=sector:';
	const sectors = Array.isArray(content?.relevant_sectors)
		? content.relevant_sectors.map((item: Sector) => {
				const slug = item.name.en
					.toLowerCase()
					.replace(/\s+/g, '-');
				const link = `${baseLearnUrl}${slug}`;
				return {
					...item,
					link,
				};
			})
		: [];

	// Generate the mapInfo object.
	const mapInfo: MapInfoData = {
		title: content?.title || { en: '', fr: '' },
		tagline: content?.tagline || { en: '', fr: '' },
		fullDescription: content?.full_description || { en: '', fr: '' },
		techDescription: content?.tech_description || { en: '', fr: '' },
		relevantSectors: sectors,
		relevantTrainings: Array.isArray(content?.relevant_trainings)
			? content.relevant_trainings
			: [],
		featuredImage: content?.featured_image || {
			thumbnail: '',
			medium: '',
			large: '',
			full: '',
		},
		dataset: Array.isArray(dataset) ? dataset : [],
	};

	const result = mapInfo;

	// Cache the result
	apiCache.set(cacheKey, result);

	return result;
};

export const fetchLegendData = async (
	layerValue?: string,
	layerStyles?: string,
	fetchOptions?: FetchOptions,
): Promise<WMSLegendData | null> => {
	const params: Record<string, string> = {
		service: 'WMS',
		version: '1.1.0',
		request: 'GetLegendGraphic',
		format: 'application/json',
		layer: layerValue ?? '',
	};

	if (layerStyles) {
		params['style'] = layerStyles;
	}

	return await fetchJSON<WMSLegendData>(
		`${GEOSERVER_BASE_URL}/geoserver/wms`,
		params,
		fetchOptions,
	);
};

/**
 * Fetches taxonomy data from the API
 *
 * @param slug - the taxonomy slug
 * @param app - the section where to load the terms
 * @param filters - the filters to apply to the data
 * @param fetchOptions Any other options to pass to all fetch requests (ex: `signal`)
 */
export const fetchTaxonomyData = async (
	slug: string,
	app: 'map'|'download' = 'map',
	filters?: Record<string, string | number | null>,
	fetchOptions?: FetchOptions,
): Promise<TaxonomyData[]> => {
	try {
		// Create cache key based on slug and filters
		const cacheKey = `taxonomy_${slug}_${JSON.stringify(filters)}`;

		// Check cache first
		if (apiCache.has(cacheKey)) {
			return apiCache.get(cacheKey) as TaxonomyData[];
		}

		// Extract the taxonomy info from the variable response
		// For sector and var-type, we need to get them from the dataset's variables list
		if (slug === 'sector' || slug === 'var-type') {
			// Use datasets-list to get the first dataset
			const datasetsData = await queryWordPressAPI(
				'/wp-json/cdc/v3/datasets-list',
				{ app: app },
				fetchOptions,
			);

			if (isAborted(fetchOptions)) {
				return [];
			}

			const firstDataset = datasetsData?.datasets?.terms?.[0];

			if (!firstDataset || !firstDataset.term_id) {
				throw new Error('No datasets found');
			}

			// Now get variables for this dataset to extract taxonomies
			const variablesData = await queryWordPressAPI(
				'/wp-json/cdc/v3/variables-list',
				{
					app: app,
					variable_dataset_term_id: firstDataset.term_id,
				},
				fetchOptions
			);

			if (isAborted(fetchOptions)) {
				return [];
			}

			// Extract unique taxonomy terms from all variables
			const termMap = new Map<number, TaxonomyData>();

			if (
				variablesData &&
				variablesData.variables &&
				Array.isArray(variablesData.variables)
			) {
				variablesData.variables.forEach((variable: ApiPostData) => {
					const taxonomy = variable.meta?.taxonomy?.[slug];
					if (taxonomy && Array.isArray(taxonomy.terms)) {
						taxonomy.terms.forEach((term: TaxonomyData) => {
							if (term.term_id && !termMap.has(term.term_id)) {
								termMap.set(term.term_id, term);
							}
						});
					}
				});
			}

			// Convert map to array
			const taxonomyList = Array.from(termMap.values());

			// Cache and return the results
			apiCache.set(cacheKey, taxonomyList);
			return taxonomyList;
		}

		// For other taxonomies, use the normal pattern

		// Fetch data from the API
		const data = await queryWordPressAPI(
			`/wp-json/cdc/v3/${slug}-list`,
			{ app: app },
			fetchOptions,
		);

		if (isAborted(fetchOptions)) {
			return [];
		}

		// Extract terms from the response as per the API structure
		let terms: TaxonomyData[] = [];

		if (data && data[slug] && Array.isArray(data[slug].terms)) {
			terms = data[slug].terms;
		}

		// Applying filters if provided
		let result = terms;
		if (filters) {
			result = terms.filter((item) => {
				return Object.keys(filters).every((key) => {
					const filterValue = filters[key];
					// Skip filtering if value is falsy
					if (!filterValue) {
						return true;
					}
					return item[key as keyof TaxonomyData] === filterValue;
				});
			});
		}

		// Cache the result
		apiCache.set(cacheKey, result);

		return result;
	} catch (error) {
		console.error('Error fetching taxonomy data:', error);
		return [];
	}
};

/**
 * Fetches posts data from the API
 * @param postType - the post type to fetch
 * @param dataset - the dataset
 * @param filters - the filters to apply to the data
 * @param section - the section we are in (e.g. map, download)
 * @param fetchOptions - any other options to pass to fetch() requests (ex: `signal`)
 */
export const fetchPostsData = async (
	postType: string,
	section: string,
	dataset: TaxonomyData,
	filters: Record<string, string | number | null>,
	fetchOptions?: FetchOptions,
): Promise<ApiPostData[]> => {
	try {
		const { term_id } = dataset;

		// Create cache key based on postType, section and dataset
		// We don't include filters since we're doing filtering client-side now
		const cacheKey = `posts_${postType}_${section}_${term_id}`;

		// Check cache first
		if (apiCache.has(cacheKey)) {
			return apiCache.get(cacheKey) as ApiPostData[];
		}

		// Build the query parameters - only include essential parameters
		const queryParams: Record<string, string> = {
			app: section,
			variable_dataset_term_id: String(term_id),
		};

		// Add search parameter if provided (since it can reduce the payload size)
		if (
			filters.search &&
			typeof filters.search === 'string' &&
			filters.search.trim()
		) {
			queryParams['search'] = filters.search.trim();
		}

		// Fetch the data
		type FetchedPostData = { [key: string]: ApiPostData[] };
		const data = await queryWordPressAPI<FetchedPostData|null>(
			`/wp-json/cdc/v3/${postType}-list`,
			queryParams,
			fetchOptions,
		);

		if (isAborted(fetchOptions)) {
			return [];
		}

		// Return the data if it exists in the expected format
		let result: ApiPostData[] = [];
		if (data && data[postType] && Array.isArray(data[postType])) {
			// Filter out items without an id
			result = data[postType].filter((item: ApiPostData) => item.id);
		}

		// Cache the result
		apiCache.set(cacheKey, result);

		return result;
	} catch (error) {
		console.error('Error fetching posts data:', error);
		return [];
	}
};

/**
 * Fetches location data from the API
 *
 * @param latlng Latitude and Longitude of the location
 * @param fetchOptions Any other options to pass to fetch (ex: `signal`)
 */
export const fetchLocationByCoords = async (
	latlng: L.LatLng | { lat: number; lng: number },
	fetchOptions?: FetchOptions,
) => {
	return await queryWordPressAPI(
		WP_API_LOCATION_BY_COORDS_PATH,
		{
			lat: String(latlng.lat),
			lng: String(latlng.lng),
			sealevel: 'false',
		},
		fetchOptions,
	);
};

/**
 * Generates chart data from the API
 *
 * @param options Options to pass to the API
 * @param fetchOptions Any other options to pass to fetch (ex: `signal`)
 */
export const generateChartData = async (options: ChartDataOptions, fetchOptions?: FetchOptions) => {
	const { 
		interactiveRegion,
		latlng,
		featureId,
		dataset,
		variable,
		frequency,
		unitDecimals
	} = options;
// 
	let fetchUrl = '';

	if(interactiveRegion == InteractiveRegionOption.GRIDDED_DATA) {
		// For gridded data
		if(latlng === undefined) return null;

		const {lat, lng} = latlng;
		fetchUrl += `/generate-charts/${lat}/${lng}`;
	} else {
		// For other interactive regions
		if(featureId === undefined) return null;

		fetchUrl += `/generate-regional-charts/${interactiveRegion}/${featureId}`;
	}

	fetchUrl += `/${variable}/${frequency}`;

	return await queryDataAPI(
		fetchUrl,
		{
			decimals: String(unitDecimals),
			dataset_name: dataset,
		},
		fetchOptions,
	);
};

/**
 * Generates chart data from the API
 *
 * @param stationId Station for which to fetch data
 * @param normalId ID of the normal data to fetch
 * @param fetchOptions Any other options to pass to fetch (ex: `signal`)
 */
export const fetchMSCClimateNormalsChartData = async (stationId: string, normalId: number, fetchOptions?: FetchOptions) => {
	return await fetchJSON(
		'https://api.weather.gc.ca/collections/climate-normals/items',
		{
			f: 'json',
			CLIMATE_IDENTIFIER: stationId,
			NORMAL_ID: String(normalId),
			sortby: 'MONTH',
		},
		fetchOptions,
	);
};

/**
 * Fetches delta values from the API, used to give data to a map cell tooltip.
 *
 * @param options Options to pass to the API
 * @param fetchOptions Any other options to pass to fetch (ex: `signal`)
 */
export const fetchDeltaValues = async (options: DeltaValuesOptions, fetchOptions?: FetchOptions) => {
	try {
		const { endpoint, varName, frequency, params } = options;
		let url = `/${endpoint}`;
		if(varName !== null) url += `/${varName}`;
		if(frequency !== null) url += `/${frequency}`;

		return await queryDataAPI(
			url,
			params,
			fetchOptions,
		);
	} catch (err) {
		console.error('Failed to fetch', err);
		return null;
	}
};

/**
 * Fetches choro values from the API.
 *
 * @param options Options to pass to the API
 * @param fetchOptions Any other options to pass to fetch (ex: `signal`)
 */
export const fetchChoroValues = async (options: ChoroValuesOptions, fetchOptions?: FetchOptions) => {
	const urlPath = [
		options.interactiveRegion,
		options.variable,
		options.emissionScenario,
		options.frequency,
	].join('/');

	const params = {
		period: String(parseInt(options.decade) + 1),
		dataset_name: options.dataset,
		decimals: String(options.decimals),
		delta7100: options.isDelta7100 ? 'true' : 'false',
	};

	return await queryDataAPI(
		`/get-choro-values/${urlPath}/`,
		params,
		fetchOptions,
	);
};

/**
 * Fetches the list of climate stations from the API.
 *
 * @returns A list of stations with their names, ids and coords.
 */
export const fetchStationsList = async ({ threshold }: { threshold?: string }, fetchOptions?: FetchOptions) => {
	let data: any;

	if (threshold === 'ahccd') {
		data = await queryDataAPI(
			'/fileserver/ahccd/ahccd.json',
			undefined,
			fetchOptions,
		);
	} else if (threshold === 'bdv') {
		data = await queryDataAPI(
			'/fileserver/bdv/bdv.json',
			undefined,
			fetchOptions,
		);
	} else if (threshold === 'station-data') {
		data = await fetchJSON(
			'https://api.weather.gc.ca/collections/climate-stations/items',
			{
				f: 'json',
				limit: '10000',
				properties: 'STATION_NAME,STN_ID,LATITUDE,LONGITUDE',
			},
			fetchOptions,
		);
	} else if (threshold === 'idf') {
		data = await queryDataAPI(
			'/fileserver/idf/idf_curves.json',
			undefined,
			fetchOptions,
		);
	} else {
		data = await fetchJSON(
			'https://api.weather.gc.ca/collections/climate-stations/items',
			{
				f: 'json',
				limit: '10000',
				properties: 'STATION_NAME,STN_ID',
				offset: '0',
				HAS_NORMALS_DATA: 'Y',
			},
			fetchOptions,
		);
	}

	if (isAborted(fetchOptions)) {
		return [];
	}

	return (data?.features ?? []).map((feature: any) => ({
		id: String(feature.properties?.ID ?? ((threshold === 'station-data') ? feature.properties?.STN_ID : feature?.id)),
		name: feature.properties?.STATION_NAME ?? feature.properties?.Name ?? feature.properties?.Location,
		type: feature.properties?.type,
		coordinates: {
			lat: feature.geometry.coordinates[1],
			lng: feature.geometry.coordinates[0],
		},
		filename: feature.properties?.filename,
	}));
};

/**
 * Fetch the release date of a S2D variable.
 *
 * @param variable - The S2D variable ID.
 * @param frequency - The frequency for which we want the release date.
 * @param fetchOptions - Any other options to pass to fetch() requests (ex: `signal`)
 * @returns The release date as a string, or null if the request is aborted.
 */
export const fetchS2DReleaseDate = async (
	variable: string,
	frequency: S2DFrequencyType | string,
	fetchOptions?: FetchOptions,
): Promise<string | null> => {
	const argVariableName = normalizeForApiVariableId(variable);
	const argFrequencyName = normalizeForApiFrequencyName(frequency);

	return await queryDataAPI(
		`/get-s2d-release-date/${argVariableName}/${argFrequencyName}`,
		undefined,
		fetchOptions,
	);
}

/**
 * Fetch the location data for a S2D variable.
 *
 * @param latlng - Location coordinates.
 * @param variableId - ID of the S2D variable.
 * @param frequency - Frequency for which we want the data.
 * @param period - Period for which we want the data.
 * @param fetchOptions - Any other options to pass to fetch() requests (ex: `signal`)
 * @returns The location data, or null if the request is aborted.
 */
export const fetchS2DLocationData = async (
	latlng: L.LatLng,
	variableId: string,
	frequency: FrequencyType,
	period: Date,
	fetchOptions?: FetchOptions
): Promise<LocationS2DData | null> => {
	const argVariableName = normalizeForApiVariableId(variableId);
	const argFrequencyName = normalizeForApiFrequencyName(frequency);
	const argLat = latlng.lat.toFixed(6);
	const argLon = latlng.lng.toFixed(6);

	return await queryDataAPI(
		`/get-s2d-gridded-values/${argLat}/${argLon}/${argVariableName}/${argFrequencyName}`,
		{
			period: `${period.getUTCFullYear()}-${String(period.getUTCMonth() + 1).padStart(2, '0')}`,
		},
		fetchOptions,
	);
}
