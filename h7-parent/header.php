<?php

if (current_user_can('administrator')) {

    echo '<!--';
    print_r($GLOBALS['vars']);
    echo '-->';

}

// if we're on the variable template and there's no variable set,
// get the first variable post

/*
  if ( is_page_template ( 'tpl-variable.php' ) ) {
    echo 'var<hr>';
  }

  if ( is_page_template ( 'tpl-variable.php' ) && !isset ( $query_string['var'] ) ) {

    $first_var = get_posts ( array (
      'post_type' => 'variable',
      'posts_per_page' => 1,
      'orderby' => 'menu_order',
      'order' => 'asc'
    ) );

    if ( !empty ( $first_var ) ) {
      $query_string['var'] = get_field ( 'var_name', $first_var[0]->ID );
    }



  }
*/

?>
<!doctype html>
<html class="no-js">
<head>
    <title><?php

        //
        // TITLE
        //

        // current object

        wp_title('—', true, 'right');

        // data vars

        if (!empty ($GLOBALS['vars']['current_data'])) {

            if ($GLOBALS['vars']['current_data']['type'] == 'variable') {

                echo get_the_title($GLOBALS['vars']['current_data']['id']) . ' — ';

            } elseif ($GLOBALS['vars']['current_data']['type'] == 'location') {

                if (isset ($GLOBALS['vars']['current_data']['location_data'])) {
                    echo $GLOBALS['vars']['current_data']['location_data']['geo_name'] . ', ' . short_province($GLOBALS['vars']['current_data']['location_data']['province']) . ' — ';
                }
            }

        }

        // site title

        bloginfo('title');

        // description on home page

        if (is_front_page() && get_bloginfo('description') != '') {
            echo ' — ' . get_bloginfo('description');
        }

        ?></title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?php

    if (get_field('favicon', 'option') != '') {

        ?>

        <link rel="icon" type="image/png" href="<?php echo wp_get_attachment_image_url(get_field('favicon', 'option'), 'thumbnail'); ?>">

        <?php

    }

    wp_head();

    $body_ID = 'page';
    
    // Prevent animation on interactive pages
    global $post_type;
    $post_type = get_post_type();

    if ( $post_type !== 'interactive' ) {
        $body_class = [ 'animsition', 'spinner-on' ];
    }

    if (is_front_page()) {

        $body_ID = 'page-home';

        if (get_field('home_progress') == 1) {
            $body_class[] = 'has-progress';
        }

    } elseif (is_page_template('tpl-variable.php')) {

        $body_class[] = 'has-filter';
        $body_ID = 'page-variable';

    } elseif (is_archive()) {

        $body_ID = 'page-archive';

    } else {

        $body_ID = get_post_type() . '-' . get_the_slug();

    }

    if (isset ($GLOBALS['vars']['current_lang'])) {

        $body_class[] = 'lang-' . $GLOBALS['vars']['current_lang'];

    }

    if (!empty ($_GET)) {
        $body_class[] = 'has-query';
    }

    //
    // CHECK FOR ALERTS
    //
    if (is_front_page() || in_array($body_ID, array("page-variable", "page-download", "page-analyze", "page-analyser", "page-telechargement") ) ) {

        $alert_query = new WP_Query (array('post_type' => 'post', 'posts_per_page' => 1, 'meta_query' => array('relation' => 'AND', array('key' => 'post_alert', 'value' => 1), array('key' => 'post_alert-start', 'value' => $GLOBALS['vars']['date'], 'compare' => '<'), array('key' => 'post_alert-end', 'value' => $GLOBALS['vars']['date'], 'compare' => '>'))));

        if ($alert_query->have_posts()) :

            $body_class[] = 'has-alert';

            while ($alert_query->have_posts()) : $alert_query->the_post();

                $alert = array('title' => get_the_title(), 'permalink' => get_permalink());

            endwhile;

        endif;

        wp_reset_postdata();

    }

		//

		// $body_class = do_action ( 'example_action', $body_class );


		$body_class = apply_filters ( 'custom_body_classes', $body_class );

    ?>

</head>

<body id="<?php echo $body_ID; ?>" <?php body_class(implode(' ', $body_class)); ?>>

<header id="main-header" class="">
    <?php

    if (isset ($alert)) {

        ?>

        <div id="alert" class="container-fluid alert header-alert bg-primary text-white">
            <div class="row align-items-center">
                <div class="col-10 col-md-9 offset-md-2 pl-3 pl-md-0">
                    <a href="<?php echo $alert['permalink']; ?>"><?php echo $alert['title']; ?></a>
                </div>

                <div class="col text-center alert-close">
                    <i class="fas fa-times rounded-circle btn btn-outline-light"></i>
                </div>
            </div>
        </div>

        <?php

    }

    ?>

    <div id="main-header-nav" class="">
        <div class="container-fluid">

            <?php

            // header sections loop

            if (have_rows('header_sections', 'option')) {
                while (have_rows('header_sections', 'option')) {
                    the_row();

                    $section_ID = get_sub_field('id');

                    ?>

                    <div id="<?php echo $section_ID; ?>" class="row">

                        <?php

                        if (have_rows('elements')) {
                            while (have_rows('elements')) {
                                the_row();

                                if (locate_template('template/blocks/' . get_row_layout() . '.php') != '') {

                                    include locate_template('template/blocks/' . get_row_layout() . '.php');

                                } else {

                                    echo get_row_layout();

                                }

                            }
                        }

                        ?>

                    </div>

                    <?php

                }
            }

            ?>

        </div>

        <?php

        //
        // VARIABLE NAV
        //

        if (is_page_template('tpl-variable.php')) {

            if (have_rows('variable_filters')) {

                include(locate_template('template/variable/filter.php'));

            }

        } elseif ($GLOBALS['vars']['current_slug'] == 'slr' && $post->post_type == 'page') {
            include(locate_template('template/variable/slr-filter.php'));
        }

        //
        // SUPERMENU
        //

        include(locate_template('blocks/supermenu/supermenu.php'));

        ?>

    </div>
</header>
