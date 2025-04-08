<?php
/**
 * Template Name: Populate variables meta
 *
 * Script for programmatic population of variable post metadata:
 * - ACF 'var_id' field values from a predefined mapping array
 * - ACF 'variable_availability' checkbox field values (map, download)
 * - Variable-dataset taxonomy terms assignment
 *
 * Endpoint: /populate-variables-meta
 * Auth: Admin-level authentication required
 *
 * Implementation Note:
 * Requires a WordPress page with template "Populate variables meta"
 * and slug "populate-variables-meta" to function correctly.
 */

// Prevent direct script access
defined( 'ABSPATH' ) || exit;

// Validate administrative privileges
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
	wp_die( 'Administrative privileges required for this operation.' );
}

$var_id_post_id_mapping = array(
	"AHCCD pre-calculated station data"                               => array( 12392, "", false, true ),
	"All CanDCS variables"                                            => array(
		12410, // Post ID
		"all_candcs_variables", // var_id
		false, // Map availability
		true // Download availability
	),
	"Average 'Wet Day' Precipitation Intensity"                       => array(
		11875,
		"average_wet_day_precipitation_intensity",
		false,
		true
	),
	"Building Climate Zones"                                          => array(
		11217,
		"building_climate_zones",
		true,
		false
	),
	"Cold Spell Days"                                                 => array( 11920, "cold_spell_days", false, true ),
	"Coldest Day"                                                     => array( 516, "coldest_day", true, true ),
	"Cooling Degree Days"                                             => array(
		497,
		"cooling_degree_days",
		true,
		true
	),
	"Cumulative degree-days above 0C"                                 => array(
		2036,
		"cumulative_degree_days_above_0",
		true,
		true
	),
	"Days above HXmax"                                                => array(
		12415,
		"days_above_hxmax",
		false,
		true
	),
	"Days above Tmax"                                                 => array( 11675, "days_above_tmax", true, true ),
	"Days above Tmax and Tmin"                                        => array(
		11888,
		"days_above_tmax_and_tmin",
		false,
		true
	),
	"Days below temperature threshold"                                => array(
		517,
		"days_below_temperature_threshold",
		true,
		true
	),
	"Days with Humidex above threshold"                               => array(
		10811,
		"days_humidex_above_threshold",
		true,
		true
	),
	"Degree days exceedance date"                                     => array(
		11912,
		"degree_days_exceedance_date",
		false,
		true
	),
	"First fall frost"                                                => array( 4102, "first_fall_frost", true, true ),
	"Freeze-Thaw Cycles"                                              => array(
		6366,
		"freeze_thaw_cycles",
		true,
		true
	),
	"Frost Days"                                                      => array( 498, "frost_days", true, true ),
	"Frost free season"                                               => array( 4104, "frost_free_season", true, true ),
	"Future Building Design Value Summaries"                          => array( 13621, "", false, true ),
	"Growing Degree Days (5C)"                                        => array(
		503,
		"growing_degree_days_5",
		true,
		true
	),
	"Heat Wave Frequency"                                             => array(
		342,
		"heat_wave_frequency",
		false,
		true
	),
	"Heat Wave"                                                       => array( 11915, "heat_wave_index", false, true ),
	"Heat Wave Total Duration"                                        => array(
		509,
		"heat_wave_total_duration",
		false,
		true
	),
	"Heating Degree Days"                                             => array(
		506,
		"heating_degree_days",
		true,
		true
	),
	"Hottest Day"                                                     => array( 311, "hottest_day", true, true ),
	"Ice Days"                                                        => array( 510, "ice_days", true, true ),
	"Last spring frost"                                               => array( 4100, "last_spring_frost", true, true ),
	"Maximum 1-Day Total Precipitation"                               => array(
		514,
		"max_1d_total_precipitation",
		true,
		true
	),
	"Maximum 5-Day Precipitation"                                     => array(
		4106,
		"max_5d_total_precipitation",
		true,
		true
	),
	"Maximum Consecutive Dry Days"                                    => array(
		11886,
		"maximum_consecutive_dry_days",
		false,
		true
	),
	"Maximum Consecutive Wet Days"                                    => array(
		11880,
		"maximum_consecutive_wet_days",
		false,
		true
	),
	"Maximum Number of Consecutive Dry Days"                          => array(
		4095,
		"max_number_consecutive_dry_days",
		true,
		true
	),
	"Maximum Temperature"                                             => array(
		523,
		"maximum_temperature",
		true,
		true
	),
	"Mean Temperature"                                                => array( 291, "mean_temp", true, true ),
	"Minimum Temperature"                                             => array(
		292,
		"minimum_temperature",
		true,
		true
	),
	"MSC Climate Normals 1981-2010"                                   => array( 575, "", true, true ),
	"Number of Periods with more than 5 Consecutive Dry Days"         => array(
		4098,
		"periods_more_5_consecutive_dry_days",
		true,
		true
	),
	"Relative Sea-Level Change"                                       => array( 4653, "", true, true ),
	"Short-duration Rainfall IDF Data"                                => array( 538, "", false, true ),
	"Standardized precipitation evapotranspiration index (12-months)" => array( 3213, "spei_12", true, true ),
	"Standardized precipitation evapotranspiration index (3-months)"  => array( 3211, "spei_3", true, true ),
	"Station Data"                                                    => array( 12394, "", false, true ),
	"Total Precipitation"                                             => array(
		511,
		"total_precipitation",
		true,
		true
	),
	"Tropical Nights (Days with Tmin above threshold)"                => array(
		519,
		"tropical_nights_days_with_tmin_above_threshold",
		true,
		true
	),
	"Wet Days"                                                        => array( 11677, "wet_days", true, true ),
);

// Initialize counters for logging
$var_id_updated_count          = 0;
$var_id_skipped_count          = 0;
$var_id_error_count            = 0;
$successfully_updated_post_ids = array(); // Track post IDs of successfully updated posts

echo "=== Variable Metadata Population Process Log ===<br><br>";

// Process each variable in the mapping array
foreach ( $var_id_post_id_mapping as $variable_name => $data ) {
	$post_id = $data[0];
	$var_id  = $data[1];

	// Skip entries with empty var_id
	if ( empty( $var_id ) ) {
		echo "SKIPPED: Post ID {$post_id} ({$variable_name}) - No var_id value provided<br>";
		$var_id_skipped_count ++;
		continue;
	}

	// Verify post exists
	if ( ! get_post( $post_id ) ) {
		echo "ERROR: Post ID {$post_id} ({$variable_name}) does not exist<br>";
		$var_id_error_count ++;
		continue;
	}

	// Update the ACF field
	$update_result = update_field( 'var_id', $var_id, $post_id );

	if ( $update_result ) {
		echo "UPDATED: Post ID {$post_id} ({$variable_name}) - var_id set to: {$var_id}<br>";
		$var_id_updated_count ++;
		$successfully_updated_post_ids[] = $post_id;
	} else {
		// Check if field already has this value
		$current_value = get_field( 'var_id', $post_id );

		if ( $current_value === $var_id ) {
			echo "UNCHANGED: Post ID {$post_id} ({$variable_name}) - var_id already set to: {$var_id}<br>";
			$var_id_updated_count ++;
			$successfully_updated_post_ids[] = $post_id;
		} else {
			echo "ERROR: Failed to update Post ID {$post_id} ({$variable_name})<br>";
			$var_id_error_count ++;
		}
	}
}

// Update the variable_availability field for each successfully updated variable post
echo "<br>=== Setting Variable Availability Options ===<br>";
$availability_updated_count = 0;

foreach ( $successfully_updated_post_ids as $post_id ) {
	// Get the variable information from the mapping array
	$variable_info = null;

	foreach ( $var_id_post_id_mapping as $var_name => $info ) {
		if ( $info[0] == $post_id ) {
			$variable_info = $info;
			break;
		}
	}

	if ( $variable_info ) {
		// Build availability options based on map and download values
		$availability_options = array();

		if ( $variable_info[2] ) { // If map is true
			$availability_options[] = 'map';
		}

		if ( $variable_info[3] ) { // If download is true
			$availability_options[] = 'download';
		}

		$update_result = update_field( 'variable_availability', $availability_options, $post_id );

		if ( $update_result ) {
			$post = get_post( $post_id );
			echo "AVAILABILITY UPDATED: Post ID {$post_id} ({$post->post_title}) - Set to " . implode( " and ", $availability_options ) . "<br>";
			$availability_updated_count ++;
		} else {
			echo "Availability options already updated for Post ID {$post_id}<br>";
		}
	} else {
		echo "WARNING: No variable information found for Post ID {$post_id}<br>";
	}
}

// Create dataset taxonomy terms if they don't exist and store their IDs
echo "<br>=== Creating Variable Dataset Terms ===<br>";
$dataset_terms    = array(
	'Dataset example 1',
	'Dataset example 2',
	'Dataset example 3'
);
$dataset_term_ids = array();

foreach ( $dataset_terms as $term_name ) {
	// Create slug (lowercase with hyphens)
	$term_slug = sanitize_title( $term_name );

	// Check if term already exists
	$existing_term = get_term_by( 'slug', $term_slug, 'variable-dataset' );

	if ( $existing_term ) {
		// Term exists, get its ID
		$term_id = $existing_term->term_id;
		echo "EXISTING TERM: '{$term_name}' already exists with ID {$term_id}<br>";
	} else {
		// Term doesn't exist, create it
		$term_result = wp_insert_term(
			$term_name,           // Term name
			'variable-dataset',   // Taxonomy
			array(
				'slug' => $term_slug
			)
		);

		if ( is_wp_error( $term_result ) ) {
			echo "ERROR: Failed to create term '{$term_name}': " . $term_result->get_error_message() . "<br>";
			continue;
		}

		$term_id = $term_result['term_id'];
		echo "CREATED TERM: '{$term_name}' with ID {$term_id}<br>";
	}

	$dataset_term_ids[] = $term_id;
}

// Assign dataset terms to successfully updated variable posts
echo "<br>=== Assigning Dataset Terms to Variables ===<br>";
$dataset_assignment_count = 0;

if ( ! empty( $dataset_term_ids ) && ! empty( $successfully_updated_post_ids ) ) {
	foreach ( $successfully_updated_post_ids as $post_id ) {
		// Get a random term ID from the dataset terms
		$term_index = array_rand( $dataset_term_ids );
		$term_id    = $dataset_term_ids[ $term_index ];

		// Assign the term to the post
		$assign_result = wp_set_object_terms( $post_id, $term_id, 'variable-dataset' );

		if ( is_wp_error( $assign_result ) ) {
			echo "ERROR: Failed to assign dataset term to Post ID {$post_id}: " . $assign_result->get_error_message() . "<br>";
		} else {
			$post = get_post( $post_id );
			$term = get_term( $term_id, 'variable-dataset' );
			echo "ASSIGNED: Post ID {$post_id} ({$post->post_title}) assigned to dataset '{$term->name}'<br>";
			$dataset_assignment_count ++;
		}
	}
}

// Display summary
echo "<br>=== Process Summary ===<br>";
echo "Total variables processed: " . count( $var_id_post_id_mapping ) . "<br>";
echo "Successfully updated var ID: {$var_id_updated_count}<br>";
echo "Successfully updated availability options: {$availability_updated_count}<br>";
echo "Var ID skipped (empty var ID): {$var_id_skipped_count}<br>";
echo "Var ID errors: {$var_id_error_count}<br>";
echo "Dataset terms created/used: " . count( $dataset_term_ids ) . "<br>";
echo "Variables assigned to datasets: {$dataset_assignment_count}<br>";