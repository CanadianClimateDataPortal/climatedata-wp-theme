<?php

  /*

    Template Name: Iframe

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

    wp_enqueue_script ( 'listnav' );

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<main id="glossary-content">

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>

  <nav class="navbar navbar-expand navbar-light bg-light">
    <aside id="glossary-listnav-nav" class="collapse navbar-collapse">
<!--
      <ul class="navbar-nav tabs-nav w-100 justify-content-center">
        <li class="nav-item head px-4 py-5 all-caps">Filter</li>
      </ul>
-->
    </aside>
  </nav>

<style>


</style>

  <section id="glossary" class="page-section">

      <?php

        $glossary_query = new WP_Query ( array (
          'post_type' => 'definition',
          'posts_per_page' => -1,
          'orderby' => 'title',
          'order' => 'asc'
        ) );

        if ( $glossary_query->have_posts() ) :

      ?>



<div class="container-fluid" id="dst-load-xhr" style='background-color:green; font-size: 12pt; height: 2000px; content: ""; width: 100%; display: table; clear: both;' >
      <!-- <iframe src="http://132.217.140.7/building-dst/decision-support-tool"  frameborder="0" allow="autoplay; fullscreen" title="W3Schools Free Online Web Tutorials"></iframe> -->

        <p id="dst-load" style="background-color:red; font-size: 12pt;">Loading...</p>

        <!-- <div style="
        background-color:#aaa;
        float: left;
        width: 25%;
        padding: 10px;
        height: 100%;"
        >
        <h2 style='background-color:green; font-size: 12pt;'>Column 1</h2>
        <p>Some text..</p>
        </div>
        <div style="
        background-color:#bbb;
        float: left;
        width: 75%;
        padding: 10px;
        height: 100%;"
        >
        <h2 style='background-color:green; font-size: 12pt;'>Column 2</h2>
        <p>Some text..</p>
        </div> -->

        <!-- <p id="dst-load" style="background-color:red; font-size: 12pt;">Loading...</p>
        <p id="dst-load2" style="background-color:red; font-size: 12pt;">Loading...</p> -->


        <!-- {{ script|safe }} -->

        <!-- <iframe width="100%" height="100%" src="http://localhost:5006/building-dst/decision-support-tool"></iframe> -->




            <!-- {{ script|safe }} -->

            <!-- <iframe width="100%" height="100%" src="http://localhost:5006/building-dst/decision-support-tool"></iframe> -->


        <script id="1090">
            function uuidv4() {
                return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }

            (function() {
                const xhr = new XMLHttpRequest()
                xhr.responseType = 'blob';
                xhr.open('GET', "http://132.217.140.7/building-dst/decision-support-tool/autoload.js?bokeh-autoload-element=1090&bokeh-app-path=/decision-support-tool&bokeh-absolute-url=http://132.217.140.7/building-dst/decision-support-tool", true);

                // we can also store it in browser's session in order to preserve websocket session after page refresh
                const sessionId = uuidv4();
                xhr.setRequestHeader("Bokeh-Session-Id", sessionId)

                xhr.onload = function (event) {
                    const script = document.createElement('script');
                    const src = URL.createObjectURL(event.target.response);
                    script.src = src;

                    // remove the loading screen
                    const container = document.getElementById('dst-load');
                    container.remove();

                    document.getElementById('dst-load-xhr').appendChild(script);
                };
                xhr.send();
            })();
        </script>



      </div>

      <?php

        endif;

        wp_reset_postdata();

      ?>

  </section>

</main>

<?php

  endwhile; endif;

  get_footer();

?>
