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
						<input class="form-check-input" type="radio" name="display-values" id="display-values-absolute" value="" checked data-query-key="delta">
						<label class="form-check-label" for="display-values-absolute">Absolute</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-delta" value="true" data-query-key="delta">
						<label class="form-check-label" for="display-values-delta">Delta vs. Baseline</label>
					</div>
				</div>
				
				<div id="map-control-aggregation" class="map-control-item">
					<h6>Map Aggregation</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-grid" value="" checked data-query-key="sector">
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
					<div class="d-flex justify-content-between">
						<h6 class="flex-grow-1">Colours</h6>
						<span id="display-colours-add" class="ms-2">Add</span>
						<span id="display-colours-reset" class="ms-2">Reset</span>
					</div>
					
					<div id="display-colour-table" class="mb-3">
						
						<!-- row -->
						<div class="d-flex py-2 border-bottom">
							<div class="color-picker flex-grow-1 d-flex align-items-center">
								<span class="rounded-circle p-1 me-2 bg-primary"></span>
								<span class="value">#DC3545</span>
							</div>
							
							<div class="d-flex">
								<div class="display-colour-sort-handle"><i class="fas fa-sort"></i></div>
								<div class="display-colour-remove ms-2"><i class="fas fa-times"></i></div>
							</div>
						</div>
						
						<!-- row -->
						<div class="d-flex py-2 border-bottom">
							<div class="color-picker flex-grow-1 d-flex align-items-center">
								<span class="rounded-circle p-1 me-2 bg-warning"></span>
								<span class="value">#FFC107</span>
							</div>
							
							<div class="d-flex">
								<div class="display-colour-sort-handle"><i class="fas fa-sort"></i></div>
								<div class="display-colour-remove ms-2"><i class="fas fa-times"></i></div>
							</div>
						</div>
						
						<!-- row -->
						<div class="d-flex py-2 border-bottom">
							<div class="color-picker flex-grow-1 d-flex align-items-center">
								<span class="rounded-circle p-1 me-2 bg-info"></span>
								<span class="value">#0DCAF0</span>
							</div>
							
							<div class="d-flex">
								<div class="display-colour-sort-handle"><i class="fas fa-sort"></i></div>
								<div class="display-colour-remove ms-2"><i class="fas fa-times"></i></div>
							</div>
						</div>
						
					</div>
					
					
					<div id="display-colours-toggle" class="btn-group">
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-discrete" autocomplete="off" checked>
						<label class="btn btn-outline-primary" for="display-colours-discrete"><?php _e ( 'Discrete', 'cdc' ); ?></label>
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-continuous" autocomplete="off">
						<label class="btn btn-outline-primary" for="display-colours-continuous"><?php _e ( 'Continuous', 'cdc' ); ?></label>
						
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