<?php

//
// LOOP
//

function fw_output_loop_ajax() {
	
	// $element, $level, $globals, $include_autogen, $callbacks = true
	
	fw_output_element ( json_decode ( get_post_meta ( $_GET['post_id'], 'builder', true ), true ), 1, $_GET['globals'], true );
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_output_loop_ajax', 'fw_output_loop_ajax' );

//
// UPDATE POST
//

function fw_update_post() {
	
	// dumpit ( $_POST );
	
	$success = false;
	
	if (
		( isset ( $_POST['post_id'] ) && !empty ( $_POST['post_id'] ) ) &&
		( isset ( $_POST['builder'] ) && !empty ( $_POST['builder'] ) )
	) {
		
		// $globals = $_POST['globals'];
		$lang = $_POST['globals']['current_lang_code'];
		
		$new_builder = json_encode ( $_POST['builder'], JSON_PRETTY_PRINT );
		
		$revision = wp_save_post_revision ( $_POST['post_id'] );
		
		// update builder object
		update_post_meta ( $_POST['post_id'], 'builder', $new_builder );
		
		// echo 'updated id #' . $_POST['post_id'] . "\n";
		
		// other meta
		
		$title_to_update = wptexturize ( $_POST['builder']['inputs']['title'][$lang] );
		
		if ( $title_to_update != '' ) {
			if ( $lang == 'en' ) {
				
				// if en, update the post title
			
				$post_update = array (
					'ID' => $_POST['post_id'],
					'post_title' => $title_to_update
				);
				
				wp_update_post ( $post_update );

			} else {
				
				// not en, update title_[lang]
				
				update_post_meta ( $_POST['post_id'], 'title_' . $lang, $title_to_update );
		
			}
			
			// echo  'updated ' . $globals['current_lang_code'] . ' title' . "\n";
			
		}
		
		$success = true;
		
	}
	
	echo ( $success == true ) ? 'success' : '';
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_update_post', 'fw_update_post' );

function fw_get_builder_object() {
	
	if ( isset ( $_GET['post_id'] ) && !empty ( $_GET['post_id'] ) ) {
		
		$builder = get_post_meta ( $_GET['post_id'], 'builder', true );
		
		if ( !empty ( $builder ) ) {
			
			echo $builder;
			
		} else {
			
			echo '{}';
			
		}
		
	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_get_builder_object', 'fw_get_builder_object' );
// add_action ( 'wp_ajax_nopriv_fw_get_builder_object', 'fw_get_builder_object' );

function fw_setup_element_ajax() {
	
	echo json_encode ( fw_setup_element ( $_GET['element'], $_GET['globals'] ) );
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_setup_element_ajax', 'fw_setup_element_ajax' );
add_action ( 'wp_ajax_nopriv_fw_setup_element_ajax', 'fw_setup_element_ajax' );


function fw_output_element_ajax() {
	
	// dumpit ( $element );
	
	if ( $_GET['element']['type'] == 'template' ) {
		
		if (
			$_GET['element']['inputs']['path'] != '' &&
			$_GET['element']['inputs']['path'] != null
		) {
			
			include ( locate_template ( 'template/' . $_GET['element']['inputs']['path'] ) );
			
		} else {
			
			$template_builder = json_decode ( get_post_meta ( $_GET['element']['inputs']['post_id'], 'builder', true ), true );
			
			// dumpit ( $template_builder );
			
			fw_output_loop ( $template_builder, 1, false );
			
		}
		
	} elseif ( isset ( $_GET['element'] ) ) {
		
		// dumpit ( $_GET['element'] );
		// dumpit ( $_GET['globals'] );
			
		fw_output_element ( $_GET['element'], null, $_GET['globals'], false, false );
		
		$GLOBALS['fw']['autogen'] = false;
		
	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_output_element_ajax', 'fw_output_element_ajax' );
add_action ( 'wp_ajax_nopriv_fw_output_element_ajax', 'fw_output_element_ajax' );

//
// NEW POST
//

add_action ( 'wp_ajax_fw_insert_post', 'fw_insert_post' );

function fw_insert_post() {
	
	$form_data = array_column ( $_GET['inputs'], 'value', 'name' );
	
	$new_post_ID = wp_insert_post ( array (
		'post_type' => $form_data['post_type'],
		'post_status' => $form_data['post_status'],
		'post_title' => $form_data['post_title']
	) );
	
	$meta_fields = array();
	
	foreach ( $form_data as $key => $val ) {
		
		if ( str_contains ( $key, 'post_meta-' ) ) {
			$new_key = str_replace ( 'post_meta-', '', $key );
			$meta_fields[$new_key] = $val;
		}
		
	}
	
	if ( !empty ( $meta_fields ) ) {
		foreach ( $meta_fields as $key => $val ) {
			
			update_post_meta ( $new_post_ID, $key, $val );
			
		}
	}
	
	// echo 'layout: ' . $form_data['layout'];
	
	if ( $form_data['layout'] != '' ) {
		
		// get the builder object from the given ID
		
		$layout_obj = get_post_meta ( (int) $form_data['layout'], 'builder', true );
		
		// update ID keys
		
		// replace instances of the layout ID
		// with the new post ID
		
		$layout_obj = str_replace ( '"' . $form_data['layout'], '"' . $new_post_ID, $layout_obj );
		
		// echo "\n\n" . $layout_obj . "\n\n";
		
		// and populate the new post with it
		
		update_post_meta ( $new_post_ID, 'builder', $layout_obj );
		
	}
	
	// echo "\n" . 'done: ' . $new_post_ID;
	
	echo json_encode ( array ( 
		'result' => 'success',
		'post_type' => $form_data['post_type'],
		'post_title' => $form_data['post_title'],
		'post_id' => $new_post_ID,
		'post_meta' => $meta_fields,
		'url' => get_permalink ( $new_post_ID )
	) );
	
	wp_die();
	
}


//
// UTILITIES
//

function fw_get_element_classes ( $type ) {
	
	return $GLOBALS['classes'][$type];
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_get_element_classes', 'fw_get_element_classes' );

//
// UPDATE PAGE SETTINGS
//

function fw_update_page_settings() {
	
	$result = array (
		'old_title' => get_the_title ( $_GET['post_id'] ),
		'old_slug' => get_the_slug ( $_GET['post_id'] ),
		'old_path' => null
	);
	
	// get the existing field values
	
	// dumpit ( $_GET );
	
	// $old_title = get_the_title ( $_GET['post_id'] );
	// $old_slug = get_the_slug ( $_GET['post_id'] );
	// $old_path = null;
	
	if ( $_GET['lang'] != 'en' ) {
		
		$result['old_title'] = get_post_meta ( $_GET['post_id'], 'title_' . $_GET['lang'], true );
		$result['old_slug'] = get_post_meta ( $_GET['post_id'], 'slug_' . $_GET['lang'], true );
		$result['old_path'] = get_post_meta ( $_GET['post_id'], 'path_' . $_GET['lang'], true );
		
	}
	
	// title
	
	// echo "\n";	
	// echo $old_title;
	
	if ( $_GET['fields']['title'] != '' && $_GET['fields']['title'] != $result['old_title'] ) {
		// echo ' > ' . $_GET['fields']['title'];
		
		if ( $_GET['lang'] == 'en' ) {
			
			wp_update_post ( array (
				'ID' => $_GET['post_id'],
				'post_title' => $_GET['fields']['title']
			) );
			
		} else {
			
			update_post_meta ( $_GET['post_id'], 'title_' . $_GET['lang'], $_GET['fields']['title'] );
			
		}
		
		$result['new_title'] = $_GET['fields']['title'];
		
	}
	
	// echo "\n";
	// echo $old_slug;
	
	if ( $_GET['fields']['slug'] != '' && $_GET['fields']['slug'] != $result['old_slug'] ) {
		
		// echo ' > ' . $_GET['fields']['slug'];
		// echo "\n";
		// echo str_replace ( $old_slug, $_GET['fields']['slug'], $old_path );
		
		if ( $_GET['lang'] == 'en' ) {
			
			wp_update_post ( array ( 
				'ID' => $_GET['post_id'],
				'post_name' => sanitize_title ( $_GET['fields']['slug'] )
			) );
			
		} else {
			
			update_post_meta ( $_GET['post_id'], 'slug_' . $_GET['lang'], sanitize_title ( $_GET['fields']['slug'] ) );
			
			update_post_meta ( $_GET['post_id'], 'path_' . $_GET['lang'], str_replace ( $result['old_slug'], sanitize_title ( $_GET['fields']['slug'] ), $result['old_path'] ) );
			
		}
		
		$result['new_slug'] = sanitize_title ( $_GET['fields']['slug'] );
		
		$result['new_path'] = str_replace ( $result['old_slug'], sanitize_title ( $_GET['fields']['slug'] ), $result['old_path'] );
		
	}
	
	print_r ( json_encode ( $result ) );
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_update_page_settings', 'fw_update_page_settings' );
