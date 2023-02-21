<?php

  /*

    Template Name: Sector

  */

  function tpl_enqueue() {



  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<main>

  <?php

    //
    // HERO
    //

    $hero_templates['content'] = 'sector-hero-content';
    $hero_templates['sidebar'] = 'sector-hero-sidebar';
    $hero_templates['footer'] = 'sector-hero-footer';

    include ( locate_template ( 'template/hero/hero.php' ) );

		//
		// CONTEXT
		//

		if ( have_rows ( 'sector_context' ) ) {
			while ( have_rows ( 'sector_context' ) ) {
				the_row();

?>

	<section id="sector-overview" class="page-section has-head">
		<div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1">
            <h3 class="text-primary"><?php _e ( 'Overview', 'cdc' ); ?></h3>
					</div>

          <div class="col-10 offset-1 col-md-4">
            <?php the_sub_field ( 'text' ); ?>
						
						<?php
						
								if ( get_sub_field ( 'btn_url' ) != '' ) {
						
						?>
						
						<a href="<?php echo get_sub_field ( 'btn_url' ); ?>" class="btn btn-lg btn-outline-secondary rounded-pill all-caps"><?php
						
									if ( get_sub_field ( 'btn_text' ) != '' ) {
										echo get_sub_field ( 'btn_text' );
									} else {
										_e ( 'Read further', 'cdc' );
									}
						
						?><i class="fas fa-long-arrow-alt-right ml-2"></i></a>
						
						<?php
						
								} // if btn
								
								?>
          </div>

					<div id="sector-context-img" class="col-10 offset-1 col-md-5 bg-dark">
						<?php

							if ( get_sub_field ( 'image' ) != '' ) {

						?>

						<div class="bg opacity-40" style="background-image: url(<?php echo wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'large' ) ?>);"></div>

						<?php

							} // if img

						?>
					</div>

        </div>
      </header>

		</div>
	</section>

	<?php

			}
		}

		//
		// CASE STUDIES
		//

		if ( have_rows ( 'sector_cases' ) ) {
			while ( have_rows ( 'sector_cases' ) ) {
				the_row();

				$block_ID = 'sector-cases-grid';

	?>

	<section id="sector-cases" class="page-section has-head has-subsections">
		<div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-md-5">
            <h4 class="text-secondary"><?php _e ( 'Case Studies', 'cdc' ); ?></h4>

            <?php the_sub_field ( 'intro' ); ?>
          </div>
        </div>
      </header>

			<?php

				if ( !empty ( get_sub_field ( 'posts' ) ) ) {

			?>

			<div class="container-fluid subsections">

        <div class="subsection">
          <div class="row">

            <div id="sector-cases-grid" class="block type-post_grid col-10 offset-1">

							<?php

								$post_grid[$block_ID] = array (
                  'display' => array (
                    'columns' => 3,
                    'template' => 'case-study-card'
                  )
                );

                $new_query = array (
                  'args' => array (
                    'post_type' => 'case-study',
										'post__in' => get_sub_field ( 'posts' ),
                    'orderby' => 'menu_order',
                    'order' => 'asc'
                  )
                );

                include ( locate_template ( 'blocks/post_grid.php' ) );

							?>

						</div>

					</div>
				</div>

			</div>

			<?php

				}

			?>

		</div>
	</section>

	<?php

			}
		}
		
		//
		// BLOG
		//
		
	?>
	
	<section id="sector-blog" class="page-section has-head has-subsections">
		<div class="section-container">
			<header class="section-head container-fluid">
				<div class="row">
					<div class="col-10 offset-1 col-md-5">
						<h4 class="text-secondary"><?php _e ( 'Blog Posts', 'cdc' ); ?></h4>
					</div>
				</div>
			</header>
	
			<div class="container-fluid subsections">
	
				<div class="subsection">
					<div class="row">
	
						<div id="sector-cases-grid" class="block type-post_grid col-10 offset-1">
	
							<?php
	
								$post_grid[$block_ID] = array (
									'display' => array (
										'columns' => 3,
										'template' => 'post'
									)
								);
	
								$new_query = array (
									'args' => array (
										'post_type' => 'post',
										'tax_query' => array (
											array (
												'taxonomy' => 'post_tag',
												'field' => 'slug',
												'terms' => [ get_the_slug ( get_the_ID() ) ]
											)
										)
									)
								);
	
								include ( locate_template ( 'blocks/post_grid.php' ) );
	
							?>
	
						</div>
	
					</div>
				</div>
	
			</div>
	
		</div>
	</section>
	
	<?php

		//
		// ANALOGOUS
		//

	?>

	<section id="sector-analogous" class="page-section has-head has-subsections">
		<div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-md-5">
            <h4 class="text-secondary"><?php _e ( 'Sector Resources', 'cdc' ); ?></h4>
          </div>
        </div>
      </header>

			<?php

				if ( have_rows ( 'sector_analogous' ) ) {

			?>

			<div class="container-fluid subsections">

        <div class="subsection">
          <div class="row">

						<?php

							while ( have_rows ( 'sector_analogous' ) ) {
								the_row();

						?>

            <div class="col-10 offset-1 my-5 py-5 row bg-info text-light">
							<?php

								if ( get_sub_field ( 'background' ) != '' ) {

							?>

							<div class="bg opacity-30" style="background-image: url(<?php echo wp_get_attachment_image_url ( get_sub_field ( 'background' ), 'large' ) ?>);"></div>

							<?php

								}

							?>

							<div class="col-8-of-10 offset-1-of-10 col-md-4-of-10 py-5 analogous-title">
								<h2 class=""><?php

									echo get_sub_field ( 'title' );

								?></h2>

								<?php

									the_sub_field ( 'text' );

								?>
							</div>

							<div class="col-8-of-10 offset-1-of-10 col-md-3-of-10 offset-md-6-of-10 text-right pb-5 analogous-btn">
								<a href="<?php the_sub_field ( 'link' ); ?>" class="btn btn-outline-light rounded-pill all-caps"><?php _e ( 'Explore', 'cdc' ); ?><i class="fas fa-long-arrow-alt-right ml-3"></i></a>
							</div>

						</div>

						<?php

							}

						?>

					</div>
				</div>

			</div>

			<?php

				}

			?>

		</div>
	</section>

	<?php

		//
		// RELATED VARS
		//

    $section_ID = 'sector-vars';
    $block_ID = 'vars-grid';

    include ( locate_template ( 'template/subsector/related.php' ) );

		//
		// RELATED CONTENT
		//

		if ( have_rows ( 'sector_related' ) ) {
			while ( have_rows ( 'sector_related' ) ) {
				the_row();

				$block_ID = 'sector-related-grid';

	?>

	<section id="sector-related" class="page-section has-head has-subsections">
		<div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-md-5">
            <h4 class="text-secondary"><?php _e ( 'Related Content', 'cdc' ); ?></h4>

            <?php the_sub_field ( 'intro' ); ?>
          </div>
        </div>
      </header>

			<?php
        
				$related_slides = 3;
				$blanks = 0;
				
				if ( count ( get_sub_field ( 'slides' ) ) == 3 )
				  $related_slides = 2;
				
				if ( count ( get_sub_field ( 'slides' ) ) < 3 )
				  $blanks = 3 - count ( get_sub_field ( 'slides' ) );

				if ( have_rows ( 'slides' ) ) {

			?>

			<div class="container-fluid subsections">

        <div class="subsection">
          <div class="row">
            
						<div id="sector-related-content" class="col-10 col-md-11 offset-1">
							<div id="sector-related-slick" class="" data-slick='{
								"slidesToShow": <?php echo $related_slides; ?>,
								"draggable": false,
								"prevArrow": false,
								"nextArrow": "#sector-related-next",
								"responsive": [
							    {
							      "breakpoint": 800,
							      "settings": {
											"slidesToShow": 2,
											"draggable": true
							      }
							    },
							    {
							      "breakpoint": 600,
							      "settings": {
											"slidesToShow": 1
							      }
							    }
								]
							}'>

								<?php

									while ( have_rows ( 'slides' ) ) {
										the_row();

								?>

								<div class="pr-sm-4">

			            <div class="slide-inner bg-dark text-light p-5 h-100">

										<?php

											if ( get_sub_field ( 'bg' ) != '' ) {

										?>

										<div class="bg opacity-40" style="background-image: url(<?php echo wp_get_attachment_image_url ( get_sub_field ( 'bg' ), 'large' ) ?>);"></div>

										<?php

											}

										?>

										<div class="slide-content h-100 d-flex flex-column justify-content-between">

											<div class="flex-grow-1">

												<h5><?php

													if ( get_sub_field ( 'link' ) != '' )
														echo '<a href="' . get_sub_field ( 'link' ) . '" class="text-white">';

													echo get_sub_field ( 'title' );

													if ( get_sub_field ( 'link' ) != '' )
														echo '</a>';

												?></h5>

												<p><?php

													the_sub_field ( 'text' );

												?></p>

											</div>

											<?php

												if ( get_sub_field ( 'link' ) != '' ) {

											?>

											<div class="text-right">
												<a href="<?php the_sub_field ( 'link' ); ?>" class="btn btn-outline-light rounded-pill"><?php _e ( 'Explore', 'cdc' ); ?></a>
											</div>

											<?php

												}

											?>

										</div>

									</div>

								</div>

								<?php

									}

								?>
								
								<?php
  								
  								// blanks
  								
									if ( $blanks != 0 ) {
										for ( $i = 0; $i < $blanks; $i += 1 ) {
											echo "\n" . '<div class="pr-sm-4"></div>';
										}
									}
    						  
  						  ?>

							</div>

							<div id="sector-related-next">
								<i class="fas fa-long-arrow-alt-right"></i>
							</div>
						</div>

					</div>
				</div>

			</div>

			<?php

				}

			?>

		</div>
	</section>

	<?php

			}
		}

  ?>

</main>

<?php

  endwhile; endif;

  get_footer();

?>
