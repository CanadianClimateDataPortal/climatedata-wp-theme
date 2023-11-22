<?php

?>

<div class="fw-form-flex-item fw-form settings-form settings-form-attributes card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Attributes</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0 fw-form-repeater-container">
		
		<input type="hidden" id="inputs-settings[]-attributes-type" name="inputs-settings[]-attributes-type" value="attributes">
		
		<div class="row border-bottom p-2 fw-form-repeater-head settings-form-repeater-head modal-label-sm">
			<div class="col">Name</div>
			<div class="col">Value</div>
			<div class="col-1"></div>
		</div>
		
		<div class="fw-form-repeater settings-form-repeater p-2 border-bottom" data-rows="1">
				
			<div class="fw-form-repeater-row settings-form-repeater-row row my-1" data-row-index="0">
				
				<div class="col pe-3">
					
					<div class="input-group input-group-sm">
						<span class="input-group-text">data-</span>
						
						<input type="text" name="inputs-settings[]-attributes-rows[]-name" id="inputs-settings[]-attributes-rows[]-name" class="form-control form-control-sm">
					</div>
					
				</div>
				
				<div class="col pe-3">
					
					<input type="text" name="inputs-settings[]-attributes-rows[]-value" id="inputs-settings[]-attributes-rows[]-value" class="form-control form-control-sm">
					
				</div>
				
				<div class="col-1 d-flex align-items-end justify-content-center">
					<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
				</div>
				
				<input type="hidden" id="inputs-settings[]-attributes-rows[]-index" name="inputs-settings[]-attributes-rows[]-index" value="0">
				
			</div>
			
		</div>
		
		<div class="d-flex justify-content-end p-2">
			<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add row</div>
		</div>
		
		<input type="hidden" id="inputs-settings[]-attributes-index" name="inputs-settings[]-attributes-index" value="0">
		
	</div>
</div>