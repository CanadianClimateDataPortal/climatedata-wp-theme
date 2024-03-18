<div class="fw-form-flex-item card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Filter Reset</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
		
		<?php 
		
			$rand_id = mt_rand ( 10000, 99999 );
			
		?>
	
		<input type="hidden" id="inputs-output[]-reset-type" name="inputs-output[]-reset-type" value="reset">
		
		<div class="row row-cols-3 rounded-bottom border-top py-3 ps-3">
			
			<div class="col pe-3">
				<label for="inputs-output[]-reset-id" class="form-label">Element ID</label>
				
				<div class="input-group input-group-sm">
					<span class="input-group-text">#</span>
					<input type="text" class="form-control form-control-sm" id="inputs-output[]-reset-id" name="inputs-output[]-reset-id">
				</div>
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-reset-class" class="form-label">Element Class</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-reset-class" id="inputs-output[]-reset-class">
			</div>
			
			<div class="col pe-3">
				<label for="inputs-output[]-reset-icon" class="form-label">Icon Text</label>
				
				<input type="text" class="form-control form-control-sm" name="inputs-output[]-reset-icon" id="inputs-output[]-reset-icon" placeholder="HTML allowed, leave blank for default">
			</div>
			
		</div>
		
		<input type="hidden" id="inputs-output[]-reset-index" name="inputs-output[]-reset-index" value="0">
		
	</div>
</div>