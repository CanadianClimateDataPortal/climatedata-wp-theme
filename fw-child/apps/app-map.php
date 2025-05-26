<?php
/**
 * Template Name: Map app
 *
 * To ensure the map React app loads correctly without any JavaScript or CSS conflicts
 * with the theme's assets, a custom WP page template was created instead of using
 * a builder template.
 *
 * The language detection can be hardcoded as a workaround for this solution.
 */

// Include app assets.
$assets = cdc_app_asset_load( 'map' );

if ( ! is_array( $assets ) || empty( $assets ) ) {
	wp_die( 'Error: could not load the map app!' );
}

// Initialize current language.
$current_lang = 'en';

if (
	isset( $GLOBALS['fw'] )
	&& isset( $GLOBALS['fw']['current_lang_code'] )
	&& in_array( $GLOBALS['fw']['current_lang_code'], array( 'en', 'fr' ), true )
) {
	$current_lang = $GLOBALS['fw']['current_lang_code'];
}

/**
 * Load translation data for the map application.
 *
 * This loads .mo translation files and converts them to a JavaScript-compatible
 * format for use in the React application.
 */
$translation_base_path = get_stylesheet_directory() . '/languages/react-apps/';
$translation_data      = array();

// Load all translation files
$translation_files = array(
	$translation_base_path . get_locale() . '.mo',
);

// JED compatible locale_data
$jed_locale_data = array();

// MO files exists
$mo_files_exists = false;

foreach ( $translation_files as $mofile ) {
	if ( file_exists( $mofile ) ) {
		$mo = new MO();

		// Mark the MO files as existing
		$mo_files_exists = true;

		if ( $mo->import_from_file( $mofile ) ) {
			// Convert MO entries to Jed-compatible format
			// $mo->entries has keys as original strings and values as Translation_Entry objects
			foreach ( $mo->entries as $original => $translation_entry ) {
				if ( ! empty( $original ) ) {
					// $translation_entry->translations is an array of translated strings
					$jed_locale_data[ $original ] = $translation_entry->translations;
				}
			}
		}
	}
}

// Structure the translation data
$translation_data = array(
	'locale_data' => $jed_locale_data
);
?>

<!DOCTYPE html>
<html lang="<?php echo esc_attr( $current_lang ); ?>">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title><?php wp_title(); ?></title>

	<?php
	// Add favicon.
	add_favicon();

	// Load the translation data for the map app
	if ( true === $mo_files_exists ) {
		?>
        <!-- Load WordPress script dependencies for i18n -->
        <script src="<?php echo esc_url( get_site_url() . '/wp-includes/js/dist/hooks.min.js' ); ?>"></script>
        <script src="<?php echo esc_url( get_site_url() . '/wp-includes/js/dist/i18n.min.js' ); ?>"></script>

        <script>
            // Translation data for the map application
			<?php if ( ! empty( $translation_data['locale_data'] ) ) { ?>
            window.wp.i18n.setLocaleData(
            	<?php echo wp_json_encode( $translation_data['locale_data'] ); ?>
            );
			<?php } ?>
        </script>
		<?php
	}
	?>

    <script>
        // URL encoder salt for the map app
        window.URL_ENCODER_SALT = '<?php echo isset( $GLOBALS['vars']['url_encoder_salt'] ) ? htmlspecialchars( $GLOBALS['vars']['url_encoder_salt'], ENT_QUOTES, 'UTF-8' ) : ''; ?>';

        // DATA URL for the map app
        window.DATA_URL = '<?php echo isset( $GLOBALS['vars']['data_url'] ) ? htmlspecialchars( $GLOBALS['vars']['data_url'], ENT_QUOTES, 'UTF-8' ) : ''; ?>';

        // Disable Leaflet's 3D features
        L_DISABLE_3D = true;
    </script>

	<?php
	// Load CSS assets.
	if ( isset( $assets['css'] ) && is_array( $assets['css'] ) ) {
		foreach ( $assets['css'] as $css_file ) {
			if ( filter_var( $css_file, FILTER_VALIDATE_URL ) ) { ?>
                <link rel="stylesheet" crossorigin href="<?php echo esc_url( $css_file ); ?>">
				<?php
			}
		}
	}

	// Load JS module preload assets.
	if ( isset( $assets['js'] ) && is_array( $assets['js'] ) && isset( $assets['js']['modulepreload'] ) && is_array( $assets['js']['modulepreload'] ) ) {
		foreach ( $assets['js']['modulepreload'] as $js_preload_file ) {
			if ( filter_var( $js_preload_file, FILTER_VALIDATE_URL ) ) { ?>
                <link rel="modulepreload" crossorigin href="<?php echo esc_url( $js_preload_file ); ?>">
			<?php }
		}
	}
	?>
</head>
<body>
<div id="root"
     data-app-lang="<?php echo esc_attr( $current_lang ); ?>"
     data-wp-home-url="<?php echo esc_attr( home_url() ); ?>"
></div>

<?php
// Load JS assets.
if ( isset( $assets['js'] ) && is_array( $assets['js'] ) && isset( $assets['js']['module'] ) && is_array( $assets['js']['module'] ) ) {
	foreach ( $assets['js']['module'] as $js_assets ) {
		if ( filter_var( $js_assets, FILTER_VALIDATE_URL ) ) { ?>
            <script type="module" crossorigin src="<?php echo esc_url( $js_assets ); ?>"></script>
		<?php }
	}
}
?>
</body>
</html>
