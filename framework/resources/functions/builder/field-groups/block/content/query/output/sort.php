<div class="fw-form-flex-item card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Sort Menu</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
	
		<input type="hidden" id="inputs-output[]-sort-type" name="inputs-output[]-sort-type" value="sort">
		
		<div class="row py-1 ps-3">
			
			<div class="col pe-3 py-2">
				<h6>Sort options</h6>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-sort-title_asc" id="inputs-output[]-sort-title_asc">
					<label class="form-check-label" for="inputs-output[]-sort-title_asc">Title (Ascending)</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-sort-title_desc" id="inputs-output[]-sort-title_desc">
					<label class="form-check-label" for="inputs-output[]-sort-title_desc">Title (Descending)</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-sort-date_desc" id="inputs-output[]-sort-date_desc">
					<label class="form-check-label" for="inputs-output[]-sort-date_desc">Date (Newest First)</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-sort-date_asc" id="inputs-output[]-sort-date_asc">
					<label class="form-check-label" for="inputs-output[]-sort-date_asc">Date (Oldest First)</label>
				</div>
			</div>
		</div>
		
		<div class="row row-cols-3 bg-light rounded-bottom border-top py-3 ps-3">
			
			<div class="col pe-3">
				<label for="inputs-output[]-sort-class" class="form-label">Element Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-sort-class" id="inputs-output[]-sort-class">
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-sort-heading_class" class="form-label">Heading Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-sort-heading_class" id="inputs-output[]-sort-heading_class">
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-sort-list_class" class="form-label">List Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-sort-list_class" id="inputs-output[]-sort-list_class">
			</div>
			
		</div>
		
		<input type="hidden" id="inputs-output[]-sort-index" name="inputs-output[]-sort-index" value="0">
		
	</div>
</div>