<?php
/**
 * Font face declarations
 *
 * This file contains the font-face declarations used across multiple app templates
 * The main reason that this exists is that we are not using normal wp_head() in map and in download so the enqueue system does not work.
 * adding the same separately to the cdc_app_asset_load() function and detecting it via reading vite manifest did not work either. So the last resort was implementing this.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$stylesheet_dir_uri = esc_url( get_stylesheet_directory_uri() );

$fonts = [
    // CDCSerif variants
    [
        'family'  => 'CDCSerif',
        'weight'  => 'normal',
        'file'    => 'CDCSerif-Medium.woff2',
        'format'  => 'woff2'
    ],
    [
        'family'  => 'CDCSerif',
        'weight'  => 'bold',
        'file'    => 'CDCSerif-Bold.woff2',
        'format'  => 'woff2'
    ],
    // CDCSans variants
    [
        'family'  => 'CDCSans',
        'weight'  => 'normal',
        'file'    => 'CDCSans-Light.woff2',
        'format'  => 'woff2'
    ],
    [
        'family'  => 'CDCSans',
        'weight'  => '500',
        'file'    => 'CDCSans-Book.woff2',
        'format'  => 'woff2'
    ],
    [
        'family'  => 'CDCSans',
        'weight'  => '600',
        'file'    => 'CDCSans-SemiBold.woff2',
        'format'  => 'woff2'
    ]
];
?>

<style>
<?php foreach ( $fonts as $font ) : ?>
    @font-face {
        font-family: "<?php echo esc_attr( $font['family'] ); ?>";
        font-weight: <?php echo esc_attr( $font['weight'] ); ?>;
        src: url("<?php echo $stylesheet_dir_uri; ?>/resources/fonts/<?php echo esc_attr( $font['file'] ); ?>") format("<?php echo esc_attr( $font['format'] ); ?>");
        font-display: swap;
    }
<?php endforeach; ?>
</style>
