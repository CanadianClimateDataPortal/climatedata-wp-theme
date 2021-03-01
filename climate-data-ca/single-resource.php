<?php

  if ( have_posts() ) : while ( have_posts() ) : the_post();

    //
    // WHAT'S HAPPENING RIGHT NOW?
    //

    if ( isset ( $_GET['content'] ) && $_GET['content'] == 'video' ) {

      // 1. ajax request for variable interstitial
      //    (a variable was selected from a menu)

?>

<div id="training-video-overlay" class="overlay-content-wrap container-fluid">
  <div class="overlay-content row">
    <div class="overlay-content-heading col-9 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
      <h6 class="overlay-subtitle text-secondary all-caps"><?php _e ( 'Video', 'cdc' ); ?></h6>
      <h4 class="overlay-title text-white"><?php the_title(); ?></h4>
    </div>

    <div class="col-1 overlay-close text-white"><i class="fas fa-times"></i></div>
  </div>

  <div class="row">
    <div class="overlay-content-row col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
      <div class="overlay-content-text">
        <?php

          if ( have_rows ( 'resource_video' ) ) {
            while ( have_rows ( 'resource_video' ) ) {
              the_row();

              switch ( get_sub_field ( 'source' ) ) {

                case 'vimeo' :

        ?>

        <div class="overlay-video-embed">
          <iframe src="https://player.vimeo.com/video/<?php the_sub_field ( 'url' ); ?>" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>

        <?php

                  break;

                case 'upload' :

                  if ( get_sub_field ( 'poster' ) != '' ) {
                    $video_poster = wp_get_attachment_image_url ( get_sub_field ( 'poster' ), 'large' );
                  } else {
                    $video_poster = get_the_post_thumbnail_url ( get_the_ID(), 'large' );
                  }

        ?>

        <video id="" class="" preload="auto" poster="<?php echo $video_poster; ?>" controls>
          <?php

                  if ( have_rows ( 'sources' ) ) {
                    while ( have_rows ( 'sources' ) ) {
                      the_row();

          ?>

          <source src="<?php echo wp_get_attachment_url ( get_sub_field ( 'source' ) ); ?>" type="video/<?php echo get_sub_field ( 'type' ); ?>">

          <?php

                    }
                  }

          ?>

          <span class="text-white">Video not supported</span>
        </video>

        <?php

                  break;

              }

            }

          } else {

            echo '<p class="text-white">No video selected.</p>';

          }

        ?>
      </div>
    </div>

  </div>
</div>

<?php

    } else {

      if ( !has_term ( array ( 'how-to', 'key-concepts' ), 'resource-category' ) ) {

        get_header();

        //
        // HERO
        //

        $hero_templates['content'] = 'resource-hero-content';
        $hero_templates['bg'] = 'post-thumb';

        include ( locate_template ( 'template/hero/hero.php' ) );

?>

<section id="resource-summary" class="page-section has-head">

  <div class="section-container">

    <header class="section-head container-fluid">
      <div class="row">
        <div class="col-10 offset-1 text-center text-lg-left">
          <?php

            if ( get_field ( 'asset_type' ) == 'video' && get_field ( 'asset_time' ) != '' ) {

          ?>

          <div id="hero-asset-time" class="asset-time summary-time d-flex align-items-center">
            <h6 class="mb-0 all-caps"><?php _e ( 'Time to completion', 'cdc' ); ?></h6>
            <span class="border border-primary text-primary rounded-pill ml-4 py-2 px-4"><?php echo get_field ( 'asset_time' ); ?> min</span>
          </div>

          <?php

            }

          ?>


          <h2 class="text-primary"><?php

            if ( get_field ( 'asset_summaryhead' ) != '' ) {
              echo get_field ( 'asset_summaryhead' );
            } else {
              _e ( 'Summary', 'cdc' );
            }


          ?></h2>
        </div>

        <div class="col-10 offset-1 col-md-8 col-lg-5">
          <?php

            the_field ( 'asset_summary' );

          ?>
        </div>

      </div>
    </header>

  </div>

</section>

<?php

        //
        // TIMELINE
        //

        if ( !empty ( get_field ( 'tl_sections' ) ) ) {

        	wp_enqueue_script ( 'gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.3/gsap.min.js', array ( 'jquery' ), null, true );
        	wp_enqueue_script ( 'scrolltrigger', 'https://assets.codepen.io/16327/ScrollTrigger.min.js?v=32', array ( 'gsap' ), null, true );
        	wp_enqueue_script ( 'scroll', get_stylesheet_directory_uri() . '/resources/js/scroll.js', array ( 'scrolltrigger' ), null, true );

?>

<div id="timeline">

  <?php

  	$section_num = 1;

  	if ( have_rows ( 'tl_sections' ) ) {
  		while ( have_rows ( 'tl_sections' ) ) {
  			the_row();

  			$section_class = array (
    			'tl-section',
  			  'bg-' . get_sub_field ( 'section_bg' ),
          'headings-' . get_sub_field ( 'section_headings' ),
          'text-' . get_sub_field ( 'section_text' ),
          'links-' . get_sub_field ( 'section_links' )
        );

  ?>

  <section id="tl-section-<?php echo $section_num; ?>" class="<?php echo implode ( ' ', $section_class ); ?>">

  	<?php

  			$scroll_elements = array();
  			$scroll_tl = array();

  			//
  			// CREATE ELEMENTS
  			//

  			while ( have_rows ( 'elements' ) ) {
    			the_row();

    			$element_ID = get_sub_field ( 'id' );

    			$new_element = array (
						'type' => get_sub_field ( 'content' ),
						'class' => array ( 'element', 'type-' . get_sub_field ( 'content' ), get_sub_field ( 'classes' ) ),
						'position' => get_sub_field ( 'position' ),
						'size' => get_sub_field ( 'size' ),
						'z_index' => ( get_sub_field ( 'z_index' ) != '' ) ? get_sub_field ( 'z_index' ) : 1
					);

					if ( get_sub_field ( 'content' ) == 'img' ) {
						$new_element['content'] = get_sub_field ( 'image' );
					} elseif ( get_sub_field ( 'content' ) == 'video' ) {
						$new_element['content'] = get_sub_field ( 'video' );
					} elseif ( get_sub_field ( 'content' ) == 'text' ) {
						$new_element['content'] = get_sub_field ( 'text' );
					}

					$scroll_elements[$element_ID] = $new_element;

  			}

  			//
  			// CREATE TIMELINE
  			//

  			while ( have_rows ( 'timeline' ) ) {
    			the_row();

    			$new_tween = array (
						'id' => get_sub_field ( 'id' ),
						'effect' => get_sub_field ( 'effect' ),
						'duration' => ( get_sub_field ( 'duration' ) != '' ) ? get_sub_field ( 'duration' ) : 1,
						'position' => ( get_sub_field ( 'tl_position' ) != '' ) ? get_sub_field ( 'tl_position' ) : '+=0',
// 						'delay' => ( get_sub_field ( 'delay' ) != '' ) ? get_sub_field ( 'delay' ) : '0'
					);

					if ( get_sub_field ( 'effect' ) == 'manual' ) {

						$new_tween['properties'] = array();

						while ( have_rows ( 'properties') ) {
							the_row();

							if ( get_row_layout() == 'position' ) {

  							$new_tween['properties']['css'] = array ();

  							$new_pos = get_sub_field ( 'position' );

  							if ( $new_pos['value1'] != '' ) {

              		if ( $new_pos['anchor1'] == 'top' ) {
                		$new_pos['value1'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $new_pos['value1'] / 100 ) . '))';
              		} else {
                		$new_pos['value1'] .= '%';
              		}

              		$new_tween['properties']['css'][$new_pos['anchor1']] = $new_pos['value1'];
                }

                if ( $new_pos['value2'] != '' ) {

              		if ( $new_pos['anchor2'] == 'top' ) {
                		$new_pos['value2'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $new_pos['value2'] / 100 ) . '))';
              		} else {
                		$new_pos['value2'] .= '%';
              		}

              		$new_tween['properties']['css'][$new_pos['anchor2']] = $new_pos['value2'];
                }

							} elseif ( get_row_layout() == 'css' ) {

								$new_tween['properties']['css'] = array();

								foreach ( get_sub_field ( 'rules' ) as $rule ) {
  								$new_tween['properties']['css'][$rule['property']] = $rule['value'];
								}

						  } else {

								$new_tween['properties'][get_row_layout()] = get_sub_field ( get_row_layout() );

							}

						}

					}

    			$scroll_tl[] = $new_tween;

  			}

  			/*if ( have_rows ( 'timeline' ) ) {
  				while ( have_rows ( 'timeline' ) ) {
  					the_row();

  					$element_ID = get_sub_field ( 'id' );

  					$new_tween = array (
  						'id' => get_sub_field ( 'id' ),
  						'type' => get_row_layout(),
  						'content' => get_sub_field ( 'content' ),
  						'effect' => get_sub_field ( 'effect' ),
  						'duration' => 1,
  						'position' => '+=0',
  						'delay' => ( get_sub_field ( 'delay' ) != '' ) ? get_sub_field ( 'delay' ) : '0'
  					);

  					if ( get_sub_field ( 'tl_position' ) != '' ) {
  						$new_tween['position'] = get_sub_field ( 'tl_position' );
  					}

  					if ( get_sub_field ( 'duration' ) != '' ) {
  						$new_tween['duration'] = (float) get_sub_field ( 'duration' );
  					}

  					if ( get_row_layout() == 'tween' ) {

  						if ( get_sub_field ( 'effect' ) == 'manual' ) {

  							$new_tween['properties'] = array();

  							while ( have_rows ( 'properties') ) {
  								the_row();

  								if ( get_row_layout() == 'position' ) {

/*
  									if ( get_sub_field ( 'xPercent' ) != '' )
  										$new_tween['properties']['xPercent'] = get_sub_field ( 'xPercent' );

  									if ( get_sub_field ( 'yPercent' ) != '' )
  										$new_tween['properties']['yPercent'] = get_sub_field ( 'yPercent' );
///

                    $new_tween['properties']['css'] = array ( 'left' => '50%' );

  								} elseif ( get_row_layout() == 'css' ) {

    								$new_tween['properties']['css'] = array();

    								foreach ( get_sub_field ( 'rules' ) as $rule ) {
      								$new_tween['properties']['css'][$rule['property']] = $rule['value'];
    								}

    						  } else {

  									$new_tween['properties'][get_row_layout()] = get_sub_field ( get_row_layout() );

  								}

  							}

  						}


  					}

  					$scroll_tl[] = $new_tween;

  					switch ( get_row_layout() ) {

  						case 'enter' :

  							$scroll_elements[$element_ID] = array (
  								'type' => get_sub_field ( 'content' ),
  								'class' => array ( 'element', 'type-' . get_sub_field ( 'content' ), get_sub_field ( 'classes' ) ),
  								'position' => get_sub_field ( 'position' ),
  								'size' => get_sub_field ( 'size' )
  							);

  							if ( get_sub_field ( 'z_index' ) != '' ) {
    							$scroll_elements[$element_ID]['z_index'] = get_sub_field ( 'z_index' );
  							} else {
    							$scroll_elements[$element_ID]['z_index'] = 1;
  							}

  							if ( get_sub_field ( 'content' ) == 'img' ) {
  								$scroll_elements[$element_ID]['content'] = get_sub_field ( 'image' );
  							} elseif ( get_sub_field ( 'content' ) == 'video' ) {
  								$scroll_elements[$element_ID]['content'] = get_sub_field ( 'video' );
  							} elseif ( get_sub_field ( 'content' ) == 'text' ) {
  								$scroll_elements[$element_ID]['content'] = get_sub_field ( 'text' );
  							}

  							break;

  						case 'exit' :

  							$scroll_elements[$element_ID]['delay'] = get_sub_field ( 'delay' );

  							break;

  					}

  				}
  			}*/

  			/*echo '<pre>';
  			print_r($scroll_elements);
  			echo '<hr>';
  			print_r($scroll_tl);
  			echo '</pre>';*/

  	?>

  	<div id="section-<?php echo $section_num; ?>" class="tl-container" data-timeline='<?php echo json_encode ( $scroll_tl, JSON_PRETTY_PRINT ); ?>'>

  		<?php

  				// dumpit($scroll_elements);

  				foreach ( $scroll_elements as $id => $element ) {

  		?>

  		<div id="section-<?php echo $section_num; ?>-element-<?php echo $id; ?>"
  			class="<?php echo implode ( ' ', $element['class'] ); ?>"
  			data-position-z="<?php echo $element['z_index']; ?>"
  			data-size-x="<?php echo $element['size']['x']; ?>"
  			data-size-y="<?php echo $element['size']['y']; ?>"
    		style="<?php


          if ( $element['position']['value1'] != '' && $element['position']['value1'] != '0' ) {

            if ( $element['position']['anchor1'] == 'top' ) {
          		$element['position']['value1'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $element['position']['value1'] / 100 ) . '))';
        		} else {
          		$element['position']['value1'] .= '%';
        		}

        		echo $element['position']['anchor1'] . ': ' . $element['position']['value1'] . '; ';
          }

          if ( $element['position']['value2'] != '' && $element['position']['value2'] != '0' ) {

            if ( $element['position']['anchor2'] == 'top' ) {
          		$element['position']['value2'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $element['position']['value2'] / 100 ) . '))';
        		} else {
          		$element['position']['value2'] .= '%';
        		}

        		echo $element['position']['anchor2'] . ': ' . $element['position']['value2'] . ';';
          }

        ?>"
  		>
  			<?php

  					if ( $element['type'] == 'img' ) {

  						echo '<img src="' . wp_get_attachment_image_url ( $element['content'], 'large' ) . '">';

  					} elseif ( $element['type'] == 'video' ) {

  						echo '<video id="section-' . $section_num . '-element-' . $id . '-video" src="' . wp_get_attachment_url ( $element['content'] ) . '" playsinline="true" webkit-playsinline="true" preload="auto" muted="muted" class="video-background"></video>';

  					} elseif ( $element['type'] == 'text' ) {

  						echo $element['content'];

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
  	}

  ?>

</div>

<?php


        }

        //
        // SECTIONS LOOP
        //

        include ( locate_template ( 'template/loop/sections.php' ) );

        get_footer();

      }

    }

  endwhile; endif;

?>
