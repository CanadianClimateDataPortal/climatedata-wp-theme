<?php

  if ( !isset ( $bg_colour ) ) $bg_colour = 'dark';
  if ( !isset ( $text_colour ) ) $text_colour = 'white';

  if ( $bg_colour == 'dark' ) {
    $btn_class = 'btn-outline-light';
  } else {
    $btn_class = 'btn-outline-secondary';
  }

  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'medium' );

  $bg_style = get_field ( 'resource_style', $item['id'] );

  if ( $bg_style == 'random' ) $bg_style = mt_rand ( 1, 3 );

?>

<div class="card h-100 bg-<?php echo $bg_colour; ?> text-<?php echo $text_colour; ?>">
  <div class="card-bg" style="background-image: url(<?php echo $bg_img; ?>);"></div>

  <div class="card-body p-5">
    <h5 class="card-title mb-4"><a href="<?php echo $item['permalink']; ?>" class="text-white"><?php echo $item['title']; ?></a></h5>

    <p><?php

      echo custom_excerpt ( $item['id'], 50 );

    ?></p>
  </div>

  <div class="card-footer border-0 d-flex flex-md-column flex-lg-row justify-content-between px-5 pb-5">
    <div class="card-keywords mb-md-4 mb-lg-0 pr-4 all-caps">
			<?php

				$keywords = get_the_terms ( $item['id'], 'keyword' );

				if ( !empty ( $keywords ) ) {

			?>

			<h6 class="mb-1"><?php _e ( 'Keywords', 'cdc' ); ?></h6>

			<p class="mb-0"><?php

				$i = 0;

				foreach ( $keywords as $keyword ) {

					if ( $i != 0 ) echo ' | ';

					echo $keyword->name;

					$i++;
				}

			?></p>

			<?php

				}

			?>
    </div>

    <div class="d-flex align-items-center">
      <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill <?php echo $btn_class; ?>"><?php _e ( 'Explore', 'cdc' ); ?></i></a>
    </div>
  </div>
</div>
