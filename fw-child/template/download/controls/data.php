<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">1</h2>
					<h5><?php _e ( 'Data Options', 'cdc' ); ?></h5>
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
				
				<div id="map-control-variable" class="map-control-item pe-0">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Variable', 'cdc' ); ?></h6>
					
					<input type="hidden" name="data-var-id" id="data-var-id" value="" data-query-key="var_id">
					<input type="hidden" name="data-var" id="data-var" value="" data-query-key="var" data-validate="<?php _e ( 'Select a variable to download', 'cdc' ); ?>">
					
					<a href="#data-variable" class="tab-drawer-trigger var-name d-block bg-white text-body p-3 mb-3"><?php _e ( 'Click to select a variable', 'cdc' ); ?></a>
					
					<div id="var-thresholds" class="me-3" style="display: none;" data-display="station:0">
						<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Thresholds', 'cdc' ); ?></h6>
						
						<div class="accordion accordion-flush" id="var-threshold-accordion">
							<div class="accordion-item" data-display="threshold:1">
								<h6 class="accordion-header" id="threshold-preset-head">
									<button id="threshold-preset-btn" class="accordion-button all-caps text-gray-600 mb-0" type="button" data-bs-toggle="collapse" data-bs-target="#threshold-preset" aria-expanded="true" aria-controls="threshold-preset">
										<?php _e ( 'Presets', 'cdc' ); ?>
									</button>
								</h6>
								<div id="threshold-preset" class="accordion-collapse collapse show" aria-labelledby="threshold-preset-head" data-bs-parent="#var-threshold-accordion">
									<div class="accordion-body">
										
										<div class="map-control-slider-well">
											<div id="threshold-slider" class="map-control-slider" data-pane="marker">
												<div id="threshold-handle" class="ui-slider-handle"></div>
											</div>
										</div>
										
									</div>
								</div>
							</div>
							<div class="accordion-item">
								<h6 class="accordion-header" id="threshold-custom-head">
									<button class="accordion-button all-caps text-gray-600 mb-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#threshold-custom" aria-expanded="false" aria-controls="threshold-custom">
										<?php _e ( 'Custom', 'cdc'); ?>
									</button>
								</h6>
								<div id="threshold-custom" class="accordion-collapse collapse" aria-labelledby="threshold-custom-head" data-bs-parent="#var-threshold-accordion">
									<div class="accordion-body">
										
									</div>
								</div>
							</div>
						</div>
						
					</div>
					
				</div>
				
				<div id="map-control-dataset" class="map-control-item" data-display="station:0">
					<h6 class="all-caps text-secondary mb-3">Dataset</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip6" value="cmip6" data-query-key="dataset" checked>
						<label class="form-check-label" for="data-dataset-cmip6">CMIP6 (CanDCS-U6)</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip5" value="cmip5" data-query-key="dataset">
						<label class="form-check-label" for="data-dataset-cmip5">CMIP5 (CanDCS-U5)</label>
					</div>
					
					<div class="form-check" data-display="threshold:1">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-humidex">
						<label class="form-check-label" for="data-dataset-humidex">Humidex (CMIP6)</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-ahccd">
						<label class="form-check-label" for="data-dataset-ahccd">AHCCD</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-station">
						<label class="form-check-label" for="data-dataset-station">Regular Station Data</label>
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