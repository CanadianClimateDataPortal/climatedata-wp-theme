<?php

// 1. CREATE MENU ITEMS

if ( str_contains ( $element['inputs']['menu'], 'menu-' ) ) {
	
	//
	// WP MENU
	//
	
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
	
} elseif ( $element['inputs']['menu'] == 'manual' ) {
	
	echo 'manual';
	
} elseif ( $element['inputs']['menu'] == 'lang' ) {
	
	//
	// LANG SWITCHER
	//
	
	// echo 'current: ' . get_permalink ( $globals['current_query']['ID'] ) . '<br>';
		
	// $current_path = implode ( '/', translate_path ( $globals['current_query']['ID'], $globals['current_lang_code'] ) );
			
	// 
	// if ( $globals['current_lang_code'] != 'en' ) {
	// 	$this_path = substr ( $this_path, 3 );
	// }
	
	foreach ( get_field ( 'fw_languages', 'option' ) as $lang ) {
		
		// echo '<br><br>';
		
		// if ( $globals['current_lang_code'] == $lang['code'] ) {
		// 	
		// 	// if linking to the current language
		// 	// just spit out get_permalink()
		// 	// and the filtering will take care of it
		// 	
		// 	// echo '<br>-' . $lang['code'] . '-<br>';
		// 	
		// 	$lang_URL = get_permalink ( $globals['current_query']['ID'] );
		// 	
		// } else {
			
		$lang_URL = translate_permalink ( $GLOBALS['vars']['current_url'], $globals['current_query']['ID'], $lang['code'] );
		
		$menu[] = array(
			'id' => $globals['current_query']['ID'],
			'type' => get_post_type ( $globals['current_query']['ID'] ),
			'url' => trailingslashit ( $lang_URL ),
			'title' => $lang['name'],
			'classes' => array(),
			'parent' => 0
		);
		
	}

}

// 2. DISPLAY

?>

<div class="fw-menu">
	
	<?php
	
		// dumpit ( $element['inputs']['classes'] );
		
		switch ( $element['inputs']['display']['name'] ) {
				
			case 'list' : 
				
				// $element['inputs']['classes']['menu'] .= 'fw';
				$element['inputs']['classes']['item'] .= ' fw-menu-item';
				
				fw_menu_output ( $menu, 1, 'list', $element['inputs']['classes'] );
				
				break;
			
			case 'dropdown' : 
				
				$element['inputs']['classes']['menu'] .= 'dropdown-menu';
				$element['inputs']['classes']['item'] .= 'd-inline';
				$element['inputs']['classes']['link'] .= 'dropdown-item';
				
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