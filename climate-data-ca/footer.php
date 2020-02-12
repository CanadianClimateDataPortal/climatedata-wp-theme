    <?php

if ( get_field ( 'page_feedback' ) == 1 ) {

  include ( locate_template ( 'template/footer/contact-form.php' ) );

}

$footer_logo = get_field ( 'footer_logo', 'option' );

if (isset($_SERVER['HTTP_HOST'])) {
  switch ($_SERVER['HTTP_HOST']) {
    case "climatedata.ca":
      $UA="UA-141104740-1";
      $DATAURL="//data.climatedata.ca";
      break;
    case "donneesclimatiques.ca":
      $UA="UA-141104740-2";
      $DATAURL="//data.climatedata.ca";
      break;
    case "climatedata.crim.ca":
      $UA="UA-141104740-3";
      $DATAURL="//dataclimatedata.crim.ca";
      break;
    case "donneesclimatiques.crim.ca":
      $UA="";
      $DATAURL="//dataclimatedata.crim.ca";
      break;
    default:
      $UA="";
      $DATAURL="//data.climatedata.ca";
  }
}


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

      if ( is_page ( 'Training' ) || is_page ( 'Formation' ) ) {

    ?>

    <div id="download-form">
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
              <label for="download-dataset" class="form-label"><?php _e ( 'Your information', 'cdc' ); ?></label>
            </p>

            <div class="form-text col-6">
              <label for="name" class="form-label all-caps"><?php _e ( 'Full name', 'cdc' ); ?></label>
              <input type="text" name="name" id="name" class="form-control form-control-lg rounded-pill">
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

    <div class="spinner"></div>

    <script type="text/javascript">

      var base_href = '<?php echo $GLOBALS['vars']['site_url']; ?>';
      var L_DISABLE_3D = true;
      var DATA_URL = '<?php echo $DATAURL;?>';
    </script>

    <?php

      wp_footer();

    ?>
<?php

if (!empty($UA)) {
?>

<!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $UA;?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '<?php echo $UA;?>');
    </script>

<?php
}
?>
  </body>
</html>
