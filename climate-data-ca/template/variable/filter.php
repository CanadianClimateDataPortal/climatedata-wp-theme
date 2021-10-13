<?php

$query_string = $_GET;

$filters = array(
    'coords' => array('hidden' => true, 'val' => '62.5325943454858,-98.525390625,4'),
    'geo-select' => array('hidden' => true, 'val' => ''),
    'var' => array('hidden' => true, 'val' => ''),
    'mora' => array('hidden' => true, 'val' => 'ann'),
    'rcp' => array('hidden' => true, 'val' => 'rcp26'),
    'decade' => array('hidden' => true, 'val' => ''),
    'sector' => array('hidden' => true, 'val' => ''));

if (isset ($query_string['geo-select']) && !empty ($query_string['geo-select'])) {
    $filters['coords']['val'] = $GLOBALS['vars']['current_data']['location_data']['lat'] . ',' . $GLOBALS['vars']['current_data']['location_data']['lon'] . ',11';
} elseif (isset ($query_string['coords']) && $query_string['coords'] != $filters['coords']['val']) {
    $filters['coords']['val'] = $query_string['coords'];
}

if (get_the_ID() == filtered_ID_by_path('explore/variable')) {
    $filter_bg = 'bg-primary';
} else {
    $filter_bg = 'bg-purple';
}

?>

<nav id="var-filter" class="filter-navbar navbar navbar-dark <?php echo $filter_bg; ?> text-white">
    <div class="container-fluid">

        <form class="row w-100 align-items-center">

            <?php

            while (have_rows('variable_filters')) {
                the_row();

                switch (get_row_layout()) {

                    case 'sector' :

                        $filters['sector']['hidden'] = false;

                        $sector_page_ID = filtered_ID_by_path('explore/sector');

                        // get all children of the sectors page

                        $sector_query = get_pages(array('post_type' => 'page', 'child_of' => $sector_page_ID, 'posts_per_page' => -1, 'orderby' => 'menu_order', 'order' => 'asc'));

                        $sector_pages = array();

                        if (!empty ($sector_query)) {

                            // find the subpages that use the map template

                            foreach ($sector_query as $sector_page) {

                                if (get_post_meta($sector_page->ID, '_wp_page_template')[0] == 'tpl-variable.php') {
                                    $sector_page->slug = get_post(icl_object_id(get_post($sector_page->post_parent)->ID, 'post', FALSE, 'en'))->post_name;
                                    $sector_pages[] = $sector_page;


                                    if ($sector_page->ID == get_the_ID()) {
                                        $filters['sector']['val'] = $sector_page->slug;
                                    }

                                }

                            }


                            ?>

<!--                            <div id="var-filter-sector" class="filter-block col-2">-->
<!--                                <select class="custom-select custom-select-lg select2 form-control" name="sector" id="sector">-->
<!--                                    <option value="" -->
                            <?php //echo ($filters['sector']['val'] == '') ? 'selected' : ''; ?>

                            <?php //echo (get_sub_field('label') != '') ? get_sub_field('label') : 'None'; ?>
<!--                            </option>-->
                                    <?php

//                                    foreach ($sector_pages as $map_page) {

                                        ?>

<!--                                        <option value="<?php //echo $map_page->slug; ?>" <?php //echo ($map_page->slug == $filters['sector']['val']) ? 'selected' : ''; ?><?php //echo get_the_title($map_page->post_parent); ?></option>-->

                                        <?php

//                                    }

                                    ?>
<!--                                </select>-->
<!--                            </div>-->

                            <?php

                        }

                        break;

                    case 'geo-select' :

                        $filters['geo-select']['hidden'] = false;

                        ?>

                        <div id="var-filter-search" class="filter-block col-2">
                            <div id="geo-select-container" class="text-center">
                                <select class="custom-select custom-select-lg select2 form-control" name="geo-select" id="geo-select">
                                    <option value=""><?php _e('Search for a City/Town', 'cdc'); ?></option>
                                    <?php

                                    if (isset ($query_string['geo-select'])) {

                                        ?>

                                        <option value="<?php echo $query_string['geo-select']; ?>"><?php echo $GLOBALS['vars']['current_data']['location_data']['geo_name']; ?></option>

                                        <?php

                                    }

                                    ?>
                                </select>
                            </div>
                        </div>

                        <?php

                        break;

                    case 'var' :

                        $filters['var']['hidden'] = false;

                        if (isset ($GLOBALS['vars']['current_data']['var_name'])) {
                            $filters['var']['val'] = $GLOBALS['vars']['current_data']['var_name'];
                        }

                        ?>

                        <div id="var-filter-variable" class="filter-block col-3">
                            <select class="custom-select custom-select-md select2 form-control input-large" name="var" id="var">
                                <?php

                                $var_types = get_terms(array('taxonomy' => 'var-type', 'hide_empty' => true));

                                if (!empty ($var_types)) {

                                    foreach ($var_types as $var_type) {

                                        ?>

                                        <optgroup label="<?php echo $var_type->name; ?>" data-slug="<?php echo $var_type->slug; ?>">

                                            <?php

                                            $vars_by_type = new WP_Query (array('post_type' => 'variable', 'posts_per_page' => -1, 'orderby' => 'menu_order', 'order' => 'asc', 'tax_query' => array(array('taxonomy' => 'var-type', 'terms' => $var_type->term_id))));

                                            if ($vars_by_type->have_posts()) : while ($vars_by_type->have_posts()) :
                                                $vars_by_type->the_post();

                                                ?>

                                                <option value="<?php the_field('var_name'); ?>" <?php echo (get_field('var_name') == $filters['var']['val']) ? 'selected' : ''; ?>><?php the_title(); ?></option>

                                            <?php

                                            endwhile; endif;

                                            wp_reset_postdata();

                                            ?>

                                        </optgroup>

                                        <?php

                                    } // foreach var_types

                                }

                                ?>
                            </select>

                            <a href="<?php echo $GLOBALS['vars']['site_url'] . 'variable/' . $GLOBALS['vars']['current_data']['var_name'] . '/'; ?>" data-overlay-content="interstitial" class="text-white dropdown-label overlay-toggle fas fa-info icon rounded-circle"></a>
                        </div>

                        <?php

                        break;

                    case 'mora' :

                        $filters['mora']['hidden'] = false;

                        ?>

                        <div id="var-filter-month" class="filter-block col-2">
                            <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="mora" id="mora">
                                <option value="ann"><?php _e('Annual', 'cdc'); ?></option>
                                <option value="jan"><?php _e('January', 'cdc'); ?></option>
                                <option value="feb"><?php _e('February', 'cdc'); ?></option>
                                <option value="mar"><?php _e('March', 'cdc'); ?></option>
                                <option value="apr"><?php _e('April', 'cdc'); ?></option>
                                <option value="may"><?php _e('May', 'cdc'); ?></option>
                                <option value="jun"><?php _e('June', 'cdc'); ?></option>
                                <option value="jul"><?php _e('July', 'cdc'); ?></option>
                                <option value="aug"><?php _e('August', 'cdc'); ?></option>
                                <option value="sep"><?php _e('September', 'cdc'); ?></option>
                                <option value="oct"><?php _e('October', 'cdc'); ?></option>
                                <option value="nov"><?php _e('November', 'cdc'); ?></option>
                                <option value="dec"><?php _e('December', 'cdc'); ?></option>
                            </select>
                        </div>

                        <?php

                        break;

                    case 'rcp' :

                        $filters['rcp']['hidden'] = false;

                        $scenarios = array(
                            array('value' => 'rcp26', 'label' => 'RCP 2.6', 'compare' => false),
                            array('value' => 'rcp26vs45', 'label' => 'RCP 2.6 vs RCP 4.5', 'compare' => true),
                            array('value' => 'rcp26vs85', 'label' => 'RCP 2.6 vs RCP 8.5', 'compare' => true),
                            array('value' => 'rcp45', 'label' => 'RCP 4.5', 'compare' => false),
                            array('value' => 'rcp45vs26', 'label' => 'RCP 4.5 vs RCP 2.6', 'compare' => true),
                            array('value' => 'rcp45vs85', 'label' => 'RCP 4.5 vs RCP 8.5', 'compare' => true),
                            array('value' => 'rcp85', 'label' => 'RCP 8.5', 'compare' => false),
                            array('value' => 'rcp85vs26', 'label' => 'RCP 8.5 vs RCP 2.6', 'compare' => true),
                            array('value' => 'rcp85vs45', 'label' => 'RCP 8.5 vs RCP 4.5', 'compare' => true));

                        ?>

                        <div id="" class="filter-block col-2">
                            <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rcp" id="rcp">
                                <?php

                                foreach ($scenarios as $scenario) {

                                    $show_scenario = true;

                                    // if 'show compare scenarios' option is not checked
                                    // and this RCP is a compare scenario

                                    if (get_sub_field('compare') != 1 && $scenario['compare'] == true) {
                                        $show_scenario = false;
                                    }

                                    if ($show_scenario == true) {

                                        ?>

                                        <option value="<?php echo $scenario['value']; ?>"><?php echo $scenario['label']; ?></option>

                                        <?php

                                    }

                                }

                                ?>
                            </select>
                        </div>

                        <?php

                        break;

                    case 'tour' :

                        ?>

                        <div class="filter-block col text-right col px-3">
                            <a href="#" class="btn btn-outline-light rounded-pill page-tour-trigger all-caps" data-tour="page-tour"> <span class="d-none d-xl-block"><?php _e('New here? Take a tour!', 'cdc'); ?></span> <span class="d-none d-lg-block d-xl-none"><?php _e('Take a tour', 'cdc'); ?></span> <span class="d-lg-none"><?php _e('Tour', 'cdc'); ?></span> </a>
                        </div>

                        <?php

                        break;

                }

            }

            if (have_rows('variable_sliders')) {
                while (have_rows('variable_sliders')) {
                    the_row();

                    if (get_row_layout() == 'decade') {

                        $filters['decade']['hidden'] = false;

                        $decade_min = (int)get_sub_field('min');
                        $decade_max = (int)get_sub_field('max');
                        $decade_default = (int)get_sub_field('default');

                        ?>

                        <div id="var-filter-decade" class="filter-block col sr-only">
                            <select class="select2" name="decade" id="decade">
                                <?php

                                for ($i = $decade_min; $i <= $decade_max; $i += 10) {

                                    ?>

                                    <option value="<?php echo $i; ?>s" <?php echo ($i == $decade_default) ? 'selected' : ''; ?>><?php echo $i; ?>s</option>

                                    <?php

                                }

                                ?>
                            </select>
                        </div>

                        <?php

                    }

                }

            }

            foreach ($filters as $filter => $settings) {

                if ($settings['hidden'] == true) {

                    ?>

                    <input type="hidden" name="<?php echo $filter; ?>" id="<?php echo $filter; ?>" value="<?php echo $settings['val']; ?>">

                    <?php

                }

            }

            ?>

        </form>

    </div>
</nav>

<?php
$get_delta = filter_input(INPUT_GET, 'delta', FILTER_SANITIZE_URL);
?>

<div class="toggle-switch-container" id="toggle-switch-container">
    <div class="toggle-switch switch-vertical"id="absolute_or_deltas">
        <input id="toggle-a" type="radio" value="a" name="absolute_delta_switch"<?php if ($get_delta == "false" || !$get_delta) { echo ' checked="checked"'; } ?> />
        <label for="toggle-a"><?php _e('Absolute','cdc');?></label>
        <input id="toggle-b" type="radio" value="d" name="absolute_delta_switch"<?php if ($get_delta == "true") { echo ' checked="checked"'; } ?> />
        <label for="toggle-b" style="float: left">Delta</label>
        <div class="text-dark fas fa-question-circle" id="absolute_or_deltas_help" data-content="<div id=aordpoptitle><?php _e('DELTA WITH 1971-2000','cdc');?></div><?php _e('Deltas are the difference between the future value and the reference period (or baseline) value of a climate variable, as simulated by a climate model .The reference period used here is 1971-2000."','cdc');?>"></div>
        <span class="toggle-outside">
        <span class="toggle-inside"></span>
      </span>
    </div>
</div>

<div id="var-filter-view" class="col-3 offset-2 p-4 align-items-center">
  <label for="sector" class="mr-3"><?php _e ( 'View by:', 'cdc' ); ?></label>
  <select class="custom-select variable-download-data-view_by" id="sector" name="sector">
    <option value="" selected>Gridded data</option>
    <option value="census">census</option>
    <option value="health">health</option>
    <option value="watershed">watershed</option>
  </select>
</div>
