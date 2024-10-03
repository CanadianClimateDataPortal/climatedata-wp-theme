<?php
/**
 * Template for displaying module title.
 */

if ( isset( $GLOBALS['fw'] ) ) {

	$modules = get_the_terms( $GLOBALS['fw']['current_query']['ID'], 'module' );

	if ( ! empty( $modules ) ) {

		echo '<p class="resource-hero-modules">';

		foreach ( $modules as $i => $module ) {
			$module_title = fw_get_field( 'title', 'module_' . $module->term_id );

			if ( ! empty( $module_title ) ) {
				// Echo comma in between each module.
				echo ( 0 !== $i ) ? ', ' : '';
				echo esc_html( $module_title );
			}
		}

		echo '</p>';

	}
}
