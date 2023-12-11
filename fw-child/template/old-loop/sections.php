<?php
	
	if ( have_rows ( 'sections' ) ) {
		
		$section_num = 1;
		
		while ( have_rows ('sections' ) ) {
			the_row();
			
			if ( get_sub_field ( 'section_id' ) != '' ) {
				
				$section_ID = get_sub_field ( 'section_id' );
				
			} else {
				
				$section_ID = 'section-' . $section_num;
				
			}
			
			$section_class = array ( 'page-section' );
			
			if ( have_rows ( 'section_head' ) ) {
				while ( have_rows ( 'section_head' ) ) {
					the_row();
					
					$head_text = '';
					
					if ( have_rows ( 'heading' ) ) {
						while ( have_rows ( 'heading' ) ) {
							the_row();
							
							$head_tag = 'h' . get_sub_field ( 'level' );
							
							$head_class = array();
			
							if ( get_sub_field ( 'style' ) != '' ) {
								$head_class[] = 'text-' . get_sub_field ( 'style' );
							}
							
							$head_text = get_sub_field ( 'text' );
							
						}
					}
					
					$head_body = get_sub_field ( 'body' );
					
					if ( $head_text != '' || $head_body != '' ) {
						$section_class[] = 'has-head';
					}
				}
			}
			
			if ( !empty ( get_sub_field ( 'subsections' ) ) ) {
				$section_class[] = 'has-subsections';
			}
			
			$bg_URL = '';
		
			if ( have_rows ( 'background' ) ) {
				while ( have_rows ( 'background' ) ) {
					the_row();
					
					if ( get_sub_field ( 'colour' ) != '' ) {
						$section_class[] = 'bg-' . get_sub_field ( 'colour' );
						
						if ( get_sub_field ( 'colour' ) == 'dark' ) {
							$section_class[] = 'text-light';
						}
						
					}
					
				}
			}
			
?>

<section id="<?php echo $section_ID; ?>" class="<?php echo implode( ' ', $section_class ); ?>">
	<?php
	
			if ( have_rows ( 'background' ) ) {
				while ( have_rows ( 'background' ) ) {
					the_row();
					
					include ( locate_template ( 'template/old-loop/bg.php' ) );
					
				}
			}
		
	?>
	
	<div class="section-container">
		<?php
			
			$block_class = array();
			
			// BLOCK SETTINGS
			
			if ( have_rows ( 'header_settings_grid' ) ) {
				while ( have_rows ( 'header_settings_grid' ) ) {
					the_row();
					
					// breakpoints, columns, offsets
					
					if ( have_rows ( 'breakpoints' ) ) {
						while ( have_rows ( 'breakpoints' ) ) {
							the_row();
							
							$new_class = 'col';
							
							if ( get_sub_field ( 'breakpoint' ) != '' ) {
								
								$new_class .= '-' . get_sub_field ( 'breakpoint' );
								
							}
							
							if ( get_sub_field ( 'columns' ) != '' ) {
								
								$new_class .= '-' . get_sub_field ( 'columns' );
								
							}
							
							$block_class[] = $new_class;
							
							if ( get_sub_field ( 'offset' ) != '' ) {
								
								$new_class = 'offset';
								
								if ( get_sub_field ( 'breakpoint' ) != '' ) {
									
									$new_class .= '-' . get_sub_field ( 'breakpoint' );
									
								}
								
								$new_class .= '-' . get_sub_field ( 'offset' );
								
								$block_class[] = $new_class;
								
							}
							
						}
					}
					
					// additional classes
					
					if ( get_sub_field ( 'class' ) != '' ) {
						$block_class = array_merge ( $block_class, explode ( ' ', get_sub_field ( 'class' ) ) );
					}
					
				}
			}
				
			if ( empty ( $block_class ) ) {
				$block_class = array ( 'col-10', 'offset-1', 'col-md-8', 'col-lg-5' );
			}
					
			if ( $head_text != '' || $head_body != '' ) {
				
		?>
		
		<header class="section-head container-fluid">
			<div class="row">
				<div class="col-10 offset-1 text-center text-lg-left">
					<?php
						
						echo '<' . $head_tag . ' class="' . implode ( ' ', $head_class ) . '">' . $head_text . '</' . $head_tag . '>';
						
					?>
				</div>
				
				<?php
					
					if ( $head_body != '' ) {
						
				?>
				
				<div class="<?php echo implode ( ' ', $block_class ); ?>">
					<?php echo $head_body; ?>
				</div>
				
				<?php
					
					}
					
				?>
				
			</div>
		</header>
				
		<?php
			
			}
			
			if ( have_rows ( 'subsections' ) ) {
				
				include ( locate_template ( 'template/old-loop/blocks.php' ) );
			
			}
					
			if ( get_sub_field ( 'section_footer' ) != '' || !empty ( get_sub_field ( 'buttons' ) ) ) {
						
				$block_class = array ( 'section-footer' );
				
				// BLOCK SETTINGS
				
				if ( have_rows ( 'footer_settings_grid' ) ) {
					while ( have_rows ( 'footer_settings_grid' ) ) {
						the_row();
						
						// breakpoints, columns, offsets
						
						if ( have_rows ( 'breakpoints' ) ) {
							while ( have_rows ( 'breakpoints' ) ) {
								the_row();
								
								$new_class = 'col';
								
								if ( get_sub_field ( 'breakpoint' ) != '' ) {
									
									$new_class .= '-' . get_sub_field ( 'breakpoint' );
									
								}
								
								if ( get_sub_field ( 'columns' ) != '' ) {
									
									$new_class .= '-' . get_sub_field ( 'columns' );
									
								}
								
								$block_class[] = $new_class;
								
								if ( get_sub_field ( 'offset' ) != '' ) {
									
									$new_class = 'offset';
									
									if ( get_sub_field ( 'breakpoint' ) != '' ) {
										
										$new_class .= '-' . get_sub_field ( 'breakpoint' );
										
									}
									
									$new_class .= '-' . get_sub_field ( 'offset' );
									
									$block_class[] = $new_class;
									
								}
								
							}
						}
						
						// additional classes
						
						if ( get_sub_field ( 'class' ) != '' ) {
							$block_class = array_merge ( $block_class, explode ( ' ', get_sub_field ( 'class' ) ) );
						}
						
					}
				}
	
		?>

		<div id="<?php echo $section_ID; ?>-footer" class="<?php echo implode ( ' ', $block_class ); ?>">
			<?php
				
				if ( get_sub_field ( 'section_footer' ) != '' ) {
					the_sub_field ( 'section_footer' );
				} 
				
				if ( have_rows ( 'buttons' ) ) {
					while ( have_rows ( 'buttons' ) ) {
						the_row();
						
						include ( locate_template ( 'template/old-loop/button.php' ) );              
						
					}
				}
			
			?>
		</div>
		
		<?php
					
			}

			
		?>
	</div>
</section>

<?php
			$section_num++;
			
		}
		
	} else {

		//the_content();
		
	}
	
?>