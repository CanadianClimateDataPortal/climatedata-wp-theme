<?php
// Prevent direct access
( ! function_exists( 'wp' ) ) ? die( '⚠' ) : null;

// Header
get_header();

/**
 * Hero section
 */

$hero_templates['content'] = 'resource-hero-content';
$hero_templates['bg'] = 'post-thumb';

include ( locate_template ( 'template/hero/hero.php' ) );

/**
 * Page sections
 */

if ( have_posts() ) {
	while ( have_posts() ) {
		the_post(); ?>
        <div class="interactive">
			<?php
			the_content(); ?>
        </div>
		<?php
	}
}

// Footer
get_footer();