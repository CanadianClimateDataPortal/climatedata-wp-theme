<?php

?>

<div class="fw-form-flex-item fw-form settings-form settings-form-spacing card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Spacing</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0 fw-form-repeater-container">
		
		<input type="hidden" id="inputs-settings[]-spacing-type" 	name="inputs-settings[]-spacing-type" value="spacing">
		
		<div class="row border-bottom p-2 fw-form-repeater-head settings-form-repeater-head modal-label-sm">
			<div class="col">Property</div>
			<div class="col">Side</div>
			<div class="col">Breakpoint</div>
			<div class="col">Value</div>
			<div class="col-1"></div>
		</div>
		
		<div class="fw-form-repeater settings-form-repeater p-2 border-bottom" data-rows="1">
			
			<div class="fw-form-repeater-row settings-form-repeater-row row my-1" data-row-index="0">
				
				<div class="col pe-3">
					
					<select id="inputs-settings[]-spacing-rows[]-property" name="inputs-settings[]-spacing-rows[]-property" class="form-select form-select-sm">
						<option value="p">Padding</option>
						<option value="m">Margin</option>
					</select>
					
				</div>
				
				<div class="col pe-3">
					
					<select id="inputs-settings[]-spacing-rows[]-side" name="inputs-settings[]-spacing-rows[]-side" class="form-select form-select-sm">
						<option value="">All</option>
						<option value="x">X</option>
						<option value="y">Y</option>
						<option value="t">Top</option>
						<option value="b">Bottom</option>
						<option value="s">Start (Left)</option>
						<option value="e">End (Right)</option>
					</select>
					
				</div>
				
				<div class="col pe-3">
					
					<select id="inputs-settings[]-spacing-rows[]-breakpoint" name="inputs-settings[]-spacing-rows[]-breakpoint" class="form-select form-select-sm">
				
						<option value="">Any</option>
						<option value="sm">Small</option>
						<option value="md">Medium</option>
						<option value="lg">Large</option>
						<option value="xl">X-Large</option>
						<option value="xxl">XX-Large</option>
						
					</select>
					
				</div>
				
				<div class="col pe-3">
					
					<select id="inputs-settings[]-spacing-rows[]-value" name="inputs-settings[]-spacing-rows[]-value" class="form-select form-select-sm">
						<?php
						
							for ( $i = 15; $i >= -15; $i -= 1 ) {
								echo ( '<option value="' )
									. ( ( $i < 0 ) ? 'n' : '' )
									. ( abs ( $i ) . '"' )
									. ( ( $i == 0 ) ? ' selected' : '' )
									. '>'
									. $i 
									. '</option>';
							}
							
						?>
					</select>
					
				</div>
				
				<div class="col-1 d-flex align-items-end justify-content-center">
					<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
				</div>
				
				<input type="hidden" id="inputs-settings[]-spacing-rows[]-index" name="inputs-settings[]-spacing-rows[]-index" value="0">
				
			</div>
			
		</div>
		
		<div class="d-flex justify-content-end p-2">
			<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add row</div>
		</div>
		
		<input type="hidden" id="inputs-settings[]-spacing-index" name="inputs-settings[]-spacing-index" value="0">
		
	</div>
</div>