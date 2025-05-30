<?php
/**
 * IDF endpoints.
 *
 * This file defines the REST API endpoint for retrieving IDF files.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register custom REST API endpoints for retrieving IDF files for a station.
 */
register_rest_route(
	'cdc/v3',
	'idf-station-files',
	array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cdc_rest_v3_get_idf_station_files',
		'permission_callback' => 'cdc_rest_v3_endpoint_permission',
		'args'                => cdc_rest_v3_get_idf_files_args(),
	)
);

/**
 * Retrieve the file URLs for an IDF station.
 *
 * @param WP_REST_Request $request The request object.
 *
 * @return WP_REST_Response|WP_Error The response object or WP_Error on failure.
 */
function cdc_rest_v3_get_idf_station_files( $request ) {
	try {
		$station_id = $request->get_param( 'station' );

		$files = [];
		$base_dir = get_stylesheet_directory() . '/resources/app/idf/';

		$directories = [
			'historical',
			'cmip5',
			'cmip6',
			'cmip6-quickstart',
		];

		foreach ( $directories as $directory) {

			// since file naming is not stable, a glob search with the station ID works
			$matching_files = glob ( $base_dir . $directory . "/*" . $station_id . "*" );

			if ( count ( $matching_files ) >= 1 ) {
				$file_path = $matching_files[0];
				$file_url = str_replace ( get_stylesheet_directory(), get_stylesheet_directory_uri(), $file_path );
				$files[] = [
					'url' => $file_url,
					'type' => $directory,
				];
			}
		}

		$response = array(
			'files' => $files,
		);

		return new WP_REST_Response( $response, 200 );
	} catch ( Exception $e ) {
		return new WP_Error(
			'server_error',
			'An unexpected error occurred.',
			[ 'status' => 500 ],
		);
	}
}

/**
 * Get the arguments for the IDF URLs REST API endpoint.
 *
 * @return array The arguments for the IDF URLs endpoint.
 */
function cdc_rest_v3_get_idf_files_args() {
	return array(
		'station' => [
			'description'       => 'ID of the station to retrieve the IDF file URLs.',
			'type'              => 'string',
			"required"          => true,
			'validate_callback' => "cdc_rest_validate_station_id",
		],
	);
}

/**
 * @param mixed $value
 * @param WP_REST_Request $request
 * @param string $param
 * @return true|WP_Error
 */
function cdc_rest_validate_station_id( $value, $request, $param ) {
	if ( ! preg_match ( '/^[a-zA-Z0-9]+$/', $value ) ) {
		return new WP_Error(
			'invalid_station_id',
			'Invalid station ID format. Only alphanumeric characters are allowed.',
			[ 'status' => 400 ],
		);
	}

	return true;
}
