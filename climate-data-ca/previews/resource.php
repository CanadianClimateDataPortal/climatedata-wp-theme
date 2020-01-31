<?php

  if ( !isset ( $bg_colour ) ) $bg_colour = 'primary';
  if ( !isset ( $text_colour ) ) $text_colour = 'white';

  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'medium' );

  $bg_style = get_field ( 'resource_style', $item['id'] );

  if ( $bg_style == 'random' ) $bg_style = mt_rand ( 1, 3 );

?>

<div class="card h-100 bg-<?php echo $bg_colour; ?> bg-<?php echo $bg_style; ?> text-center text-<?php echo $text_colour; ?>">
  <div class="card-body">
    <h6 class="card-label vertical-label"><span><?php _e ( 'Training Video', 'cdc' ); ?></span></h6>
    <h5 class="card-title"><?php echo $item['title']; ?></h5>

    <div class="card-bg" style="background-image: url(<?php echo $bg_img; ?>);"></div>
  </div>

  <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-secondary text-white overlay-toggle" data-overlay-content="video" data-overlay-opacity="0.8"><?php _e ( 'View Video', 'cdc' ); ?></a>

  <a href="<?php echo $item['permalink']; ?>" class="card-overlay overlay-toggle" data-overlay-content="video" data-overlay-opacity="0.8"></a>
</div>
