<div class="fw-form-flex-item card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Pagination</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
	
		<input type="hidden" id="inputs-output[]-pagination-type" name="inputs-output[]-pagination-type" value="pagination">
		
		<div class="row py-1 ps-3">
			
			<div class="col pe-3 py-2">
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-pagination-buttons" id="inputs-output[]-pagination-buttons" checked data-form-condition="#btn-class">
					<label class="form-check-label" for="inputs-output[]-pagination-buttons">Previous / Next Buttons</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-pagination-number" id="inputs-output[]-pagination-number" checked data-form-condition="#page-class">
					<label class="form-check-label" for="inputs-output[]-pagination-number">Page Number</label>
				</div>
				
			</div>
		</div>
		
		<div class="row row-cols-3 bg-light rounded-bottom border-top py-3 ps-3">
			
			<div class="col pe-3">
				<label for="inputs-output[]-pagination-class" class="form-label">Element Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-pagination-class" id="inputs-output[]-pagination-class">
			</div>
			
			<div id="btn-class" class="col pe-3">
				<label for="inputs-output[]-pagination-item_class" class="form-label">Button Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-pagination-btn_class" id="inputs-output[]-pagination-btn_class">
			</div>
			
			<div id="page-class" class="col pe-3">
				<label for="inputs-output[]-pagination-item_class" class="form-label">Page Number Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-pagination-page_class" id="inputs-output[]-pagination-page_class">
			</div>
			
			
		</div>
		
		<input type="hidden" id="inputs-output[]-pagination-index" name="inputs-output[]-pagination-index" value="0">
		
	</div>
</div>