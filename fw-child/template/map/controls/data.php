<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Data Options</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-variable" class="map-control-item">
					<a href="#data-variable" class="tab-drawer-trigger">Variable</a>
				</div>
				
				<div id="map-control-dataset" class="map-control-item">
					
					<label for="data-dataset" class="form-label h6"><?php _e ( 'Dataset', 'cdc' ); ?></label>
					
					<div class="btn-group">
						<input type="radio" class="btn-check" name="data-dataset" id="data-dataset-cmip6" value="cmip6" autocomplete="off" data-query-key="dataset" checked>
						<label class="btn btn-outline-primary" for="data-dataset-cmip6"><?php _e ( 'CMIP6', 'cdc' ); ?></label>
						
						<input type="radio" class="btn-check" name="data-dataset" id="data-dataset-cmip5" value="cmip5" autocomplete="off" data-query-key="dataset">
						<label class="btn btn-outline-primary" for="data-dataset-cmip5"><?php _e ( 'CMIP5', 'cdc' ); ?></label>
					</div>
					
				</div>
				
				<div id="map-control-frequency" class="map-control-item">
					<label for="data-frequency" class="form-label">Frequency</label>
					
					<select class="form-select" name="data-frequency" data-query-key="frequency">
						<option value="ann"><?php _e ( 'Annual', 'cdc' ); ?></option>
						<optgroup label="<?php _e ( 'Monthly', 'cdc' ); ?>">
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