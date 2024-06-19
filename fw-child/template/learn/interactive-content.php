<?php

// outputs post content created using WP block editor

$interactive = get_field ( 'asset_post_' . $GLOBALS['fw']['current_lang_code'], get_the_ID() );

// Enqueue GSAP and dependencies when id 'timeline' is present in content.
// Essential for compatibility with old interactive resource post
function detect_id_and_enqueue_script($content) {
    $id_to_detect = 'id="timeline"';

    if (strpos($content, $id_to_detect) !== false) {
		wp_enqueue_script ( 'gsap' );
		wp_enqueue_script ( 'scrolltrigger' );
		wp_enqueue_script ( 'scroll' );
    }
    
    return $content;
}
add_filter('the_content', 'detect_id_and_enqueue_script');


if ( !empty ( $interactive ) ) {
	
	$interactive_post = get_post ( $interactive );
	
	// output
	echo apply_filters ( 'the_content', $interactive_post->post_content );
	
}
