<?php

// add_action( 'parse_request', 'debug_404_rewrite_dump', 100 );

function debug_404_rewrite_dump ( &$wp ) {
	
	if ( !is_admin() ) {
		
		global $wp;
		global $wp_rewrite;
		
		// echo '<h4>rewrite rules</h4>';
		// dumpit ( $wp_rewrite->wp_rewrite_rules(), true );
		
		echo '<h4>matched rule and query</h4>';
		dumpit ( $wp->matched_rule, true );
		
		echo '<h4>matched query</h4>';
		dumpit ( $wp->matched_query, true );
		
		// echo '<h4>request</h4>';
		// dumpit ( $wp->request, true );
		
	}
	
}

// add_action ( 'init', 'fw_init_get_langs', 10 );

function fw_init_get_langs() {
	
	// delete_option ( 'fw_langs' );
	
	if ( !get_option ( 'fw_langs' ) ) {
		
		if (
			is_array ( get_field ( 'fw_languages', 'option' ) ) &&
			!empty ( get_field ( 'fw_languages', 'option' ) )
		) {
			
			// dumpit ( get_field ( 'fw_languages', 'option' ) );
			
		} else {
			
			// setup default langs field
			
			update_field ( 'fw_languages', array (
				array (
					'name' => 'English',
					'code' => 'en',
					'locale' => 'en_US'
				)
			), 'option' );
			
			// update the theme option
			// for init/rewrite function
			
			
			
		}
		
		// add_option (
		// 	'fw_langs', 
		// 	array ( 
		// 		'en' => 'English',
		// 		'fr' => 'Français',
		// 		'es' => 'Español'
		// 	)
		// );
		
		// dumpit ( get_option ( 'fw_langs' ) );
		
	}
	
}
// 
// add_action ( 'init', function() {
// 	
// 	$GLOBALS['rewrite_code'] = 'fr';
// 	
// }, 9 );


add_action ( 'init', 'add_my_rewrites', 10 );

function add_my_rewrites () {
	
	// echo 'do rewrites<br>';
	
	global $wp_rewrite;
	
	add_rewrite_tag ( '%lang%', '([^&]+)' );
	
	$all_langs = get_option ( 'fw_langs' );// get_option ( 'fw_langs' );
	
	$rewrite_method = get_option ( 'options_fw_language_settings_rewrite' );
	
	$rewrite_code = $GLOBALS['fw']['current_lang_code'];
	
	switch ( $rewrite_method ) {
		
		case 'path' :
			
			// rewrite method:
			// add language to path
	
			//
			// ALL PAGES OTHER THAN HOME
			//
			
			foreach ( $all_langs as $code => $lang ) {
				
				if ( $code != 'en' ) {
					
					// custom post types
					
					foreach ( get_post_types ( array ( 'public' => true ) ) as $cpt ) {
						
						add_rewrite_rule (
							'(^' . $code . ')/' . $cpt . '/(.*)([^/]+)?',
							'index.php?lang=$matches[1]&slug_' . $code . '=$matches[2]',
							'top'
						);
						
					}
					
					// posts with permalink structure
					
					// month and name
					
					add_rewrite_rule (
						'(^' . $code . ')/([0-9]{4})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=$matches[1]&year=$matches[2]&monthnum=$matches[3]&slug_' . $code . '=$matches[4]&page=$matches[5]',
						'top'
					);
					
					// day and name
					
					add_rewrite_rule (
						'(^' . $code . ')/([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=$matches[1]&year=$matches[2]&monthnum=$matches[3]&day=$matches[4]&slug_' . $code . '=$matches[5]&page=$matches[6]',
						'top'
					);
					
					// page/post
					
					add_rewrite_rule (
						'(^' . $code . ')/(.*)([^/]+)?',
						'index.php?lang=$matches[1]&path_' . $code . '=$matches[2]',
						'top'
					);
					
					// HOME
					
					add_rewrite_rule (
						'(^' . $code . ')/?$',
						'index.php?lang=$matches[1]&page_id=' . get_option ( 'page_on_front' ),
						'top' 
					);
					
				}
					
			}
			
			break;
		
		case 'domain' :
			
			// * unpleasant *
			// destroy the existing rewrite rules
			// completely, because we need to replace everything
			// with the lang=XX query
			
			update_option ( 'rewrite_rules', array() );
			
			// echo $GLOBALS['fw']['current_lang_code'] . '<br>';
			// dumpit ( $_SERVER );
			
			$rewrite_code = $GLOBALS['fw']['current_lang_code'];
			
			add_filter ( 'rewrite_rules_array', function ( $rules ) {
				
				// $new_rules = $rules;
				
				if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
					
					// $new_rules = array();
					
					foreach ( $rules as $rule => $query ) {
						
						// add lang=XX
						
						$new_query = $query . '&lang=' . $GLOBALS['fw']['current_lang_code'];
						
						$new_query = str_replace ( '&name=', '&slug_' . $GLOBALS['fw']['current_lang_code'] . '=', $new_query );
							
						$new_query = str_replace ( 'pagename=', 'path_' . $GLOBALS['fw']['current_lang_code'] . '=', $new_query );
							
						// adjust individual rules
						// 
						// switch ( $rule ) {
						// 	
						// 	case '([0-9]{4})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$' :
						// 		break;
						// 		
						// }
						// 
						$rules[$rule] = $new_query;
						
						// echo $query .'<br>';
						// dumpit ( $rule );
					}
					
				}
				return $rules;
				
				
			}, 1 );
			
			// $rewrite_code = $_SERVER['HTTP_HOST'];
	
			foreach ( $all_langs as $code => $lang ) {
				
				if ( $code != 'en' ) {
					
					
					/*
					// custom post types
					
					foreach ( get_post_types () as $cpt ) {
						
						// echo 'code is ' . $rewrite_code . '<br>';
						// echo 'string is ' . 'index.php?lang=' . $rewrite_code . '&slug_' . $rewrite_code . '=$matches[1]' . '<br>';
						
						// echo $cpt . '/(.*)([^/]+)?',
						// 'index.php?lang=' . $rewrite_code . '&slug_' . $rewrite_code . '=$matches[1]' . '<br>';
						
						add_rewrite_rule (
							$cpt . '/(.*)([^/]+)?',
							'index.php?lang=' . $rewrite_code . '&slug_' . $rewrite_code . '=$matches[1]',
							'top'
						);
						
						// var_dump ( $test );
						
					}
					
					// posts with permalink structure
					
					// month and name
					
					add_rewrite_rule (
						'([0-9]{4})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=' . $rewrite_code . '&year=$matches[1]&monthnum=$matches[2]&slug_' . $rewrite_code . '=$matches[3]&page=$matches[4]',
						'top'
					);
					
					echo 'pre<br>';
					dumpit ( $wp_rewrite->wp_rewrite_rules() );
					dumpit ( get_option ( 'rewrite_rules' ) );
					echo 'post<br>';
					dumpit ( $wp_rewrite->wp_rewrite_rules() );
					echo '<hr>';
					
					// day and name
					
					add_rewrite_rule (
						'([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=' . $rewrite_code . '&year=$matches[1]&monthnum=$matches[2]&day=$matches[3]&slug_' . $rewrite_code . '=$matches[4]&page=$matches[5]',
						'top'
					);
					
					// page/post
					
					add_rewrite_rule (
						'(.*)([^/]+)?',
						'index.php?lang=' . $rewrite_code . '&path_' . $rewrite_code . '=$matches[1]',
						'top'
					);
					
					// HOME
					
					add_rewrite_rule (
						'/?$',
						'index.php?lang=' . $rewrite_code . '&page_id=' . get_option ( 'page_on_front' ),
						'top' 
					);*/
					
				}
					
			}
			
			
			
			
			break;
			
	}
	
}

// don't redirect the front page

add_action( 'template_redirect', function(){
	if ( is_front_page() ) {
		remove_action ( 'template_redirect', 'redirect_canonical' );
	}
}, 0 );

// add_action ('wp_body_open', function() {
// 	
// 	echo '<a href="/">/</a><br>';
// 	echo '<a href="/sample-page/">/sample-page/</a><br>';
// 	echo '<a href="/sample-page/child/">/sample-page/child/</a><br>';
// 	
// 	echo '<a href="/fr/">/fr/</a><br>';
// 	echo '<a href="/fr/sample-page/">/fr/sample-page/</a><br>';
// 	echo '<a href="/fr/sample-page/child/">/fr/sample-page/child/</a><br>';
// 	
// 	// echo 'lang: ' . get_query_var ( 'lang' );
// 	// 
// 	// if ( is_404() ) {
// 	// 	echo '<br>404<br>';
// 	// } else {
// 	// 	echo '<br>id ' . get_the_ID();
// 	// }
// });

// add lang to query vars

add_filter ( 'query_vars', function ( $query_vars ) {
	
	$query_vars[] = 'lang';
	// commented out because 2 'langs' were showing up in 
	// dumpit ( $query_vars );
	// and not really sure why
	
	foreach ( get_option ( 'fw_langs' ) as $code => $lang ) {
		$query_vars[] = 'slug_' . $code;
		$query_vars[] = 'path_' . $code;
	}
	
	// dumpit ( $query_vars );
	
	return $query_vars;
	
} );

// use slug_lang query var to adjust query

function get_post_by_lang_slug ( $query ) {

	if ( is_admin() )
		return $query;

	if (
		!is_admin() && 
		$query->is_main_query()
	) {
		
		foreach ( get_option ( 'fw_langs' ) as $code => $lang ) {
			
			if (
				isset ( $query->query_vars['slug_' . $code] ) &&
				!empty ( $query->query_vars['slug_' . $code] )
			) {
		
				$query->set ( 'post_type', array ( 'post', 'page' ) );
				
				$query->set ( 'meta_query', array ( 
					array (
						'key' => 'slug_' . $code,
						'value' => $query->query_vars['slug_' . $code],
						'compare' => '='
					)
				) );
				
			}
			
			if (
				isset ( $query->query_vars['path_' . $code] ) &&
				!empty ( $query->query_vars['path_' . $code] )
			) {
			
				$query->set ( 'post_type', array ( 'post', 'page' ) );
				
				$query->set ( 'meta_query', array ( 
					array (
						'key' => 'path_' . $code,
						'value' => $query->query_vars['path_' . $code],
						'compare' => '='
					)
				) );
				
			}
			
		}
		
	}
	
}
 
add_action ( 'pre_get_posts', 'get_post_by_lang_slug' );

// dumpit SQL after any query

function dump_query_sql ( $query ) {
	dumpit ( $query );
	return $query;
}

// add_filter ( 'query', 'dump_query_sql' );

//
// PERMALINKS
//

foreach ( [ 'post', 'page', 'attachment', 'post_type' ] as $type ) {
	
	add_filter ( $type . '_link', function ( $url, $post_id, ? bool $sample = null ) use ( $type ) {
		
		return apply_filters ( 'wpse_link', $url, $post_id, $sample, $type );
		
	}, 9999, 3 );
	
}

add_filter ( 'wpse_link', 'fw_rewrite_link', 10, 4 );

function fw_rewrite_link ( $url, $post_id, $sample, $type ) {
	
	if ( is_admin() && !wp_doing_ajax() ) {
		return $url;
	}
	
	// echo 'original URL: ' . $url . '<br>';
	
	// is the link a translated version of the current page
	
	if ( gettype ( $post_id ) == 'object' ) {
		$link_id = $post_id->ID;
	} else {
		$link_id = $post_id;
	}
	
	// echo 'link ID: ' . $link_id . '<br>';
	// echo 'current ID: ' . $GLOBALS['fw']['current_query']['ID'] . '<br>';
	// 
	// if ( $link_id == $GLOBALS['fw']['current_query']['ID'] ) {
	// 	echo 'ya';
	// 	echo $url;
	// }
	
	// what is the language rewrite method
	
	if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
		
		switch ( get_option ( 'options_fw_language_settings_rewrite' ) ) {
			
			case 'path' :
					
				$new_URL = home_url() . '/' . $GLOBALS['fw']['current_lang_code'] . '/';
				
				if ( $type != 'post' && $type != 'page' ) {
					
					$new_URL .= $type . '/';
					
				}
				
				if ( $type == 'post' ) {
					
					$post_path = str_replace ( home_url(), '', $url);
					
					$post_path = substr ( str_replace ( '/' . $post_id->post_name, '', $post_path), 1 );
					
					$new_URL .= $post_path . get_post_meta ( $post_id->ID, 'slug_' . $GLOBALS['fw']['current_lang_code'], true );
					
				} else {
				
					$new_URL .= implode ( '/', translate_path ( $post_id, $GLOBALS['fw']['current_lang_code'] ) );
					
				}
				
				break;
				
			case 'domain' :
				
				$new_URL = $GLOBALS['vars']['home_url'];
				
				if ( $type != 'post' && $type != 'page' ) {
					
					$new_URL .= $type . '/';
					
				}
				
				if ( $type == 'post' ) {
					
					// get the path by removing the home_url from $url
					
					$post_path = str_replace ( $GLOBALS['vars']['original_home_url'], '', $url );
					
					// replace the original slug with the translated one
					
					$post_path = str_replace ( '/' . $post_id->post_name, '', $post_path);
					
					// account for permalink structure
					
					$new_URL .= $post_path . get_post_meta ( $post_id->ID, 'slug_' . $GLOBALS['fw']['current_lang_code'], true );
					
				} else {
					
					if ( (int) $post_id != (int) get_option ( 'page_on_front' ) ) {
						$new_URL .= implode ( '/', translate_path ( $post_id, $GLOBALS['fw']['current_lang_code'] ) );
					}
					
				}
				
				// echo $url . ' -> ' . trailingslashit ( $new_URL ) . '<br>';
				
				
				break;
				
		}
		
		$url = trailingslashit ( $new_URL );
		
	} // if not en
	
	return $url;
	
}

function translate_path ( $post_id, $lang ) {
	
	if ( gettype ( $post_id ) == 'object' ) {
		$post_id = $post_id->ID;
	}
	
	// parents
	if ( has_post_parent ( $post_id ) ) {
		$path = translate_path ( wp_get_post_parent_id ( $post_id ), $lang );
	}
	
	if ( $lang == 'en' ) {
		$path[] = get_the_slug ( $post_id );
	} else {
		// echo 'ya ' . get_post_meta ( $post_id, 'slug_' . $lang, true );
		
		$path[] = get_post_meta ( $post_id, 'slug_' . $lang, true );
	}
	
	return $path;
	
}


//
// TITLES
//

add_filter ( 'document_title_parts', 'translate_doc_title' );

function translate_doc_title ( $title_array ) {
	
	if (
		$GLOBALS['fw']['current_lang_code'] != 'en' &&
		get_post_meta ( get_the_ID(), 'title_' . $GLOBALS['fw']['current_lang_code'], true )
	) {
		
		$title_array['title'] = get_post_meta ( get_the_ID(), 'title_' . $GLOBALS['fw']['current_lang_code'], true );
	}
	
	return $title_array;
	
}

add_filter('the_title', 'translate_post_title', 10, 2);

function translate_post_title ( $title, $id ) {
	
	if ( is_admin() && !wp_doing_ajax() ) {
		return $title;
	}
	
	if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
		if (get_post_meta ( $id, 'title_' . $GLOBALS['fw']['current_lang_code'], true ) != '') {
			$title = get_post_meta ( $id, 'title_' . $GLOBALS['fw']['current_lang_code'], true );
		}
	}
	
	return $title;
	
}

