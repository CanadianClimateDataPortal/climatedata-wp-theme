<?php
/**
 * Template Name: fw-child/apps/app-map.php
 *
 * To ensure the app loads correctly without any JavaScript or CSS conflicts
 * with the theme's assets, a custom WP page template was created instead of using
 * a builder template.
 *
 * The language detection can be hardcoded as a workaround for this solution.
 */

// Include app assets.
$assets = cdc_app_asset_load( 'map' );

if ( ! is_array( $assets ) || empty( $assets ) ) {
	wp_die( 'Error: could not load the app!' );
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

$internal_urls = [
	'wp-api-domain' => home_url(),

	'home-en' => home_url(),
	'home-fr' => cdc_get_fr_domain(),

	'about-data-en' => '/about/our-data/',
	'about-data-fr' => '/le-portail/nos-donnees/',

	'support-en' => '/feedback/',
	'support-fr' => '/retroaction/',

	'download-en' => '/download/',
	'download-fr' => '/telechargement/',
];

$locale_data = cdc_extract_locale_data( 'react-apps', get_locale() );

?>
<!DOCTYPE html>
<html lang="<?php echo esc_attr( $current_lang ); ?>">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title><?php echo esc_html( wp_get_document_title() ); ?></title>
    <?php include ( locate_template ( 'template/google-tags-head.php' ) ); ?>

	<?php
	// Add favicon.
	add_favicon();

	// Load the translation data for the app
	if ( count( $locale_data ) ) {
		?>
        <script src="<?php echo esc_url( get_site_url() . '/wp-includes/js/dist/hooks.min.js' ); ?>"></script>
        <script src="<?php echo esc_url( get_site_url() . '/wp-includes/js/dist/i18n.min.js' ); ?>"></script>

        <script>
        window.wp.i18n.setLocaleData(
            <?php echo wp_json_encode( $locale_data ); ?>
        );
        </script>
		<?php
	}
	?>

    <script>
        // URL encoder salt for the app
        window.URL_ENCODER_SALT = '<?php echo isset( $GLOBALS['vars']['url_encoder_salt'] ) ? htmlspecialchars( $GLOBALS['vars']['url_encoder_salt'], ENT_QUOTES, 'UTF-8' ) : ''; ?>';

        // DATA URL for the app
        window.DATA_URL = '<?php echo isset( $GLOBALS['vars']['data_url'] ) ? htmlspecialchars( $GLOBALS['vars']['data_url'], ENT_QUOTES, 'UTF-8' ) : ''; ?>';

        // Disable Leaflet's 3D features
        L_DISABLE_3D = true;

        // WP AJAX URL for the app
        window.wpAjaxUrl = '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>';
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
<?php include ( locate_template ( 'template/google-tags-body.php' ) ); ?>
<div
    id="root"
    data-app-lang="<?php echo esc_attr( $current_lang ); ?>"
    data-internal-urls="<?php echo esc_attr( wp_json_encode( $internal_urls ) ); ?>"
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
