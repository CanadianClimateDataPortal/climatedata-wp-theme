<div id="display" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0">Display</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-values" class="map-control-item">
					<h6 class="all-caps text-secondary">Data Values</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-absolute" value="" checked data-query-key="delta">
						<label class="form-check-label" for="display-values-absolute">Absolute</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-delta" value="true" data-query-key="delta">
						<label class="form-check-label" for="display-values-delta">Delta vs. Baseline</label>
					</div>
				</div>
				
				<div id="map-control-aggregation" class="map-control-item">
					<h6 class="all-caps text-secondary">Map Aggregation</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-grid" value="canadagrid" checked data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-grid">Gridded Data</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-csd" value="census" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-csd">Census Subdivisions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-health" value="health" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-health">Health Regions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-watershed" value="watershed" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-watershed">Watersheds</label>
					</div>
					
				</div>
				
				<div id="map-control-colours" class="map-control-item">
					<h6 class="all-caps text-secondary">Colours</h6>
					
					<input type="hidden" name="display-scheme" id="display-scheme" value="kejDjr" data-query-key="scheme">
					
					<div id="display-scheme-select" class="dropdown mb-3">
						<div class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
							<span class="gradient" style="background: linear-gradient(90deg, #22C1C3, #FDBB2D);"></span>
							<span class="sr-only">Selected Scheme Name</span>
						</div>
						
						<ul class="dropdown-menu w-100 p-0">
							<li><button class="dropdown-item active default" data-scheme-id="scheme1">
								<span class="gradient" style="background: linear-gradient(90deg, #22C1C3, #FDBB2D);"></span>
								<span class="small all-caps"><?php _e ( 'Default', 'cdc' ); ?></span>
							</button></li>
								
							<li><button class="dropdown-item" data-scheme-id="scheme2">
								<span class="gradient" style="background: linear-gradient(90deg, #2F4A1F, #D4FD2D);"></span>
								<span class="sr-only">Scheme Name</span>
							</button></li>
							
							<li><button class="dropdown-item" data-scheme-id="scheme3">
								<span class="gradient" style="background: linear-gradient(90deg, #3F5EFB, #FC466B);"></span>
								<span class="sr-only">Scheme Name</span>
							</button></li>
						</ul>
						
					</div>
					
					<div id="display-colours-toggle" class="btn-group w-100">
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-discrete" autocomplete="off" checked>
						<label class="btn disabled btn-outline-gray-400" for="display-colours-discrete"><?php _e ( 'Discrete', 'cdc' ); ?></label>
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-continuous" autocomplete="off">
						<label class="btn disabled btn-outline-gray-400" for="display-colours-continuous"><?php _e ( 'Continuous', 'cdc' ); ?></label>
						
					</div>
				</div>
				
				<div id="map-control-opacity" class="map-control-item all-caps">
					<h6 class="text-secondary mb-3">Layer Opacity</h6>
					
					<h6 class="text-gray-600">Data</h6>
					
					<div class="map-control-slider-well mb-4">
						<div id="display-data-slider" class="map-control-slider opacity-slider" data-pane="raster">
							<div id="data-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
					<h6 class="text-gray-600">Labels</h6>
					
					<div class="map-control-slider-well mb-4">
						<div id="display-labels-slider" class="map-control-slider opacity-slider" data-pane="labels">
							<div id="labels-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
					<h6 class="text-gray-600">Pins</h6>
					
					<div class="map-control-slider-well">
						<div id="display-pins-slider" class="map-control-slider opacity-slider" data-pane="marker">
							<div id="pins-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
				</div>					
				
			</div>
		</div>
	</div>
</div>