<?php

// add_action( 'parse_request', 'debug_404_rewrite_dump' );

function debug_404_rewrite_dump ( &$wp ) {
	
	if ( !is_admin() ) {
		
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

add_action ( 'init', 'init_get_langs', 10 );

function init_get_langs() {
	
	if ( !get_option ( 'fw_langs' ) ) {
		
		add_option (
			'fw_langs', 
			array ( 
				'en' => 'English',
				'fr' => 'Français',
				'es' => 'Español'
			)
		);
		
		// dumpit ( get_option ( 'fw_langs' ) );
		
	}
	
}

add_action ( 'init', 'add_my_rewrites', 20 );

function add_my_rewrites() {
	
	add_rewrite_tag ( '%lang%', '([^&]+)' );
	
	global $fw;
	
	// dumpit ($_SESSION);
	
	$all_langs = get_option ( 'fw_langs' );
	$en = array_shift ( $all_langs );
	
	// dumpit ( $all_langs );
	
	// add_rewrite_rule(
	// 	'^fr/\/(.*)/?$',
	// 	'index.php?lang=fr',
	// 	'top'
	// );
	
	// gets fr
	// (^\/fr\/)
	
	// gets last segment
	// .*\/([^\/]+)\/
	// (.*)\/([^\/]+)\/
	
	// .*\/([^\/]+)\/
	
	// ^lang/([^/]*)/(.*)([^/]+)?
	
	// add_rewrite_rule (
	// 	'^lang/([^/]*)/([^/]*)/([^/]*)/?',
	// 	'index.php?lang=$matches[1]&pagename=$matches[3]',
	// 	'top'
	// );
	// 
	// // works for top level page
	// add_rewrite_rule (
	// 	'^lang/([^/]*)/([^/]*)/?',
	// 	'index.php?lang=$matches[1]&pagename=$matches[2]',
	// 	'top'
	// );
	
	// sub page
	
	// add_rewrite_rule (
	// 	'lang/([a-z0-9-]+)/([^/]*)[/]?$',
	// 	'index.php?lang=$matches[1]&pagename=$matches[2]',
	// 	'top' 
	// );
	// 
	
	
	// fw-template/([^/]+)(?:/([0-9]+))?/?$ => index.php?fw-template=$matches[1]&page=$matches[2]
	
	//
	// ALL PAGES OTHER THAN HOME
	//
	
	foreach ( $all_langs as $code => $lang ) {
		
		// fr slug fields
		/*
		$slug_query = get_posts ( array (
			'post_type' => 'any',
			'post_status' => 'publish',
			'meta_query' => array (
				array (
					'key' => 'slug_' . $code,
					'value' => '',
					'compare' => '!='
				)
			)
		) );
		
		// dumpit ( $slug_query );
		
		if ( !empty ( $slug_query ) ) {
			foreach ( $slug_query as $result ) {
				
				$this_slug = get_post_meta ( $result->ID, 'slug_' . $code, true );
				$id_param = 'page_id';
				$val = $result->ID;
				
				$rule = $code . '/';
				
				if ( $result->post_type != 'page' ) {
					$rule .= $result->post_type . '/';
					$id_param = $result->post_type;
					$val = $result->post_name;
				}
					
				$rule .= $this_slug;
				
				// dumpit ( $code . '/' . $result->post_type . '/' . $this_slug . '/ -> ' . $result->ID );
				
				// /fr/le-page-slug/ -> lang=fr&p=ID
				
				add_rewrite_rule (
					$rule,
					'index.php?lang=' . $code . '&' . $id_param . '=' . $val,
					'top'
				);
				
			}
		}*/
		
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
	
	//
	// HOME
	// 
		
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
	
	// $query_vars[] = 'lang';
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
	
	// dumpit ( $GLOBALS );
	
	// dumpit ($_SESSION);

	if ( $GLOBALS['fw']['lang'] != 'en' ) {
		
		$new_URL = home_url() . '/' . $GLOBALS['fw']['lang'] . '/';
		
		if ( $type != 'post' && $type != 'page' ) {
			
			$new_URL .= $type . '/';
			
		}
		
		if ( $type == 'post' ) {
			
			// dumpit ( $post_id );
			
			$post_path = str_replace ( home_url(), '', $url);
			
			// echo '1 ' . $post_path . '<br>';
			
			$post_path = substr ( str_replace ( '/' . $post_id->post_name, '', $post_path), 1 );
			
			// echo '2 ' . $post_path . '<br>';
			
			// account for permalink structure
			
			$new_URL .= $post_path . get_post_meta ( $post_id->ID, 'slug_' . $GLOBALS['fw']['lang'], true );
			
		} else {
		
			$new_URL .= implode ( '/', translate_path ( $post_id, $GLOBALS['fw']['lang'] ) );
			
		}
		
		// echo $url . ' -> ' . trailingslashit ( $new_URL ) . '<br>';
		
		$url = trailingslashit ( $new_URL );
		
	}
	
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

add_filter( 'document_title_parts', 'translate_doc_title' );

function translate_doc_title ( $title_array ) {
	
	if (
		$GLOBALS['fw']['lang'] != 'en' &&
		get_post_meta ( get_the_ID(), 'title_' . $GLOBALS['fw']['lang'], true )
	) {
		
		$title_array['title'] = get_post_meta ( get_the_ID(), 'title_' . $GLOBALS['fw']['lang'], true );
	}
	
	return $title_array;
	
}

add_filter('the_title', 'translate_post_title', 10, 2);

function translate_post_title ( $title, $id ) {
	
	if ( is_admin() && !wp_doing_ajax() ) {
		return $title;
	}
	
	if ( $GLOBALS['fw']['lang'] != 'en' ) {
		if (get_post_meta ( $id, 'title_' . $GLOBALS['fw']['lang'], true ) != '') {
			$title = get_post_meta ( $id, 'title_' . $GLOBALS['fw']['lang'], true );
		}
	}
	
	return $title;
	
}