<?php

if ( current_user_can ( 'administrator' ) ) {
	
	if ( !defined ( 'ICL_LANGUAGE_CODE' ) ) {
		
		echo '<p>WPML not active</p>';
		
	} else {
		
		if ( !$_GET['run'] ) {
			echo '<p>This page applies the “Video” layout to all published video resources.</p>';
			
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
							'value' => 'video',
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
					
					$en_text = '';
					$fr_text = '';
					
					if ( $fr_ID != '' ) {
						
						if ( get_field ( 'asset_summary', $en_ID ) != '' ) {
							$en_text = preg_replace ( '~[\r\n]+~', '', htmlentities ( get_field ( 'asset_summary', $en_ID ) ) );
						}
						
						if ( get_field ( 'asset_summary', $fr_ID ) != '' ) { 
							$fr_text = preg_replace ( '~[\r\n]+~', '', htmlentities ( get_field ( 'asset_summary', $fr_ID ) ) );
						}
							
						// 3. insert 'video' builder layout
						
						$builder = [
							"type" => "page",
							"inputs" => ["id" => "auto"],
							"post_id" => $en_ID,
							"key" => $en_ID,
							"children" => [
								[
									"classes" => ["fw-element", "fw-template"],
									"type" => "template",
									"inputs" => [
										"source" => "post",
										"post_id" => "11445",
										"path" => "",
										"output" => "template",
										"id" => "auto",
										"class" => [""],
									],
									"key" => $en_ID . "-1",
								],
								[
									"type" => "section",
									"key" => $en_ID . "-2",
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
															"side" => "b",
															"breakpoint" => "",
															"value" => "4",
															"index" => "0",
														],
														[
															"property" => "p",
															"side" => "b",
															"breakpoint" => "md",
															"value" => "6",
															"index" => "0",
														],
													],
													"index" => "0",
												],
											],
										],
									],
									"children" => [
										[
											"classes" => [
												"fw-element",
												"fw-container",
												"container-fluid",
											],
											"child" => "row",
											"type" => "container",
											"inputs" => [
												"id" => "resource-video-container",
												"class" => [""],
												"settings" => [
													[
														"spacing" => [
															"type" => "spacing",
															"rows" => [
																[
																	"property" => "m",
																	"side" => "t",
																	"breakpoint" => "",
																	"value" => "n6",
																	"index" => "0",
																],
																[
																	"property" => "m",
																	"side" => "b",
																	"breakpoint" => "",
																	"value" => "4",
																	"index" => "1",
																],
															],
															"index" => "0",
														],
													],
												],
											],
											"key" => $en_ID . "-2-1",
											"children" => [
												[
													"autogen" => "true",
													"type" => "row",
													"key" => $en_ID . "-2-1-1",
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
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "",
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
															"key" => $en_ID . "-2-1-1-1",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/video",
																	"inputs" => [
																		"source" => "url",
																		"url" => [
																			"en" => 'https://vimeo.com/' . get_field ( 'asset_video', $en_ID ),
																			"fr" => 'https://vimeo.com/' . get_field ( 'asset_video', $fr_ID )
																		],
																		"upload" => [
																			"rows" => [
																				[
																					"file" => [
																						"id" => "",
																						"url" => "",
																					],
																					"encoding" => "mp4",
																					"index" => "0",
																				],
																			],
																			"atts" => [
																				"loop" => "false",
																				"autoplay" => "false",
																				"muted" => "false",
																				"controls" => "false",
																			],
																		],
																		"code" => ["", [""]],
																		"id" => "resource-video",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-1-1-1-1",
																],
															],
														],
													],
												],
											],
										],
										[
											"classes" => [
												"fw-element",
												"fw-container",
												"container-fluid",
											],
											"child" => "row",
											"type" => "container",
											"inputs" => ["id" => "auto", "class" => [""]],
											"key" => $en_ID . "-2-2",
											"children" => [
												[
													"type" => "row",
													"key" => $en_ID . "-2-2-1",
													"inputs" => [
														"id" => "resource-format",
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
																			"value" => "2",
																			"index" => "0",
																		],
																	],
																	"index" => "0",
																],
															],
														],
													],
													"children" => [
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "3",
																		"offset" => "",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "2",
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
															"key" => $en_ID . "-2-2-1-1",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/text",
																	"inputs" => [
																		"text" => [
																			"en" =>
																				"&lt;h5&gt;Format&lt;/h5&gt;",
																			"fr" =>
																				"&lt;h5&gt;Format&lt;/h5&gt;",
																		],
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-1-1-1",
																],
															],
														],
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "8",
																		"offset" => "1",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "",
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
															"key" => $en_ID . "-2-2-1-2",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/text",
																	"inputs" => [
																		"text" => [
																			"en" =>
																				"&lt;p&gt;Video&lt;/p&gt;",
																			"fr" =>
																				"&lt;p&gt;Vid&amp;eacute;o&lt;/p&gt;",
																		],
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-1-2-1",
																],
															],
														],
													],
												],
												[
													"type" => "row",
													"key" => $en_ID . "-2-2-2",
													"inputs" => [
														"id" => "resource-time",
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
																			"value" => "2",
																			"index" => "0",
																		],
																	],
																	"index" => "0",
																],
															],
														],
													],
													"children" => [
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "3",
																		"offset" => "",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "2",
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
															"key" => $en_ID . "-2-2-2-1",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/text",
																	"inputs" => [
																		"text" => [
																			"en" =>
																				"&lt;h5&gt;Time to completion&lt;/h5&gt;",
																			"fr" =>
																				"&lt;h5&gt;Temps de r&amp;eacute;alisation&lt;/h5&gt;",
																		],
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-2-1-1",
																],
															],
														],
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "8",
																		"offset" => "1",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "",
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
															"key" => $en_ID . "-2-2-2-2",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/field",
																	"inputs" => [
																		"key" => "asset_time",
																		"translate" => "false",
																		"display" => "p",
																		"content" => "false",
																		"prepend" => "",
																		"append" => " minutes",
																		"post_id" => "",
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-2-2-1",
																],
															],
														],
													],
												],
												[
													"type" => "row",
													"key" => $en_ID . "-2-2-3",
													"inputs" => [
														"id" => "resource-summary",
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
																			"value" => "2",
																			"index" => "0",
																		],
																	],
																	"index" => "0",
																],
															],
														],
													],
													"children" => [
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "3",
																		"offset" => "",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "2",
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
															"key" => $en_ID . "-2-2-3-1",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/text",
																	"inputs" => [
																		"text" => [
																			"en" =>
																				"&lt;h5&gt;Transcript&lt;/h5&gt;",
																			"fr" =>
																				"&lt;h5&gt;Transcription&lt;/h5&gt;",
																		],
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-3-1-1",
																],
															],
														],
														[
															"type" => "column",
															"inputs" => [
																"breakpoints" => [
																	"xs" => [
																		"d" => "block",
																		"col" => "12",
																		"offset" => "2",
																		"order" => "",
																	],
																	"sm" => [
																		"d" => "block",
																		"col" => "8",
																		"offset" => "1",
																		"order" => "",
																	],
																	"md" => [
																		"d" => "block",
																		"col" => "",
																		"offset" => "",
																		"order" => "",
																	],
																	"lg" => [
																		"d" => "block",
																		"col" => "",
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
															"key" => $en_ID . "-2-2-3-2",
															"children" => [
																[
																	"classes" => [
																		"fw-element",
																		"fw-block",
																	],
																	"parent" => "",
																	"type" => "block/content/text",
																	
																	"inputs" => [
																		"text" => [
																			"en" => "&lt;h5&gt;" . get_field ( 'asset_summaryhead', $en_ID ) . "&lt;/h5&gt;",
																			"fr" => "&lt;h5&gt;" . get_field ( 'asset_summaryhead', $fr_ID ) . "&lt;/h5&gt;",
																		],
																		"id" => "auto",
																		"class" => [""],
																		"inner_class" => "",
																	],
																	"key" => $en_ID . "-2-2-3-2-1",
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
									"type" => "template",
									"inputs" => [
										"source" => "post",
										"post_id" => "11447",
										"path" => "",
										"output" => "template",
										"id" => "auto",
										"class" => [""],
									],
									"key" => $en_ID . "-3",
								],
								[
									"classes" => ["fw-element", "fw-template"],
									"type" => "template",
									"inputs" => [
										"source" => "post",
										"post_id" => "11315",
										"path" => "",
										"output" => "template",
										"id" => "auto",
										"class" => [""],
									],
									"key" => $en_ID . "-4",
								],
							],
						];
				
						update_post_meta ( $en_ID, 'builder', json_encode ( $builder, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) );
						
						echo 'updated builder layout<br>';
						
						// 4. update EN title
						
						update_post_meta ( $en_ID, 'hero_title', get_the_title() );
						
						echo 'hero title: ' . get_the_title() . '<br>';
						
						
						// 6. repeat for FR
						
						
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
						
						echo 'no french!!!!!!';
						
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