<div id="details" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">3</h2>
					<h5><?php _e ( 'Additional Details', 'cdc' ); ?></h5>
					<p class="mb-0"><?php _e ( 'Adjust the controls below to customize your analysis.', 'cdc' ); ?></p>
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
			
				<div id="map-control-timeframe" class="map-control-item" data-flags="station:0">
				
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Timeframe', 'cdc' ); ?></h6>
					
					<div class="row row-cols-2">
						<div class="col pe-3">
							<label for="" class="h6 all-caps text-gray-600"><?php _e ( 'Start Year', 'cdc' ); ?></label>
							
							<input type="hidden" name="details-time-start" id="details-time-start" value="" data-query-key="start_year">
							
							<div class="map-control-slider-well">
								<div id="details-time-slider-start" class="map-control-slider">
									<div id="details-time-slider-start-handle" class="ui-slider-handle"></div>
								</div>
							</div>
						</div>
						
						<div class="col">
							<label for="" class="h6 all-caps text-gray-600"><?php _e ( 'End Year', 'cdc' ); ?></label>
							
							<input type="hidden" name="details-time-end" id="details-time-end" value="" data-query-key="end_year">
							
							<div class="map-control-slider-well">
								<div id="details-time-slider-end" class="map-control-slider">
									<div id="details-time-slider-end-handle" class="ui-slider-handle"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div id="map-control-datepicker" class="map-control-item" data-request="station">
				
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Timeframe', 'cdc' ); ?></h6>
					
					<div class="row row-cols-2">
						<div class="col pe-3">
							<label for="from" class="h6 all-caps text-gray-600"><?php _e ( 'Start Date', 'cdc' ); ?></label>
							
							<input type="text" id="details-datepicker-start" name="details-datepicker-start" class="form-control" value="<?php 
							
								$start_date = strtotime ( "-30 years", time() );
								echo date ( 'Y-m-d', $start_date );
								
							?>" data-query-key="start_date" data-validate="<?php _e ( 'Start date is required', 'cdc' ); ?>">
							
						</div>
						
						<div class="col">
							<label for="to" class="h6 all-caps text-gray-600"><?php _e ( 'End Date', 'cdc' ); ?></label>
							
							<input type="text" id="details-datepicker-end" name="details-datepicker-end" class="form-control" value="<?php echo date ( 'Y-m-d' ); ?>" data-query-key="end_date" data-validate="<?php _e ( 'End date is required', 'cdc' ); ?>">
							
						</div>
					</div>
				</div>
				
				<div id="map-control-models" class="map-control-item" data-flags="custom:1">
					
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Models', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="<?php _e ( 'About models', 'cdc' ); ?>">?</a>
					</h6>
					
					<div id="models-placeholder" class="row row-cols-2">
						
					</div>
				</div>
				
				<div id="map-control-panels" class="map-control-item" data-request="threshold,single,custom">
					
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Scenarios', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="<?php _e ( 'About scenarios', 'cdc' ); ?>">?</a>
					</h6>
					
					<div class="row row-cols-2">
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-scenarios" id="details-scenarios-high" value="high" data-query-key="scenarios">
								<label class="form-check-label" for="details-scenarios-high">
									<span class="scenario-name" data-dataset="cmip6" data-name="ssp585">SSP 5–8.5</span>
								</label>
							</div>
						</div>
						
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-scenarios" id="details-scenarios-medium" value="medium" data-query-key="scenarios">
								<label class="form-check-label" for="details-scenarios-medium">
									<span class="scenario-name" data-dataset="cmip6" data-name="ssp245">SSP 2–4.5</span>
								</label>
							</div>
						</div>
						
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-scenarios" id="details-scenarios-low" value="low" data-query-key="scenarios">
								<label class="form-check-label" for="details-scenarios-low">
									<span class="scenario-name" data-dataset="cmip6" data-name="ssp126">SSP 1–2.6</label>
							</div>
						</div>
					</div>
				</div>
				
				<div id="map-control-missing" class="map-control-item" data-request="ahccd">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Missing Data Options', 'cdc' ); ?></h6>
					
					<div class="row row-cols-2">
						<div class="form-check">
							<input class="form-check-input" type="radio" name="details-missing" id="details-missing-5" value="0.05" data-query-key="check_missing">
							<label class="form-check-label" for="details-missing-5">5%</label>
						</div>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="details-missing" id="details-missing-10" value="0.1" data-query-key="check_missing">
							<label class="form-check-label" for="details-missing-10">10%</label>
						</div>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="details-missing" id="details-missing-15" value="0.15" data-query-key="check_missing">
							<label class="form-check-label" for="details-missing-15">15%</label>
						</div>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="details-missing" id="details-missing-wmo" value="wmo" data-query-key="check_missing">
							<label class="form-check-label" for="details-missing-wmo">WMO Parameters</label>
						</div>
					</div>
					
				</div>
				
				<div id="map-control-percentiles" class="map-control-item" data-request="custom">
					
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Percentiles', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="<?php _e ( 'Unselect all to receive output from individual models', 'cdc' ); ?>">?</a>
					</h6>
					
					<div class="row row-cols-4">
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-all" value="all" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-all"><?php _e ( 'All', 'cdc' ); ?></label>
							</div>
						</div>
						
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-5" value="5" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-5">5</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-10" value="10" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-10">10</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-25" value="25" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-25">25</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-50" value="50" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-50">50</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-75" value="75" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-75">75</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-90" value="90" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-90">90</label>
							</div>
						</div>
					
						<div class="col">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" name="details-percentiles" id="details-percentiles-95" value="95" data-query-key="percentiles">
								<label class="form-check-label" for="details-percentiles-95">95</label>
							</div>
						</div>
					</div>
					
				</div>
				
				<div id="map-control-frequency" class="map-control-item" data-flags="station:0">
					
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Temporal Frequency', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="<?php _e ( 'About frequency', 'cdc' ); ?>">?</a>
					</h6>
					
					<div id="map-control-frequency-radio" class="row row-cols-2" data-flags="custom:1" data-request="custom,ahccd">
						<div class="col">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="details-frequency" id="details-frequency-annual" value="YS" data-query-key="frequency" checked>
								<label class="form-check-label" for="details-frequency-annual"><?php  _e ( 'Annual', 'cdc' ); ?></label>
							</div>
						</div>
						
						<div class="col">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="details-frequency" id="details-frequency-monthly" value="MS" data-query-key="frequency">
								<label class="form-check-label" for="details-frequency-monthly"><?php  _e ( 'Monthly', 'cdc' ); ?></label>
							</div>
						</div>
						
						<div class="col">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="details-frequency" id="details-frequency-seasonal" value="QS-DEC" data-query-key="frequency">
								<label class="form-check-label" for="details-frequency-seasonal"><?php  _e ( 'Seasonal', 'cdc' ); ?></label>
							</div>
						</div>
							
						<div class="col">
							<div class="form-check">
								<input class="form-check-input" type="radio" name="details-frequency" id="details-frequency-junjul" value="AS-JUL" data-query-key="frequency">
								<label class="form-check-label" for="details-frequency-junjul"><?php  _e ( 'Annual (July – June)', 'cdc' ); ?></label>
							</div>
						</div>
						
					</div>
					
					<div id="map-control-frequency-select" data-flags="custom:0" data-request="threshold,single">
						
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
				</div>
				
				<div id="map-control-format" class="map-control-item">
					<div class="row row-cols-2 align-items-center">
						<div class="col">
							<label for="details-format" class="form-label h6 all-caps text-secondary mb-0"><?php _e ( 'Output Format', 'cdc' ); ?></label>
						</div>
						
						<div class="col d-flex align-items-center justify-content-between">
							<div class="form-check mb-0">
								<input class="form-check-input" type="radio" name="details-format" id="details-format-csv" value="csv" data-query-key="format" checked data-conditional="#map-control-decimals">
								<label class="form-check-label" for="details-format-csv">CSV</label>
							</div>
							
							<div class="form-check mb-0" data-flags="station:0">
								<input class="form-check-input" type="radio" name="details-format" id="details-format-netcdf" value="netcdf" data-query-key="format">
								<label class="form-check-label" for="details-format-netcdf">NetCDF</label>
							</div>
							
							<div class="form-check mb-0" data-flags="station:1">
								<input class="form-check-input" type="radio" name="details-format" id="details-format-json" value="json" data-query-key="format">
								<label class="form-check-label" for="details-format-json">GeoJSON</label>
							</div>
						</div>
					</div>
					
				</div>
				
				<div id="map-control-decimals" class="map-control-item">
					<div class="row row-cols-2 align-items-center">
						<div class="col">
							<label for="" class="h6 all-caps text-secondary"><?php _e ( 'Decimal Places', 'cdc' ); ?></label>
						</div>
						
						<div class="col">
							<input type="hidden" name="details-decimals" id="details-decimals" value="" data-query-key="decimals">
							
							<div class="map-control-slider-well">
								<div id="details-decimals-slider" class="map-control-slider">
									<div id="details-decimals-handle" class="ui-slider-handle"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
			</div>
			
			<div class="control-tab-footer">
				<a href="#submit" class="btn btn-lg btn-secondary d-block tab-drawer-trigger"><?php _e ( 'Next', 'cdc' ); ?>: <?php _e ( 'Submit', 'cdc' ); ?></a>
			</div>
		</div>
	</div>
	
</div>