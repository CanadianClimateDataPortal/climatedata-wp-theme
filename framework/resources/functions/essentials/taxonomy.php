<?php

// GET CURRENT CATEGORY HIERARCHY LEVEL

function category_level($term_id) {
  $level = count(get_ancestors($term_id, 'category'));
  return $level;
}

// GET TOP-MOST CATEGORY
// returns name, slug, object or ID

function get_top_category($term_id, $returnwhat) {
  
  $ancestors = get_ancestors($term_id, 'category');
  $top_ancestor = get_category($ancestors[count($ancestors) - 1]);
  
  if ($returnwhat == 'name') {
		$output = $top_ancestor->name;
	} elseif ($returnwhat == 'slug') {
		$output = $top_ancestor->slug;
	} elseif ($returnwhat == 'object') {
  	$output = $top_ancestor;
  } else {
		$output = $top_ancestor->term_id;
	}
  
  return $output;
}

// GET CUSTOM TAXONOMY FOR GIVEN POST ID
// returns an array of post taxonomies ['name', 'slug', 'id']

function get_custom_taxonomy($taxonomy, $thepost = null) {
  global $post;
	if ($thepost === null) $thepost = $post->ID;
	
	$get_terms = get_the_terms($thepost, $taxonomy);
	
	$i = 0;
	
	if ($get_terms != '') {
		foreach ($get_terms as $term) {
			$post_output[$i]['name'] = $term->name;
			$post_output[$i]['slug'] = $term->slug;
			$post_output[$i]['id'] = $term->term_id;
			$i++;
		}
	}
	
	return $post_output;
}

//
// GET ITEM TERMS FOR MULTIPLE TAXONOMIES
//

function get_item_terms ( $post_ID, $taxonomies, $exclude ) {
  
  $item_terms = array();
  
  $i = 0;
  
  foreach ( $taxonomies as $taxonomy ) {
    foreach ( $exclude as $exclude_term ) {
      
      if ( $taxonomy == $exclude_term ) {
        unset ( $taxonomies[$i] );
      }
      
      $i++;
      
    }
  }
  
  // for each taxonomy
  
  foreach ( $taxonomies as $term_name ) {

    // get the post's terms
    
    $get_terms = get_the_terms ( $post_ID, $term_name );
    
    // if it has terms
    
    if ( !empty ( $get_terms ) ) {
      
      // add each term
      
      foreach ( $get_terms as $item_term ) {
        $item_terms[] = $item_term;
      }
      
    }
    
  }
  
  return $item_terms;
  
}