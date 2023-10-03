<?php

// delete_option ( 'fw_langs' );

$types = array (
	'section', 'container', 'column', 'block'
);

function fw_builder() {
	
	// this page's builder object

	$builder = get_post_meta ( get_the_ID(), 'builder', true );

	$this_ID = get_the_ID();
	
	if ( $builder == '' ) {
		
		$builder = array (
			"type" => "page", 
			"inputs" => array (
				"id" => "auto"
			),
			"post_id" => $this_ID,
			"key" => $this_ID
		);
	
		update_post_meta ( $this_ID, 'builder', json_encode ( $builder, JSON_PRETTY_PRINT ) );
		
	} else {
		
		$builder = json_decode ( $builder, true );
		
	}
	
	// update_post_meta ( get_the_ID(), 'builder', $builder );

	// dumpit ( $builder );
	
	//
	// OUTPUT
	//
	
	fw_output_loop ( $builder, 1, true );
	
}

function builder_is_active() {
	
	if ( current_user_can ( 'administrator' ) ) {
		return true;
	}
	
}

//
// ACTIONS
//

// element open/close functions

add_action ( 'fw_before_element_open', 'fw_output_extras_before_open', 10, 1 );
add_action ( 'fw_after_element_open', 'fw_output_extras_after_open', 10, 1 );
add_action ( 'fw_before_element_close', 'fw_output_element_children', 10, 3 );

// BEFORE OPEN 

// check for settings

function fw_output_extras_before_open ( $element ) {
	
	// check for settings
	
	if ( isset ( $element['inputs']['settings'] ) ) {
		
		$offcanvas_ID = ( $element['inputs']['id'] == 'auto' ) ? 'element-' . $element['key'] : $element['inputs']['id'];
		
		if ( $element['type'] == 'block' ) {
			$offcanvas_ID .= '-inner';
		}
		
		// dumpit ( $element['inputs']['settings'] );
		
		foreach ( $element['inputs']['settings'] as $setting_obj ) {
			
			foreach ( $setting_obj as $setting => $options ) {
				
				switch ( $setting ) {
					
					case 'offcanvas' :
						
						$offcanvas_btn_class = '';
						
						if ( $options['breakpoint'] != 'xs' ) {
							$offcanvas_btn_class .= 'd-' . $options['breakpoint'] . '-none';
						}
					
						if ( $options['trigger'] == 'insert' ) {
							
							
?>

<button class="btn btn-primary <?php echo $offcanvas_btn_class; ?>" type="button" data-bs-toggle="offcanvas" data-bs-target="#<?php echo $offcanvas_ID; ?>">Open</button>

<?php
						
						}
						
						break;
					
				}
			}
		}
	}
	
}

// AFTER OPEN


function fw_output_extras_after_open ( $element ) {
	
	// check for settings
	
	if ( isset ( $element['inputs']['settings'] ) ) {
		
		// dumpit ( $element['inputs']['settings'] );
		
		foreach ( $element['inputs']['settings'] as $setting_obj ) {
			foreach ( $setting_obj as $setting => $options ) {
				
				switch ( $setting ) {
						
					case 'background' :
						
						$bg_classes = [ 'fw-bg' ];
						
						$bg_classes[] = 'bg-position-' . str_replace ( ' ', '-', $options['position'] );
						$bg_classes[] = 'bg-attachment-' . $options['attachment'];
						$bg_classes[] = 'bg-size-' . $options['size'];
						$bg_classes[] = 'bg-opacity-' . floatval ( $options['opacity'] ) * 100;
						
						$bg_urls = json_decode ( $options['file']['url'], true );
					
?>

<div class="<?php echo implode ( ' ', $bg_classes ); ?>" style="background-image: url(<?php echo $bg_urls['full']; ?>);"></div>

<?php
					
						break;
						
					case 'offcanvas' :
						
						if ( $options['close'] == 'true' ) {
						
?>

<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>

<?php
				
						}		
						
						break;
						
				}
				
			}
		}
	}
	
}


// BEFORE CLOSE

// output element children







function fw_output_loop ( $element, $level, $include_autogen ) {
	
	if ( gettype ( $include_autogen ) == 'undefined' ) {
		
		$include_autogen = true;
		
	}
	
	// dumpit ( $element );
	
	fw_output_element ( $element, $level, $GLOBALS['fw'], $include_autogen, true );
	
	$GLOBALS['fw']['autogen'] = false;
	
}

//
// OUTPUT ELEMENTS
//

function fw_output_element_children ( $element, $level, $include_autogen ) {
	
	if ( isset ( $element['children'] ) && !empty ( $element['children'] ) ) {
		
		foreach ( $element['children'] as $child ) {
			fw_output_loop ( $child, $level + 1, $include_autogen );
		}
		
	}
	
}

function fw_setup_element ( $element, $globals ) {
	
	if ( $element == null ) {
		return;
	}
	
	$settings = array (
		'el_type' => $element['type'],
		'autogen' => false
	);
	
	if ( str_contains ( $settings['el_type'], '/' ) ) {
		$settings['el_type'] = explode ( '/', $settings['el_type'] )[0];
	}
	
	// classes array
	
	$settings['classes'] = array ( 'fw-element', 'fw-' . $settings['el_type'] );
	
	if ( isset ( $element['autogen'] ) ) {
		
		if (
			(
				gettype ( $element['autogen'] ) == 'boolean' &&
				$element['autogen'] == true
			) ||
			(
				gettype ( $element['autogen'] == 'string' ) &&
				$element['autogen'] == 'true'
			)
		) {
			
			// echo "\n\n\n\n" . 'autogen true' . "\n\n\n\n";
			$settings['autogen'] = true;
			$settings['classes'][] = 'fw-auto-generated';
			
		}
		
	}
	
	// data-* attributes array
	
	$settings['atts'] = array (
		'key' => $element['key']
	);
	
	switch ( $settings['el_type'] ) {
		case 'page' : 
			break;
			
		case 'container' :
			
			$settings['classes'][] = 'container-fluid';
			
			break;
			
		case 'row' :
			
			$settings['classes'][] = 'row';
			
			break;
			
		case 'column' :
			
			$settings['classes'][] = 'col';
			
			if (
				isset ( $element['inputs']['breakpoints'] ) && 
				!empty ( $element['inputs']['breakpoints'] ) 
			) {
				
				$is_hidden = false;
			
				// dumpit ( $element['inputs']['breakpoints'] );
			
				foreach ( $element['inputs']['breakpoints'] as $breakpoint => $keys ) {
					
					foreach ( $keys as $key => $val ) {
						
						// echo $key . '-' . $breakpoint . '-' . $val . '<br>';
						
						$new_class = $key;
						
						if ( $breakpoint != 'xs' ) $new_class .= '-' . $breakpoint;
						
						$new_class .= '-';
						
						if ( $val != '' ) {
							
							if ( $key == 'd' ) {
								
								// hide/show setting
								
								if ( $val == 'none' ) {
									
									// hiding at this breakpoint
									
									if ( $is_hidden == false ) {
										
										// not already hidden
										
										$new_class .= 'none';
										$is_hidden = true;
										
										array_push ( $settings['classes'], $new_class );
										
									}
									
								} else {
									
									// showing at this breakpoint
									
									if ( $is_hidden == true ) {
										
										// is already hidden
										
										$new_class .= 'block';
										$is_hidden = false;
										
										array_push ( $settings['classes'], $new_class );
										
									}
									
									
								}
								
							} else {
								
								// other column setting
								
								$new_class .= $val;
								
								array_push ( $settings['classes'], $new_class );
								
							}
							
						}
						
					}
				}
				
			}
			
			break;
			
	}
	
	// classes
	
	$settings['el_id'] = 'element-' . $element['key'];
	
	if (
		isset ( $element['inputs']['id'] ) && 
		$element['inputs']['id'] != 'auto'
	) {
		$settings['el_id'] = $element['inputs']['id'];
	}
	
	if (
		isset ( $element['inputs']['class'] ) && 
		!empty ( $element['inputs']['class'] )
	) {
	
		$settings['classes'] = array_merge ( $settings['classes'], $element['inputs']['class'] );
		
	}
	
	// check for settings
	
	if ( isset ( $element['inputs']['settings'] ) ) {
		
		// dumpit ( $element['inputs']['settings'] );
		
		foreach ( $element['inputs']['settings'] as $setting_obj ) {
			
			foreach ( $setting_obj as $setting => $options ) {
				
				switch ( $setting ) {
					
					case 'offcanvas' :
						
						$settings['classes'][] = 'has-offcanvas';
						
						$settings['classes'][] = 'offcanvas-' . $options['placement'];
						
						if ( $options['breakpoint'] != 'xs' ) {
							$settings['classes'][] = 'offcanvas-' . $options['breakpoint'];
						} else {
							$settings['classes'][] = 'offcanvas';
						}
						
						if (
							$options['trigger'] == 'selector' &&
							$options['selector'] != ''
						) {
							$settings['atts']['offcanvas-trigger'] = $options['selector'];
							$settings['atts']['offcanvas-breakpoint'] = $options['selector'];
						}
						
						// backdrop - default, no scroll
						$settings['atts']['bs-scroll'] = 'false';
						$settings['atts']['bs-backdrop'] = 'true';
						
						switch ( $options['backdrop'] ) {
							case 'scroll' :
								// backdrop with scroll
								$settings['atts']['bs-scroll'] = 'true';
								break;
								
							case 'off' :
								// no backdrop
								$settings['atts']['bs-scroll'] = 'true';
								$settings['atts']['bs-backdrop'] = 'false';
								break;		
						}
						
						break;
					
					case 'spacing' : 
						
						// dumpit ( $options );
						
						foreach ( $options as $index => $spacing ) {
							
							$new_class = $spacing['property'] . $spacing['side'];
							
							if ( $spacing['breakpoint'] != '' ) {
								$new_class .= '-' . $spacing['breakpoint'];
							}
							
							$new_class .= '-' . $spacing['value'];
							
							$settings['classes'][] = $new_class;
							
						}
						
						break;
						
					case 'background' :
						
						$settings['classes'][] = 'has-bg';
						
						// $settings['background'] = $options['background'];
						
						break;
						
					case 'aos' :
						
						wp_enqueue_script ( 'aos' );
						
						foreach ( $options as $option => $val ) {
							if ( $val != '' ) {
								
								$this_att = ( $option != 'effect' ) ? 'aos-' . $option : 'aos';
								
								$settings['atts'][$this_att] = $val;
								
							}
						}
						
						break;
						
					case 'colors' :
						
						if ( $options['bg'] != '' ) {
							$settings['classes'][] = 'bg-' . $options['bg'];
						}
						
						if ( $options['text'] != '' ) {
							$settings['classes'][] = 'text-' . $options['text'];
						}
						
						if ( $options['headings'] != '' ) {
							
							$css_string = 'color: var(--bs-' . $options['headings'] . ')';
							
							if ( !isset ( $GLOBALS['css']['#' . $settings['el_id']] ) )
								$GLOBALS['css']['#' . $settings['el_id']] = array();
							
							$GLOBALS['css']['#' . $settings['el_id']]['h1'] = array ( $css_string );
							$GLOBALS['css']['#' . $settings['el_id']]['h2'] = array ( $css_string );
							$GLOBALS['css']['#' . $settings['el_id']]['h3'] = array ( $css_string );
							$GLOBALS['css']['#' . $settings['el_id']]['h4'] = array ( $css_string );
							$GLOBALS['css']['#' . $settings['el_id']]['h5'] = array ( $css_string );
							$GLOBALS['css']['#' . $settings['el_id']]['h6'] = array ( $css_string );
							
						}
						
						break;
						
				}
			}
			
		}
	}
	
	return $settings;
	
}

function fw_output_element ( $element, $level, $globals, $include_autogen, $callbacks = true ) {
	
	if ( $element == null ) {
		return;
	}
	
	if ( !isset ( $element['type'] ) ) {
		dumpit ( $element );
	}
	
	// echo "\n\n\n" . 'var dump element' . "\n\n";
	// var_dump ( $element );
	
	$settings = fw_setup_element ( $element, $globals );
	
	// dumpit ( $settings );
	
	$output_this_element = true;
	
	// AUTO-GENERATED
	
	// flag when the template's first actual element is created
	// if autogen = false we don't want to output auto elements
	// BUT once a real element exists, we DO want to start outputting
	// auto elements in the rest of the tree
	
	if ( $settings['autogen'] == false ) {
		$GLOBALS['fw']['autogen'] = true;
	}
	
	// skip the 'page' element
	// if inserting a template
	
	if ( $settings['el_type'] == 'template' ) {
		$include_autogen = false;
	}
	
	if (
		$settings['el_type'] == 'page' &&
		$include_autogen == false 
	) {

		$output_this_element = false;
		
	}
	
	if (
		$settings['el_type'] != 'page' &&
		isset ( $settings['autogen'] ) &&
		$settings['autogen'] == true &&
		$include_autogen == false
	) {
		
		$output_this_element = false;
		
	}
	
	if ( $settings['el_type'] != 'page' && $GLOBALS['fw']['autogen'] == true ) {
		$output_this_element = true;
	}
	
	if ( $output_this_element == true ) {
	
		// dumpit ( $settings );
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_open', $element, $level );
		}
		
		if ( $include_autogen == false ) {
			
			$settings['classes'][] = 'fw-template-element';
			
		}
		
		if ( $settings['el_type'] != 'template' ) {
		
			echo '<div id="' . $settings['el_id'] . '" class="' . implode ( ' ', $settings['classes'] ) . '"';
			
			foreach ( $settings['atts'] as $key => $val ) {
				echo ' data-' . $key . '="' . $val . '"';
			}
			
			echo '>';
			
		}
		
		if ( $callbacks == true ) {
			do_action ( 'fw_after_element_open', $element, $level );
		}
		
		if ( $settings['el_type'] == 'template' ) {
			
			$template_type = 'post';
			$template_key = $element['inputs']['post_id'];
			
			if ( $element['inputs']['path'] != null ) {
				$template_type = 'include';
				$template_key = $element['inputs']['path'];
			}
			
			if ( builder_is_active() ) {
				echo '<div class="fw-template-label begin" data-template-type="' . $template_type . '" data-template-key="' . $template_key . '" data-key="' . $settings['atts']['key'] . '"></div>';
			}
			
			if ( $element['inputs']['path'] != null ) {
				
				if ( locate_template ( 'template/' . $element['inputs']['path'] ) != '' ) {
					
					include ( locate_template ( 'template/' . $element['inputs']['path'] ) );
					
				} else {
					
					echo '<div class="alert alert-warning">Template ' . $element['inputs']['path'] . ' not found</div>';
					
				}
				
			} elseif ( $element['inputs']['post_id'] != null ) {
			
				$template_builder = json_decode ( get_post_meta ( $element['inputs']['post_id'], 'builder', true ), true );
				
				fw_output_loop ( $template_builder, 1, false );
				
			}
			
			
			if ( builder_is_active() ) {
				echo '<div class="fw-template-label end" data-template-key="' . $template_key . '" data-key="' . $settings['atts']['key'] . '"></div>';
			}
			
		} elseif ( str_contains ( $settings['el_type'], 'block' ) ) {
			
			echo fw_output_element_content ( $element, $globals );
			
		}
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_close', $element, $level, $include_autogen );
		}
		
		if ( $settings['el_type'] != 'template' ) {
			echo '</div>';
		}
	
	} else {
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_close', $element, $level, $include_autogen );
		}
		
	}
	
	// echo 'all done';
	
}

function fw_output_element_content ( $element, $globals ) {
	
	// if doing ajax we need to reset $GLOBALS['fw']
	// with the data that was given by the app
	
	if ( !isset ( $GLOBALS['fw'] ) ) {
		$GLOBALS['fw'] = $globals;
	}
	
	$output = '';
	
	// $element = (array) $element;
	$element['inputs'] = (array) $element['inputs'];
	
	$element_path = 'resources/functions/builder/front-end/' . $element['type'] . '.php';
	
	if ( locate_template ( $element_path ) != '' ) {
		
		$inner_ID = ( $element['inputs']['id'] == 'auto' ) ? 'element-' . $element['key'] . '-inner' : $element['inputs']['id'] . '-inner';
		
		// open fw-element-inner
		$inner_classes = array ( 'fw-element-inner' );
		
		if ( isset ( $element['inputs']['settings']['offcanvas'] ) ) {
			
			$inner_classes[] = 'offcanvas-' . $element['inputs']['settings']['offcanvas']['placement'];
			
			$inner_classes[] = ( $element['inputs']['settings']['offcanvas']['breakpoint'] == 'xs' ) ? 'offcanvas' : 'offcanvas-' . $element['inputs']['settings']['offcanvas']['breakpoint'];
			
		}
		
		$output .= '<div id="' . $inner_ID . '" class="' . implode ( ' ', $inner_classes ) . '">';
		
		ob_start();
		
		include ( locate_template ( $element_path ) );

		$output .= ob_get_clean();
		
		// close .fw-element-inner
		$output .= '</div>';
		
	} else {
		
		dumpit ( $element );
		
		$output = '<div class="alert alert-warning">Template ' . $element['content'] . '.php not found</div>';
		
	}
	
	return $output;
	
}

//
// UX
//

function insert_fw_modal_container() {

?>

<div class="modal fade fw-modal" id="fw-modal" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="spinner-border my-3 mx-auto"></div>
		</div>
	</div>
</div>

<?php
	
}

add_action ( 'fw_modals', 'insert_fw_modal_container' );

//
// ACTIONS
//

// save meta

add_action ( 'save_post', function ( $post_id, $post ) {
	
	$parent_id = wp_is_post_revision ( $post_id );
	
	if ( $parent_id ) {
		
		// get the revision post object & builder field
		$parent = get_post ( $parent_id );
		$builder_field = get_post_meta ( $parent_id, 'builder', true );

		if ( $builder_field != '' ) {
			
			// add the builder field to the revision
			add_metadata ( 'post', $post_id, 'builder', $builder_field );
			
		}

	}

}, 10, 2 );

// restore revision

add_action ( 'wp_restore_post_revision', function ( $post_id, $revision_id ) {

	$post = get_post ( $post_id );
	$revision_post = get_post ( $revision_id );
	$builder_field = get_metadata ( 'post', $revision_post->ID, 'builder', true );

	if ( $builder_field !== false ) {
		update_post_meta ( $post_id, 'builder', $builder_field );
	} else {
		delete_post_meta ( $post_id, 'builder' );
	}

}, 10, 2 );

// show in revision

add_filter ( '_wp_post_revision_fields', function ( $fields ) {

	$fields['builder'] = 'Builder';
	return $fields;

} );

// add_filter ( '_wp_post_revision_field_builder', 'fw_revision_field', 10, 2 );

function fw_revision_field ( $value, $field ) {

	global $revision;
	
	dumpit ( get_metadata ( 'post', $revision->ID, $field, true ) );
	
	return get_metadata ( 'post', $revision->ID, $field, true );

}