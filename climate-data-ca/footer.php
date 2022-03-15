    <?php

if ( get_field ( 'page_feedback' ) == 1 ) {

  include ( locate_template ( 'template/footer/contact-form.php' ) );

}

$footer_logo = get_field ( 'footer_logo', 'option' );

    ?>

    <footer id="main-footer">
      <div class="section-container">
        <?php

          if ( have_rows ( 'background', 'option' ) ) {
            while ( have_rows ( 'background', 'option' ) ) {
              the_row();

              $bg_URL = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'hero' );

              include ( locate_template ( 'elements/bg.php' ) );

            }
          }

        ?>

        <div class="section-content container-fluid">

          <?php

            // footer sections loop

            include ( locate_template ( 'template/footer/loop.php' ) );

          ?>

        </div>
      </div>
    </footer>

    <?php

      if ( is_page ( 'learn' ) || is_page ( 'apprendre' ) ) {

    ?>

    <div id="download-form" style="display: none;">
      <div class="container-fluid">

        <div class="row">
          <div class="col-10 offset-1">
            <h4 class="overlay-title text-primary"><?php _e ( 'Download', 'cdc' ); ?></h4>
            <p><?php _e ( 'Please agree to the following terms before downloading the training presentation.', 'cdc' ); ?></p>
          </div>
        </div>

        <form id="download-terms-form" class="needs-validation container-fluid pb-5" novalidate="">
          <input type="hidden" name="page_ID" value="<?php echo get_the_ID(); ?>">

          <div class="form-layout-row row">
            <p class="form-label-wrap col-3 offset-1">
              <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
              <label for="fullname" class="form-label"><?php _e ( 'Terms of Use', 'cdc' ); ?></label>
            </p>

            <div class="form-text col-7">

              <p><?php _e ( 'Since these training materials are being provided to me free of charge, I agree not to charge participants/clients for the development of the training materials and will likewise make the materials freely available to clients (in PDF format).' ,'cdc' ); ?></p>

              <div class="form-check form-control-lg form-check-inline">

                <input class="form-check-input mr-4" type="checkbox" name="download-term-1" id="download-term-1" value="term-1">
                <label class="form-check-label" for="download-term-1"><?php _e ( 'I agree', 'cdc' ); ?></label>
              </div>

            </div>
          </div>

          <div class="form-layout-row row">
            <p class="form-label-wrap col-3 offset-1"></p>

            <div class="form-text col-7">
              <p><?php _e ( 'If other organizations wish to use the training materials, I agree to refer them back to climatedata.ca rather than sharing the PowerPoint file directly.', 'cdc' ); ?></p>

              <div class="form-check form-control-lg form-check-inline">
                <input class="form-check-input mr-4" type="checkbox" name="download-term-2" id="download-term-2" value="term-2">
                <label class="form-check-label" for="download-term-2"><?php _e ( 'I agree', 'cdc' ); ?></label>
              </div>

            </div>
          </div>

          <div class="form-layout-row row">
            <p class="form-label-wrap col-3 offset-1"></p>

            <div class="form-text col-7">

              <p><?php _e ( 'I agree to add or remove slides, but I will not edit individual slide content other than design and formatting. Specifically, the font size/colour can be changed, the layout of items on the slide can be rearranged, and organization branding (e.g. logo, PowerPoint template) can be added, but otherwise nothing can be added or removed (including the climatedata.ca text)', 'cdc' ); ?></p>

              <div class="form-check form-control-lg form-check-inline">
                <input class="form-check-input mr-4" type="checkbox" name="download-term-3" id="download-term-3" value="term-3">
                <label class="form-check-label" for="download-term-3"><?php _e ( 'I agree', 'cdc' ); ?></label>
              </div>

            </div>
          </div>

          <div class="form-layout-row row">
            <p class="form-label-wrap col-3 offset-1">
              <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
              <label for="download-dataset" class="form-label"><?php _e ( 'Your information (optional)', 'cdc' ); ?></label>
            </p>

            <div class="form-text col-6">
              <p><?php _e ( 'We are asking for your contact information to inform you when new versions are released and to request feedback. We are continuously seeking to improve these training materials and value your input. If you have any feedback or questions please contact the <a href="https://climate-change.canada.ca/support-desk">Climate Services Support Desk</a>.' ,'cdc' ); ?></p>

              <label for="fullname" class="form-label all-caps"><?php _e ( 'Full name', 'cdc' ); ?></label>
              <input type="text" name="fullname" id="fullname" class="form-control form-control-lg rounded-pill">
            </div>
          </div>

          <div class="form-layout-row row">
            <p class="form-label-wrap col-3 offset-1"></p>

            <div class="form-text col-6">
              <label for="email" class="form-label all-caps"><?php _e ( 'Email address', 'cdc' ); ?></label>
              <input type="text" name="email" id="email" class="form-control form-control-lg rounded-pill">
            </div>
          </div>

          <div id="download-terms-submit-wrap" class="form-layout-row row align-items-center form-process">
            <div id="terms-captcha-wrap" class="col-4 offset-4">
              <label for="terms-captcha_code" class="d-block w-100"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: </label>

              <div class="d-flex align-items-center">
                <img id="terms-captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/php/securimage/securimage_show.php" alt="CAPTCHA Image" />
                <input type="text" name="terms-captcha_code" id="terms-captcha_code" class="form-control ml-4" placeholder="XXXX" size="4" maxlength="4" data-toggle="tooltip" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
              </div>
            </div>

            <div class="col-3 offset-1 input-group input-group-lg">
              <button class="btn btn-secondary all-caps rounded-pill disabled" type="submit" id="download-terms-submit"><?php _e ( 'Accept & Download', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></button>
            </div>
          </div>

          <div id="download-terms-response" class="form-layout-row row" style="display: none;"></div>
        </form>

      </div>
    </div>

    <?php

      }

    ?>

		<div id="newsletter" style="display: none;">
			<div class="container-fluid">
				<div class="row">
					<div class="col-10 offset-1 col-md-6 offset-md-3">

						<h2 class="text-primary"><?php _e('ClimateData.ca Newsletter', 'cdc'); ?></h2>

						<p><?php _e('Join our newsletter for periodic updates.', 'cdc'); ?></p>

						<!-- Begin Mailchimp Signup Form -->
						<div id="mc_embed_signup" class="mt-5">
							<form action="https://climatedata.us1.list-manage.com/subscribe/post?u=c52e1be341cba7905716a66b4&amp;id=727cebaf22" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
						    <div id="mc_embed_signup_scroll">

									<label for="mce-EMAIL" class="sr-only">Email Address</label>

									<div class="input-group mc-field-group">
										<input type="email" value="" name="EMAIL" class="required email form-control form-control-lg" id="mce-EMAIL" placeholder="<?php _e('Enter your email address', 'cdc'); ?>">

									  <div class="input-group-append">
											<input type="submit" value="<?php _e('Subscribe','cdc'); ?>" name="subscribe" id="mc-embedded-subscribe" class="btn btn-outline-secondary">
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

						<!--End mc_embed_signup-->

					</div>
				</div>
			</div>
		</div>

    <div class="spinner"></div>

    <script type="text/javascript">

      var base_href = '<?php echo $GLOBALS['vars']['site_url']; ?>';
      var L_DISABLE_3D = true;
      var DATA_URL = '<?php echo $GLOBALS['vars']['data_url']; ?>';
    </script>

    <?php

      wp_footer();

    ?>
<?php


$UA = ($GLOBALS['vars']['current_lang'] == 'fr')? $GLOBALS['vars']['analytics_ua_fr']:$GLOBALS['vars']['analytics_ua_en'];
$GTMNGR = $GLOBALS['vars']['googletag_id'];
$GA_CROSS_DOMAIN = $GLOBALS['vars']['ga_cross_domain'];

if (!empty($UA)) {
?>

<!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $UA;?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
<?php
      if (!empty($GA_CROSS_DOMAIN)) {
          echo "      gtag('set', 'linker', {'domains': $GA_CROSS_DOMAIN});\n";
      }
?>
      gtag('js', new Date());

      gtag('config', '<?php echo $UA;?>');
    </script>

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','<?php echo $GTMNGR;?>');</script>
    <!-- End Google Tag Manager -->

    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id='<?php echo $GTMNGR;?>'"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

<?php
}
?>
  </body>
</html>
