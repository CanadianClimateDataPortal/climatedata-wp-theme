<?php

function fw_replace_lang_domain ( $str ) {
	
	$new_str = $str;
	
	if ( !empty ( $str ) && $str != ' ' )
		$new_str = str_replace ( $GLOBALS['vars']['original_site_url'], $GLOBALS['vars']['site_url'], $str );
	
	return $new_str;
	
}

function fw_get_rewrite_method() {
	
	// get the rewrite method
	// if the user's logged in, force the 'path' method
	// because WP login cookies don't work
	// across domains
	
	return ( is_user_logged_in() ) ? 'path' : get_option ( 'options_fw_language_settings_rewrite' );
}

function fw_setup_current_lang() {
	
	global $wp;
	global $fw;
	global $vars;
	
	$all_langs = get_option ( 'fw_langs' );
	$rewrite_method = fw_get_rewrite_method();
	
	$fw['current_lang_code'] = 'en';
	$fw['current_lang_obj'] = null;
	
	// store the old home_url and site_url
	
	$vars['original_home_url'] = trailingslashit ( home_url() );
	$vars['original_site_url'] = trailingslashit ( site_url() );
	
	// dumpit ( $fw );
	
	// how are languages getting rewritten
	
	switch ( $rewrite_method ) {
		
		case 'path' :
			
			foreach ( $all_langs as $code => $lang ) {
					
				// the first 3 characters of REQUEST_URI are /xx
				
				if ( substr ( $_SERVER['REQUEST_URI'], 0, 3 ) == '/' . $code ) {
					$fw['current_lang_code'] = substr ( $_SERVER['REQUEST_URI'], 1, 2 );
				}
				
			}
			
			break;
			
		case 'domain' :
	
			foreach ( $all_langs as $code => $lang ) {
				
				// echo 'check lang';
				// dumpit ( $lang );
				// echo '<br>';
				
				// echo $lang['domain'] . ' vs ' . $_SERVER['HTTP_HOST'];
				
				if ( $lang['domain'] == $_SERVER['HTTP_HOST'] ) {
					
					// this is where we're setting the current language
					
					$fw['current_lang_code'] = $code;
					
					// echo 'code: ' . $code . '<br>';
					
					// generate the new home/site URLs
					
					$vars['home_url'] = $_SERVER['REQUEST_SCHEME'] . '://' . $lang['domain'] . '/';
				
					$url_array = explode ( '/', $GLOBALS['vars']['original_site_url'] );
					
					// grab the protocol
					$vars['site_url'] = $url_array[0];
					
					// remove the first 3 elements (protocol and domain)
					$url_array = array_splice ( $url_array, 3 );
					
					$vars['site_url'] .= '//' . $lang['domain'] . '/' . implode ( '/', $url_array );
						
					// filter any new calls to home_url and site_url
					
					add_filter ( 'home_url', function ( $url, $path ) {
						// echo '<br><br>home_url - ';
						if ( !is_admin() )
							return $GLOBALS['vars']['home_url'] . ltrim ( $path, '/' );
							
						return $url;
					}, 1, 2 );
					
					add_filter ( 'site_url', function ( $url ) {
						// echo '<br><br>site_url - ';
						if ( !is_admin() ) return trailingslashit ( $GLOBALS['vars']['site_url'] );
						return $url;
					}, 1 );
					
					add_filter ( 'content_url', 'fw_replace_lang_domain', 1, 2 );
					add_filter ( 'script_loader_tag', 'fw_replace_lang_domain', 1 );
					add_filter ( 'rest_url', 'fw_replace_lang_domain', 1 );
					
					// add_filter ( 'content_url', function($str) {
					// 	
					// 	echo 'content url - ';
					// 	
					// 	$str = fw_replace_lang_domain($str);
					// 	
					// 	return $str;
					// 	
					// }, 1, 2 );
					
					// add_filter ( 'script_loader_tag', function( $src ) {
					// 	
					// 	echo 'script_loader_tag - ';
					// 	echo '<br>';
					// 	
					// 	// dumpit ( $tag );
					// 	// dumpit ( $handle );
					// 	dumpit ( $src );
					// 	// var_dump ( $str );
					// 	
					// 	echo '<br>';
					// 	
					// 	$str = fw_replace_lang_domain($src);
					// 	
					// 	return $src;
					// 	
					// }, 1 );
					
					
					// add_filter ( 'rest_url', function($str) {
					// 	
					// 	echo 'rest_url - ';
					// 	
					// 	$str = fw_replace_lang_domain($str);
					// 	
					// 	return $str;
					// 	
					// }, 1 );
					
				} else {
					// echo 'uh oh';
				}
				
			}
		
			break;
	}
	
	if ( isset ( $all_langs[$fw['current_lang_code']] ) ) {
		
		$fw['current_lang_obj'] = $all_langs[$fw['current_lang_code']];
		
		switch_to_locale ( $fw['current_lang_obj']['locale'] );
		
	} else {
		
		echo 'uh oh';
		
	}
	
}

add_action( 'init', 'fw_setup_current_lang', 0 );


function fw_load_lang_files() {
	
	load_theme_textdomain ( 'fw', get_template_directory() . '/languages' );
	
	$locale = get_locale();
	$locale_file = get_template_directory() . '/languages/' . $locale . '.php';
	
	if ( is_readable( $locale_file ) ) {
		require_once ( $locale_file );
	}
	
}

add_action( 'after_theme_setup', 'fw_load_lang_files', 10 );

// update theme options and flush rewrite
// whenever the languages options page is updated

function fw_flush_rewrite_on_lang_save ( $post_id, $menu_slug ) {
	
	if ( $menu_slug == 'acf-options-languages' ) {
		
		// update the languages option
		// to match the field value
		
		update_option ( 'fw_languages', get_field ( 'fw_languages', 'option' ) );
		
		$option_langs = array();
		
		foreach ( get_field ( 'fw_languages', 'option' ) as $lang ) {
			
			$option_langs[$lang['code']] = $lang;
			
		}
		
		// update the current language object
		
		update_option ( 'fw_langs', $option_langs );
		
		// flush rewrite
		
		flush_rewrite_rules ( true );
		
		// flag
		
		update_option ( 'teststamp', array (
			'updated' => date ( 'H:i:s' ),
			'array' => $option_langs
		) );
		
	}
	
}

add_action ( 'acf/options_page/save', 'fw_flush_rewrite_on_lang_save', 22, 2 );

// update slugs on post save

function fw_update_slugs_on_save ( $post_id, $post, $update ) {
	
	if ( in_array ( $post->post_status, array ( 'publish', 'future', 'pending' ) ) ) {
		
		$stuff = array ( 'post' => $post );
		
		// each lang
			
		foreach ( get_option ( 'fw_langs' ) as $lang ) {
			if ( $lang['code'] != 'en' ) {
				
				// get slug and title in this lang
				
				$this_title = get_post_meta ( $post_id, 'title_' . $lang['code'], true );
				$this_slug = get_post_meta ( $post_id, 'slug_' . $lang['code'], true );
				$this_path = get_post_meta ( $post_id, 'path_' . $lang['code'], true );
				
				if ( $this_title == '' ) {
					update_post_meta ( $post_id, 'title_' . $lang['code'], $post->post_title );
				}
				
				if ( $this_slug == '' ) {
					update_post_meta ( $post_id, 'slug_' . $lang['code'], $post->post_name );
				}
				
				if ( $this_path == '' ) {
					update_post_meta ( $post_id, 'path_' . $lang['code'], implode ( '/', translate_path ( $post_id, $lang['code'] ) ) );
				}
				
			}
		}
		
	}
	
	// update_option ( 'save_stuff', $stuff );
	
}

add_action ( 'save_post', 'fw_update_slugs_on_save', 10, 3 );


