<?php

if ( current_user_can ( 'administrator' ) ) {
	
	if ( !defined ( 'ICL_LANGUAGE_CODE' ) ) {
		
		echo '<p>WPML not active</p>';
		
	} else {
		
		if ( !$_GET['run'] ) {
			echo '<p>This page applies the “News Post” layout to all published posts.</p>';
			
			echo '<p><a href="' . get_permalink() . '?run=1">Run script</a></p>';
			
		} else if ( $_GET['run'] == 1 ) {
				
			// 1. query each post in EN
			// 2. get EN/FR ids
			// 3. create the default layout
			// 4. use the OLD system to generate the output HTML
			// 5. add it to a 'old_output_en' field
			// 6. repeat using the FR id
			// 7. set the FR post to draft
			
			$post_types = array ( 'post' );
			
			foreach ( $post_types as $post_type ) {
				
				echo '<h2>' . $post_type . '</h2>';
				
				$pt_query = new WP_Query ( array (
					'post_type' => $post_type,
					'post_status' => 'publish',
					'posts_per_page' => -1,
				));
				
				// $pt_query = new WP_Query ( array (
				// 	'p' => 11293
				// ));
				
				while ( $pt_query->have_posts() ) {
					
					// 1. each post
					
					$pt_query->the_post();
					
					echo '<h4>' . get_the_title() . '</h4>';
					
					// 2. get IDs
					
					$en_ID = get_the_ID();
					$fr_ID = apply_filters ( 'wpml_object_id', get_the_ID(), $post_type, false, 'fr' );
					
					echo 'en: ' . $en_ID . '<br>';
					echo 'fr: ' . $fr_ID . '<br>';
					
					// 3. insert 'standard page' builder layout
					
					$builder = [
						"type" => "page",
						"inputs" => ["id" => "auto"],
						"post_id" => "11443",
						"key" => "11443",
						"children" => [
							[
								"type" => "template",
								"inputs" => [
									"source" => "post",
									"post_id" => "11434",
									"path" => "",
									"output" => "template",
									"id" => "auto",
									"class" => [""],
								],
								"key" => "11443-1",
							],
							[
								"type" => "section",
								"inputs" => [
									"id" => "auto",
									"class" => [""],
									"settings" => [
										[
											"spacing" => [
												"type" => "spacing",
												"rows" => [
													[
														"property" => "p",
														"side" => "y",
														"breakpoint" => "",
														"value" => "4",
														"index" => "0",
													],
													[
														"property" => "p",
														"side" => "y",
														"breakpoint" => "md",
														"value" => "6",
														"index" => "0",
													],
													[
														"property" => "p",
														"side" => "y",
														"breakpoint" => "lg",
														"value" => "8",
														"index" => "1",
													],
												],
												"index" => "0",
											],
										],
									],
								],
								"key" => "11443-2",
								"children" => [
									[
										"classes" => ["fw-element", "fw-template"],
										"type" => "template",
										"inputs" => [
											"source" => "include",
											"post_id" => "",
											"path" => "old-post-loop.php",
											"output" => "",
											"id" => "auto",
											"class" => [""],
										],
										"key" => "11443-2-1",
									],
								],
							],
							[
								"type" => "template",
								"inputs" => [
									"source" => "post",
									"post_id" => "11315",
									"path" => "",
									"output" => "template",
									"id" => "auto",
									"class" => [""],
								],
								"key" => "11443-3",
							],
						],
					];

					update_post_meta ( $en_ID, 'builder', json_encode ( $builder, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) );
					
					echo 'updated builder layout<br>';
					
					update_post_meta ( $en_ID, 'hero_title', get_the_title() );
					
					// 4. get the HTML
					// using a modified loop of the OLD system
					
					$output = '';
					
					ob_start();
					
					include ( locate_template ( 'template/old-loop/sections.php' ) );
					
					$output = ob_get_clean();
					
					// ob_end_flush();
					
					// update_field ( 'old_output_en', '', $en_ID );
					
					// 5. add it to 'old_output_en'
					
					update_field ( 'old_output_en', $output );
					
					// echo 'populated english field<br>';
					
					// echo $output;
					
					// 6. repeat for FR
					
					if ( $fr_ID != '' ) {
						
						// title
						update_post_meta ( $en_ID, 'title_fr', get_the_title ( $fr_ID ) );
						update_post_meta ( $en_ID, 'hero_title_fr', get_the_title ( $fr_ID ) );
					
						// slug/path
						update_post_meta ( $en_ID, 'slug_fr', get_the_slug ( $fr_ID ) );
						update_post_meta ( $en_ID, 'path_fr', get_the_slug ( $fr_ID ) );
						
						echo 'updated fr title/slug/path<br>';
						
						// backup post ID
						$original_post = $post;
						
						// get the FR post object
						
						$post = get_post ( $fr_ID );
						setup_postdata ( $post );
						
						echo '<h4>' . get_the_title() . '</h4>';
						
						$output = '';
						
						ob_start();
						
						include ( locate_template ( 'template/old-loop/sections.php' ) );
						
						$output = ob_get_clean();
						
						if ( $output != '' ) {
							// ob_end_flush();
							
							update_field ( 'old_output_fr', $output, $en_ID );	
							
							echo 'populated FR field<br>';
						}
						
						// update_field ( 'old_output_fr', '', $en_ID );
						
						wp_update_post ( array (
							'ID' => $fr_ID,
							'post_status' => 'draft'
						) );
						
						echo 'set ' . $fr_ID . ' to draft';
						
					}
					
					// not really necessary
					wp_reset_postdata();
					
					echo '<hr>';
					
				}
			}
			
			flush_rewrite_rules ( true );
		}			
		
	}

} else {
	
	echo '<p>Login to use this page.</p>';
	
}