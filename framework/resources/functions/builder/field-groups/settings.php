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
				<?php
				
					$settings_items = array (
						array (
							'key' => 'colors',
							'name' => 'Colour Scheme'
						),
						array (
							'key' => 'background',
							'name' => 'Background Image'
						),
						array (
							'key' => 'spacing',
							'name' => 'Spacing'
						),
						array (
							'key' => 'carousel',
							'name' => 'Carousel'
						),
						array (
							'key' => 'offcanvas',
							'name' => 'Offcanvas'
						),
						array (
							'key' => 'accordion',
							'name' => 'Accordion'
						),
						array (
							'key' => 'aos',
							'name' => 'Animate on Scroll'
						),
						array (
							'key' => 'attributes',
							'name' => 'Data Attributes'
						)
					);
					
					foreach ( $settings_items as $item ) {
					
				?>
				
				<li><span class="dropdown-item" data-flex-item="<?php echo $item['key']; ?>"><?php echo $item['name']; ?></span></li>
				
				<?php
				
					}
			
				?>
			</ul>
		</div>
		
	</div>
	
	<div class="fw-form-flex-rows row mt-3"></div>
</div>