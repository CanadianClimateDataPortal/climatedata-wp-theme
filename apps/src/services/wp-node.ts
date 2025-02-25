// TODO: update this dummy with the correct structure and information as soon as this is connected to WP.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const POST_ID = 311;

// TODO: add documentation to this file as soon this functions fetch data from WordPress.
export const wpApiSlice = createApi({
	reducerPath: 'wp-api',
	baseQuery: fetchBaseQuery({
		baseUrl: `/dummy/wp-response-${POST_ID}-dummy.json`,
		prepareHeaders: (headers) => {
			// headers.set('-api-token-wordpress', 'token-id')
			return headers;
		},
	}),
	endpoints: (builder) => ({
		// Here for example we can define a query to get the current post.
		getPosts: builder.query({
			query: () => '',
		}),
	}),
});

export const { useGetPostsQuery } = wpApiSlice;
