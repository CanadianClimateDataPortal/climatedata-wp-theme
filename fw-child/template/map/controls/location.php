<div id="location" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0"><?php _e ( 'Location', 'cdc' ); ?></h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-search" class="map-control-item px-0">
					<div id="map-control-search-inner" class="p-3">
						<label for="area-search" class="h6 d-block all-caps text-secondary mb-3"><?php _e ( 'Search', 'cdc' ); ?></label>
						
						<?php
							
							// location vars
							
						?>
						
						<input type="hidden" name="area-location" id="area-location" data-query-key="location">
						
						<?php
						
							// search var
							
						?>
						
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
				</div>
				
				<div id="map-control-recent" class="map-control-item">
					<div class="d-flex justify-content-between mb-3">
						<h6 class="all-caps text-secondary mb-0"><?php _e ( 'Recent Locations', 'cdc' ); ?></h6>
						<h6 id="recent-locations-clear" class="all-caps text-gray-600 mb-0" role="button" style="display: none;"><?php _e ( 'Clear', 'cdc' ); ?></h6>
					</div>
					
					<div id="recent-locations" class="list-group list-group-flush">
					</div>
					
					<div id="recent-locations-none">
						<?php _e ( 'Use the map or search function to add locations to this list.', 'cdc' ); ?>
					</div>
				</div>
					
				<div id="map-control-coords" class="map-control-item">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Adjust Coordinates', 'cdc' ); ?></h6>
					
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
		</div>
	</div>
		
	<div class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/map/controls/location-detail.php' ) );
			
			include ( locate_template ( 'template/map/controls/station-detail.php' ) );
			
		?>
	</div>
</div>