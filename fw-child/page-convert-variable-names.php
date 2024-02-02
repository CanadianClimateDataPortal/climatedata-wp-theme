<?php

if ( current_user_can ( 'administrator' ) ) {
		
	if ( !isset($_GET['run']) ) {
		
		echo '<p><a href="' . get_permalink() . '?run=1">Run script</a></p>';
		
	} else if ( $_GET['run'] == 1 ) {
		
		$var_query = new WP_Query ( array (
			'posts_per_page' => -1,
			'post_type' => 'variable',
			
		));
		
		if ( $var_query->have_posts() ) {
			while ( $var_query->have_posts() ) {
				$var_query->the_post();
				
				echo '<h4>' . get_the_title() . '</h4>';
				
				dumpit ( get_field ( 'var_name' ) );
				
				$current_arr = get_field ( 'var_names' );
				
				if ( !empty ( $current_arr ) ) {
					
					dumpit ( $current_arr );
					
					echo 'first array val already set<br>';
					
				} else {
					
					$new_arr = array (
						array (
							'variable' => get_field ( 'var_name' ),
							'label' => ''
						)
					);
					
					update_field ( 'var_names', $new_arr, get_the_ID() );
				
					echo 'done<br>';	
					
				}
				
			}
		}
		
	}
	
}