<?php

  if ( is_front_page() ) {

?>

<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Quick Start', 'cdc' ); ?></h6>

    <ul>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/location' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Location', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/variable' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Variable', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/sector' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Sector', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'analyze' ) ); ?>"><?php _e ( 'Analyze', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'download' ) ); ?>"><?php _e ( 'Download', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'learn' ) ); ?>"><?php _e ( 'Learn', 'cdc' ); ?></a></li>
    </ul>
  </div>

  <footer class="hero-menu-footer"><?php the_field ( 'version' ); ?></footer>
</aside>

<?php

  } elseif ( is_page ( 'learn' ) || is_page ( 'apprendre' ) ) {

?>

<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Skip to topics', 'cdc' ); ?></h6>

    <ul>
      <?php

        $terms_to_exclude = get_terms ( array (
          'taxonomy' => 'resource-category',
          'fields' => 'ids',
          'slug' => array ( 'how-to', 'key-concepts' ),
          'hide_empty' => false
        ) );

        $modules = get_terms ( array (
          'taxonomy' => 'resource-category',
          'exclude' => $terms_to_exclude,
          'hide_empty' => false
        ) );

        foreach ( $modules as $module ) {

      ?>

      <li><a href="#<?php echo $module->slug; ?>" class="smooth-scroll"><?php echo get_field ( 'module_title', 'resource-category_' . $module->term_id ); ?></a></li>

      <?php

        }

      ?>

      <li><a href="#training-materials" class="smooth-scroll"><?php _e ( 'Training Materials', 'cdc' ); ?></a></li>
    </ul>
  </div>
</aside>

<?php

} elseif ( is_page ( 'news' ) || is_page ( 'media' ) ) {

?>

<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">

		<h6><?php _e('ClimateData.ca Newsletter', 'cdc'); ?></h6>

		<p><?php _e('Join our newsletter for periodic updates.', 'cdc'); ?></p>

		<div id="mc_embed_signup" class="mt-5">
			<form action="https://climatedata.us1.list-manage.com/subscribe/post?u=c52e1be341cba7905716a66b4&amp;id=727cebaf22" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
				<div id="mc_embed_signup_scroll">

					<label for="mce-EMAIL" class="sr-only">Email Address</label>

					<div class="input-group mc-field-group">
						<input type="email" value="" name="EMAIL" class="required email form-control form-control-lg" id="mce-EMAIL" placeholder="<?php _e('Enter your email address', 'cdc'); ?>">

						<div class="input-group-append">
							<input type="submit" value="<?php _e('Subscribe','cdc'); ?>" name="subscribe" id="mc-embedded-subscribe" class="btn btn-primary">
						</div>
					</div>

					<div id="mce-responses" class="clear">
						<div class="response" id="mce-error-response" style="display:none"></div>
						<div class="response" id="mce-success-response" style="display:none"></div>
					</div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->

					<div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_c52e1be341cba7905716a66b4_727cebaf22" tabindex="-1" value=""></div>
				</div>
			</form>
		</div>

  </div>
</aside>

<?php

  }

?>
