<?php

// OUTPUT CUSTOM EXCERPT LENGTH

function custom_excerpt ( $thepost = null, $limit = null, $link = null ) {
  
  global $post;
	
	// defaults
	
	if ($thepost === null) $thepost = get_the_ID();
	if ($limit === null) $limit = 20;
	if ($link === null) $link = false;
	
	$post_object = get_post ( $thepost );
	
	$excerpt_more = ' … ';
  
  if ($link === null || $link === false) {
    $excerpt_more .= '';
  } else {
    $excerpt_more .= '<a href="'. esc_url ( get_permalink ( $thepost ) ) . '">Read more</a>';
  }
  
  $excerpt_text = apply_filters( 'the_content', $post_object->post_excerpt );
  
  if ( $excerpt_text == '' ) {
    $excerpt_text = apply_filters( 'the_content', $post_object->post_content );
  }
  
  $excerpt = wp_trim_words ( $excerpt_text, $limit, $excerpt_more );
  
  return $excerpt;
}