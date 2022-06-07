<div class="container-fluid subsections">
  <?php

    $subsection_num = 1;

    while ( have_rows ( 'subsections' ) ) {
      the_row();

      if ( get_sub_field ( 'subsection_id' ) != '' ) {

        $subsection_ID = get_sub_field ( 'subsection_id' );

      } else {

        $subsection_ID = $section_ID . '-' . $subsection_num;

      }

  ?>

  <div id="<?php echo $subsection_ID; ?>" class="subsection">
    <div class="row">
      <?php

        if ( have_rows ( 'blocks' ) ) {

          $block_num = 1;

          while ( have_rows ( 'blocks' ) ) {

            the_row();

            if ( get_sub_field ( 'block_id' ) != '' ) {

              $block_ID = get_sub_field ( 'block_id' );

            } else {

              $block_ID = $subsection_ID . '-' . $block_num;

            }

            $block_type = get_row_layout();

            if ( $block_type == 'divider' ) {

              echo '</div><div class="row">';

            } else {

              $block_class = array ( 'block', 'type-' . $block_type );

              if ( $block_type == 'post_carousel' ) {


              }

              $block_breakpoints = array();

              // BLOCK SETTINGS

              if ( have_rows ( 'grid' ) ) {
                while ( have_rows ( 'grid' ) ) {
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

                      $block_breakpoints[] = $new_class;

                      if ( get_sub_field ( 'offset' ) != '' ) {

                        $new_class = 'offset';

                        if ( get_sub_field ( 'breakpoint' ) != '' ) {

                          $new_class .= '-' . get_sub_field ( 'breakpoint' );

                        }

                        $new_class .= '-' . get_sub_field ( 'offset' );

                        $block_breakpoints[] = $new_class;

                      }

                    }
                  }

                  // adjust for content types

                  if ( $block_type == 'text' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-10', 'offset-1', 'col-lg-8' );
                    }

                  }

                  if ( $block_type == 'image' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-12' );
                    }

                  }

                  if ( $block_type == 'big_list' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-10', 'offset-1', 'col-lg-6' );
                    }

                  }

                  if ( $block_type == 'text_img' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-12' );
                    }

                  }

                  if ( $block_type == 'post_grid' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-10', 'offset-1' );
                    }

                  }

                  if ( $block_type == 'map' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-12' );
                    }

                  }

                  if ( $block_type == 'chart' ) {

                    if ( empty ( $block_breakpoints ) ) {
                      $block_breakpoints = array ( 'col-10', 'offset-1', 'col-xl-8' );
                    }

                  }

                  $block_class = array_merge ( $block_class, $block_breakpoints );

                  // additional classes

                  if ( get_sub_field ( 'class' ) != '' ) {
                    $block_class = array_merge ( $block_class, explode ( ' ', get_sub_field ( 'class' ) ) );
                  }

                }
              }

      ?>

      <div id="<?php echo $block_ID; ?>" class="<?php echo implode ( ' ', $block_class ); ?>">

        <?php

              if ( locate_template ( 'blocks/' . get_row_layout() . '.php' ) != '' ) {

                include ( locate_template ( 'blocks/' . get_row_layout() . '.php' ) );

              } else {

                echo 'block';

              }

        ?>

      </div>

      <?php

              $block_num++;

            }

          } // while blocks

        } // if blocks

      ?>

    </div>
  </div>

  <?php

      $subsection_num++;

    } // while subsections

  ?>

</div>
