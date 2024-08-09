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
				
				if ( !empty ( get_field ( 'timestep' ) ) ) {
					
					$this_field = get_field ( 'timestep' );
					
					foreach ( $this_field as $key => $option ) {
						if ( $option == 'annual' ) $this_field[$key] = 'ann';
					}
					
					dumpit ( $this_field );
					
					update_field ( 'timestep', $this_field, get_the_ID() );
					
				} else {
					
					echo 'no field<br>';
				}
				
			}
		}
		
	}
	
}