<div id="area" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">2</h2>
					<h5><?php _e ( 'Area of Analysis', 'cdc' ); ?></h5>
					<p class="mb-0"><?php _e ( 'Use the map to select regions to add to your request.', 'cdc' ); ?></p>
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
				
				<input type="hidden" name="area-selections" id="area-selections" value="" data-query-key="selections" data-request="single,threshold,custom" data-validate="<?php _e ( 'At least 1 map region is required.', 'cdc' ); ?>">
				
				<div id="map-control-stations" class="map-control-item" data-request="station,ahccd" style="display: none;">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Stations', 'cdc' ); ?></h6>
					
					<select 
						class="custom-select custom-select-md select2 form-control input-large" 
						name="station-select" 
						id="station-select" 
						multiple="multiple" 
						data-placeholder="<?php _e ( 'Select station(s)','cdc' ); ?>"
						data-container-css-class="big-menu btn btn-lg border-primary" 
						data-dropdown-css-class="big-menu-dropdown" 
						data-query-key="station" 
						data-validate="<?php _e ( 'Select at least one station.', 'cdc' ); ?>"
					>
					</select>
				</div>
					
				<div id="map-control-aggregation" class="map-control-item conditional-trigger" data-request="single,threshold,custom">
					<h6 class="d-flex align-items-center h6 mb-3 all-caps text-secondary">
						<?php _e ( 'Data Aggregation', 'cdc' ); ?>
						<a tabindex="0" class="popover-btn" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="Description here">?</a>
					</h6>
					
					<div id="area-gridded-container" class="d-flex align-items-start justify-content-between">
						<div class="form-check">
							<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-grid" value="gridded_data" data-query-key="sector" data-conditional="#area-aggregation-select-mode">
							<label class="form-check-label" for="area-aggregation-grid"><?php _e ( 'Gridded Data', 'cdc' ); ?></label>
						</div>
						
						<div id="area-selections-status">
							<div id="area-selections-count"><span>0</span> <?php _e ( 'cells', 'cdc' ); ?></div>
							<div id="area-selections-reset" class="ms-3 disabled" role="button">
								<i class="fas fa-sync-alt"></i>
								<?php _e ( 'Clear', 'cdc' ); ?>
							</div>
						</div>
					</div>
					
					<div id="area-aggregation-select-mode" class="bg-gray-200 p-2 mb-2">
						<div class="btn-group w-100" role="group">
							<input type="radio" class="btn-check" name="area-selection" id="area-selection-select" value="select" autocomplete="off" checked>
							<label class="btn btn-sm btn-outline-gray-600" for="area-selection-select"><?php _e ( 'Grid cells', 'cdc' ); ?></label>
						
							<input type="radio" class="btn-check" name="area-selection" id="area-selection-draw" value="draw" autocomplete="off">
							<label class="btn btn-sm btn-outline-gray-600" for="area-selection-draw"><?php _e ( 'Draw region', 'cdc' ); ?></label>
						</div>
						
					</div>
					
					<div class="form-check" data-request="custom">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-csd" value="census" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-csd"><?php _e ( 'Census Subdivisions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check" data-request="custom">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-health" value="health" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-health"><?php _e ( 'Health Regions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check" data-request="custom">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-watershed" value="watershed" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-watershed"><?php _e ( 'Watersheds', 'cdc' ); ?></label>
					</div>
					
					<div data-request="custom">
						<div class="form-check">
							<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-upload" value="upload" data-query-key="sector" data-conditional="#area-aggregation-shapefile">
							<label class="form-check-label" for="area-aggregation-upload"><?php _e ( 'Upload Custom Shapefile', 'cdc' ); ?></label>
							<a tabindex="0" role="button" id="area-aggregation-upload-tooltip" class="text-secondary">ⓘ
								<span style="display: none">
									<?php _e ( 'Please upload a ZIP file containing at least the .shp and .prj files. The uploaded shapes must be closed polygons and be located entirely within Canada. Once your shapefile is uploaded, the shapes will appear on the map. Click the region of interest to continue.', 'cdc' ) ?>
								</span>
							</a>
						</div>
						
						<div id="area-aggregation-shapefile" class="bg-gray-200 p-3">
							<label for="area-aggregation-shapefile-input" class="form-label"><?php _e ( 'Select your Shapefile', 'cdc' ); ?></label>
							<input class="form-control form-control-sm" id="area-aggregation-shapefile-input" type="file">
							<div id="area-aggregation-shapefile-message" class="mt-2"></div>
						</div>
					</div>
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6 all-caps text-secondary mb-3"><?php _e ( 'Search', 'cdc' ); ?></label>
					
					<select 
						class="custom-select custom-select-md select2 form-control" 
						name="area-search" 
						id="area-search" 
						data-placeholder="<?php _e ( 'Community, landmark or coordinates','cdc' ); ?>"
					>
						<option value=""><?php _e('Search for a City/Town', 'cdc'); ?></option>
						
						<?php
							
							if ( isset ( $_GET['search'] ) ) {
					
						?>
					
						<option value="<?php echo $_GET['search']; ?>"><?php echo 'search val'; //echo $GLOBALS['vars']['current_data']['location_data']['geo_name']; ?></option>
					
						<?php
							
							}
						
						?>
					</select>
				</div>
				
				<div id="map-control-coords" class="map-control-item">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Coordinates', 'cdc' ); ?></h6>
					
					<input type="hidden" name="coords" id="coords" data-query-key="coords">
					
					<div class="d-flex flex-wrap align-items-center">
						<label for="coords-lat" class="form-label h6 all-caps text-gray-500 me-3"><?php _e ( 'Latitude', 'cdc' ); ?></label>
						
						<div class="input-group mb-3 border">
							<button class="btn btn-sm btn-light p-2 down-btn down-2" type="button"><i class="fas fa-angle-double-down"></i></button>
							
							<button class="btn btn-sm btn-light p-2 down-btn down-1" type="button"><i class="fas fa-angle-down"></i></button>
							
							<input type="text" class="form-control coord-field text-center border-0" name="coords-lat" id="coords-lat">
							
							<button class="btn btn-sm btn-light p-2 up-btn up-1" type="button"><i class="fas fa-angle-up"></i></button>
							
							<button class="btn btn-sm btn-light p-2 up-btn up-2" type="button"><i class="fas fa-angle-double-up"></i></button>
						</div>
						
						<label for="coords-lng" class="form-label h6 all-caps text-gray-500 me-3"><?php _e ( 'Longitude', 'cdc' ); ?></label>
						
						<div class="input-group mb-3 border">
							<button class="btn btn-sm btn-light p-2 down-btn down-2" type="button"><i class="fas fa-angle-double-left"></i></button>
							
							<button class="btn btn-sm btn-light p-2 down-btn down-1" type="button"><i class="fas fa-angle-left"></i></button>
							
							<input type="text" class="form-control coord-field text-center border-0" name="coords-lng" id="coords-lng">
							
							<button class="btn btn-sm btn-light p-2 up-btn up-1" type="button"><i class="fas fa-angle-right"></i></button>
							
							<button class="btn btn-sm btn-light p-2 up-btn up-2" type="button"><i class="fas fa-angle-double-right"></i></button>
						</div>
					
						<label for="coords-zoom" class="form-label h6 all-caps text-gray-500 me-3"><?php _e ( 'Zoom', 'cdc' ); ?></label>
						
						<div class="input-group mb-3 border w-50">
							<button class="btn btn-sm btn-light p-2 down-btn down-1" type="button"><i class="fas fa-minus"></i></button>
							
							<input type="text" class="form-control coord-field text-center border-0" name="coords-zoom" id="coords-zoom">
							
							<button class="btn btn-sm btn-light p-2 up-btn up-1" type="button"><i class="fas fa-plus"></i></button>
						</div>
						
					</div>
				</div>
				
			</div>
			
			<div class="control-tab-footer">
				<a href="#details" class="btn btn-lg btn-secondary d-block tab-drawer-trigger"><?php _e ( 'Next', 'cdc' ); ?>: <?php _e ( 'Details', 'cdc' ); ?></a>
			</div>
		</div>
	</div>
</div>
