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
			'type' => 'page', 
			'inputs' => array (
				'id' => 'auto'
			),
			'post_id' => $this_ID,
			'key' => $this_ID
		);
	
		update_post_meta ( $this_ID, 'builder', json_encode ( $builder, JSON_PRETTY_PRINT ) );
		
	} else {
		
		$builder = json_decode ( $builder, true );
		
	}
	
	// BEGIN INITIAL OUTPUT LOOP
	
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

add_action ( 'fw_before_element_open', 'fw_output_extras_before_open', 10, 3 );
add_action ( 'fw_after_element_open', 'fw_output_extras_after_open', 10, 3 );
add_action ( 'fw_before_element_close', 'fw_output_element_children', 10, 4 );
add_action ( 'fw_before_element_close', 'fw_output_extras_before_close', 11, 4 );

// BEFORE OPEN 

// check for settings

function fw_output_extras_before_open ( $element, $level, $settings ) {
	
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

function fw_output_extras_after_open ( $element, $level, $settings ) {
	
	// check for settings
	
	if ( isset ( $element['inputs']['settings'] ) ) {
		
		// dumpit ( $element['inputs']['settings'] );
		
		foreach ( $element['inputs']['settings'] as $setting_obj ) {
			foreach ( $setting_obj as $setting => $options ) {
				
				switch ( $setting ) {
					
					case 'carousel' :
						
						echo '<div id="' . $settings['el_id'] . '-carousel" class="swiper">';
						echo '<div class="swiper-wrapper">';
						
						break;
						
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

function fw_output_extras_before_close ( $element, $level, $settings, $include_autogen ) {

	// check for settings
	
	if ( isset ( $element['inputs']['settings'] ) ) {
		
		// dumpit ( $settings );
		
		foreach ( $element['inputs']['settings'] as $setting_obj ) {
			foreach ( $setting_obj as $setting => $options ) {
				
				switch ( $setting ) {
					
					case 'carousel' :
						
						echo '</div><!-- .swiper-wrapper -->';
					
						echo '<div id="' . $settings['el_id'] . '-carousel-pagination" class="swiper-pagination d-none"></div>';	
					
						echo '<div id="' . $settings['el_id'] . '-carousel-prev" class="swiper-button-prev d-none"></div>';
						echo '<div id="' . $settings['el_id'] . '-carousel-next" class="swiper-button-next d-none"></div>';
						
						// echo '<div id="' . $settings['el_id'] . '-carousel-scrollbar" class="swiper-scrollbar"></div>';
						
						echo '</div><!-- .swiper -->';
						
						unset ( $GLOBALS['fw']['carousel'] );
						
						break;
				}
			}
		}
	}

}

//
// OUTPUT LOOP
// output recursively 
// beginning with the given element
//

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

function fw_output_element_children ( $element, $level, $settings, $include_autogen ) {
	
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
		'autogen' => false,
		'classes' => array ( 'fw-element' )
	);
	
	// classes array
	
	if ( str_contains ( $settings['el_type'], '/' ) ) {
		
		// it's a block
		
		// explode the 'block/xxx/yyy' string
		$settings['el_type'] = explode ( '/', $settings['el_type'] );
		
		// last part becomes a 'block-type-zzz' class
		$settings['classes'][] = 'fw-block-type-' . end ( $settings['el_type'] );
		
		// first becomes the new settings[el_type]
		$settings['el_type'] = $settings['el_type'][0];
		
	}
	
	$settings['classes'][] = 'fw-' . $settings['el_type'];
	
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
					
					case 'carousel' :
						$settings['classes'][] = 'has-swiper';
						
						// build the swiper JSON object
						
						$carousel = $options;
						
						// echo 'pre<br>';
						// dumpit ( $carousel );
						
						unset ( $carousel['type'] );
						unset ( $carousel['index'] );
						
						$breakpoints = array();
						$defaults = array();
						
						$key_replace = [ 0, 576, 768, 992, 1200, 1400 ];
						
						foreach ( array ( 'slidesPerView', 'slidesPerGroup' ) as $key ) {
							
							$i = 0;
							
							// map breakpoint values to their matching key_replace arrays
							
							foreach ( $carousel[$key] as $breakpoint => $val ) {
								
								if ( $val != '' ) {
									
									// skip if no value
									
									if ( $breakpoint == 'xs' ) {
										
										// set the default value if 'xs'
										
										$defaults[$key] = (int) $val;
										
									} else {
										
										// create the array if necessary
										
										if ( !isset ( $breakpoints[$key_replace[$i]] ) )
											$breakpoints[$key_replace[$i]] = array();
										
										// e.g. breakpoints[768][slidesPerView] = 1
										$breakpoints[$key_replace[$i]][$key] = (int) $val;
									}
								}
								
								$i++;
								
							}
							
							if ( isset ( $defaults[$key] ) ) {
								$carousel[$key] = $defaults[$key];
							} else {
								unset ( $carousel[$key] );
							}
						}
						
						$carousel['breakpoints'] = $breakpoints;
						
						// bullets
						
						if ( $carousel['pagination'] != 'none' ) {
							
							$carousel['pagination'] = array (
								'type' => $carousel['pagination'],
								'el' => '#' . $settings['el_id'] . '-carousel-pagination',
								'clickable' => true
							);
							
							if ( $carousel['pagination']['type'] == 'dynamic' ) {
								$carousel['pagination']['type'] = 'bullets';
								$carousel['pagination']['dynamicBullets'] = true;
							}
							
						} else {
							unset ( $carousel['pagination'] );
						}
						
						// arrows
						
						if ( $carousel['navigation'] == 'true' ) {
							
							$carousel['navigation'] = array (
								'enabled' => true,
								'nextEl' => '#' . $settings['el_id'] . '-carousel-next',
								'prevEl' => '#' . $settings['el_id'] . '-carousel-prev'
							);
							
						} else {
							unset ( $carousel['navigation'] );
						}
						
						// other
						
						if (
							( isset ( $carousel['other'] ) && isset ( $carousel['other']['rows'] ) ) &&
							!empty ( $carousel['other']['rows'] )
						) {
							
							foreach ( $carousel['other']['rows'] as $row ) {
								
								// each repeater row
								
								$new_val = $row['value'];
								
								if ( $row['type'] == 'integer' ) {
									$new_val = (int) $row['value'];
								} elseif ( $row['type'] == 'boolean') {
									$new_val = ( $row['value'] == 'true' ) ? true : false;
								} elseif ( $row['type'] == 'json' ) {
									$new_val = json_decode ( $row['value'] );
								}
								
								$carousel[$row['name']] = $new_val;
								
							}
							
						}
						
						unset ( $carousel['other'] );
						
						// autoplay
						
						if ( $carousel['autoplay'] != '0' && $carousel['autoplay'] != 0 ) {
							$carousel['autoplay'] = array (
								'delay' => ( (int) $carousel['autoplay'] ) * 1000,
								'pauseOnMouseEnter' => true
							);
						} else {
							unset ( $carousel['autoplay'] );
						}
						
						switch ( $carousel['effect'] ) {
							case 'fade' :
								$carousel['fadeEffect'] = array (
									'crossFade' => true
								);
								break;
								
							case 'cube' :
								break;
								
							case 'coverflow' :
								break;
								
							case 'flip' :
								break;
								
							default : 
								// unset ( $carousel['effect'] );
						}
						
						// convert any leftover true/false strings to boolean
						
						foreach ( $carousel as $key => $val ) {
							if ( $val == 'true' ) {
								$carousel[$key] = true;
							} elseif ( $val == 'false' ) {
								unset ( $carousel[$key] );
							}
						}
						
						// dumpit ( $carousel );
						
						$settings['atts']['swiper-settings'] = json_encode ( $carousel );
						
						wp_enqueue_script ( 'swiper' );
						
						$GLOBALS['fw']['carousel'] = array (
							'element' => $settings['el_type'],
							'slide' => ( $settings['el_type'] == 'block' ) ? '' : $GLOBALS['fw']['elements'][array_search ( $settings['el_type'], $GLOBALS['fw']['elements'] ) + 1]
						);
						
						break;
						
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
						
						// remove sometime later
						
						$rows_array = $options;
						
						if ( isset ( $options['rows'] ) ) {
							$rows_array = $options['rows'];
						}
						
						// ^ remove later
						
						foreach ( $rows_array as $index => $spacing ) {
							
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
					
					case 'accordion' :
						
						$settings['classes'][] = 'accordion';
						
						$settings['atts']['accordion-heading'] = $options['heading'];
						
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
						
					case 'attributes' :
						
						foreach ( $options['rows'] as $index => $att ) {
							
							$settings['atts'][$att['name']] = $att['value'];
							
						}
						
						// $settings['atts']
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
	
	
	// other alterations
	
	if (
		isset ( $GLOBALS['fw']['carousel'] ) && 
		$GLOBALS['fw']['carousel']['slide'] == $settings['el_type']
	) {
		
		$settings['classes'][] = 'swiper-slide';
		
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
	
	// echo "<pre>\n\n\n" . 'var dump element' . "\n\n</pre>";
	// dumpit ( $element );
	
	$settings = fw_setup_element ( $element, $globals );
	
	// dumpit ( $settings );
	
	$output_this_element = true;
	
	// AUTO-GENERATED
	
	// flag when the template's first actual element is created
	// if autogen = false we don't want to output auto elements
	// BUT once a real element exists, we DO want to start outputting
	// auto elements in the rest of the tree
	
	if (
		$settings['el_type'] != 'page' &&
		$settings['autogen'] == false
	) {
		$GLOBALS['fw']['autogen'] = true;
	}
	
	
	// echo '<br>' . 'global autogen: ';
	// echo ( $GLOBALS['fw']['autogen'] == true ) ? 'y' : 'n';
	// echo '<br>';
	
	// set include_autogen to whatever the global is
	// $include_autogen = $GLOBALS['fw']['autogen'];
	
	// skip the 'page' element
	// if inserting a template
	
	// if ( $settings['el_type'] == 'template' ) {
	// 	$include_autogen = false;
	// }
	
	// echo '<br>' . 'include autogen: ';
	// echo ( $include_autogen == true ) ? 'y' : 'n';
	// echo '<br>';
	
	if (
		$settings['el_type'] == 'page' &&
		$include_autogen == false 
	) {
		
		// never include the page element
		// when auto-generating
		
		$output_this_element = false;
		
	}
	
	// not outputting the page element
	// element settings[autogen] is true
	// include_autogen is false
	
	if (
		$settings['el_type'] != 'page' &&
		(
			isset ( $settings['autogen'] ) &&
			$settings['autogen'] == true
		) &&
		$include_autogen == false
	) {
		
		$output_this_element = false;
		
	}
	
	// is the global autogen override turned on
	
	if (
		$settings['el_type'] != 'page' && 
		(
			isset ( $globals['autogen'] ) && 
			$globals['autogen'] == true
		)
	) {
		
		$output_this_element = true;
		
	}
	
	// echo 'output ' . $settings['el_type'] . ': ';
	// echo ( $output_this_element == true ) ? 'y' : 'n';
	// echo '<br>';
	
	// if we have decided to output this element
	
	if ( $output_this_element == true ) {
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_open', $element, $level, $settings );
		}
		
		// is this a template element
		
		if ( $include_autogen == false ) {
			$settings['classes'][] = 'fw-template-element';
		}
		
		if ( $settings['el_type'] != 'template' ) {
			
			// element output begins here
		
			echo '<div id="' . $settings['el_id'] . '" class="' . implode ( ' ', $settings['classes'] ) . '"';
			
			foreach ( $settings['atts'] as $key => $val ) {
				echo ' data-' . $key . '=\'' . $val . '\'';
			}
			
			echo '>';
			
		}
		
		if ( $callbacks == true ) {
			do_action ( 'fw_after_element_open', $element, $level, $settings );
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
				// echo 'ya';
				
				$GLOBALS['fw']['autogen'] = false;
				fw_output_loop ( $template_builder, 1, false );
				
			}
			
			
			if ( builder_is_active() ) {
				echo '<div class="fw-template-label end" data-template-key="' . $template_key . '" data-key="' . $settings['atts']['key'] . '"></div>';
			}
			
		} elseif ( str_contains ( $settings['el_type'], 'block' ) ) {
			
			echo fw_output_element_content ( $element, $globals, $settings );
			
		}
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_close', $element, $level, $settings, $include_autogen );
		}
		
		if ( $settings['el_type'] != 'template' ) {
			echo '</div>';
		}
	
	} else {
		
		if ( $callbacks == true ) {
			do_action ( 'fw_before_element_close', $element, $level, $settings, $include_autogen );
		}
		
	}
	
	// echo 'all done';
	
}

function fw_output_element_content ( $element, $globals, $settings ) {
	
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
		
		if ( isset ( $element['inputs']['inner_class'] ) ) {
			$inner_classes[] = $element['inputs']['inner_class'];
		}
		
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
