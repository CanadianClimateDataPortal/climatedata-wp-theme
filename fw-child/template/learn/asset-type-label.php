<?php
/**
 * Template for displaying the asset type label.
 */

$asset_type_value = get_field( 'asset_type' ); // Get the selected value.
$asset_type_meta  = cdc_get_asset_type_meta( $asset_type_value ); // Get the meta data for the selected value.

if ( ! empty( $asset_type_meta['label'] ) ) {
	echo '<p class="resource-hero-asset-type">' . __( $asset_type_meta['label'], 'cdc' ) . '</p>';
}
