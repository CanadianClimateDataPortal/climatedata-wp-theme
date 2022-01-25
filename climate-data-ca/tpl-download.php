<?php

/*

  Template Name: Download

*/

//
// ENQUEUE
//

function tpl_enqueue()
{

    wp_enqueue_script('download-functions');

    wp_enqueue_script('highcharts-highstock');
    wp_enqueue_script('highcharts-more');
    wp_enqueue_script('highcharts-exporting');
    wp_enqueue_script('highcharts-export-data');

    wp_enqueue_script('leaflet');
    wp_enqueue_script('leaflet-geoman');
    wp_enqueue_script('leaflet-cluster');
    wp_enqueue_script('leaflet-cluster-subgroup');
    wp_enqueue_script('jszip');
    wp_enqueue_script('FileSaver');

    wp_enqueue_script('vector-grid');
    wp_enqueue_script('sync');
    wp_enqueue_script('nearest');

    wp_enqueue_script('jquery-ui-core');
    wp_enqueue_script('jquery-ui-widget');
    wp_enqueue_script('jquery-effects-core');
    wp_enqueue_script('jquery-ui-tabs');

    wp_enqueue_script('moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js', null, null, true);
    wp_enqueue_script('tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/js/tempusdominus-bootstrap-4.min.js', array('jquery'), null, true);

    wp_enqueue_style('tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/css/tempusdominus-bootstrap-4.min.css', null, null, 'all');

}

add_action('wp_enqueue_scripts', 'tpl_enqueue');

//
// TEMPLATE
//

get_header();

if (have_posts()) : while (have_posts()) : the_post();

    $get_start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $get_end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';
    $get_selected_stations = isset($_GET['s']) ? $_GET['s'] : '';
    $get_format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $get_limit = isset($_GET['limit']) ? $_GET['limit'] : 150000;
    $get_offset = isset($_GET['offset']) ? $_GET['offset'] : 0;
    $get_generated = isset($_GET['generated']) ? $_GET['generated'] : '';

    if ($get_generated == 1 && !$get_selected_stations) {
        $station_error = '<span class="badge badge-danger">Please choose at least one station</span>';
    } else {
        $station_error = null;
    }

    if (is_array($get_selected_stations)) {

        $station_choice = implode(',', $get_selected_stations);
        $station_count = count($get_selected_stations);
        $station_choice_pipes = implode('|', $get_selected_stations);

    }

    ?>

    <style>
    .bootstrap-datetimepicker-widget {
        font-size:10px; }
</style>
    <main id="download-content">

        <?php

        include(locate_template('template/hero/hero.php'));

        ?>

        <nav class="navbar navbar-expand navbar-light bg-light">

            <ul class="navbar-nav tabs-nav w-100 justify-content-center">
                <li class="nav-item"><a href="#var-download" class="nav-link px-4 py-5 all-caps"><?php _e('Variable Data', 'cdc'); ?></a></li>
                <li class="nav-item"><a href="#station-download" class="nav-link px-4 py-5 all-caps"><?php _e('Station Data', 'cdc'); ?></a></li>
                <li class="nav-item"><a href="#idf-download" class="nav-link px-4 py-5 all-caps"><?php _e('IDF Curves', 'cdc'); ?></a></li>
                <li class="nav-item"><a href="#ahccd-download" class="nav-link px-4 py-5 all-caps"><?php _e('AHCCD', 'cdc'); ?></a></li>                
            </ul>

        </nav>

        <section id="var-download" class="page-section tab">
					<?php

						if ( have_rows ( 'download_tabs' ) ) {
							while ( have_rows ( 'download_tabs' ) ) {
								the_row();

								if ( get_sub_field ( 'variable' ) != '' ) {

					?>

					<div class="row mb-5">
						<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3 p-5 bg-light">
							<?php the_sub_field ( 'variable' ); ?>
						</div>
					</div>

					<?php

								}

							}
						}

            include(locate_template('template/download/variable.php'));

          ?>
        </section>

        <section id="station-download" class="page-section tab">
          <?php

						if ( have_rows ( 'download_tabs' ) ) {
							while ( have_rows ( 'download_tabs' ) ) {
								the_row();

								if ( get_sub_field ( 'station' ) != '' ) {

					?>

					<div class="row mb-5">
						<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3 p-5 bg-light">
							<?php the_sub_field ( 'station' ); ?>
						</div>
					</div>

					<?php

								}

							}
						}

            include(locate_template('template/download/station-data.php'));

          ?>
        </section>

        <section id="idf-download" class="page-section tab">
          <?php

						if ( have_rows ( 'download_tabs' ) ) {
							while ( have_rows ( 'download_tabs' ) ) {
								the_row();

								if ( get_sub_field ( 'idf' ) != '' ) {

					?>

					<div class="row mb-5">
						<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3 p-5 bg-light">
							<?php the_sub_field ( 'idf' ); ?>
						</div>
					</div>

					<?php

								}

							}
						}

            include(locate_template('template/download/idf.php'));

          ?>
        </section>
        
        <section id="ahccd-download" class="page-section tab">
            <?php

            if ( have_rows ( 'download_tabs' ) ) {
                while ( have_rows ( 'download_tabs' ) ) {
                    the_row();

                    if ( get_sub_field ( 'ahccd' ) != '' ) {

                        ?>

                        <div class="row mb-5">
                            <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3 p-5 bg-light">
                                <?php the_sub_field ( 'ahccd' ); ?>
                            </div>
                        </div>

                        <?php

                    }

                }
            }

            include(locate_template('template/download/ahccd.php'));

            ?>
        </section>        

    </main>

    <div id="dummy-chart" style="position: absolute; left: -9999px; top: -9999px; width: 500px; height: 500px;"></div>

    <div class="modal fade" id="success-modal" tabindex="-1" role="dialog" aria-labelledby="heat-wave-success-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle"><?php _e('Success', 'cdc'); ?></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p><?php _e('Your request has been submitted. The processed data will be sent to your email address shortly.', 'cdc'); ?></p>
                </div>
            </div>
        </div>
    </div>

<?php

endwhile; endif;

get_footer();

?>
