// Any kind of service that you want to use in your application should be defined here.
// For example any external request to an API, or any kind of data manipulation.

import {
	MapInfoData,
	Sector,
	TaxonomyData,
	ApiPostData,
	ChartDataOptions,
	DeltaValuesOptions,
	ChoroValuesOptions,
} from '@/types/types';
import L from 'leaflet';

import {GEOSERVER_BASE_URL, WP_API_DOMAIN, WP_API_LOCATION_BY_COORDS_PATH, WP_API_VARIABLE_PATH} from '@/lib/constants';
import { InteractiveRegionOption } from '@/types/climate-variable-interface';

// Cache for API responses to avoid duplicate requests
const apiCache = new Map<string, any>();

/**
 * Fetches WordPress variable data by post ID from the custom WP REST API endpoint.
 * Processes and normalizes the response into a structured MapInfoData object,
 * including sectors, trainings, featured image, and dataset taxonomy terms.
 */
export const fetchWPData = async (postId: number) => {
	try {
		const cacheKey = `wp_data_${postId}`;

		// Check cache first
		if (apiCache.has(cacheKey)) {
			return apiCache.get(cacheKey);
		}

		// Make the Fetch request.
		const response = await fetch(
			`${WP_API_DOMAIN}${WP_API_VARIABLE_PATH}?post_id=${postId}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		);

		// Handle HTTP errors
		if (!response.ok) {
			const errorDetails = await response.json();
			throw new Error(
				`HTTP error ${response.status}: ${response.statusText} - ${errorDetails}`
			);
		}

		// Parse response JSON
		const data = await response.json();
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

		const result = { mapInfo };

		// Cache the result
		apiCache.set(cacheKey, result);

		return result;
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
};

export const fetchLegendData = async (url: string) => {
	return await fetch(url)
		.then((res) => {
			if (!res.ok) {
				throw new Error('Failed to fetch data');
			}
			return res.json();
		})
		.then((json) => json);
};

/**
 * Fetches taxonomy data from the API
 * @param slug - the taxonomy slug
 * @param app - the section where to load the terms
 * @param filters - the filters to apply to the data
 */
export const fetchTaxonomyData = async (
	slug: string,
	app: 'map'|'download' = 'map',
	filters?: Record<string, string | number | null>,
): Promise<TaxonomyData[]> => {
	try {
		// Create cache key based on slug and filters
		const cacheKey = `taxonomy_${slug}_${JSON.stringify(filters)}`;

		// Check cache first
		if (apiCache.has(cacheKey)) {
			return apiCache.get(cacheKey);
		}

		// Extract the taxonomy info from the variable response
		// For sector and var-type, we need to get them from the dataset's variables list
		if (slug === 'sector' || slug === 'var-type') {
			// Use datasets-list to get the first dataset
			const datasetsResponse = await fetch(
				`${WP_API_DOMAIN}/wp-json/cdc/v3/datasets-list?app=${app}`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				}
			);

			if (!datasetsResponse.ok) {
				throw new Error(
					`Failed to fetch datasets: ${datasetsResponse.statusText}`
				);
			}

			const datasetsData = await datasetsResponse.json();
			const firstDataset = datasetsData.datasets?.terms?.[0];

			if (!firstDataset || !firstDataset.term_id) {
				throw new Error('No datasets found');
			}

			// Now get variables for this dataset to extract taxonomies
			const variablesResponse = await fetch(
				`${WP_API_DOMAIN}/wp-json/cdc/v3/variables-list?app=${app}&variable_dataset_term_id=${firstDataset.term_id}`,
				{
					method: 'GET',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				}
			);

			if (!variablesResponse.ok) {
				throw new Error(
					`Failed to fetch variables: ${variablesResponse.statusText}`
				);
			}

			const variablesData = await variablesResponse.json();

			// Extract unique taxonomy terms from all variables
			const termMap = new Map<number, TaxonomyData>();

			if (
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
		const url = `${WP_API_DOMAIN}/wp-json/cdc/v3/${slug}-list?app=${app}`;

		// Fetch data from the API
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch taxonomy data: ${response.statusText}`
			);
		}

		const data = await response.json();

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
 */
export const fetchPostsData = async (
	postType: string,
	section: string,
	dataset: TaxonomyData,
	filters: Record<string, string | number | null>
): Promise<ApiPostData[]> => {
	try {
		const { term_id } = dataset;

		// Create cache key based on postType, section and dataset
		// We don't include filters since we're doing filtering client-side now
		const cacheKey = `posts_${postType}_${section}_${term_id}`;

		// Check cache first
		if (apiCache.has(cacheKey)) {
			return apiCache.get(cacheKey);
		}

		// Build the query parameters - only include essential parameters
		const queryParams = new URLSearchParams();
		queryParams.append('app', section);
		queryParams.append('variable_dataset_term_id', String(term_id));

		// Add search parameter if provided (since it can reduce the payload size)
		if (
			filters.search &&
			typeof filters.search === 'string' &&
			filters.search.trim()
		) {
			queryParams.append('search', filters.search.trim());
		}

		const url = `${WP_API_DOMAIN}/wp-json/cdc/v3/${postType}-list?${queryParams.toString()}`;

		// Fetch the data
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch posts data: ${response.statusText}`
			);
		}

		const data = await response.json();

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

// Method to clear cache for a specific key or all keys
export const clearApiCache = (key?: string): void => {
	key ? apiCache.delete(key) : apiCache.clear();
};

/**
 * Fetches location data from the API
 *
 * @param latlng Latitude and Longitude of the location
 */
export const fetchLocationByCoords = async (latlng: L.LatLng | { lat: number; lng: number }) => {
	try {
		// Make the Fetch request.
		const response = await fetch(`${WP_API_DOMAIN}${WP_API_LOCATION_BY_COORDS_PATH}?lat=${latlng.lat}&lng=${latlng.lng}&sealevel=false`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		});

		// Handle HTTP errors
		if (!response.ok) {
			const errorDetails = await response.json();
			throw new Error(`HTTP error ${response.status}: ${response.statusText} - ${errorDetails}`);
		}

		// Parse response JSON
		return await response.json();
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
};

/**
 * Generates chart data from the API
 *
 * @param options Options to pass to the API
 */
export const generateChartData = async (options: ChartDataOptions) => {
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
	let fetchUrl = `${window.DATA_URL}`;

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

	fetchUrl += `/${variable}/${frequency}?decimals=${unitDecimals}&dataset_name=${dataset}`;
	const response = await fetch(fetchUrl);

	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}

	return await response.json();
};

/**
 * Generates chart data from the API
 *
 * @param options Options to pass to the API
 */
export const fetchMSCClimateNormalsChartData = async (stationId: string, normalId: number) => {
	const response = await fetch(`https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=${stationId}&NORMAL_ID=${normalId}&sortby=MONTH`);

	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}

	return await response.json();
};

/**
 * Fetches delta values from the API, used to give data to a map cell tooltip.
 *
 * @param options Options to pass to the API
 */
export const fetchDeltaValues = async (options: DeltaValuesOptions) => {
	try {
		const { endpoint, varName, frequency, params } = options;
		let url = `${GEOSERVER_BASE_URL}/${endpoint}`;
		if(varName !== null) url += `/${varName}`;
		if(frequency !== null) url += `/${frequency}`;
		url += `?${params}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		return await response.json();
	} catch (err) {
		console.error('Failed to fetch', err);
		return null;
	}
};

/**
 * Fetches choro values from the API.
 *
 * @param options Options to pass to the API
 */
export const fetchChoroValues = async (options: ChoroValuesOptions) => {
	const urlPath = [
		options.interactiveRegion,
		options.variable,
		options.emissionScenario,
		options.frequency,
	].join('/');

	const urlQuery = [
		`period=${parseInt(options.decade) + 1}`,
		`dataset_name=${options.dataset}`,
		`decimals=${options.decimals}`,
	].join('&');

	return await fetch(
		`${GEOSERVER_BASE_URL}/get-choro-values/${urlPath}?${urlQuery}`
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error('Failed to fetch data');
			}
			return res.json();
		})
		.then((json) => json);
};

/**
 * Fetches the list of climate stations from the API.
 *
 * @returns A list of stations with their names, ids and coords.
 */
export const fetchStationsList = async ({ threshold }: { threshold?: string }) => {
	try {
		let data: any;

		const fetchJson = async (url: string) => {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			});
			if (!response.ok) {
				throw new Error(`Failed to fetch stations list: ${response.statusText}`);
			}
			return response.json();
		};

		if (threshold === 'ahccd') {
			data = await fetchJson(`${window.DATA_URL}/fileserver/ahccd/ahccd.json`);
		} else if (threshold === 'bdv') {
			data = await fetchJson(`${window.DATA_URL}/fileserver/bdv/bdv.json`);
		} else if (threshold === 'station-data') {
			data = await fetchJson('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID,LATITUDE,LONGITUDE');
		} else if (threshold === 'idf') {
			data = await fetchJson(`${window.DATA_URL}/fileserver/idf/idf_curves.json`);
		} else {
			data = await fetchJson('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID&offset=0&HAS_NORMALS_DATA=Y');
		}

		return (data.features || []).map((feature: any) => ({
			id: String(feature.properties?.ID ?? ((threshold === 'station-data') ? feature.properties?.STN_ID : feature?.id)),
			name: feature.properties?.STATION_NAME ?? feature.properties?.Name ?? feature.properties?.Location,
			type: feature.properties?.type,
			coordinates: {
				lat: feature.geometry.coordinates[1],
				lng: feature.geometry.coordinates[0],
			},
			filename: feature.properties?.filename,
		}));
	} catch (error) {
		console.error('Error fetching stations list:', error);
		throw error;
	}
};
