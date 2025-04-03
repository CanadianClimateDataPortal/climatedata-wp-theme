// Any kind of service that you want to use in your application should be defined here.
// For example any external request to an API, or any kind of data manipulation.

import {
	RelatedData,
	MapInfoData,
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
import wpResponse311Dummy from '@/assets/dummy/wp-response-311-dummy.json';
import locationByCoordsDummy from '@/assets/dummy/location-by-coords-dummy.json';
import generateChartDummy from '@/assets/dummy/generate-chart-dummy.json';
import deltaValuesDummy from '@/assets/dummy/delta-values-dummy.json';

const dummyResponses = {
	'variable-dataset': variableDatasetResponseDummy,
	'var-type': varTypeResponseDummy,
	sector: sectorResponseDummy,
} as const;

type DummyResponseKey = keyof typeof dummyResponses;

import { WP_API_DOMAIN } from "@/lib/constants.ts";

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

export const fetchWPData = async () => {
	// const POST_ID = 311;
	// TODO: uncomment this and use correct API endpoint when ready
	// const response = await fetch(`/dummy/wp-response-${POST_ID}-dummy.json`);
	// if (!response.ok) {
	// 	// TODO: this is a error handler dummy, we should use a redux alternative for this.
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	const response = {
		json: async () => wpResponse311Dummy, // mimic fetch response.json()
	};

	const _responseJson = await response.json();
	const _relatedData = await fetchRelatedData();
	const { acf: acfData } = _responseJson;

	const mapInfo: MapInfoData = {
		title: _responseJson.title.rendered,
		relatedData: _relatedData,
		en: {
			title: _responseJson.title.rendered,
			description: acfData.var_description,
			techDescription: acfData.var_tech_description,
		},
		fr: {
			title: _responseJson.meta.title_fr, // TODO: this should come from ACF instead of meta (?)
			description: acfData.var_description_fr,
			techDescription: acfData.var_tech_description_fr,
		},
	};

	return {
		mapInfo,
	};
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
 * @param filters - the filters to apply to the data
 */
export const fetchPostsData = async (
	postType: string,
	filters: Record<string, string | number | null>
): Promise<ApiPostData[]> => {
	// check if the there is a dummy response for the slug, which means the API is not yet implemented for it in the backend
	const fetchFromApi = !Object.keys(dummyResponses).includes(postType);

	// fetch from the API or directly return dummy json response
	const data: ApiPostData[] = fetchFromApi
		? await fetch(
				`${WP_API_DOMAIN}/wp-json/cdc/v3/${postType}-list`
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
	// TODO: uncomment this and use correct API domain when ready
	// const response = await fetch(`https://dev-en.climatedata.ca/wp-json/cdc/v2/get_location_by_coords/?lat=${latlng.lat}&lng=${latlng.lng}&sealevel=false`);
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	void latlng;
	const response = {
		json: async () => locationByCoordsDummy, // mimic fetch response.json()
	};

	return await response.json();
};

/**
 * Generates chart data from the API
 *
 * @param options Options to pass to the API
 */
export const generateChartData = async (options: ChartDataOptions) => {
	// TODO: uncomment this and use correct API domain when ready
	// const { latlng: { lat, lng }, dataset, variable, frequency  } = options;
	// const response = await fetch(`https://dataclimatedata.crim.ca/generate-charts/${lat}/${lng}/${variable}/${frequency}?decimals=1&dataset_name=${dataset}`);
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	void options;
	const response = {
		json: async () => generateChartDummy, // mimic fetch response.json()
	};

	return await response.json();
};

/**
 * Fetches delta values from the API, used to give data to a map cell tooltip.
 *
 * @param options Options to pass to the API
 */
export const fetchDeltaValues = async (options: DeltaValuesOptions) => {
	// TODO: uncomment this and use correct API domain when ready
	// const { endpoint, varName, frequency, params } = options;
	try {
		// const response = await fetch(`//dataclimatedata.crim.ca/${endpoint}/${varName}/${frequency}?${params}`);
		// if (!response.ok) {
		// 	throw new Error(response.statusText);
		// }
		// TODO: remove this when the API is ready
		void options;
		const response = {
			json: async () => deltaValuesDummy, // mimic fetch response.json()
		};

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
