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

					<option value="allowance"><?php echo get_the_title() ?></option>
				</select>
				<a href="<?php echo $GLOBALS['vars']['site_url'] ?>variable/allowance/" data-overlay-content="interstitial" class="text-white dropdown-label overlay-toggle fas fa-info icon rounded-circle"></a>
			</div>
			<div id="" class="filter-block col-3">
				<select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rcp" id="rcp">
					<option value="ssp585-p50">SSP5-8.5</option>
					<option value="ssp370-p50">SSP3-7.0</option>
					<option value="ssp245-p50">SSP2-4.5</option>
					<option value="ssp126-p50">SSP1-2.6</option>
				</select>
			</div>


			<div id="" class="filter-block col-3">
				<select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rightrcp" id="rightrcp">
					<option value="disabled"><?php _e('Add a map to compare','cdc'); ?></option>
					<option value="ssp585-p50">SSP5-8.5</option>
					<option value="ssp370-p50">SSP3-7.0</option>
					<option value="ssp245-p50">SSP2-4.5</option>
					<option value="ssp126-p50">SSP1-2.6</option>
				</select>
			</div>





			<div id="var-filter-decade" class="filter-block col sr-only">
				<select class="select2" name="decade" id="decade">

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
