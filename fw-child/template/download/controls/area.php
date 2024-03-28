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
				
				<input type="hidden" name="area-selections" id="area-selections" value="" data-query-key="selections" data-validate="<?php _e ( 'At least 1 map region is required', 'cdc' ); ?>">
				
				<div id="map-control-stations" class="map-control-item" data-display="station:1" style="display: none;">
					<h6 class="all-caps text-secondary"><?php _e ( 'Select Stations', 'cdc' ); ?></h6>
					
					<select 
						class="custom-select custom-select-md select2 form-control input-large" 
						name="station-select" 
						id="station-select" 
						multiple="multiple" 
						data-placeholder="<?php _e ( 'Select station(s)','cdc' ); ?>"
						data-container-css-class="big-menu btn btn-lg border-primary" 
						data-dropdown-css-class="big-menu-dropdown" 
						data-query-key="station" 
						data-validate="<?php _e ( 'Select at least one station', 'cdc' ); ?>"
					>
					</select>
				</div>
					
				<div id="map-control-aggregation" class="map-control-item conditional-trigger" data-display="station:0">
					<h6 class="all-caps text-secondary"><?php _e ( 'Change Aggregation', 'cdc' ); ?></h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-grid" value="gridded_data" data-query-key="sector" data-conditional="#area-aggregation-select-mode">
						<label class="form-check-label" for="area-aggregation-grid"><?php _e ( 'Gridded Data', 'cdc' ); ?></label>
					</div>
					
					<div id="area-aggregation-select-mode" class="bg-gray-200 p-2 mb-2">
						
						<div class="btn-group" role="group">
							<input type="radio" class="btn-check" name="area-selection" id="area-selection-select" value="select" autocomplete="off">
							<label class="btn btn-sm btn-outline-gray-600" for="area-selection-select"><?php _e ( 'Select', 'cdc' ); ?></label>
						
							<input type="radio" class="btn-check" name="area-selection" id="area-selection-draw" value="draw" autocomplete="off">
							<label class="btn btn-sm btn-outline-gray-600" for="area-selection-draw"><?php _e ( 'Draw', 'cdc' ); ?></label>
						</div>
						
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-csd" value="census" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-csd"><?php _e ( 'Census Subdivisions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-health" value="health" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-health"><?php _e ( 'Health Regions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-watershed" value="watershed" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-watershed"><?php _e ( 'Watersheds', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-upload" value="upload" data-query-key="sector" data-conditional="#area-aggregation-shapefile">
						<label class="form-check-label" for="area-aggregation-upload"><?php _e ( 'Upload Custom Shapefile', 'cdc' ); ?></label>
						<a tabindex="0" role="button" id="area-aggregation-upload-tooltip" class="text-secondary">ⓘ
							<span style="display: none">
								<?php _e ( 'A shapefile is a ZIP file containing at least the <em>.shp</em> and
								<em>.prj</em> files. It must contain only closed polygons and must be entirely contained
								inside the canadian territory. Once your shapefile is uploaded, click all the regions
								for which you want data.' ) ?>
							</span>
						</a>
					</div>
					
					<div id="area-aggregation-shapefile" class="bg-gray-200 p-3">
						<label for="area-aggregation-shapefile-input" class="form-label"><?php _e ( 'Drop your shapefile here to upload', 'cdc' ); ?></label>
						<input class="form-control form-control-sm" id="area-aggregation-shapefile-input" type="file">
						<div id="area-aggregation-shapefile-message" class="mt-2"></div>
					</div>
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6 all-caps text-secondary"><?php _e ( 'Search &amp; Zoom', 'cdc' ); ?></label>
					
					<select 
						class="custom-select custom-select-md select2 form-control" 
						name="area-search" 
						id="area-search" 
						data-placeholder="<?php _e ( 'City, landmark or postal code','cdc' ); ?>"
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
					<h6 class="all-caps text-secondary">Change Coordinates</h6>
					
					<input type="hidden" name="coords" id="coords" data-query-key="coords">
					
					<label for="coords-lat">Latitude</label>
					<input type="text" class="form-control coord-field" name="coords-lat" id="coords-lat">
					
					<label for="coords-lng">Longitude</label>
					<input type="text" class="form-control coord-field" name="coords-lng" id="coords-lng">
					
					<label for="coords-zoom">Zoom</label>
					<input type="text" class="form-control coord-field" name="coords-zoom" id="coords-zoom">
				</div>
				
			</div>
			
			<div class="control-tab-footer">
				<a href="#details" class="btn btn-lg btn-secondary d-block tab-drawer-trigger"><?php _e ( 'Next', 'cdc' ); ?>: <?php _e ( 'Details', 'cdc' ); ?></a>
			</div>
		</div>
	</div>
</div>