<?php

header ( 'Content-Type: text/html; charset=utf-8' );

if (
	 current_user_can ( 'administrator' ) ) {
	if ( !defined ( 'ICL_LANGUAGE_CODE' ) ) {
		
		echo '<p>WPML not active</p>';
		
	} else {
		
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
					
					$en_ID = get_the_ID();
					$fr_ID = apply_filters ( 'wpml_object_id', get_the_ID(), 'variable', false, 'fr' );
					
					echo 'en: ' . $en_ID . '<br>';
					
					$en_content = get_the_content();
					
					$en_content = str_replace ( ' class="p1"', '', $en_content );
					$en_content = str_replace ( ' class="p2"', '', $en_content );
					$en_content = str_replace ( ' class="p3"', '', $en_content );
					$en_content = str_replace ( ' class="p4"', '', $en_content );
					$en_content = str_replace ( ' class="p5"', '', $en_content );
					
					$split_key = '';
					
					$keys = array (
						'<strong>Technical Description:</strong></p>',
						'<strong>Technical Description</strong>:</p>',
						'<b>Technical Description:</b></p>',
						'<b>Technical Description</b>:</p>',
						'<strong>Technical description:</strong></p>',
						'<strong>Technical description</strong>:</p>',
						'<b>Technical description:</b></p>', 
						'<b>Technical description</b>:</p>'
					);
					
					$did_split = false;
					
					foreach ( $keys as $str ) {
						
						if ( $did_split == false ) {
							if ( str_contains ( 
								$en_content, 
								$str
							) ) {	
								$split_key = $str;
								$did_split = true;
							}
						}
						
					}
					
					if ( $did_split == true ) {
						
						// echo 'success: ' . $split_key . '<br>';
						
						$split = explode ( $split_key, $en_content );
						
						// echo '<h4>DESCRIPTION</h4>';
						// echo $split[0];
						// 
						// echo '<h4>TECH</h4>';
						// echo $split[1] . '<hr>';
						
						update_field ( 'var_description', html_entity_decode ( apply_filters ( 'the_content', $split[0] ) ), $en_ID );
						
						update_field ( 'var_tech_description', html_entity_decode ( apply_filters ( 'the_content', $split[1] ) ), $en_ID );
						
					} else {
						
						update_field ( 'var_description', html_entity_decode ( apply_filters ( 'the_content', $en_content ) ), $en_ID );
						
						// echo 'put it all in the description<br>';
						
					}
						
					
					
					if ( $fr_ID != '' ) {
					
						echo 'fr: ' . $fr_ID . '<br>';
						
						$fr_post = get_post ( $fr_ID );
						
						$fr_content = $fr_post->post_content;
						
						$fr_content = str_replace ( ' class="p1"', '', $fr_content );
						$fr_content = str_replace ( ' class="p2"', '', $fr_content );
						$fr_content = str_replace ( ' class="p3"', '', $fr_content );
						$fr_content = str_replace ( ' class="p4"', '', $fr_content );
						$fr_content = str_replace ( ' class="p5"', '', $fr_content );
						
						$split_key = '';
						
						$keys = array (
							'<strong>Description technique:</strong></p>',
							'<strong>Description technique :</strong></p>',
							'<strong>Description technique</strong>:</p>',
							'<strong>Description technique</strong> :</p>',
							'<strong>Description technique </strong>:</p>',
							
							'<strong>Description Technique:</strong></p>',
							'<strong>Description Technique :</strong></p>',
							'<strong>Description Technique</strong>:</p>',
							'<strong>Description Technique</strong> :</p>',
							'<strong>Description Technique </strong>:</p>',
							
							'<b>Description technique:</b></p>',
							'<b>Description technique :</b></p>',
							'<b>Description technique</b>:</p>',
							'<b>Description technique</b> :</p>',
							'<b>Description technique </b>:</p>',
							
							'<b>Description Technique:</b></p>',
							'<b>Description Technique :</b></p>',
							'<b>Description Technique</b>:</p>',
							'<b>Description Technique</b> :</p>',
							'<b>Description Technique </b>:</p>',
							
						);
						
						$did_split = false;
						
						foreach ( $keys as $str ) {
							
							if ( $did_split == false ) {
								if ( str_contains ( 
									$fr_content, 
									$str
								) ) {	
									$split_key = $str;
									$did_split = true;
								}
							}
							
						}
						
						if ( $did_split == true ) {
							
							// echo 'success: ' . $split_key . '<br>';
							
							$split = explode ( $split_key, $fr_content );
							
							echo '<h4>DESCRIPTION</h4>';
							echo $split[0];
							
							echo '<h4>TECH</h4>';
							echo $split[1] . '<hr>';
							
							update_field ( 'var_description_fr', html_entity_decode ( apply_filters ( 'the_content', $split[0] ) ), $en_ID );
							
							update_field ( 'var_tech_description_fr', html_entity_decode ( apply_filters ( 'the_content', $split[1] ) ), $en_ID );
							
						} else {
							
							update_field ( 'var_description_fr', html_entity_decode ( apply_filters ( 'the_content', $fr_content ) ), $en_ID );
							
							echo 'put it all in the description<br>';
							
						}
						
					}
					
					wp_update_post ( array (
						'ID' => $fr_ID,
						'post_status' => 'draft'
					) );
					
					echo 'done<hr>';	
					
					
					
				}
			}
			
		}
		
	}
	
}