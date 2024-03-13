<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Display
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
			
			<div class="row row-cols-3 g-3 mb-3">
				<div class="col">
					<label for="inputs-key" class="form-label">Taxonomy</label>
					
					<select class="form-select" name="inputs-taxonomy" id="inputs-taxonomy">
						<?php
						
							foreach ( get_taxonomies ( array ( 'public' => true ), 'objects' ) as $tax_slug => $tax_obj ) {
								
						?>
						
						<option value="<?php echo $tax_obj->name; ?>"><?php echo $tax_obj->labels->singular_name; ?></option>
						
						<?php
								
							}
							
						?>
					</select>
				</div>
				
				<div class="col">
					
					<label for="inputs-display" class="form-label">Display As</label>
					
					<select class="form-select" name="inputs-display" id="inputs-display">
						<option value="list">List</option>
						<option value="comma">Comma-separated</option>
					</select>
				</div>
				
				<div class="col">
					<label class="form-label">Term Link</label>
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-link" id="inputs-link">
						<label class="form-check-label" for="inputs-link">Link items to term archive</label>
					</div>
				</div>
				
			</div>
			
		</div>
	</div>
</div>