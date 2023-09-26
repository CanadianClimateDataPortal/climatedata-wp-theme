<?php

//
// LOOP
//

function fw_output_loop_ajax() {
	
	fw_output_element ( json_decode ( get_post_meta ( $_GET['post_id'], 'builder', true ), true ), 1 );
	
	wp_die();
	
}


add_action ( 'wp_ajax_fw_output_loop_ajax', 'fw_output_loop_ajax' );

//
// UPDATE POST
//

function fw_update_post() {
	
	if (
		( isset ( $_POST['post_id'] ) && !empty ( $_POST['post_id'] ) ) &&
		( isset ( $_POST['builder'] ) && !empty ( $_POST['builder'] ) )
	) {
		
		$globals = $_POST['globals'];
		
		$new_builder = json_encode ( $_POST['builder'], JSON_PRETTY_PRINT );
			
		$revision = wp_save_post_revision ( $_POST['post_id'] );
		
		// update builder object
		update_post_meta ( $_POST['post_id'], 'builder', $new_builder );
		
		echo 'updated id #' . $_POST['post_id'] . "\n";
		
		// print_r ( $_POST['builder'] );
		
		// echo "\n\n";
		
		// print_r ( $new_builder );
		
		// echo "\n\n";
		
		// other meta
		
		$title_to_update = wptexturize ( $_POST['builder']['inputs']['title'][$globals['current_lang_code']] );
		
		if ( $title_to_update != '' ) {
			if ($globals['current_lang_code'] == 'en') {
				
				// if en, update the post title
			
				$post_update = array (
					'ID' => $_POST['post_id'],
					'post_title' => $title_to_update
				);
				
				wp_update_post ( $post_update );

			} else {
				
				// not en, update title_[lang]
				
				update_post_meta ( $_POST['post_id'], 'title_' . $globals['current_lang_code'], $title_to_update );
		
			}
			
			echo  'updated ' . $globals['current_lang_code'] . ' title' . "\n";
			
		}
		
		
	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_update_post', 'fw_update_post' );


// function fw_get_post_builder_object() {
// 	
// 	if ( isset ( $_GET['post_id'] ) && !empty ( $_GET['post_id'] ) ) {
// 		
// 		print_r ( json_encode ( get_post_meta ( $_GET['post_id'], 'builder', true ) ) );
// 		
// 	}
// 	
// 	wp_die();
// 	
// }
// 
// add_action ( 'wp_ajax_fw_get_post_builder_object', 'fw_get_post_builder_object' );



// function fw_create_block() {
// 	
// 	echo '<div class="fw-element fw-block">';
// 	
// 		echo '<div class="fw-block-inner"></div>';
// 		
// 		echo '<div class="fw-element-footer d-flex text-uppercase">';
// 		
// 			echo '<span class="me-2">Block</span>';
// 			
// 			echo '<a href="#fw-block-type-select" data-bs-toggle="modal" class="fw-btn-add-block me-2" data-key="">Add block</a>' . "\n";
// 		
// 		echo '</div>';
// 	
// 	echo '</div>';
// 	
// 	wp_die();
// 	
// }
// 
// add_action ( 'wp_ajax_fw_create_block', 'fw_create_block' );


function fw_get_builder_object() {
	
	if ( isset ( $_GET['post_id'] ) && !empty ( $_GET['post_id'] ) ) {
		
		$builder = get_post_meta ( $_GET['post_id'], 'builder', true );
		
		if ( !empty ( $builder ) ) {
			
			echo $builder;
			
		} else {
			
			echo '{}';
			
			// echo '{ "type": "page", "inputs": { "id": "auto" }, "post_id": ' . $_GET['post_id'] . ', "key": ' . $_GET['post_id'] . ', "children": [ { "type": "section", "inputs": { "id": "auto" }, "children": [], "key": "' . $_GET['post_id'] . '-1" } ] }';
			
		}
		
	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_get_builder_object', 'fw_get_builder_object' );
// add_action ( 'wp_ajax_nopriv_fw_get_builder_object', 'fw_get_builder_object' );


function fw_setup_element_ajax() {
	
	// print_r($_GET['element']);
	// echo "\n";
	// print_r($_GET['globals']);
	// echo "\n";
	
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
	
	$form_data = $_GET['inputs'];
	
	print_r($form_data);
	
	$new_post_ID = wp_insert_post ( array (
		'post_type' => $form_data['post_type'],
		'post_status' => $form_data['post_status'],
		'post_title' => $form_data['post_title']
	) );
	
	echo 'layout: ' . $form_data['layout'];
	
	if ( $form_data['layout'] != '' ) {
		
		// get the builder object from the given ID
		
		$layout_obj = get_post_meta ( (int) $form_data['layout'], 'builder', true );
		
		// update ID keys
		
		// replace instances of the layout ID
		// with the new post ID
		
		$layout_obj = str_replace ( '"' . $form_data['layout'], '"' . $new_post_ID, $layout_obj );
		
		echo "\n\n" . $layout_obj . "\n\n";
		
		// and populate the new post with it
		
		update_post_meta ( $new_post_ID, 'builder', $layout_obj );
		
	}
	
	echo "\n" . 'done: ' . $new_post_ID;
	
	wp_die();
	
}


//
// SETTINGS MODALS
//

function fw_modal_settings() {
	
	$globals = $_GET['globals'];
	
	$element = $_GET['element'];

	switch ( $_GET['content'] ) {
		case 'delete' :
		case 'new-post' :
			
			include ( locate_template ( 'resources/functions/builder/modals/' . $_GET['content'] . '.php' ) );
			
			break;
			
		default :
			
			$modal_content = $_GET['content'];
			
			if ( str_contains ( $modal_content, '/' ) ) {
				$modal_content = explode ( '/', $modal_content );
				$modal_content = $modal_content[0];
			}
	
?>
	
<div class="modal-header">
	<h4 class="modal-title">
		<span class="modal-title-action"></span>
		<span class="modal-title-content"><?php echo $modal_content; ?></span>
	</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<?php
		
			if ( $_GET['content'] != 'block' ) {
		
		?>
		
		<button type="button" class="btn btn-primary fw-settings-submit">Add</button>
		
		<?php
		
			}
		
		?>
		
	</div>
</div>

<div class="modal-body p-0">
	
	<form class="accordion accordion-flush" id="element-form">
		<?php
		
			include ( locate_template ( 'resources/functions/builder/field-groups/' . $_GET['content'] . '.php' ) );
			
		?>
		
		<div class="accordion-item">
			<h2 class="accordion-header" id="element-form-head-settings">
				<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-settings" aria-expanded="false" aria-controls="element-form-settings">
					Settings
				</button>
			</h2>
			
			<div id="element-form-settings" class="accordion-collapse collapse" aria-labelledby="element-form-head" data-bs-parent="#element-form">
				<div class="accordion-body container-fluid">
					<?php
					
						include ( locate_template ( 'resources/functions/builder/field-groups/settings.php' ) );
						
					?>
				</div>
			</div>
		</div>
		
	</form>
</div>

<?php

	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_modal_settings', 'fw_modal_settings' );

function fw_modal_add_setting() {
	
	// dumpit ( $_GET['setting_data'] );
	
	if ( isset ( $_GET['path'] ) ) {
		
		$full_path = 'resources/functions/builder/field-groups/' . $_GET['path'] . '.php';
		
		// echo $full_path . '.php';
		
		if ( locate_template ( $full_path ) != '' ) {
			
			echo '<div class="fw-form-flex-row" data-item="' . $_GET['path'] . '" data-row-index="0">';
			
			include ( locate_template ( $full_path ) );
			
			echo '</div>';
			
		} else {
			
			echo 'huh';
			
		}
		
	}
	
	// include ( locate_template ( 'resources/functions/builder/' . $_GET['setting'] . '.php' ) );
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_modal_add_setting', 'fw_modal_add_setting' );

//
// UTILITIES
//

function fw_get_element_classes ( $type ) {
	
	return $GLOBALS['classes'][$type];
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_get_element_classes', 'fw_get_element_classes' );


//
// FLEX FIELD ROWS
//

// 
// 
// function fw_output_flex_row() {
// 	
// 	if ( isset ( $_GET['path'] ) ) {
// 		
// 		// echo $_GET['path'] . '.php';
// 		
// 		if ( locate_template ( $_GET['path'] . '.php' ) != '' ) {
// 			
// 			echo '<div class="fw-form-flex-row d-flex justify-content-between">';
// 			
// 			include ( locate_template ( $_GET['path'] . '.php' ) );
// 			
// 			echo '<div class="fw-form-flex-delete-row">&times;</div>';
// 			
// 			echo '</div>';
// 			
// 		} else {
// 			
// 			echo 'huh';
// 			
// 		}
// 		
// 	}
// 	
// 	wp_die();
// 	
// }
// 
// 
// add_action ( 'wp_ajax_fw_output_flex_row', 'fw_output_flex_row' );
