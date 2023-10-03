<div id="display" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Display</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-values" class="map-control-item">
					<h6>Data Values</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-absolute" checked>
						<label class="form-check-label" for="display-values-absolute">Absolute</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-delta">
						<label class="form-check-label" for="display-values-delta">Delta vs. Baseline</label>
					</div>
				</div>
				
				<div id="map-control-aggregation" class="map-control-item">
					<h6>Map Aggregation</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-aggregation" id="data-aggregation-grid" checked>
						<label class="form-check-label" for="data-aggregation-grid">Gridded Data</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-aggregation" id="data-aggregation-csd">
						<label class="form-check-label" for="data-aggregation-csd">Census Subdivisions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-aggregation" id="data-aggregation-health">
						<label class="form-check-label" for="data-aggregation-health">Health Regions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-aggregation" id="data-aggregation-watershed">
						<label class="form-check-label" for="data-aggregation-watershed">Watersheds</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-aggregation" id="data-aggregation-custom">
						<label class="form-check-label" for="data-aggregation-custom">Custom shapefile</label>
					</div>
					
				</div>
				
				<div id="map-control-colours" class="map-control-item">
					<div class="d-flex justify-content-between">
						<h6 class="flex-grow-1">Colours</h6>
						<span class="ms-2">Add</span>
						<span class="ms-2">Reset</span>
					</div>
				</div>
				
				<div id="map-control-opacity" class="map-control-item">
					<h6>Layer Opacity</h6>
					
					<label for="display-opacity-data" class="form-label">Data</label>
					<input type="range" class="form-range" min="0" max="100" value="100" id="display-opacity-data">
					
					<label for="display-opacity-labels" class="form-label">Labels</label>
					<input type="range" class="form-range" min="0" max="100" value="100" id="display-opacity-labels">
					
					<label for="display-opacity-pins" class="form-label">Pins</label>
					<input type="range" class="form-range" min="0" max="100" value="100" id="display-opacity-pins">
				</div>					
				
			</div>
		</div>
	</div>
</div>