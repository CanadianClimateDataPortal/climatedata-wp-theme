<?php
/**
 * Template Name: Populate variables meta
 *
 * Script for programmatic population of variable post metadata:
 * - ACF 'var_id' field values from a predefined mapping array
 * - ACF 'variable_availability' checkbox field values (map, download)
 * - Variable-dataset taxonomy terms assignment
 * - ACF 'dataset_type' field values for dataset terms (projection, ahccd, or empty)
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
	"Daily AHCCD Temperature and Precipitation"                               => array(
		12392,
		"daily_ahccd_temperature_and_precipitation",
		false,
		true,
		array( "Adjusted and Homogenized Canadian Climate Data (AHCCD)" )
	),
	"All CanDCS variables"                                            => array(
		12410, // Post ID
		"all_candcs_variables", // var_id
		false, // Map availability
		true, // Download availability
		array( "Statistically Downscaled Global Climate Projections" ) // Datasets
	),
	"Average 'Wet Day' Precipitation Intensity"                       => array(
		11875,
		"average_wet_day_precipitation_intensity",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Building Climate Zones"                                          => array(
		11217,
		"building_climate_zones",
		true,
		false,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Cold Spell Days"                                                 => array(
		11920,
		"cold_spell_days",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Coldest Day"                                                     => array(
		516,
		"coldest_day",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Cooling Degree Days"                                             => array(
		497,
		"cooling_degree_days",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Cumulative degree-days above 0C"                                 => array(
		2036,
		"cumulative_degree_days_above_0",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Days above HXmax"                                                => array(
		12415,
		"days_above_hxmax",
		false,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Days above Tmax"                                                 => array(
		11675,
		"days_above_tmax",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Days above Tmax and Tmin"                                        => array(
		11888,
		"days_above_tmax_and_tmin",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Days below temperature threshold"                                => array(
		517,
		"days_below_temperature_threshold",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Days with Humidex above threshold"                               => array(
		10811,
		"days_humidex_above_threshold",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Degree days exceedance date"                                     => array(
		11912,
		"degree_days_exceedance_date",
		false,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"First fall frost"                                                => array(
		4102,
		"first_fall_frost",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Freeze-Thaw Cycles"                                              => array(
		6366,
		"freeze_thaw_cycles",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Frost Days"                                                      => array(
		498,
		"frost_days",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Frost free season"                                               => array(
		4104,
		"frost_free_season",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Future Building Design Value Summaries"                          => array(
		13621,
		"future_building_design_value_summaries",
		false,
		true,
		array( "Future Building Design Values" )
	),
	"Growing Degree Days (5C)"                                        => array(
		503,
		"growing_degree_days_5",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Heat Wave Frequency"                                             => array(
		342,
		"heat_wave_frequency",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Heat Wave"                                                       => array(
		11915,
		"heat_wave_index",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Heat Wave Total Duration"                                        => array(
		509,
		"heat_wave_total_duration",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Heating Degree Days"                                             => array(
		506,
		"heating_degree_days",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Hottest Day"                                                     => array(
		311,
		"hottest_day",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Ice Days"                                                        => array(
		510,
		"ice_days",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Last spring frost"                                               => array(
		4100,
		"last_spring_frost",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Maximum 1-Day Total Precipitation"                               => array(
		514,
		"max_1d_total_precipitation",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Maximum 5-Day Precipitation"                                     => array(
		4106,
		"max_5d_total_precipitation",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Maximum Consecutive Dry Days"                                    => array(
		11886,
		"maximum_consecutive_dry_days",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Maximum Consecutive Wet Days"                                    => array(
		11880,
		"maximum_consecutive_wet_days",
		false,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Maximum Number of Consecutive Dry Days"                          => array(
		4095,
		"max_number_consecutive_dry_days",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Maximum Temperature"                                             => array(
		523,
		"maximum_temperature",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Mean Temperature"                                                => array(
		291,
		"mean_temp",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Minimum Temperature"                                             => array(
		292,
		"minimum_temperature",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"MSC Climate Normals 1981-2010"                                   => array(
		575,
		"msc_climate_normals",
		true,
		true,
		array( "Climate Normals" )
	),
	"Number of Periods with more than 5 Consecutive Dry Days"         => array(
		4098,
		"periods_more_5_consecutive_dry_days",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Relative Sea-Level Change"                                       => array(
		4653,
		"sea_level",
		true,
		true,
		array( "Sea Level" )
	),
	"Short-duration Rainfall IDF Data"                                => array(
		538,
		"short_duration_rainfall_idf_data",
		false,
		true,
		array( "IDF Rainfall Data" )
	),
	"Standardized precipitation evapotranspiration index (12-months)" => array(
		3213,
		"spei_12",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Standardized precipitation evapotranspiration index (3-months)"  => array(
		3211,
		"spei_3",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Station Data"                                                    => array(
		12394,
		"station_data",
		false,
		true,
		array( "Station Observations" )
	),
	"Total Precipitation"                                             => array(
		511,
		"total_precipitation",
		true,
		true,
		array( "Statistically Downscaled Global Climate Projections" )
	),
	"Tropical Nights (Days with Tmin above threshold)"                => array(
		519,
		"tropical_nights_days_with_tmin_above_threshold",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
	"Wet Days"                                                        => array(
		11677,
		"wet_days",
		true,
		true,
		array(
			"Statistically Downscaled Global Climate Projections",
			"Adjusted and Homogenized Canadian Climate Data (AHCCD)"
		)
	),
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

// Extract all unique dataset values from the mapping array
echo "<br>=== Creating Variable Dataset Terms and Setting Dataset Types ===<br>";
$dataset_terms = array();

foreach ( $var_id_post_id_mapping as $variable_name => $data ) {
	if ( isset( $data[4] ) && is_array( $data[4] ) ) {
		foreach ( $data[4] as $dataset ) {
			if ( ! in_array( $dataset, $dataset_terms ) ) {
				$dataset_terms[] = $dataset;
			}
		}
	}
}

$dataset_term_ids           = array();
$dataset_type_updated_count = 0;

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

	$dataset_term_ids[ $term_name ] = $term_id;

	// Determine and update dataset_type for this term
	$dataset_type = "";

	if ( $term_name === "Adjusted and Homogenized Canadian Climate Data (AHCCD)" ) {
		$dataset_type = "ahccd";
	} elseif ( in_array( $term_name, array(
		"Statistically Downscaled Global Climate Projections",
		"Sea Level",
	) ) ) {
		$dataset_type = "projection";
	}

	if ( $dataset_type ) {
		$update_result = update_field( 'dataset_type', $dataset_type, 'variable-dataset_' . $term_id );

		if ( $update_result ) {
			echo "DATASET TYPE UPDATED: Term '{$term_name}' (ID: {$term_id}) - dataset_type set to: {$dataset_type}<br>";
			$dataset_type_updated_count ++;
		} else {
			// Check if field already has this value
			$current_value = get_field( 'dataset_type', 'variable-dataset_' . $term_id );

			if ( $current_value === $dataset_type ) {
				echo "DATASET TYPE UNCHANGED: Term '{$term_name}' (ID: {$term_id}) - dataset_type already set to: {$dataset_type}<br>";
				$dataset_type_updated_count ++;
			} else {
				echo "ERROR: Failed to update dataset_type for term '{$term_name}' (ID: {$term_id})<br>";
			}
		}
	}
}

// Assign dataset terms to successfully updated variable posts
echo "<br>=== Assigning Dataset Terms to Variables ===<br>";
$dataset_assignment_count = 0;

if ( ! empty( $dataset_term_ids ) && ! empty( $successfully_updated_post_ids ) ) {
	foreach ( $successfully_updated_post_ids as $post_id ) {
		// Find the variable information in the mapping array
		$variable_info = null;
		$variable_name = "";

		foreach ( $var_id_post_id_mapping as $var_name => $info ) {
			if ( $info[0] == $post_id ) {
				$variable_info = $info;
				$variable_name = $var_name;

				break;
			}
		}

		if ( $variable_info && isset( $variable_info[4] ) && is_array( $variable_info[4] ) ) {
			$term_ids = array();

			// Get all term IDs for the datasets associated with this variable
			foreach ( $variable_info[4] as $dataset_name ) {
				if ( isset( $dataset_term_ids[ $dataset_name ] ) ) {
					$term_ids[] = $dataset_term_ids[ $dataset_name ];
				}
			}

			// Assign all relevant terms to the post
			if ( ! empty( $term_ids ) ) {
				$assign_result = wp_set_object_terms( $post_id, $term_ids, 'variable-dataset' );

				if ( is_wp_error( $assign_result ) ) {
					echo "ERROR: Failed to assign dataset terms to Post ID {$post_id}: " . $assign_result->get_error_message() . "<br>";
				} else {
					$post       = get_post( $post_id );
					$term_names = array();

					foreach ( $term_ids as $term_id ) {
						$term         = get_term( $term_id, 'variable-dataset' );
						$term_names[] = $term->name;
					}

					echo "ASSIGNED: Post ID {$post_id} ({$post->post_title}) assigned to datasets: " . implode( ", ", $term_names ) . "<br>";
					$dataset_assignment_count ++;
				}
			}
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
echo "Unique dataset terms created/used: " . count( $dataset_term_ids ) . "<br>";
echo "Dataset types updated for terms: {$dataset_type_updated_count}<br>";
echo "Variables assigned to datasets: {$dataset_assignment_count}<br>";