// Any kind of service that you want to use in your application should be defined here.
// For example any external request to an API, or any kind of data manipulation.

import { transformLegendData } from "@/lib/format";
import { RelatedData, MapInfoData, TaxonomyData, PostData, ApiPostData } from "@/types/types";

// TODO: temporarily using dummy data inside the assets folder, until the API is ready
import variableResponseDummy from '@/assets/dummy/variable-response-dummy.json';
import datasetResponseDummy from '@/assets/dummy/dataset-response-dummy.json';
import variableDatasetResponseDummy from '@/assets/dummy/variable-dataset-response-dummy.json';
import varTypeResponseDummy from '@/assets/dummy/var-type-response-dummy.json';
import sectorResponseDummy from '@/assets/dummy/sector-response-dummy.json';
import relatedResponse311Dummy from '@/assets/dummy/related-response-311-dummy.json';
import wmsResponseDummy from '@/assets/dummy/wms-response-dummy.json';
import wpResponse311Dummy from '@/assets/dummy/wp-response-311-dummy.json';

const dummyResponses = {
	variable: variableResponseDummy,
	'variable-dataset': variableDatasetResponseDummy,
	dataset: datasetResponseDummy,
	'var-type': varTypeResponseDummy,
	sector: sectorResponseDummy,
} as const;

type DummyResponseKey = keyof typeof dummyResponses;

export const fetchRelatedData = async (
  // @ts-ignore: doing this so typescript build doesn't complain.. remove this when the API is ready
	postId: number
): Promise<RelatedData> => {
	// TODO: uncomment this and use correct API endpoint when ready
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
	const POST_ID = 311;
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
	const _relatedData = await fetchRelatedData(POST_ID);
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

export const fetchLegendData = async () => {
	// TODO: uncomment this and use correct API endpoint when ready
	// const response = await fetch('/dummy/wms-response-dummy.json');
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	const response = {
		json: async () => wmsResponseDummy, // mimic fetch response.json()
	};

	return transformLegendData(await response.json());
};

/**
 * Fetches taxonomy data from the API
 * @param slug - the taxonomy slug
 * @param filters - the filters to apply to the data
 */
export const fetchTaxonomyData = async (slug: string, filters?: Record<string, string | number | null>): Promise<TaxonomyData[]> => {
	// TODO: uncomment this and use correct API endpoint when ready
	// const response = await fetch(`/dummy/${slug}-response-dummy.json`);
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	let response: { json: () => Promise<any> };
	if (slug in dummyResponses) {
		response = {
			json: async () => dummyResponses[slug as DummyResponseKey], // mimic fetch response.json()
		};
	}
	else {
		return [];
	}

	const data: TaxonomyData[] = await response.json();

	// applying filters for the dummy implementation.. for the real implementation, this should be done via query params when fetching
	if (filters)  {
		return data.filter((item) => {
			return Object.keys(filters).every((key) => {
				return item[key] === filters[key];
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
export const fetchPostsData = async (postType: string, filters: Record<string, string | number | null>): Promise<PostData[]> => {
	// TODO: uncomment this and use correct API endpoint when ready
	// const response = await fetch(`/dummy/${postType}-response-dummy.json`);
	// if (!response.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// TODO: remove this when the API is ready
	let response: { json: () => Promise<any> };
	if (postType in dummyResponses) {
		response = {
			json: async () => dummyResponses[postType as DummyResponseKey], // mimic fetch response.json()
		};
	}
	else {
		return [];
	}

	const data: PostData[] = (await response.json() as ApiPostData[]).map((post) => ({
		...post,
		title: post.title.rendered,
	}));

	// applying filters for the dummy implementation.. for the real implementation, this should be done via query params when fetching
	if (filters)  {
		return data.filter((item) => {
			return Object.keys(filters).every((key) => {
				const filterValue = String(filters[key]);

				if (! filterValue) {
					return true;
				}

				if (Array.isArray(item[key])) {
					return String(item[key]).includes(filterValue);
				}

				return false;
			});
		});
	}

	return data;
};
