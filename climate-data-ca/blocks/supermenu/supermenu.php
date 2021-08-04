<div id="supermenu" class="supermenu-wrap">
  <div class="supermenu bg-light">
    <div class="tablet d-none d-lg-block"></div>

    <div id="supermenu-carousel" class="supermenu-carousel" data-slick='{
      "slidesToShow": 1,
      "speed": 600,
      "autoplay": false,
      "infinite": false,
      "draggable": false,
      "prevArrow": ".supermenu-prev",
      "nextArrow": ".supermenu-next"
    }'>

      <div class="supermenu-slide" data-href="<?php echo $GLOBALS['vars']['site_url']; ?>location/" data-slug="<?php echo get_the_slug ( filtered_ID_by_path ( 'explore/location' ) ); ?>">
        <div class="container-fluid">
          <header class="row">
            <div class="col-10 offset-1 col-lg-4 offset-lg-4 d-flex align-items-center text-secondary">
              <span class="cdc-icon icon-variable"></span>
              <h5><?php _e ( 'Find data summaries in locations you care about', 'cdc' ); ?></h5>
            </div>
          </header>

          <div id="location-search-container" class="row align-items-center text-lg-center">
            <label for="location-search" class="col-10 offset-1 col-md-3 col-lg-2 offset-lg-2 col-form-label"><?php _e ( 'Select a location', 'cdc' ); ?></label>

            <div class="col-10 offset-1 col-md-6 offset-md-0 col-lg-4 offset-lg-0">
              <select class="custom-select custom-select-lg select2 form-control-lg rounded-pill border-dark text-center w-100" name="location-search" id="location-search" data-container-css-class="big-menu btn btn-lg rounded-pill" data-dropdown-css-class="big-menu-dropdown">
                <option value=""><?php _e ( 'Search for a City/Town', 'cdc' ); ?></option>
              </select>
            </div>
          </div>

          <div id="location-search-instruction" class="col-10 offset-1 col-lg-4 offset-lg-4">
            <p><?php _e('* Each location provided here corresponds to a point location in Canada.
            The data displayed is for the ~10 km x 6 km grid cell within which the selected location lies.
            Accordingly, the data does not necessarily reflect the exact point that you select, particularly in areas with varying microclimates.','cdc'); ?></p>
          </div>
        </div>
      </div>

      <div class="supermenu-slide" data-href="<?php echo $GLOBALS['vars']['site_url']; ?>variable/" data-slug="<?php echo get_the_slug ( filtered_ID_by_path ( 'explore/variable' ) ); ?>">
        <div class="container-fluid">
          <header class="row">
            <div class="col-10 offset-1 col-md-6 col-lg-3 offset-lg-3 d-flex align-items-center text-primary mb-3 mb-md-0">
              <span class="cdc-icon icon-variable"></span>
              <h5><?php _e ( 'Quick links to Popular Data Sets', 'cdc' ); ?></h5>
            </div>

            <div class="col-10 offset-1 col-md-4 col-lg-3 offset-lg-2 text-center">
              <a href="<?php echo get_post_type_archive_link( 'variable' ); ?>" class="btn btn-lg rounded-pill bg-primary text-white"><?php _e ( 'View all variables', 'cdc' ); ?></a>
            </div>
          </header>

          <div class="row d-none d-lg-flex">
            <?php

              $var_types = get_terms ( array (
                'taxonomy' => 'var-type',
                'hide_empty' => true
              ) );

              $var_column = 1;

              foreach ( $var_types as $var_type ) {

            ?>

            <div class="col-6 col-lg-2 px-5 px-lg-0 <?php echo ( $var_column == 1 ) ? 'offset-lg-3' : ''; ?>">

              <?php

                  $variable_query = new WP_Query ( array (
                    'post_type' => 'variable',
                    'posts_per_page' => 5,
                    'orderby' => 'menu_order',
                    'order' => 'asc',
                    'tax_query' => array (
                      array (
                        'taxonomy' => 'var-type',
                        'terms' => $var_type->term_id
                      )
                    )
                  ) );

                  if ( $variable_query->have_posts() ) :

              ?>

              <h6><?php echo $var_type->name; ?></h6>

              <ul>

                <?php

                    while ( $variable_query->have_posts() ) :

                      $variable_query->the_post();

                      $var_class = array ( );

                      if ( isset ( $GLOBALS['vars']['current_data'] ) && $GLOBALS['vars']['current_data']['id'] == get_the_ID() ) {
                        $var_class[] = 'current-item';
                        $var_class[] = 'text-dark';
                      } else {
                        $var_class[] = 'text-muted';
                      }

                ?>

                <li><a href="<?php the_permalink(); ?>" class="overlay-toggle <?php echo implode ( ' ', $var_class ); ?>" data-overlay-content="interstitial"><?php the_title(); ?></a></li>

                <?php

                    endwhile; // while vars

                ?>

              </ul>

              <?php

                  endif; // if vars

                  wp_reset_postdata();

              ?>

            </div>

            <?php

                $var_column++;

              } // foreach type

            ?>
          </div>
        </div>
      </div>

      <div class="supermenu-slide" data-href="<?php echo $GLOBALS['vars']['site_url']; ?>sector/" data-slug="<?php echo get_the_slug ( filtered_ID_by_path ( 'explore/sector' ) ); ?>">
        <div class="container-fluid">

          <header class="row">
            <div class="col-10 offset-1 col-md-6 col-lg-3 offset-lg-3 d-flex align-items-center text-muted mb-3 mb-md-0">
              <span class="cdc-icon icon-var-other"></span>
              <h5><?php _e('Sectors','cdc'); ?></h5>
            </div>

            <div class="col-10 offset-1 col-md-4 col-lg-3 text-center">
            </div>
          </header>

          <div class="row">
            <?php

              $current_ID = get_the_ID();
              $sector_page_ID = filtered_ID_by_path ( 'explore/sector' );

              $sector_query = new WP_Query ( array (
                'post_type' => 'page',
                'post_parent' => $sector_page_ID,
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'asc',
                'meta_query' => array (
                  array (
                    'key' => '_wp_page_template',
                    'value' => 'tpl-variable.php',
                    'compare' => 'NOT IN'
                  )
                )
              ) );

              if ( $sector_query->have_posts() ) :

                $sector_column = 1;

                while ( $sector_query->have_posts() ) : $sector_query->the_post();


								$link_href = '';
								$link_class = 'text-muted';

								if ( $current_ID == get_the_ID() ) {
									$link_class .= ' smooth-scroll';
								} else {
									$link_href = get_permalink();
								}

            ?>

            <div class="col-10 col-sm-6 col-lg-2 px-5 px-lg-0 <?php echo ( $sector_column == 1 ) ? 'offset-lg-3' : ''; ?>">

              <h6><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h6>


              <ul>
								<li><a href="<?php echo $link_href; ?>#sector-context" class="<?php echo $link_class; ?>"><?php _e ( 'Context', 'cdc' ); ?></a></li>
					      <li><a href="<?php echo $link_href; ?>#sector-cases" class="<?php echo $link_class; ?>"><?php _e ( 'Case Studies', 'cdc' ); ?></a></li>
					      <li><a href="<?php echo $link_href; ?>#sector-analogous" class="<?php echo $link_class; ?>"><?php _e ( 'Sector Resources', 'cdc' ); ?></a></li>
					      <li><a href="<?php echo $link_href; ?>#sector-vars" class="<?php echo $link_class; ?>"><?php _e ( 'Relevant Variables', 'cdc' ); ?></a></li>
					      <li><a href="<?php echo $link_href; ?>#sector-related" class="<?php echo $link_class; ?>"><?php _e ( 'Related Content', 'cdc' ); ?></a></li>
              </ul>
            </div>

            <?php

                $sector_column++;

              endwhile; endif;

            ?>
          </div>

          <?php

            wp_reset_postdata();

          ?>

        </div>
      </div>

    </div>

    <div class="supermenu-carousel-controls">
      <span class="supermenu-prev icon fas fa-caret-left"></span>
      <span class="supermenu-next icon fas fa-caret-right"></span>
    </div>

  </div>
</div>
