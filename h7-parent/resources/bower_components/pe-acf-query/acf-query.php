<?php
  
  if ( !isset ( $new_query ) ) $new_query = array();
  
  if ( !isset ( $new_query['type'] ) ) $new_query['type'] = 'posts';
  
  if ( get_sub_field ( 'query_type' ) != '' ) {
    
    $new_query['type'] = get_sub_field ( 'query_type' );
    
  }
  
  //
  // GET POSTS
  //
  
  if ( $new_query['type'] == 'posts' ) {
    
    if ( !isset ( $new_query['args'] ) ) {
      $new_query['args'] = array();
    }
    
    if ( get_sub_field ( 'posts_per_page' ) != '' ) {
      
      $new_query['args']['posts_per_page'] = get_sub_field ( 'posts_per_page' );
      
    } else {
      
      $new_query['args']['posts_per_page'] = '-1';
      
    }
    
    // 'POST PARAMETERS' GROUP
    
    if ( have_rows ( 'post' ) ) {
      while ( have_rows ( 'post' ) ) {
        the_row();
        
        // 'post types' group
        
        if ( have_rows ( 'post_types' ) ) {
          while ( have_rows ( 'post_types' ) ) {
            the_row();
              
            if ( !isset ( $new_query['args']['post_type'] ) ) {
              $new_query['args']['post_type'] = 'post';
            }
            
            if ( get_sub_field ( 'post_type' ) != '' ) {
              
              $selected_post_types = get_sub_field ( 'post_type' );
              
              if ( $selected_post_types[0] != '' ) {
                
                $new_query['args']['post_type'] = get_sub_field ( 'post_type' );
                
              }
              
            }
            
          }
        }
        
        // 'sort' group
        
        if ( have_rows ( 'sort' ) ) {
          while ( have_rows ( 'sort' ) ) {
            the_row();
            
            $new_query['args']['orderby'] = get_sub_field ( 'orderby' );
            
            if ( get_sub_field ( 'orderby' ) != 'rand' ) {
              $new_query['args']['order'] = get_sub_field ( 'order' );
            }
            
            if ( $new_query['args']['orderby'] == 'meta_value_num' || $new_query['args']['orderby'] == 'meta_value' ) {
              $new_query['args']['meta_key'] = get_sub_field ( 'meta_key' );
            }
            
          }
        }
        
        // 'tax query' group
        
        if ( have_rows ( 'tax_query' ) ) {
          while ( have_rows ( 'tax_query' ) ) {
            the_row();
            
            $args = array();
            
            if ( have_rows ( 'arguments' ) ) {
              while ( have_rows ( 'arguments' ) ) {
                the_row();
                
                $args[] = array (
                  'taxonomy' => get_sub_field ( 'taxonomy' ),
                  'field' => 'slug',
                  'terms' => get_sub_field ( 'terms' )
                );
                
              }
            }
            
            if ( !empty ( $args ) ) {
              
              $new_query['args']['tax_query'] = $args;
              
              if ( count ( $args ) > 1 ) {
                $new_query['args']['tax_query']['relation'] = get_sub_field ( 'relation' );
              }
              
            }
        
          }
        }
        
        // 'meta query' group
        
        if ( have_rows ( 'meta_query' ) ) {
          while ( have_rows ( 'meta_query' ) ) {
            the_row();
            
            $args = array();
            
            if ( have_rows ( 'arguments' ) ) {
              while ( have_rows ( 'arguments' ) ) {
                the_row();
                
                $args[] = array (
                  'key' => get_sub_field ( 'key' ),
                  'value' => get_sub_field ( 'value' ),
                  'compare' => get_sub_field ( 'compare' )
                );
                
              }
            }
            
            if ( !empty ( $args ) ) {
              
              $new_query['args']['meta_query'] = $args;
              
              if ( count ( $args ) > 1 ) {
                $new_query['args']['meta_query']['relation'] = get_sub_field ( 'relation' );
              }
              
            }
            
          }
        }
        
      }
    }
    
    //
    // ADJUST BASED ON QUERY STRING PARAMETERS
    //
    
    if ( $_GET ) {
      
      //echo 'has query string';
      
    }
    
    // CREATE ITEMS
  
    $new_query['results'] = new WP_Query ( $new_query['args'] );
    
    if ( $new_query['results']->have_posts () ) :
    
      while ( $new_query['results']->have_posts () ) :
      
        $new_query['results']->the_post();
        
        $new_query['items'][] = array (
          'id' => get_the_ID(),
          'title' => get_the_title(),
          'permalink' => get_permalink(),
          'post_type' => get_post_type(),
          'content' => get_the_content()
        );
        
      endwhile;
    
    endif;
    
    wp_reset_postdata();
    
  } elseif ( $new_query['type'] == 'terms' ) {
    
    $new_query['args'] = array (
      'hide_empty' => false
    );
    
    // 'TAXONOMY PARAMETERS' GROUP
    
    if ( have_rows ( 'taxonomy' ) ) {
      while ( have_rows ( 'taxonomy' ) ) {
        the_row();
        
        $new_query['args']['taxonomy'] = get_sub_field ( 'taxonomy' );
        
      }
    }
    
    $new_query['results'] = get_terms ( $new_query['args'] );
    
  }