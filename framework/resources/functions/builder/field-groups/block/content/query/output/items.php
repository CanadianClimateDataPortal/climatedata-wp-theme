<div class="fw-form-flex-item card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Query Items</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
	
		<input type="hidden" id="inputs-output[]-items-type" name="inputs-output[]-items-type" value="items">
		
		<div class="row py-1 ps-3">
			
			<div class="col pe-3 py-2">
				
				<label for="inputs-output[]-items-template" class="form-label">Template</label>
				
				<div class="input-group input-group-sm">
					<span class="input-group-text">template/query/</span>
					<input type="text" class="form-control form-control-sm" id="inputs-output[]-items-template" name="inputs-output[]-items-template" placeholder="card.php">
				</div>
				
				
			</div>
		</div>
		
		<div class="row row-cols-3 bg-light rounded-bottom border-top py-1 ps-3">
			<div class="col pe-3 py-2">
				<label for="inputs-output[]-items-id" class="form-label">ID</label>
				
				<div class="input-group input-group-sm">
					<span class="input-group-text">#</span>
					<input type="text" class="form-control form-control-sm" id="inputs-output[]-items-id" name="inputs-output[]-items-id">
				</div>
			</div>
			
			<div class="col pe-3 py-2">
				<label for="inputs-output[]-items-class" class="form-label">Element Class</label>
				<input type="text" class="form-control form-control-sm" id="inputs-output[]-items-class" name="inputs-output[]-items-class">
			</div>
			
			<div class="col pe-3 py-2">
				<label for="inputs-output[]-items-item_class" class="form-label">Item Class</label>
				<input type="text" class="form-control form-control-sm" id="inputs-output[]-items-item_class" name="inputs-output[]-items-item_class">
			</div>
		</div>
		
		<input type="hidden" id="inputs-output[]-items-index" name="inputs-output[]-items-index" value="0">
		
	</div>
</div>