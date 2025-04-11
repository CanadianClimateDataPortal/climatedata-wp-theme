// Any kind of service that you want to use in your application should be defined here.
// For example any external request to an API, or any kind of data manipulation.

import {
	RelatedData,
	MapInfoData,
	Sector,
	TaxonomyData,
	ApiPostData,
	ChartDataOptions,
	DeltaValuesOptions,
	ChoroValuesOptions,
} from '@/types/types';
import L from 'leaflet';

// TODO: temporarily using dummy data inside the assets folder, until the API is ready
import variableDatasetResponseDummy from '@/assets/dummy/variable-dataset-response-dummy.json';
import varTypeResponseDummy from '@/assets/dummy/var-type-response-dummy.json';
import sectorResponseDummy from '@/assets/dummy/sector-response-dummy.json';
import relatedResponse311Dummy from '@/assets/dummy/related-response-311-dummy.json';

const dummyResponses = {
	'variable-dataset': variableDatasetResponseDummy,
	'var-type': varTypeResponseDummy,
	sector: sectorResponseDummy,
} as const;

type DummyResponseKey = keyof typeof dummyResponses;

import {WP_API_DOMAIN, WP_API_VARIABLE_PATH} from "@/lib/constants.ts";

export const fetchRelatedData = async (): Promise<RelatedData> => {
	// TODO: uncomment this and use correct API endpoint when ready
	// re add `postId: number` as a parameter to the function
	// const response = await fetch(
	// 	`/dummy/related-response-${postId}-dummy.json`
	// );
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	const response = {
		json: async () => relatedResponse311Dummy, // mimic fetch response.json()
	};

	return response.json();
};

/**
 * Fetches WordPress variable data by post ID from the custom WP REST API endpoint.
 * Processes and normalizes the response into a structured MapInfoData object,
 * including sectors, trainings, featured image, and dataset taxonomy terms.
 */
export const fetchWPData = async (postId: number) => {
	try {
		// Make the Fetch request.
		const response = await fetch(`${WP_API_DOMAIN}${WP_API_VARIABLE_PATH}?post_id=${postId}`, {
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
				const slug = item.name.en.toLowerCase().replace(/\s+/g, '-');
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
			relevantTrainings: Array.isArray(content?.relevant_trainings) ? content.relevant_trainings : [],
			featuredImage: content?.featured_image || {
				thumbnail: '',
				medium: '',
				large: '',
				full: '',
			},
			dataset: Array.isArray(dataset) ? dataset : []
		};

		return { mapInfo };

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
 * @param filters - the filters to apply to the data
 */
export const fetchTaxonomyData = async (
	slug: string,
	filters?: Record<string, string | number | null>
): Promise<TaxonomyData[]> => {
	// check if the there is a dummy response for the slug, which means the API is not yet implemented for it in the backend
	const fetchFromApi = !Object.keys(dummyResponses).includes(slug);

	// fetch from the API or directly return dummy json response
	const data: TaxonomyData[] = !fetchFromApi
		? dummyResponses[slug as DummyResponseKey]
		: await fetch(
				`${WP_API_DOMAIN}/wp-json/cdc/v3/${slug}-list`
			)
				.then((res) => {
					if (!res.ok) {
						throw new Error('Failed to fetch data');
					}
					return res.json();
				})
				.then((json) => {
					return json[slug].terms
				});

	// applying filters for the dummy implementation.. for the real implementation, this should be done via query params when fetching
	if (filters) {
		return data.filter((item) => {
			return Object.keys(filters).every((key) => {
				return item[key as keyof TaxonomyData] === filters[key];
			});
		});
	}

	return data;
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
	filters: Record<string, string | number | null>,
): Promise<ApiPostData[]> => {
	// check if the there is a dummy response for the slug, which means the API is not yet implemented for it in the backend
	const fetchFromApi = !Object.keys(dummyResponses).includes(postType);
	const { term_id } = dataset;

	// fetch from the API or directly return dummy json response
	const data: ApiPostData[] = fetchFromApi
		? await fetch(
				`${WP_API_DOMAIN}/wp-json/cdc/v3/${postType}-list?app=${section}&variable_dataset_term_id=${term_id}`, {
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
			}
			)
				.then((res) => {
					if (!res.ok) {
						throw new Error('Failed to fetch data');
					}
					return res.json();
				})
				.then((json) => json[postType])
		: dummyResponses[postType as DummyResponseKey];

	// only interested in items with an id
	const filteredData = data.filter((item) => item.id);

	// applying filters for the dummy implementation.. for the real implementation, this should be done via query params when fetching
	if (Object.values(filters).some((value) => value)) {
		return filteredData.filter((item) => {
			return Object.keys(filters).every((key) => {
				const filterValue = filters[key];

				// if filterValue is falsy (0, null, etc) don't filter by it
				if (!filterValue) {
					return true;
				}

				// access taxonomies inside meta.taxonomy
				const taxonomy = item.meta?.taxonomy?.[key];

				// if taxonomy is missing, filter it out
				if (!taxonomy || !taxonomy.terms) {
					return false;
				}

				// check if any term_id matches the filterValue
				return taxonomy.terms.some(
					(term) => String(term.term_id) === String(filterValue)
				);
			});
		});
	}

	return filteredData;
};

/**
 * Fetches location data from the API
 *
 * @param latlng Latitude and Longitude of the location
 */
export const fetchLocationByCoords = async (latlng: L.LatLng) => {
	const response = await fetch(`https://dev-en.climatedata.ca/wp-json/cdc/v2/get_location_by_coords/?lat=${latlng.lat}&lng=${latlng.lng}&sealevel=false`);
	
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
export const generateChartData = async (options: ChartDataOptions) => {
	const { latlng: { lat, lng }, dataset, variable, frequency  } = options;
	const response = await fetch(`https://dataclimatedata.crim.ca/generate-charts/${lat}/${lng}/${variable}/${frequency}?decimals=1&dataset_name=${dataset}`);
	
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
		
		const response = await fetch(`//dataclimatedata.crim.ca/${endpoint}/${varName}/${frequency}?${params}`);

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		return await response.json();
	} catch (err) {
		console.error('Failed to fetch', err);
		return null;
	}
};

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
		`//dataclimatedata.crim.ca/get-choro-values/${urlPath}?${urlQuery}`
	)
		.then((res) => {
			if (!res.ok) {
				throw new Error('Failed to fetch data');
			}
			return res.json();
		})
		.then((json) => json);
};
