<?php

if ( current_user_can ( 'administrator' ) ) {
	
	if ( !defined ( 'ICL_LANGUAGE_CODE' ) ) {
		
		echo '<p>WPML not active</p>';
		
	} else {
		
		if ( !$_GET['run'] ) {
			echo '<p>This page applies the “Article” layout to all published article resources.</p>';
			
			echo '<p><a href="' . get_permalink() . '?run=1">Run script</a></p>';
			
		} else if ( $_GET['run'] == 1 ) {
	
			// 1. query each post in EN
			// 2. get EN/FR ids
			// 3. create the default layout
			// 4. add the EN/FR titles to the hero_title fields
			// 5. add the summary heading & text to the transcript text blocks
			// 6. repeat using the FR id
			// 7. set the FR post to draft
			
			$post_types = array ( 'resource' );
			
			foreach ( $post_types as $post_type ) {
				
				echo '<h2>' . $post_type . '</h2>';
				
				$pt_query = new WP_Query ( array (
					'post_type' => $post_type,
					'post_status' => 'publish',
					'posts_per_page' => -1,
					'meta_query' => array (
						array ( 
							'key' => 'asset_type',
							'value' => 'article',
							'compare' => '='
						)
					)
				));
				
				// dumpit ( $pt_query );
				
				while ( $pt_query->have_posts() ) {
					
					// 1. each post
					
					$pt_query->the_post();
					
					echo '<h4>' . get_the_title() . '</h4>';
					
					// 2. get IDs
					
					$en_ID = get_the_ID();
					$fr_ID = apply_filters ( 'wpml_object_id', get_the_ID(), $post_type, false, 'fr' );
					
					echo 'en: ' . $en_ID . '<br>';
					echo 'fr: ' . $fr_ID . '<br>';
					
					if ( get_field ( 'hero_title', $en_ID ) == '' ) { 
						update_field ( 'hero_title', get_the_title() );
					}
					
					if ( get_field ( 'hero_subhead', $en_ID ) == '' ) { 
						update_field ( 'hero_subhead', get_the_excerpt() );
					}
					
					if ( get_field ( 'asset_summaryhead' ) == '' ) { 
						update_field ( 'asset_summaryhead', 'Summary' );
					}
					
					if ( $fr_ID != '' ) {
						
						if ( get_field ( 'asset_summaryhead', $fr_ID ) != '' ) { 
							update_field ( 'asset_summaryhead_fr', get_field ( 'asset_summary', $fr_ID ), $en_ID );
						} else {
							update_field ( 'asset_summaryhead_fr', 'Résumé' );
						}
						
						if ( get_field ( 'asset_summary', $fr_ID ) != '' ) { 
							update_field ( 'asset_summary_fr', get_field ( 'asset_summary', $fr_ID ), $en_ID );
						}
							
						// 3. insert 'article' builder layout
						
						$builder = [
							"type" => "page",
							"inputs" => ["id" => "auto"],
							"post_id" => "11444",
							"key" => "11444",
							"children" => [
								[
									"type" => "template",
									"inputs" => [
										"source" => "post",
										"post_id" => "11445",
										"path" => "",
										"output" => "template",
										"id" => "auto",
										"class" => [""],
									],
									"key" => "11444-1",
								],
								[
									"type" => "section",
									"inputs" => [
										"id" => "summary",
										"class" => ["bg-light"],
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
											[
												"colors" => [
													"type" => "colors",
													"bg" => "",
													"headings" => "secondary",
													"text" => "",
													"index" => "1",
												],
											],
										],
									],
									"key" => "11444-2",
									"children" => [
										[
											"autogen" => "true",
											"type" => "container",
											"key" => "11444-2-1",
											"inputs" => ["id" => "auto"],
											"children" => [
												[
													"autogen" => "true",
													"type" => "row",
													"key" => "11444-2-1-1",
													"inputs" => ["id" => "auto"],
													"children" => [
														[
															"classes" => [
																"fw-element",
																"fw-column",
																"col",
															],
															"child" => "block",
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "14",
																		"offset" => "1",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "10",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "7",
																		"offset" => "",
																		"order" => "",
																	],
																	"xl" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"xxl" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																],
																"id" => "auto",
																"class" => [""],
															],
															"key" => "11444-2-1-1-1",
															"children" => [
																[
																	"type" => "block/data/field",
																	"inputs" => [
																		"key" => "asset_summaryhead",
																		"translate" => "true",
																		"display" => "h2",
																		"content" => "false",
																		"prepend" => "",
																		"append" => "",
																		"post_id" => "",
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => "11444-2-1-1-1-1",
																],
																[
																	"type" => "block/data/field",
																	"inputs" => [
																		"key" => "asset_summary",
																		"translate" => "true",
																		"display" => "none",
																		"content" => "true",
																		"prepend" => "",
																		"append" => "",
																		"post_id" => "",
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => "11444-2-1-1-1-2",
																],
															],
														],
													],
												],
											],
										],
									],
								],
								[
									"type" => "section",
									"inputs" => [
										"id" => "content",
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
															"index" => "1",
														],
														[
															"property" => "p",
															"side" => "y",
															"breakpoint" => "lg",
															"value" => "8",
															"index" => "2",
														],
													],
													"index" => "0",
												],
											],
										],
									],
									"key" => "11444-3",
								],
								[
									"type" => "template",
									"inputs" => [
										"source" => "post",
										"post_id" => "11447",
										"path" => "",
										"output" => "template",
										"id" => "auto",
										"class" => [""],
									],
									"key" => "11444-4",
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
									"key" => "11444-5",
								],
							],
						];
				
						update_post_meta ( $en_ID, 'builder', json_encode ( $builder, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) );
						
						echo 'updated builder layout<br>';
						
						
						// 6. hero fields
						
						$fr_post = get_post ( $fr_ID );
						
						if ( get_field ( 'hero_subhead_fr', $en_ID ) == '' ) { 
							update_field ( 'hero_subhead_fr', $fr_post->post_excerpt );
						}
						
						// title
						update_post_meta ( $en_ID, 'title_fr', get_the_title ( $fr_ID ) );
						update_post_meta ( $en_ID, 'hero_title_fr', get_the_title ( $fr_ID ) );
					
						// slug/path
						update_post_meta ( $en_ID, 'slug_fr', get_the_slug ( $fr_ID ) );
						update_post_meta ( $en_ID, 'path_fr', get_the_slug ( $fr_ID ) );
						
						// echo 'updated fr title/slug/path<br>';
						
						// backup post ID
						// $original_post = $post;
						
						// get the FR post object
						
						// $post = get_post ( $fr_ID );
						// setup_postdata ( $post );
						
						// set to draft
						
						wp_update_post ( array (
							'ID' => $fr_ID,
							'post_status' => 'draft'
						) );
						
						echo 'set ' . $fr_ID . ' to draft';
						
					} else {
						
						echo 'no french!';
						
					}
					
					// not really necessary
					wp_reset_postdata();
					
					echo '<hr>';
					
				}
			}
			
			flush_rewrite_rules ( true );
			
		}
		
	}
	
}