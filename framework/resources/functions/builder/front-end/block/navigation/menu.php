<?php

$menu = array();

// 1. CREATE MENU ITEMS

if ( str_contains ( $element['inputs']['menu'] ?? '', 'menu-' ) ) {
	
	// WP MENU
	
	$nav_items = wp_get_nav_menu_items ( str_replace ( 'menu-', '', $element['inputs']['menu'] ) );
	
	$menu_items = array();
	
	foreach ( $nav_items as &$item ) {
	
		$menu_items[] = array (
			'id' => $item->ID,
			'type' => $item->type,
			'url' => $item->url,
			'title' => $item->title,
			'classes' => $item->classes,
			'parent' => $item->menu_item_parent
		);
	
	}
	
	$menu = fw_build_menu ( $menu_items, 0, 1 );
	
} elseif ( $element['inputs']['menu'] == 'hierarchy' ) {

	// HIERARCHY
	
	$menu_items = array();
	
	// get top parent

	$top_parent = get_top_parent ( $globals['current_query']['ID'] );
	$build_menu_top = $top_parent;
	
	if ( $element['inputs']['hierarchy']['parent'] == 'true' ) {
		
		$menu_items[] = array (
			'id' => $top_parent,
			'type' => get_post_type ( $top_parent ),
			'url' => get_permalink ( $top_parent ),
			'title' => get_the_title ( $top_parent ),
			'parent' => 0
		);
		
		$build_menu_top = 0;
		
		
	}
	
	// get children
	
	$all_children = get_page_children ( $top_parent, get_pages ( array (
		'post_type' => 'page',
		'post_status' => array ( 'publish' ),
		'sort_column' => 'menu_order',
		'sort_order' => 'asc'
	) ) );
	
	if ( !empty ( $all_children ) ) {
		
		foreach ( $all_children as $item ) {
			
			$menu_items[] = array (
				'id' => $item->ID,
				'type' => $item->post_type,
				'url' => get_permalink ( $item->ID ),
				'title' => get_the_title ( $item->ID ),
				'parent' => $item->post_parent
			);
		}
		
		$menu = fw_build_menu ( $menu_items, $build_menu_top, 1 );
		
	}
	
} elseif ( $element['inputs']['menu'] == 'manual' ) {
	
	echo 'manual';
	
} elseif ( $element['inputs']['menu'] == 'lang' ) {
	
	//
	// LANG SWITCHER
	//

	if ( is_404() ) {
		// If we are currently displaying the 404 page, we want the language buttons to link to the home page.
		$page_id = get_option( 'page_on_front' );
	} else {
		$page_id = $GLOBALS['fw']['current_query']['ID'];
	}
	
	foreach ( get_field ( 'fw_languages', 'option' ) as $lang ) {

		$lang_URL = translate_permalink ( $GLOBALS['vars']['current_url'], $page_id, $lang['code'] );
		
		$lang_title = $lang['name'];
		
		if (
			isset ( $element['inputs']['display']['lang'] ) &&
			$element['inputs']['display']['lang'] == 'code'
		) {
			$lang_title = $lang['code'];
		}
		
		$menu[] = array(
			'id' => $page_id,
			'type' => get_post_type ( $page_id ),
			'url' => trailingslashit ( $lang_URL ),
			'title' => $lang_title,
			'classes' => array(),
			'parent' => 0
		);
		
	}

}

// 2. DISPLAY

?>

<div class="fw-menu">
	
	<?php
	
		switch ( $element['inputs']['display']['name'] ) {
				
			case 'nested' : 
				
				$element['inputs']['classes']['menu'] .= ' fw-menu-nested';
				$element['inputs']['classes']['item'] .= ' fw-menu-item';
				
				fw_menu_output ( $menu, 1, 'list', $element['inputs']['classes'] );
				
				break;
				
			case 'hover' : 
				
				$element['inputs']['classes']['menu'] .= ' fw-menu-hover';
				$element['inputs']['classes']['item'] .= ' fw-menu-item';
				
				fw_menu_output ( $menu, 1, 'list', $element['inputs']['classes'] );
				
				break;
			
			case 'dropdown' : 
				
				$element['inputs']['classes']['menu'] .= ' dropdown-menu';
				$element['inputs']['classes']['item'] .= ' d-inline';
				$element['inputs']['classes']['link'] .= ' dropdown-item';
				
	?>
	
	<div class="dropdown">
		<a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
			<?php echo $element['inputs']['toggle']; ?>
		</a>
	
		<?php fw_menu_output ( $menu, 1, 'dropdown', $element['inputs']['classes'] ); ?>
	</div>
	
	<?php
				
				break;
		}
		
	
	?>

</div>
