<?php

//
// INCLUDES
//

$includes = array (
	'resources/functions/init.php',
	'resources/functions/setup/setup.php',
	'resources/functions/setup/language.php',
	'resources/functions/setup/rewrite.php',
	'resources/functions/setup/field-groups.php',
	'resources/functions/setup/theme-options.php',
	'resources/functions/essentials/overrides.php',
	'resources/functions/essentials/blocks.php',
	'resources/functions/essentials/post.php',
	'resources/functions/essentials/taxonomy.php',
	'resources/functions/essentials/content.php',
	'resources/functions/essentials/layout.php',
	'resources/functions/essentials/media.php',
	'resources/functions/essentials/misc.php',
	'resources/functions/essentials/post-types.php',
	'resources/functions/essentials/taxonomies.php',
	'resources/functions/essentials/shortcodes.php',
	'resources/functions/essentials/acf.php',
	'resources/functions/loop/elements.php',
	'resources/functions/loop/extras.php',
	'resources/functions/loop/utilities.php',
	'resources/functions/template/hero.php',
	'resources/functions/template/menu.php',
	'resources/functions/extensions/taxonomies.php',
	'resources/functions/extensions/post-types.php',
	'resources/functions/extensions/shortcodes.php',
	'resources/functions/builder/builder.php',
	'resources/functions/builder/modal.php',
	'resources/functions/builder/ajax.php',
	'resources/functions/builder/rest.php',
	'elements/carousel/setup.php'
);

foreach ( $includes as $include ) {

	if ( locate_template ( $include ) != '' ) {

		include_once ( locate_template ( $include ) );
	}

}

//
// THEME SUPPORT
//

function theme_features() {

	// title
	add_theme_support ( 'title-tag' );
	
	// menus
	add_theme_support ( 'menus' );
	
	// post thumbnails
	add_theme_support ( 'post-thumbnails' );

}

add_action ( 'after_setup_theme', 'theme_features' );

//
// ENQUEUE
//

function fw_enqueue_styles() {

	//
	// VARS
	//
	
	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';
	
	wp_dequeue_style ( 'wp-block-library' );
	wp_dequeue_style ( 'global-styles' );
	
	// VENDOR
	
	// font awesome
	
	wp_register_style ( 'font-awesome', $vendor_dir . 'font-awesome-pro/css/all.css', null, null, 'all' );
	wp_enqueue_style ( 'font-awesome' );
	
	// GLOBAL
	
	wp_register_style ( 'global-vendor', $theme_dir . 'resources/css/vendor.css', null, null, 'all' );
	
	wp_register_style ( 'global-style', $theme_dir . 'style.css', null, null, 'all' );
	
	wp_enqueue_style ( 'global-vendor' );
	wp_enqueue_style ( 'global-style' );
	
	if ( current_user_can ( 'administrator' ) ) {
		wp_enqueue_style ( 'framework', $theme_dir . 'resources/css/framework.css', null, null, 'all' );
	}
	
}

add_action ( 'wp_enqueue_scripts', 'fw_enqueue_styles' );

function fw_enqueue_scripts() {
	
	//
	// VARS
	//
	
	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';
	
	// wp_enqueue_script ( 'jquery' );
	
	// VENDOR
	
	wp_register_script ( 'fw-query', $js_dir . 'query.js', NULL, NULL, true );
	
	// inview
	
	wp_register_script ( 'inview', $vendor_dir . 'in-view.min.js', NULL, NULL, true );
	
	// lottie
	
	wp_register_script ( 'lottie', 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.11/lottie.min.js', null, '5.7.11', true );
	wp_register_script ( 'lottie-player', $vendor_dir . 'lottie-player.js', null, '2.0.2', true );
	
	// aos
	
	wp_register_script ( 'aos', $vendor_dir . 'aos/dist/aos.js', null, null, true );
	
	// swiper
	
	wp_register_script ( 'swiper', $vendor_dir . 'swiper-11.0.4/swiper-bundle.min.js', null, null, true );
	
	// bootstrap
	
	wp_register_script ( 'bootstrap-js', $vendor_dir . 'bootstrap/dist/js/bootstrap.bundle.min.js', array( 'jquery' ), null, true );
	
	wp_enqueue_script ( 'bootstrap-js' );
	
	if ( current_user_can ( 'administrator' ) ) {
		wp_enqueue_script ( 'builder' );
	}
	
	wp_register_script ( 'animation', $js_dir . 'animation-functions.js', array ( 'lottie', 'inview' ), null, true );
	
	wp_register_script ( 'global', $js_dir . 'global-functions.js', array ( 'jquery', 'fw-query' ), null, true );
	
	wp_localize_script ( 'global', 'ajax_data',
		array (
			'rest_url' => rest_url(),
			'rest_nonce' => wp_create_nonce ( 'wp_rest' ),
			'url' => admin_url ( 'admin-ajax.php' ),
			'globals' => $GLOBALS['fw']
		)
	);
	
	wp_enqueue_script ( 'global' );
	
	//
	// BUILDER
	//
	
	wp_register_script ( 'builder', $js_dir . 'builder.js', array ( 'jquery', 'jquery-ui-core', 'jquery-ui-mouse', 'jquery-ui-sortable', 'aos', 'animation', 'bootstrap-js' ), null, true );
	
	// wp_localize_script ( 'builder', 'ajax_data',
	// 	array (
	// 		'url' => admin_url ( 'admin-ajax.php' ),
	// 		'globals' => $GLOBALS['fw']
	// 	)
	// );
	
	if ( current_user_can ( 'administrator' ) ) {
		wp_enqueue_editor();
		
		// if ( ! did_action( 'wp_enqueue_media' ) ) {
			wp_enqueue_media();
		// }
		
	}
	
}

add_action ( 'wp_enqueue_scripts', 'fw_enqueue_scripts', 10 );


add_filter ( 'body_class', function ( $classes ) {
	
	if ( current_user_can ( 'administrator' ) ) {
		return array_merge ( $classes, array ( 'fw-builder' ) );
	} else {
		return $classes;
	}
	
} );

function fw_build_menu ( array &$elements, $parent_id = 0, $level = 1 ) {

	$branch = array();

	$i = 0;

	foreach ( $elements as &$element ) {
		
		if ( $element['parent'] == $parent_id ) {
			
			// element's parent matches the function's parent
		
			if ( is_int ( $element['id'] ) ) {
			
				$children = fw_build_menu ( $elements, $element['id'], $level + 1 );
				
				if ( $children ) {
					$element['children'] = $children;
				}
				
			}
			
			// add the element to this level in the array
			
			$branch[] = $element;
			
			unset ( $elements[$i] );
			
		}
		
		$i++;

	}

	return $branch;

}

/**
 * Outputs the menu HTML.
 *
 * @param array  $menu The menu items.
 * @param int    $level The menu level.
 * @param string $type The menu type.
 * @param array  $classes The CSS classes.
 */
function fw_menu_output( $menu, $level, $type, $classes ) {

	$element_class = $classes['menu'];
	$item_class    = $classes['item'];
	$link_class    = $classes['link'];

	echo '<ul class="fw-menu-' . esc_attr( $type ) . ' menu-level-' . esc_attr( $level ) . ' ';

	if ( 1 === $level ) {
		echo esc_attr( $element_class );
	}

	echo '">';

	foreach ( $menu as $item ) {
		$is_item_of_current_page = false;

		echo '<li class="';

		if ( isset( $GLOBALS['vars']['current_url'] ) ) {
			$current_host = parse_url( $GLOBALS['vars']['current_url'], PHP_URL_HOST );
			$current_path = parse_url( $GLOBALS['vars']['current_url'], PHP_URL_PATH );
			$current_url  = $current_host . $current_path;

			$item_host = parse_url( $item['url'], PHP_URL_HOST );
			$item_path = parse_url( $item['url'], PHP_URL_PATH );
			$item_url  = $item_host . $item_path;

			if ( $current_url === $item_url ) {
				$is_item_of_current_page = true;
				echo 'current-nav-item ';
			}
		}

		// If the item's page is an ancestor of the current page
		// or if the item is an ancestor of the current menu item ID.
		$post_id   = get_post_meta( $item['id'], '_menu_item_object_id', true );
		$ancestors = get_post_ancestors( get_the_ID() );

		if (
			( ! empty( $ancestors ) && in_array( $post_id, $ancestors ) ) ||

			( isset( $GLOBALS['vars']['current_ancestors'] ) && in_array( $item['id'], $GLOBALS['vars']['current_ancestors'] ) )
		) {
			echo 'ancestor-nav-item ';
		}

		// other classes.
		echo esc_attr( $item_class );

		echo '">';

		echo '<a href="' . esc_url( $item['url'] ) . '"';

		if ( isset( $item['target'] ) && 'blank' === $item['target'] ) {
			echo ' target="_blank"';
		}

		echo ' class="';

		if ( $is_item_of_current_page ) {
			echo 'current-nav-link ';
		}

		if ( isset( $item['classes'] ) && is_array( $item['classes'] ) ) {
			echo ' ' . esc_attr( implode( ' ', $item['classes'] ) );
		}

		echo ' ' . esc_attr( $link_class );

		echo '">';

		if ( isset( $item['icon'] ) && ! empty( $item['icon'] ) ) {
			echo '<i class="icon ' . esc_attr( $item['icon'] ) . ' mr-3"></i>';
		}

		// Get the translation of the item label.
		$item_label_translation = get_post_meta( $item['id'] )[ 'label_' . $GLOBALS['fw']['current_lang_code'] ];

		// If the current language is not English and the translation is not empty, use the translation.
		if ( 'en' !== $GLOBALS['fw']['current_lang_code'] && ! empty( $item_label_translation[0] ) ) {

			$item_title = $item_label_translation[0];

		} else {

			$item_title = $item['title'];

		}

		echo esc_html( $item_title ) . '</a>';

		if ( isset( $item['children'] ) ) {

			fw_menu_output( $item['children'], $level + 1, $type, $classes );

		}

		echo '</li>';

	}

	echo '</ul>';
}

add_action ( 'fw_global_css', function() { } );

//
// allow json uploads
//

function fw_custom_mime_types ( $mime_types ) {
	$mime_types['json'] = 'application/json';
	return $mime_types;
}

add_filter ( 'upload_mimes', 'fw_custom_mime_types' );

function my_correct_filetypes ( $data, $file, $filename, $mimes, $real_mime ) {

	if ( !empty ( $data['ext'] ) && !empty ( $data['type'] ) ) {
		return $data;
	}

	$wp_file_type = wp_check_filetype ( $filename, $mimes );

	if ( 'json' == $wp_file_type['ext'] ) {
		$data['ext'] = 'json';
		$data['type'] = 'application/json';
	}

	return $data;

}

add_filter ( 'wp_check_filetype_and_ext', 'my_correct_filetypes', 10, 5 );


