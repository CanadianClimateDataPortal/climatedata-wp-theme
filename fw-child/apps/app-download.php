<?php
/**
 * Template Name: Download app
 *
 * To ensure the download React app loads correctly without any JavaScript or CSS conflicts
 * with the theme's assets, a custom WP page template was created instead of using
 * a builder template.
 *
 * The language detection can be hardcoded as a workaround for this solution.
 */

// Include app assets.
$assets = cdc_app_asset_load( 'download' );

if ( ! is_array( $assets ) || empty( $assets ) ) {
    wp_die( 'Error: could not load the download app!' );
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

// Get the French domain
$fr_domain = cdc_get_fr_domain();
?>

<!DOCTYPE html>
<html lang="<?php echo esc_attr( $current_lang ); ?>">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title><?php wp_title(); ?></title>

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
<div
        id="root"
        data-app-lang="<?php echo esc_attr( $current_lang ); ?>"
        data-wp-home-url="<?php echo esc_attr( home_url() ); ?>"
        data-wp-home-url-fr="<?php echo esc_attr( $fr_domain ); ?>"
></div>

<?php
// Load JS assets.
if ( isset( $assets['js'] ) && is_array( $assets['js'] ) && isset( $assets['js']['module'] ) && is_array( $assets['js']['module'] ) ) {
    foreach ( $assets['js']['module'] as $js_assets ) {
        if ( filter_var( $js_assets, FILTER_VALIDATE_URL ) ) { ?>
            <script>
                // Disable Leaflet's 3D features
                L_DISABLE_3D = true;
            </script>
            <script type="module" crossorigin src="<?php echo esc_url( $js_assets ); ?>"></script>
        <?php }
    }
}
?>
</body>
</html>
