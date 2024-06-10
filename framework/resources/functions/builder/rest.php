<?php

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'framework/v2', '/query/', array (
		'methods' => 'GET', 
		'callback' => 'fw_query_builder' 
	) );
	
});

function fw_query_builder() {
	
	if (
		isset ( $_GET['options']['template'] ) && 
		$_GET['options']['template'] != '' &&
		locate_template ( $_GET['options']['template'] ) != ''
	) {
		$element_path = $_GET['options']['template'];
	} else {
		$element_path = 'template/query/item.php';
	}
	
	$result = array (
		'success' => false
	);
	
	$new_query = new WP_Query ( $_GET['args'] );
	
	if ( $new_query->have_posts() ) {
		
		$result['options'] = $_GET['options'];
		$result['success'] = true;
		$result['found_posts'] = $new_query->found_posts;
		$result['max_pages'] = $new_query->max_num_pages;
		$result['items'] = array();
		
		while ( $new_query->have_posts() ) {
			$new_query->the_post();
			
			$item = array (
				'id' => get_the_ID(),
				'title' => get_the_title(),
				'permalink' => get_permalink(),
				'lang' => $_GET['lang'],
			);
			
			if ( $_GET['lang'] != 'en' ) {
				$item['title'] = get_post_meta ( get_the_ID(), 'title_' . $_GET['lang'], true );
				$item['permalink'] = translate_permalink ( get_permalink(), get_the_ID(), 'fr' );
				
			}
			
			ob_start();
			
			include ( locate_template ( $element_path ) );
			
			$item['output'] = ob_get_clean();

			$result['items'][] = $item;
			
		}
		
		
	} else {
		
		$result['message'] = __ ( 'No items found.', 'fw' );
		
	}
	
	return $result;
	
}