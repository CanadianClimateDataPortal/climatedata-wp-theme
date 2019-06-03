    <?php

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

      wp_footer();

    ?>

  </body>
</html><!--test-->
