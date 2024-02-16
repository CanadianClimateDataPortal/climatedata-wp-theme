<?php

// dumpit ( $element['inputs']['output'] );

$args = $element['inputs']['args'];

if ( $element['inputs']['type'] == 'posts' ) {
	
	$args['post_status'] = 'publish';
	
	$args['posts_per_page'] = (int) $args['posts_per_page'];
	
	//
	// QUERY ADJUSTMENTS
	// some input form fields need to be converted to useable wp_query args
	//
	
	$i = 0;
	
	if ( isset ( $args['tax_query'] ) ) {
			
		$args['tax_query'] = $args['tax_query']['rows'];
		
		foreach ( $args['tax_query'] as $tax_arg ) {
			
			unset ( $args['tax_query']['index'] );
			
			if ( empty ( $tax_arg['terms'] ) ) {
				unset ( $args['tax_query'][$i] );
			}
			
			$i++;
			
		}
		
	}
	
	if ( empty ( $args['tax_query'] ) ) {
		unset ( $args['tax_query'] );
	}
	
	// post type
	
	if ( isset ( $args['post_type'] ) && !empty ( $args['post_type'] ) ) {
		
		// dumpit ( $args['post_type'] );
		
		$post_types = array_keys ( $args['post_type'] );
		
		$i = 0;
		
		foreach ( $post_types as $post_type ) {
			
			if ( $args['post_type'][$post_type] == 'false' )
				unset ( $post_types[$i] );
			
			$i++;
			
		}
		
		
		if ( empty ( $post_types ) ) {
			$args['post_type'] = 'any';
		} else {
			$args['post_type'] = str_replace ( '*', '-', $post_types );
		}
		
	}
	
	// parent
	
	if ( $element['inputs']['depth'] == 'top' ) {
		$args['post_parent'] = 0;
	} elseif ( $args['post_parent'] == '' ) {
		unset ( $args['post_parent'] );
	}
	
	// dumpit ( $args );
	
	// random seed
	
	if ( $args['orderby'] == 'rand' )
		$args['orderby'] = 'RAND(' . mt_rand ( 100000, 999999 ) . ')';
	
	// run the query
	
	$element['query'] = new WP_Query ( $args );
	
} else {
	
	echo 'terms';
	
}

// dumpit ( $settings );

?>

<div 
	id="<?php echo $settings['el_id']; ?>-query" 
	class="fw-query-object"
	data-args='<?php echo json_encode ( $args ); ?>'
>

	<?php
		
		//
		
		if ( isset ( $element['inputs']['output'] ) ) {
			
			$container_open = false;
				
			foreach ( $element['inputs']['output'] as $item_obj ) {
				
				foreach ( $item_obj as $item => $options ) {
					
					// if ( $item == 'container' ) {
					// 	dumpit ( $item_obj );
					// }
					
					if ( $item != 'container' && $container_open == false ) {
						include ( locate_template ( 'resources/functions/builder/front-end/block/content/query/output/container.php' ) );
					}
					
					if ( locate_template ( 'resources/functions/builder/front-end/block/content/query/output/' . $item . '.php' ) != '' ) {
						
						include ( locate_template ( 'resources/functions/builder/front-end/block/content/query/output/' . $item . '.php' ) );
						
					} else {
						
						$item . '.php not found';
						
					}
					
				}
				
			}
			
		}
		
		// close the last container
		
		echo '</div>';
		$container_open = false;
		
	?>

</div>