<?php
/**
 * Template Name: Populate variables global IDs
 *
 * Script for programmatic population of ACF 'var_id' field values in variable posts
 * from a predefined mapping array.
 *
 * Endpoint: /populate-variables-global-ids
 * Auth: Admin-level authentication required
 *
 * Implementation Note:
 * Requires a WordPress page with template "Populate variables global IDs"
 * and slug "populate-variables-global-ids" to function correctly.
 */

// Prevent direct script access
defined( 'ABSPATH' ) || exit;

// Validate administrative privileges
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
	wp_die( 'Administrative privileges required for this operation.' );
}

$var_id_post_id_mapping = array(
	"AHCCD pre-calculated station data"                               => array( 12392, "" ),
	"All CanDCS variables"                                            => array( 12410, "all_candcs_variables" ),
	"Average 'Wet Day' Precipitation Intensity"                       => array(
		11875,
		"average_wet_day_precipitation_intensity"
	),
	"Building Climate Zones"                                          => array( 11217, "building_climate_zones" ),
	"Cold Spell Days"                                                 => array( 11920, "cold_spell_days" ),
	"Coldest Day"                                                     => array( 516, "coldest_day" ),
	"Cooling Degree Days"                                             => array( 497, "cooling_degree_days" ),
	"Cumulative degree-days above 0C"                                 => array(
		2036,
		"cumulative_degree_days_above_0"
	),
	"Days above HXmax"                                                => array( 12415, "days_above_hxmax" ),
	"Days above Tmax"                                                 => array( 11675, "days_above_tmax" ),
	"Days above Tmax and Tmin"                                        => array( 11888, "days_above_tmax_and_tmin" ),
	"Days below temperature threshold"                                => array(
		517,
		"days_below_temperature_threshold"
	),
	"Days with Humidex above threshold"                               => array( 10811, "days_humidex_above_threshold" ),
	"Degree days exceedance date"                                     => array( 11912, "degree_days_exceedance_date" ),
	"First fall frost"                                                => array( 4102, "first_fall_frost" ),
	"Freeze-Thaw Cycles"                                              => array( 6366, "freeze_thaw_cycles" ),
	"Frost Days"                                                      => array( 498, "frost_days" ),
	"Frost free season"                                               => array( 4104, "frost_free_season" ),
	"Future Building Design Value Summaries"                          => array( 13621, "" ),
	"Growing Degree Days (5C)"                                        => array( 503, "growing_degree_days_5" ),
	"Heat Wave Frequency"                                             => array( 342, "heat_wave_frequency" ),
	"Heat Wave"                                                       => array( 11915, "heat_wave_index" ),
	"Heat Wave Total Duration"                                        => array( 509, "heat_wave_total_duration" ),
	"Heating Degree Days"                                             => array( 506, "heating_degree_days" ),
	"Hottest Day"                                                     => array( 311, "hottest_day" ),
	"Ice Days"                                                        => array( 510, "ice_days" ),
	"Last spring frost"                                               => array( 4100, "last_spring_frost" ),
	"Maximum 1-Day Total Precipitation"                               => array( 514, "max_1d_total_precipitation" ),
	"Maximum 5-Day Precipitation"                                     => array( 4106, "max_5d_total_precipitation" ),
	"Maximum Consecutive Dry Days"                                    => array( 11886, "maximum_consecutive_dry_days" ),
	"Maximum Consecutive Wet Days"                                    => array( 11880, "maximum_consecutive_wet_days" ),
	"Maximum Number of Consecutive Dry Days"                          => array(
		4095,
		"max_number_consecutive_dry_days"
	),
	"Maximum Temperature"                                             => array( 523, "maximum_temperature" ),
	"Mean Temperature"                                                => array( 291, "mean_temp" ),
	"Minimum Temperature"                                             => array( 292, "minimum_temperature" ),
	"MSC Climate Normals 1981-2010"                                   => array( 575, "" ),
	"Number of Periods with more than 5 Consecutive Dry Days"         => array(
		4098,
		"periods_more_5_consecutive_dry_days"
	),
	"Relative Sea-Level Change"                                       => array( 4653, "" ),
	"Short-duration Rainfall IDF Data"                                => array( 538, "" ),
	"Standardized precipitation evapotranspiration index (12-months)" => array( 3213, "spei_12" ),
	"Standardized precipitation evapotranspiration index (3-months)"  => array( 3211, "spei_3" ),
	"Station Data"                                                    => array( 12394, "" ),
	"Total Precipitation"                                             => array( 511, "total_precipitation" ),
	"Tropical Nights (Days with Tmin above threshold)"                => array(
		519,
		"tropical_nights_days_with_tmin_above_threshold"
	),
	"Wet Days"                                                        => array( 11677, "wet_days" ),
);

// Initialize counters for logging
$updated_count = 0;
$skipped_count = 0;
$error_count   = 0;

echo "=== Variable Global ID Population Process Log ===<br><br>";

// Process each variable in the mapping array
foreach ( $var_id_post_id_mapping as $variable_name => $data ) {
	$post_id = $data[0];
	$var_id  = $data[1];

	// Skip entries with empty var_id
	if ( empty( $var_id ) ) {
		echo "SKIPPED: Post ID {$post_id} ({$variable_name}) - No var_id value provided<br>";
		$skipped_count ++;
		continue;
	}

	// Verify post exists
	if ( ! get_post( $post_id ) ) {
		echo "ERROR: Post ID {$post_id} ({$variable_name}) does not exist<br>";
		$error_count ++;
		continue;
	}

	// Update the ACF field
	$update_result = update_field( 'var_id', $var_id, $post_id );

	if ( $update_result ) {
		echo "UPDATED: Post ID {$post_id} ({$variable_name}) - var_id set to: {$var_id}<br>";
		$updated_count ++;
	} else {
		// Check if field already has this value
		$current_value = get_field( 'var_id', $post_id );

		if ( $current_value === $var_id ) {
			echo "UNCHANGED: Post ID {$post_id} ({$variable_name}) - var_id already set to: {$var_id}<br>";
			$updated_count ++;
		} else {
			echo "ERROR: Failed to update Post ID {$post_id} ({$variable_name})<br>";
			$error_count ++;
		}
	}
}

// Display summary
echo "<br>=== Process Summary ===<br>";
echo "Total variables processed: " . count( $var_id_post_id_mapping ) . "<br>";
echo "Successfully updated: {$updated_count}<br>";
echo "Skipped (no var_id): {$skipped_count}<br>";
echo "Errors: {$error_count}<br>";