<?php

	//
	// ID / CLASSES
	//
	
	include ( locate_template ( 'resources/functions/builder/field-groups/settings/classes.php' ) );

?>

<div 
	id="element-settings-form" 
	class="fw-form-flex-container p-3" 
	data-input="settings" 
	data-path="settings"
	data-multi="false"
>
	<div class="d-flex align-items-center">
	
		<h5 class="mb-0 me-3">Add a setting</h5>
		
		<div class="dropdown">
			<button class="d-block btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="settings-form-add" data-bs-toggle="dropdown" aria-expanded="false">
				Settings
			</button>
			
			<ul id="settings-form-add-items" class="dropdown-menu fw-form-flex-menu" aria-labelledby="settings-form-add">
				<li><span class="dropdown-item" data-flex-item="colors">Colour Scheme</span></li>
				<li><span class="dropdown-item" data-flex-item="background">Background Image</span></li>
				<li><span class="dropdown-item" data-flex-item="spacing">Spacing</span></li>
				<li><span class="dropdown-item" data-flex-item="offcanvas">Offcanvas</span></li>
				<li><span class="dropdown-item" data-flex-item="aos">Animate on Scroll</span></li>
				<li><span class="dropdown-item" data-flex-item="attributes">Data Attributes</span></li>
			</ul>
		</div>
		
	</div>
	
	<div class="fw-form-flex-rows row mt-3"></div>
</div>