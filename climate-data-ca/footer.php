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

    <div class="spinner"></div>

    <script type="text/javascript">

      var base_href = '<?php echo $GLOBALS['vars']['site_url']; ?>';
      var L_DISABLE_3D = true; 
    </script>

    <?php

      wp_footer();

      /*if ( current_user_can ( 'administrator' ) ) {

        $var_query = new WP_Query ( array (
          'post_type' => 'variable',
          'posts_per_page' => -1
        ) );

        while ( $var_query->have_posts() ) : $var_query->the_post();

          update_field ( 'var_title', get_the_title() );

          echo get_the_title() . ': ' . get_field ( 'var_title' ) . '<br>';

        endwhile;

      }*/

    ?>
<?php

if (isset($_SERVER['HTTP_HOST'])) {
  switch ($_SERVER['HTTP_HOST']) {
    case "climatedata.ca":
      $UA="UA-141104740-1";
      break;
    case "donneesclimatiques.ca":
      $UA="UA-141104740-2";
      break;
    case "climatedata.crim.ca":
      $UA="UA-141104740-3";
      break;
    default:
      $UA="";
  }
}

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
