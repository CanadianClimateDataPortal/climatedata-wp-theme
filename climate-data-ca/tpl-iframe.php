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
        .bk * {
            font-size: 12pt;
        }

        main {
            min-height: 400px;
            margin-bottom: 100px;
            clear: both;
        }



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



  <div class="container-fluid">
    <div class="row">

      <div id="analyze-form" class="col-3">

        <form id="analyze-form-inputs">



          <div id="analyze-steps" class="ui-accordion ui-widget ui-helper-reset" role="tablist">
            <div class="accordion-head ui-accordion-header ui-state-default ui-accordion-header-active ui-state-active ui-corner-top ui-accordion-icons" data-step="1" role="tab" id="ui-id-1" aria-controls="ui-id-2" aria-selected="true" aria-expanded="true" tabindex="0" data-valid="false"><span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>
              <h5 class="d-flex align-items-center justify-content-between all-caps">
                <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
                <span class="flex-grow-1">Choose a decision support tool</span>
                <i class="fas fa-caret-down"></i>
              </h5>
            </div>

            <div class="accordion-content ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active" data-step="1" id="ui-id-2" aria-labelledby="ui-id-1" role="tabpanel" style="display: block;" aria-hidden="false">
              <div class="accordion-content-inner">
                <div class="field validate-input type-radio">

                  <div class="input-row form-check">
                    <div class="input-item">
                      <input class="form-check-input add-to-object" type="radio" name="dataset_name" id="analyze-dataset-bccaqv2" value="bccaqv2">
                      <i class="form-icon fas fa-circle"></i><label class="form-check-label" for="analyze-dataset-bccaqv2">Building</label>
                    </div>
                  </div>

                  <div class="input-row form-check">
                    <div class="input-item">
                      <input class="form-check-input add-to-object" type="radio" name="dataset_name" id="analyze-dataset-bccaqv2" value="bccaqv2">
                      <i class="form-icon fas fa-circle"></i><label class="form-check-label" for="analyze-dataset-bccaqv2">Agriculture</label>
                    </div>
                  </div>

                </div>
              </div>
            </div>


          </div>

        </form>
      </div>

      <div class="col-9">

        <div id="analyze-map-container" style="font-size: 12pt; height: 2000px;">
          <p id="dst-load">Loading...</p>


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
              xhr.open('GET', "https://dst-staging.climatedata.ca/building-dst/decision-support-tool/autoload.js?bokeh-autoload-element=1090&bokeh-app-path=/decision-support-tool&bokeh-absolute-url=https://dst-staging.climatedata.ca/building-dst/decision-support-tool", true);

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

                document.body.appendChild(script);
              };
              xhr.send();
            })();
          </script>


        </div>
      </div>
    </div>



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
