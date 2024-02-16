<?php

// outputs post content created using WP block editor

// force post object from globals[fw]
$block_post = get_post ( $GLOBALS['fw']['current_query']['ID'] );

// output
echo apply_filters ( 'the_content', $block_post->post_content );