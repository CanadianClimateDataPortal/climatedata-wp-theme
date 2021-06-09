<div class="row">
  <h4 class="col-10 offset-1 col-lg-5 offset-lg-3 text-primary"><a href="<?php echo $item['permalink']; ?>" class="overlay-toggle" data-overlay-content="interstitial"><?php echo $item['title']; ?></a></h4>
</div>

<div class="row">
  <div class="col-10 offset-1 col-md-3 col-lg-2 pb-5 pb-md-0 pr-md-5">
    <?php

      if ( has_post_thumbnail ( $item['id'] ) ) {

    ?>

    <img src="<?php echo get_the_post_thumbnail_url( $item['id'], 'medium' ); ?>" class="mx-auto">

    <?php

      }

    ?>
  </div>

  <div class="col-10 offset-1 col-md-6 offset-md-0 col-lg-5">
    <?php echo apply_filters ( 'the_content', $item['content'] ); ?>
  </div>

  <div class="col-10 offset-1 col-md-6 offset-md-4 col-lg-2 offset-lg-1 text-center text-md-left text-lg-center">

    <p><a href="<?php echo $item['permalink']; ?>" class="result-permalink btn rounded-pill btn-outline-primary overlay-toggle all-caps" data-overlay-content="interstitial"><?php _e ( 'View Data', 'cdc' ); ?> <i class="fas fa-long-arrow-alt-right"></i></a></p>

    <?php

      $link_href = get_permalink ( filtered_ID_by_path ( 'download' ) );

      if ( has_term ( 'station-data', 'var-type', $item['id'] ) ) {

        $link_href .= '#station-download';

      } else {

        $link_href .= '?var=' . get_field ( 'var_name', $item['id'] );

      }

    ?>

    <p class="result-download-link small all-caps"><a href="<?php echo $link_href; ?>" class="text-body"><i class="far fa-arrow-alt-circle-down text-primary"></i> <?php _e ( 'Download data', 'cdc' ); ?></a></p>

  </div>

  <hr class="col-10 offset-1 col-md-8 offset-md-3 my-5">
</div>
