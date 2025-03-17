<nav id="var-filter" class="filter-navbar navbar navbar-dark bg-primary text-white">
    <div class="container-fluid">

        <form class="row w-100 align-items-center">

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

            <div id="var-filter-variable" class="filter-block col-3">
                <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="var" id="var">

                    <option value="slr"><?php echo get_the_title() ?></option>
                </select>
                <a href="<?php echo $GLOBALS['vars']['site_url'] ?>variable/slr/" data-overlay-content="interstitial" class="text-white dropdown-label overlay-toggle fas fa-info icon rounded-circle"></a>
            </div>
			<?php
			$scenarios = [
				"rcp85plus65-p50" => __('RCP 8.5 enhanced scenario','cdc'),
				"rcp85-p05" => "RCP 8.5 " . __('lower (5th percentile)','cdc'),
				"rcp85-p50" => "RCP 8.5 " . __('median (50th percentile)','cdc'),
				"rcp85-p95" => "RCP 8.5 " . __('upper (95th percentile)','cdc'),
				"rcp45-p05" => "RCP 4.5 " . __('lower (5th percentile)','cdc'),
				"rcp45-p50" => "RCP 4.5 " . __('median (50th percentile)','cdc'),
				"rcp45-p95" => "RCP 4.5 " . __('upper (95th percentile)','cdc'),
				"rcp26-p05" => "RCP 2.6 " . __('lower (5th percentile)','cdc'),
				"rcp26-p50" => "RCP 2.6 " . __('median (50th percentile)','cdc'),
				"rcp26-p95" => "RCP 2.6 " . __('upper (95th percentile)','cdc'),

				"ssp585-p50" => "SSP5-8.5",
				"ssp370-p50" => "SSP3-7.0",
				"ssp245-p50" => "SSP2-4.5",
				"ssp126-p50" => "SSP1-2.6",
			];

			?>
            <div id="" class="filter-block col-3">
                <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rcp" id="rcp">

					<?php
					foreach ( $scenarios as $scenario_key => $scenario_label ) {
						echo '<option value="' . $scenario_key . '">' . $scenario_label . '</option>';
					}
					?>

                </select>
            </div>


            <div id="" class="filter-block col-3">
                <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rightrcp" id="rightrcp">

                    <option value="disabled"><?php _e('Add a map to compare','cdc'); ?></option>
					<?php
					foreach ( $scenarios as $scenario_key => $scenario_label ) {
						echo '<option value="' . $scenario_key . '">' . $scenario_label . '</option>';
					}
					?>
                </select>
            </div>





            <div id="var-filter-decade" class="filter-block col sr-only">
                <select class="select2" name="decade" id="decade">

                    <option value="2006" >2006</option>
                    <option value="2010" >2010</option>
                    <option value="2020" >2020</option>
                    <option value="2030" >2030</option>
                    <option value="2040" >2040</option>
                    <option value="2050" >2050</option>
                    <option value="2060" >2060</option>
                    <option value="2070" >2070</option>
                    <option value="2080" >2080</option>
                    <option value="2090" >2090</option>
                    <option value="2100" >2100</option>

                </select>
            </div>

            <input type="hidden" name="coords" id="coords" value="58.60833366077633,-89.86816406250001,4">


        </form>

    </div>
</nav>

<?php
$get_dataset = filter_input(INPUT_GET, 'dataset', FILTER_SANITIZE_URL);
?>

<div class="toggle-switch-container" id="toggle-switch-container">

	<div class="toggle-switch switch-vertical">
		<input id="toggle-cmip5" type="radio" value="cmip5" name="dataset_switch"<?php if ($get_dataset == "cmip5") { echo ' checked="checked"'; } ?> />
		<label for="toggle-cmip5" style="float: left;white-space: nowrap;margin-top:3px">CMIP 5</label>
		<input id="toggle-cmip6" type="radio" value="cmip6" name="dataset_switch"<?php if (!$get_dataset || $get_dataset == "cmip6") { echo ' checked="checked"'; } ?> />
		<label for="toggle-cmip6" style="float: left;white-space: nowrap">CMIP 6</label>
		<span class="toggle-outside">
        <span class="toggle-inside"></span>
      </span>
	</div>
</div>
