<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">1</h2>
					<h5><?php _e ( 'Data', 'cdc' ); ?></h5>
					<p class="mb-0"><?php _e ( 'Select a variable and dataset to begin building your request.', 'cdc' ); ?></p>
				</div>
				<span class="tab-drawer-close btn-close"></span>
			</div>

			<div class="control-tab-body">
				<div class="invalid-alert m-3" style="display: none;">
					<div class="alert alert-danger bg-white d-flex">
						<div class="me-3"><span class="alert-icon"></span></div>
						<div><ul class="list-unstyled mb-0 text-body"></ul></div>
					</div>
				</div>

				<div id="map-control-variable" class="map-control-item px-0">

					<input type="hidden" name="data-var-id" id="data-var-id" value="" data-query-key="var_id" data-validate="<?php _e ( 'Select a variable to download.', 'cdc' ); ?>">
					<input type="hidden" name="data-var" id="data-var" value="" data-query-key="var">

					<a href="#data-variable" class="tab-drawer-trigger d-block text-body p-3">
						<span class="h6 all-caps text-secondary mb-3"><?php _e ( 'Variable', 'cdc' ); ?></span>
						<span class="var-name p-2"><?php _e ( 'Click to select a variable', 'cdc' ); ?></span>
					</a>

				</div>

				<div id="map-control-dataset" class="map-control-item" data-flags="station:0">
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Dataset', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="Description here">?</a>
					</h6>

					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip6" value="cmip6" data-query-key="dataset">
						<label class="form-check-label" for="data-dataset-cmip6">CMIP6 (CanDCS-U6)</label>
					</div>

					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip5" value="cmip5" data-query-key="dataset">
						<label class="form-check-label" for="data-dataset-cmip5">CMIP5 (CanDCS-U5)</label>
					</div>

					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-humidex" value="humidex" data-query-key="dataset">
						<label class="form-check-label" for="data-dataset-humidex">Humidex (CMIP6)</label>
					</div>

					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-ahccd" value="ahccd" data-query-key="dataset">
						<label class="form-check-label" for="data-dataset-ahccd"><?php _e ( 'Observations (AHCCD)', 'cdc' ) ?></label>
					</div>

					<?php /*<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-station" value="regular" data-query-key="regular">
						<label class="form-check-label" for="data-dataset-station">Regular Station Data</label>
					</div>*/ ?>

				</div>

				<div id="var-thresholds" class="map-control-item" style="display: none;" data-flags="threshold:1,custom:1">
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Threshold Values', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="Description here">?</a>
					</h6>

					<div class="accordion accordion-flush" id="var-threshold-accordion">
						<div class="accordion-item" data-flags="threshold:1">
							<h6 class="accordion-header" id="threshold-preset-head">
								<button id="threshold-preset-btn" class="accordion-button all-caps text-gray-600 mb-0" type="button" data-bs-toggle="collapse" data-bs-target="#threshold-preset" aria-expanded="true" aria-controls="threshold-preset">
									<?php _e ( 'Preset', 'cdc' ); ?>
								</button>
							</h6>
							<div id="threshold-preset" class="accordion-collapse collapse show" aria-labelledby="threshold-preset-head" data-bs-parent="#var-threshold-accordion">
								<div class="accordion-body">

									<div class="single-preset-label">
									</div>

									<div class="map-control-slider-well">
										<div id="threshold-slider" class="map-control-slider" data-pane="marker">
											<div id="threshold-handle" class="ui-slider-handle"></div>
										</div>
									</div>

								</div>
							</div>
						</div>
						<div class="accordion-item" data-flags="custom:1">
							<h6 class="accordion-header" id="threshold-custom-head">
								<button class="accordion-button all-caps text-gray-600 mb-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#threshold-custom" aria-expanded="false" aria-controls="threshold-custom">
									<?php _e ( 'Custom', 'cdc'); ?>
								</button>
							</h6>
							<div id="threshold-custom" class="accordion-collapse collapse" aria-labelledby="threshold-custom-head" data-bs-parent="#var-threshold-accordion">
								<div class="accordion-body">
									<?php // custom inputs placeholder ?>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>

			<div class="control-tab-footer">
				<a href="#area" class="btn btn-lg btn-secondary d-block tab-drawer-trigger"><?php _e ( 'Next', 'cdc' ); ?>: <?php _e ( 'Area of Analysis', 'cdc' ); ?></a>
			</div>

		</div>
	</div>

	<div class="tab-drawer-container">
		<?php

			include ( locate_template ( 'template/download/controls/data-variable.php' ) );

		?>
	</div>
</div>
