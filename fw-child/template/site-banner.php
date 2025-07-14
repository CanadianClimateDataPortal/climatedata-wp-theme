<?php
/**
 * Display the banner (i.e. "news" banner) at the top of the site.
 * 
 * The banner is displayed only if:
 * - It's enabled
 * - We are in the date range when to show the banner
 * - The "hide the news banner" cookie is NOT set
 */

if ( ! get_field( 'site_banner_enabled', 'option' ) ) {
    return;
}

$cookie_name = 'cdc-site-banner-closed';

if ( isset( $_COOKIE[ $cookie_name ] ) && $_COOKIE[ $cookie_name ] === '1' ) {
    return;
}

$display_start = get_field( 'site_banner_time_from', 'option' );
$display_end = get_field( 'site_banner_time_until', 'option' );

$now = new DateTime();

$now_is_after_start = empty( $display_start ) || $now >= new DateTime( $display_start, new DateTimeZone( 'UTC' ) );
$now_is_before_end = empty( $display_end ) || $now < new DateTime( $display_end, new DateTimeZone( 'UTC' ) );

if ( ! $now_is_after_start || ! $now_is_before_end ) {
    return;
}

$current_lang = 'en';

if ( isset( $GLOBALS['fw'] ) && isset( $GLOBALS['fw']['current_lang_code'] ) ) {
    $current_lang = $GLOBALS['fw']['current_lang_code'];
}

$content_field = $current_lang === 'fr' ? 'site_banner_content_fr' : 'site_banner_content_en';

?>
<div id="site-banner" class="bg-secondary text-white container-fluid">
    <div class="row">
        <div class="col offset-2">
            <div class="d-flex align-items-center py-4 fs-5">
                <div class="flex-grow-1 pe-3">
                    <?php the_field( $content_field, 'option' ); ?>
                </div>
                <div class="pe-4 fs-5">
                    <button type="button" class="close btn-close rounded-circle btn-close-white" aria-label="Close"></button>
                </div>
            </div>
        </div>
    </div>
</div>
