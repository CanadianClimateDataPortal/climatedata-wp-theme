<div class="fw-form-flex-item card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Filter Item</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
		
		<?php 
		
			$rand_id = mt_rand ( 10000, 99999 );
			
		?>
	
		<input type="hidden" id="inputs-output[]-filter-type" name="inputs-output[]-filter-type" value="filter">
		
		<div class="row row-cols-2 py-1 ps-3">
			<div class="col pe-3 py-2">
				<label for="inputs-output[]-filter-class" class="form-label">Filter by</label>
				
				<select class="form-select form-select-sm conditional-select" id="inputs-output[]-filter-by" name="inputs-output[]-filter-by">
					<option value="post_type">Post Type</option>
					<option value="taxonomy" data-form-condition="#filter-tax-<?php echo $rand_id; ?>">Taxonomy</option>
					<option value="meta" data-form-condition="#filter-meta-<?php echo $rand_id; ?>,#filter-label-<?php echo $rand_id; ?>">Custom Field</option>
				</select>
			</div>
			
			<div id="filter-tax-<?php echo $rand_id; ?>" class="col pe-3 py-2">
				<label for="inputs-output[]-filter-taxonomy" class="form-label">Taxonomy Slug</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-taxonomy" id="inputs-output[]-filter-taxonomy">
			</div>
			
			<div id="filter-meta-<?php echo $rand_id; ?>" class="col pe-3 py-2">
				<label for="inputs-output[]-filter-meta" class="form-label">Custom Field Key</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-meta" id="inputs-output[]-filter-meta">
			</div>
			
			<div id="filter-label-<?php echo $rand_id; ?>" class="col pe-3 py-2">
				<label for="inputs-output[]-filter-meta" class="form-label">Filter Label</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-label" id="inputs-output[]-filter-label">
			</div>
			
			<div class="col pe-3 py-2">
				<label class="form-label">Multiple selections</label>
				<div class="form-check">
					<input class="form-check-input" type="checkbox" value="true" name="inputs-output[]-filter-multi" id="inputs-output[]-filter-multi">
					<label class="form-check-label">Enabled</label>
				</div>
			</div>
		</div>
		
		<div class="row row-cols-3 bg-light rounded-bottom border-top py-3 ps-3">
			
			<div class="col pe-3">
				<label for="inputs-output[]-filter-class" class="form-label">Element Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-class" id="inputs-output[]-filter-class">
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-filter-heading_class" class="form-label">Heading Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-heading_class" id="inputs-output[]-filter-heading_class">
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-filter-list_class" class="form-label">List Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-filter-list_class" id="inputs-output[]-filter-list_class">
			</div>
			
		</div>
		
		<input type="hidden" id="inputs-output[]-filter-index" name="inputs-output[]-filter-index" value="0">
		
	</div>
</div>