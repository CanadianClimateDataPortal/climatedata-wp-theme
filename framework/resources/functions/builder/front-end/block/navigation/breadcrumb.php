<?php

// echo '<pre>';
// var_dump ( $element['inputs'] );
// echo '</pre>';

// dumpit ( $GLOBALS['vars'] );
// dumpit ( $globals );

?>

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<?php
		
			// static parents
		
			foreach ( $element['inputs']['static']['rows'] as $static_parent ) {
				
				$static_title = get_the_title ( $static_parent['page'] );
				
				if (
					isset ( $static_parent['text'][$globals['current_lang_code']] ) &&
					$static_parent['text'][$globals['current_lang_code']] != ''
				) {
					$static_title = $static_parent['text'][$globals['current_lang_code']];
				}
				
		?>
		
		<li class="breadcrumb-item"><a href="<?php echo translate_permalink ( get_permalink ( $static_parent['page'] ), $static_parent['page'], $globals['current_lang_code'] ); ?>"><?php 
		
			echo $static_title;
			
		?></a>
		
		<?php
				
			}
				
			/*
			switch ( $element['inputs']['include']['top'] ) {
				case 'home' :
					$top_ID = get_option ( 'page_on_front' );
						
					break;
				
				case 'posts' :
					$top_ID = get_option ( 'page_for_posts' );
					break;
					
				case 'other' :
					$top_ID = $element['inputs']['include']['top_other'];
					break;
					
				default :
					$top_ID = null;
					
			}
			
			if ( $top_ID != null && $top_ID != '' ) {
				
				$top_title = get_the_title ( $top_ID );
				
				if ( 
					isset ( $element['inputs']['include']['top_label'][$globals['current_lang_code']] ) &&
					$element['inputs']['include']['top_label'][$globals['current_lang_code']] != ''
				) {
					
					$top_title = $element['inputs']['include']['top_label'][$globals['current_lang_code']];
					
				}
				
		?>
		
		<li class="breadcrumb-item"><a href="<?php echo get_permalink ( $top_ID ); ?>"><?php echo $top_title; ?></a></li>
		
		<?php
		
			}*/
		
			// posts page
		
			if ( $element['inputs']['include']['posts'] == 'true' ) {
				
		?>
		
		<li class="breadcrumb-item"><a href="<?php echo get_permalink ( get_option ( 'page_for_posts' ) ); ?>"><?php echo get_the_title ( get_option ( 'page_for_posts' ) ); ?></a></li>
		
		<?php
		
			}
			
			// ancestors
			
			if (
				$element['inputs']['include']['ancestors'] &&
				!empty ( $globals['current_ancestors'] )
			) {
				
				foreach ( $globals['current_ancestors'] as $ancestor_ID ) {
					
		?>
		
		<li class="breadcrumb-item"><a href="<?php echo get_permalink ( $ancestor_ID ); ?>"><?php echo get_the_title ( $ancestor_ID ); ?></a></li>
		
		<?php
		
				}
				
			}
			
			// category
			
			if (
				$element['inputs']['include']['category'] == 'true' &&
				!empty ( wp_get_post_categories ( $globals['current_query']['ID'] ) )
			) {
				
				
				foreach ( wp_get_post_categories ( $globals['current_query']['ID'] ) as $category ) {
					
					$this_cat = get_term ( $category );
					
		?>
		
		<li class="breadcrumb-item"><a href="<?php echo get_term_link ( $category, 'category' ); ?>"><?php echo $this_cat->name; ?></a></li>
		
		<?php
		
				}
		
			}
			
			// post type
			
			if ( $element['inputs']['include']['post_type'] == 'true' ) {
				
				$this_type = get_post_type_object ( $globals['current_query']['post_type'] );
				
		?>
		
		<li class="breadcrumb-item active" aria-current="page"><?php echo $this_type->labels->singular_name; ?></li>
		
		<?php
		
			}
			
			// title
			
			if ( $element['inputs']['include']['title'] == 'true' ) {
			
		?>
		
		<li class="breadcrumb-item active" aria-current="page"><?php echo get_the_title ( $globals['current_query']['ID'] ); ?></li>
		
		<?php
		
			}
			
		?>
	</ol>
</nav>