<?php

// dumpit ( $element['inputs'] );

$args = $element['inputs']['args'];

//
// QUERY ADJUSTMENTS
// some input form fields need to be converted to useable wp_query args
//

// [tax_query][repeater] to [tax_query][]

if (
	isset ( $args['tax_query']['repeater'] ) &&
	!empty ( $args['tax_query']['repeater'] )
) {
	
	$args['tax_query'] = array ( $args['tax_query']['repeater'] );
	
}

if ( isset ( $args['post_type'] ) && !empty ( $args['post_type'] ) ) {
	
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
		$args['post_type'] = $post_types;
	}
	
	// dumpit ( $post_types );
	
}

// run the query

$element['query'] = new WP_Query ( $args );

//

if ( isset ( $element['inputs']['output'] ) ) {
		
	foreach ( $element['inputs']['output'] as $item_obj ) {
		
		foreach ( $item_obj as $item => $options ) {
		
			if ( locate_template ( 'resources/functions/builder/block/content/query/output/' . $item . '.php' ) != '' ) {
				
				include ( locate_template ( 'resources/functions/builder/block/content/query/output/' . $item . '.php' ) );
				
			} else {
				
				$item . '.php not found';
				
			}
			
		}
		
	}
	
}

// close the last container

echo '</div>';