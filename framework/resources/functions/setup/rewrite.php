<?php

function array_key_exists_wildcard ( $array, $search, $return = '' ) {
	$search = str_replace( '\*', '.*?', preg_quote( $search, '/' ) );
	$result = preg_grep( '/^' . $search . '$/i', array_keys( $array ) );
	
	if ( $return == 'key-value' )
		return array_intersect_key( $array, array_flip( $result ) );
		
	return $result;
}

// add_action ( 'parse_request', 'debug_404_rewrite_dump', 100 );

function debug_404_rewrite_dump ( &$wp ) {
	
	if ( !is_admin() ) {
		
		global $wp;
		global $wp_rewrite;
		
		echo '<h4>rewrite rules</h4>';
		dumpit ( $wp_rewrite->wp_rewrite_rules(), true );
		
		// echo '<h4>request</h4>';
		// dumpit ( $wp->request, true );
		
		echo '<h4>matched rule and query</h4>';
		dumpit ( $wp->matched_rule, true );
		
		echo '<h4>matched query</h4>';
		dumpit ( $wp->matched_query, true );
		
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


add_action ( 'init', 'fw_add_custom_rewrites', 10 );

function fw_add_custom_rewrites () {
	
	global $wp_rewrite;
	
	add_rewrite_tag ( '%lang%', '([^&]+)' );
	
	$all_langs = get_option ( 'fw_langs' );
	
	$rewrite_code = $GLOBALS['fw']['current_lang_code'];
	
	switch ( fw_get_rewrite_method() ) {
		
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
							'index.php?lang=$matches[1]&cpt=' . $cpt . '&slug_' . $code . '=$matches[2]',
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
					
					// archive
					
					foreach ( get_taxonomies ( array ( 'public' => true ) ) as $taxonomy ) {
						
						if ( $taxonomy != 'post_format' ) {
						
							$tax_slug = get_option ( 'options_tax_' . $taxonomy . '_slug_' . $code );
							
							// taxonomy archive i.e. /fr/tax/term/
							
							$taxonomy_rules = array (
								array (
									'rule' => '(^' . $code . ')/' . $tax_slug . '/(.+?)/(feed|rdf|rss|rss2|atom)/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&feed=$matches[3]'
								),
								array (
									'rule' => '(^' . $code . ')/' . $tax_slug . '/(.+?)/embed/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&embed=true'
								),
								array (
									'rule' => '(^' . $code . ')/' . $tax_slug . '/(.+?)/page/?([0-9]{1,})/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&paged=$matches[3]'
								),
								array (
									'rule' => '(^' . $code . ')/' . $tax_slug . '/(.+?)/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]'
								),
							);
							
							foreach ( $taxonomy_rules as $tax_rule ) {
						
								add_rewrite_rule (
									$tax_rule['rule'],
									$tax_rule['query'],
									'top'
								);
								
							}
						}
						
					}
					
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
			
			add_filter ( 'rewrite_rules_array', function ( $rules ) {
				
				$rewrite_code = $GLOBALS['fw']['current_lang_code'];
				
				// $new_rules = $rules;
				
				if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
					
					// $new_rules = array();
					
					foreach ( $rules as $rule => $query ) {
						
						$add_rule = false;
						
						// add lang=XX
						
						$new_query = $query . '&lang=' . $rewrite_code;
						
						// 
						
						foreach ( get_post_types ( array ( 'public' => true, '_builtin' => false ) ) as $cpt ) {
							
							if ( $add_rule == false ) {
								
								// if the path includes 'cpt=', 
								// change it to 'post_type=cpt&slug_XX='
								
								if ( str_contains ( $query, $cpt . '=' ) ) {
									
									$new_query = str_replace ( $cpt . '=', 'cpt=' . $cpt . '&slug_' . $rewrite_code . '=', $new_query );
									
									$add_rule = true;
									
								}
								
							}
								
						}
						
						if ( $add_rule == false ) {
						
							$new_query = str_replace ( '&name=', '&slug_' . $rewrite_code . '=', $new_query );
								
							$new_query = str_replace ( 'pagename=', 'path_' . $rewrite_code . '=', $new_query );
							
							$add_rule = true;
							
						}
						
						if ( $add_rule == true ) {
							$rules[$rule] = $new_query;
						}
						
					}
					
				}
				
				// taxonomies
				
				foreach ( get_taxonomies ( array ( 'public' => true ) ) as $taxonomy ) {
					
					// echo $taxonomy . '<br>';
					
					if ( $taxonomy != 'post_format' ) {
						
						$tax_slug = get_option ( 'options_tax_' . $taxonomy . '_slug_' . $rewrite_code );
						
						// taxonomy archive i.e. /tax(fr)/term(fr)/
						
						// find items in $rules that start with the taxonomy slug
						
						$default_rules = array_key_exists_wildcard ( $rules, $taxonomy . '*', 'key-value' );
						
						foreach ( $default_rules as $rule => $query ) {
							
							$new_key = str_replace ( $taxonomy . '/', $tax_slug . '/', $rule );
							
							$new_query = $query . '&archive=' . $taxonomy;
							
							// replace category_name= with slug=
							$new_query = str_replace ( 'category_name=', 'slug_' . $rewrite_code . '=', $new_query );
							
							// replace tax= with slug=
							$new_query = str_replace ( $taxonomy . '=', 'slug_' . $rewrite_code . '=', $new_query );
							
							// echo $new_query . '<br>';
							
							$rules = array ( $new_key => $new_query ) + $rules;
							
						}
							
					}
					
				}
				
				return $rules;
				
			}, 1 );
			
			break;
			
	}
	
}

// don't redirect the front page

add_action ( 'template_redirect', function() {
	if ( is_front_page() ) {
		remove_action ( 'template_redirect', 'redirect_canonical' );
	}
}, 0 );

// add lang to query vars

add_filter ( 'query_vars', function ( $query_vars ) {
	
	$query_vars[] = 'lang';
	$query_vars[] = 'archive';
	$query_vars[] = 'cpt';
	
	foreach ( get_option ( 'fw_langs' ) as $code => $lang ) {
		$query_vars[] = 'slug_' . $code;
		$query_vars[] = 'path_' . $code;
	}
	
	// dumpit ( $query_vars );
	
	return $query_vars;
	
} );

// use slug_lang query var to adjust query
// there's probably a better way to do all of this,
// someday

add_action ( 'pre_get_posts', 'get_post_by_lang_slug' );

function get_post_by_lang_slug ( $query ) {

	if ( is_admin() )
		return $query;

	if (
		!is_admin() && 
		$query->is_main_query()
	) {
		
		// dumpit ( $query );
		
		foreach ( get_option ( 'fw_langs' ) as $code => $lang ) {
			
			if ( $code != 'en' ) {
			
				$has_slug = false;
				$has_path = false;
				
				if (
					isset ( $query->query_vars['slug_' . $code] ) &&
					!empty ( $query->query_vars['slug_' . $code] )
				) {
					
					$has_slug = true;
					
					$query->set ( 'meta_query', array ( 
						array (
							'key' => 'slug_' . $code,
							'value' => $query->query_vars['slug_' . $code],
							'compare' => '='
						)
					) );
					
					$query->set ( 'post_type', array ( 'post', 'page' ) );
					
				}
				
				if (
					isset ( $query->query_vars['path_' . $code] ) &&
					!empty ( $query->query_vars['path_' . $code] )
				) {
					
					$query->set ( 'meta_query', array ( 
						array (
							'key' => 'path_' . $code,
							'value' => $query->query_vars['path_' . $code],
							'compare' => '='
						)
					) );
					
					$query->set ( 'post_type', array ( 'post', 'page' ) );
					
					$has_path = true;
				}
					
				if (
					$has_slug == true &
					(
						isset ( $query->query_vars['archive'] ) &&
						$query->query_vars['archive'] != ''
					)
				) {
				
					// TAXONOMY ARCHIVE
					
					// find the term that matches the slug
					
					$en_term = get_terms ( array (
						'hide_empty' => false,
						'meta_query' => array(
							array (
								'key' => 'slug_' . $code,
								'value' => $query->query_vars['slug_' . $code],
								'compare' => 'LIKE'
							)
						),
					) );
						
					if ( !empty ( $en_term ) ) {
						
						$en_term = $en_term[0];
						
						$query->is_archive = true;
						$query->is_home = false;
						
						if ( $query->query_vars['archive'] == 'category' ) {
							
							// category
							
							// unset ( $query->query_vars['slug_' . $code] );
							// unset ( $query->query_vars['archive'] );
							
							$query->query['category_name'] = $en_term->slug;
							$query->query_vars['category_name'] = $en_term->slug;
							
							$query->is_category = true;
							
						} elseif ( $query->query_vars['archive'] == 'post_tag' ) {
							
							// tag
							
							$query->is_tag = true;
							
						} else {
							
							// custom taxonomy
						
							$query->is_tax = true;
							$query->query_vars[$query->query_vars['archive']] = $en_term->slug;
							
						}
						
					}
				
				} elseif (
					$has_slug == true ||
					$has_path == true
				) {
					
					// tell the query what this isn't
					$query->is_home = false;
					$query->is_archive = false;
					$query->is_date = false;
					$query->is_year = false;
					$query->is_month = false;
					$query->is_day = false;
					
					// tell it what it is
					$query->is_single = true;
					$query->is_singular = true;
					
					if (
						isset ( $query->query_vars['cpt'] ) &&
						!empty ( $query->query_vars['cpt'] )
					) {
					
						// CPT SINGLE
						
						$query->set ( 'post_type', array ( $query->query_vars['cpt'] ) );
						
					}
					
				}
				
			}
			
		} // foreach lang
		
		// correct here
		// dumpit ( $query );
		// echo '<hr>';
		
	}
	
}

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
		
		// echo 'link : ' . $url . '<br>';
		// echo 'id : ';
		// dumpit ( $post_id ); echo '<br>';
		
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
	
	// what is the language rewrite method
	
	if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
		
		// echo 'translate this: ' . $url .'<br>';
		
		$url = translate_permalink ( $url, $link_id, $GLOBALS['fw']['current_lang_code'] );
		
		// $url = trailingslashit ( $new_URL );
		
	} // if not en
	
	return $url;
	
}

function translate_path ( $post_id, $lang ) {
	
	if ( gettype ( $post_id ) == 'object' ) {
		$post_id = $post_id->ID;
	}
	
	if ( 
		(
			get_post_type ( $post_id ) != 'post' &&
			get_post_type ( $post_id ) != 'page'
		) && 
		in_array ( get_post_type ( $post_id ), array_keys ( get_post_types () ) )
	) {
		$path[] = get_post_type ( $post_id );
	}
	
	// parents
	if ( has_post_parent ( $post_id ) ) {
		$path = translate_path ( wp_get_post_parent_id ( $post_id ), $lang );
	}
	
	if ( $lang == 'en' ) {
		$path[] = get_the_slug ( $post_id );
	} else {
		$path[] = get_post_meta ( $post_id, 'slug_' . $lang, true );	
	}
	
	// dumpit ( $path );
	
	return $path;
	
}

function translate_permalink ( $url, $post_id, $lang ) {
	
	// echo 'url: ' . $url . '<br>';
	// echo 'id: ' . $post_id . '<br>';
	// echo 'lang: ' . $lang . '<br>';
		
	$post_obj = get_post ( $post_id );
	
	$new_slug = $post_obj->post_name;
	
	if ( $lang != 'en' ) {
		$new_slug = get_post_meta ( $post_id, 'slug_' . $lang, true );
	}
	
	// todo
	// fix this so it's an independent function
	// use it in rewrite
	// and menu
	
	// domain/prefix
	
	// default to the current home URL
	$new_URL = $GLOBALS['vars']['home_url'];
	
	switch ( fw_get_rewrite_method() ) {
		
		case 'path' :
			
			// add the language path
			$new_URL = $GLOBALS['vars']['original_home_url'];
			
			if ( $lang != 'en' ) {
				$new_URL .= $lang . '/';
			}
			
			if ( $post_obj->post_type == 'post' ) {
				
				$post_path = explode ( '/', untrailingslashit ( $url ) );
				
				$splice_index = 4;
				
				if (
					$GLOBALS['fw']['current_lang_code'] == 'en' ||
					!str_contains ( $url, '/' . $GLOBALS['fw']['current_lang_code'] . '/' )
				) {
					$splice_index = 3;
				}
					
				array_pop ( $post_path );
				
				// dumpit ( $post_path );
				
				$post_path = implode ( '/',  array_splice ( $post_path, $splice_index ) );
				
				$new_URL .= $post_path . '/' . $new_slug;
				
			} elseif ( $post_obj->post_type != 'page' ) {
				
				$new_URL .= implode ( '/', translate_path ( $post_id, $lang ) );
				
			} else {
				
				if ( (int) $post_id != (int) get_option ( 'page_on_front' ) ) {
					
					$new_URL .= implode ( '/', translate_path ( $post_id, $lang ) );
					
				}
				
			}
			
			break;
			
		case 'domain' :
			
			// echo $GLOBALS['fw']['current_lang_code'] . ' > ' . $lang . '<br>';
			
			if ( $lang == 'en' ) {
				
				$new_URL = $GLOBALS['vars']['original_home_url'];
				
			} elseif ( $lang != $GLOBALS['fw']['current_lang_code'] ) {
				
				$all_langs = get_option ( 'fw_langs' );
				
				// dumpit ( $all_langs[$lang] );
				
				$new_URL = $_SERVER['REQUEST_SCHEME'] . '://' . $all_langs[$lang]['domain'] . '/';
				
			}
			
			if ( $post_obj->post_type == 'post' ) {
				
				$post_path = explode ( '/', untrailingslashit ( $url ) );
				
				array_pop ( $post_path );
				
				$post_path = implode ( '/',  array_splice ( $post_path, 3 ) );
				
				$new_URL .= $post_path . '/' . $new_slug;
				
			} else {
				
				if ( (int) $post_id != (int) get_option ( 'page_on_front' ) ) {
					
					$new_URL .= implode ( '/', translate_path ( $post_id, $lang ) );
					
				}
				
				// echo '5b. ' . $new_URL;
				
			}
			
			break;
			
	}
	
	// echo '1. ' . $new_URL . '<br>';
	
	// dumpit ( $post_obj );
	
	
	
	// echo 'result: ' . $new_URL . '<hr>';
	// echo '<hr>';
	
	return trailingslashit ( $new_URL );
	
}

//
// TITLES
//

add_filter ( 'document_title_parts', 'translate_doc_title' );

function translate_doc_title ( $title_array ) {
	
	$lang = $GLOBALS['fw']['current_lang_code'];
	
	if ( is_archive() ) {
		
		$this_tax = get_taxonomy ( $GLOBALS['fw']['current_query']['taxonomy'] );
		$tax_name = $this_tax->labels->singular_name;
		$term_name = '';
			
		if ( $lang != 'en' ) {
			
			$tax_name = get_option ( 'options_tax_' . $GLOBALS['fw']['current_query']['taxonomy'] . '_title_single_' . $lang );
			
			$term_name = get_term_meta ( $GLOBALS['fw']['current_query']['term_id'], 'title_' . $lang, true );
			
		}
		
		if ( $term_name != '' ) {
		
			$title_array['title'] = get_term_meta ( $GLOBALS['fw']['current_query']['term_id'], 'title_' . $lang, true );
			
		}
		
		if ( $tax_name != '' ) {
		
			$title_array = array_slice ( $title_array, 0, 1, true ) 
				+ array ( 'tax' => $tax_name ) 
				+ array_slice ( $title_array, 1, true );
				
		}
		
	} elseif (
		( is_page() || is_singular() ) &&
		get_post_meta ( get_the_ID(), 'title_' . $lang, true ) != ''
	) {
		
		$title_array['title'] = get_post_meta ( get_the_ID(), 'title_' . $lang, true );
		
	}
	
	return $title_array;
	
}

add_filter ( 'the_title', 'translate_post_title', 10, 2 );

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

