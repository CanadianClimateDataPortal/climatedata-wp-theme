<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5><?php _e ( 'Data Options', 'cdc' ); ?></h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-variable" class="map-control-item pe-0">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Variable', 'cdc' ); ?></h6>
					
					<input type="hidden" name="data-var-id" id="data-var-id" value="" data-query-key="var_id">
					<input type="hidden" name="data-var" id="data-var" value="" data-query-key="var">
					
					<a href="#data-variable" class="tab-drawer-trigger var-name d-block bg-white text-body p-3 mb-3"><?php _e ( 'Click to select a variable', 'cdc' ); ?></a>
					
					<div id="var-thresholds" class="me-3" style="display: none;">
						<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Thresholds', 'cdc' ); ?></h6>
						
						<div class="map-control-slider-well">
							<div id="threshold-slider" class="map-control-slider" data-pane="marker">
								<div id="threshold-handle" class="ui-slider-handle"></div>
							</div>
						</div>
						
					</div>
					
				</div>
				
				<div id="map-control-dataset" class="map-control-item">
					
					<label for="data-dataset" class="form-label d-block h6 all-caps text-secondary"><?php _e ( 'Dataset', 'cdc' ); ?></label>
					
					<div class="btn-group">
						<input type="radio" class="btn-check" name="data-dataset" id="data-dataset-cmip6" value="cmip6" autocomplete="off" data-query-key="dataset" checked>
						<label class="btn btn-outline-gray-400" for="data-dataset-cmip6"><?php _e ( 'CMIP6', 'cdc' ); ?></label>
						
						<input type="radio" class="btn-check" name="data-dataset" id="data-dataset-cmip5" value="cmip5" autocomplete="off" data-query-key="dataset">
						<label class="btn btn-outline-gray-400" for="data-dataset-cmip5"><?php _e ( 'CMIP5', 'cdc' ); ?></label>
					</div>
					
				</div>
				
				<div id="map-control-frequency" class="map-control-item">
					<label for="data-frequency" class="form-label d-block h6 all-caps text-secondary">Frequency</label>
					
					<select class="form-select" name="data-frequency" data-query-key="frequency">
						<option value="ann" data-field="ann"><?php _e ( 'Annual', 'cdc' ); ?></option>
						<option value="daily" data-field="daily"><?php _e ( 'Daily', 'cdc' ); ?></option>
						<optgroup label="<?php _e ( 'Monthly', 'cdc' ); ?>" data-field="monthly">
							<option value="jan"><?php _e ( 'January', 'cdc' ); ?></option>
							<option value="feb"><?php _e ( 'February', 'cdc' ); ?></option>
							<option value="mar"><?php _e ( 'March', 'cdc' ); ?></option>
							<option value="apr"><?php _e ( 'April', 'cdc' ); ?></option>
							<option value="may"><?php _e ( 'May', 'cdc' ); ?></option>
							<option value="jun"><?php _e ( 'June', 'cdc' ); ?></option>
							<option value="jul"><?php _e ( 'July', 'cdc' ); ?></option>
							<option value="aug"><?php _e ( 'August', 'cdc' ); ?></option>
							<option value="sep"><?php _e ( 'September', 'cdc' ); ?></option>
							<option value="oct"><?php _e ( 'October', 'cdc' ); ?></option>
							<option value="nov"><?php _e ( 'November', 'cdc' ); ?></option>
							<option value="dec"><?php _e ( 'December', 'cdc' ); ?></option>
						</optgroup>
						
						<optgroup label="<?php _e ( 'Seasonal', 'cdc' ); ?>" data-field="qsdec">
							<option value="spring"><?php _e ( 'Spring', 'cdc' ); ?></option>
							<option value="summer"><?php _e ( 'Summer', 'cdc' ); ?></option>
							<option value="fall"><?php _e ( 'Fall', 'cdc' ); ?></option>
							<option value="winter"><?php _e ( 'Winter', 'cdc' ); ?></option>
						</optgroup>
					</select>
				</div>
				
				<div id="map-control-panels" class="map-control-item">
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" name="data-scenarios" id="data-scenarios-high" value="high" data-query-key="scenarios">
							<label class="form-check-label" for="data-scenarios-high">High emissions (SSP 5–8.5)</label>
						</div>
					</div>
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" name="data-scenarios" id="data-scenarios-medium" value="medium" data-query-key="scenarios">
							<label class="form-check-label" for="data-scenarios-medium">Medium emissions (SSP 2–4.5)</label>
						</div>
					</div>
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" name="data-scenarios" id="data-scenarios-low" value="low" data-query-key="scenarios">
							<label class="form-check-label" for="data-scenarios-low">Low emissions (SSP 1–2.6)</label>
						</div>
					</div>
					
				</div>
				
			</div>
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/map/controls/data-variable.php' ) );
			
		?>
	</div>
</div>