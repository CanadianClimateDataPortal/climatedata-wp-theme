<?php

//
// CUSTOM EXCERPT
//

function custom_excerpt ( $limit = null, $post_ID = null, $link = null ) {

	global $post;

	// defaults

	if ( $post_ID === null ) $post_ID = get_the_ID();
	if ( $limit === null ) $limit = 20;
	if ( $link === null ) $link = false;

	$post_object = get_post ( $post_ID );

	$excerpt_more = ' … ';

	if ( $link === null || $link === false ) {
		$excerpt_more .= '';
	} else {
		$excerpt_more .= '<a href="'. esc_url ( get_permalink ( $post_ID ) ) . '">Read more</a>';
	}

	$excerpt_text = apply_filters ( 'the_content', $post_object->post_excerpt );

	if ( $excerpt_text == '' ) {
		$excerpt_text = apply_filters ( 'the_content', $post_object->post_content );
	}

	$excerpt = wp_trim_words ( $excerpt_text, $limit, $excerpt_more );

	return $excerpt;
}