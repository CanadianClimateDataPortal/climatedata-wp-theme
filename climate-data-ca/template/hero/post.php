<?php

	wp_enqueue_script ( 'share-widget' );

	add_action( 'wp_footer', function() {

?>

<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

<script src="https://platform.linkedin.com/in.js" type="text/javascript">lang: en_US</script>
<script type="IN/Share" data-url="https://www.linkedin.com"></script>

<?php

	}, 10, 1 );

?>

<section id="hero" class="page-section first-section bg-dark text-white">
  <?php

    $bg_URL = '';

    $hero_images = get_field ( 'misc_images', 'option' );

    if ( !empty ( $hero_images ) ) {

      $bg_URL = wp_get_attachment_image_url ( $hero_images[array_rand ( $hero_images )]['ID'], 'hero' );
      $bg_class = array ( 'opacity-30', 'bg-position-center', 'bg-attachment-fixed' );

      include ( locate_template ( 'elements/bg.php' ) );

    }

  ?>

  <div class="section-container">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-6 offset-1">
          <h1><?php

            the_title();

          ?></h1>

          <?php the_field ( 'hero_text' ); ?>
        </div>

        <aside class="col-3 offset-1 hero-menu-wrap">
          <div class="hero-menu">
            <h6><?php _e ( 'Date', 'cdc' ); ?></h6>

            <p class="mb-4"><?php the_time ( 'F j, Y' ); ?></p>

						<?php

							if ( get_field ( 'post_author' ) != '' ) {

						?>

						<h6><?php _e ( 'Author', 'cdc' ); ?></h6>

						<p class="mb-4"><?php the_field ( 'post_author' ); ?></p>

						<?php

							}

						?>

						<h6><?php _e ( 'Share this post', 'cdc' ); ?></h6>

						<div id="post-share-wrap">
							<div id="share"></div>
						</div>

          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
