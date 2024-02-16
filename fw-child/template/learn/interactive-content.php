<?php

// outputs post content created using WP block editor

$interactive = get_field ( 'asset_post_' . $GLOBALS['fw']['current_lang_code'], get_the_ID() );

if ( !empty ( $interactive ) ) {
	
	$interactive_post = get_post ( $interactive );
	
	// output
	echo apply_filters ( 'the_content', $interactive_post->post_content );
	
}
