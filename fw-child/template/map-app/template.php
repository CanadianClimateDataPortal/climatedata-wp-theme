<?php
/**
 * Map app template.
 */

// Initialize current language.
$current_lang = 'en';

if (
	isset( $GLOBALS['fw'] )
	&& isset( $GLOBALS['fw']['current_lang_code'] )
	&& in_array( $GLOBALS['fw']['current_lang_code'], array( 'en', 'fr' ), true )
) {
	$current_lang = $GLOBALS['fw']['current_lang_code'];
}

// Render the root container for the map app.
echo '<div id="root" data-app-lang="' . $current_lang . '"></div>';