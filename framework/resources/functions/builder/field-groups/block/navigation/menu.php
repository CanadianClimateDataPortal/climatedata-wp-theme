
<?php

$menus = wp_get_nav_menus();

?>

<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Menu Content
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div class="row row-cols-2 g-3 mb-3">
				<div class="col">
					<label for="inputs-menu" class="form-label">Menu Type</label>
					
					<select name="inputs-menu" class="form-select conditional-select">
					
						<option value="" disabled selected>Select a menu</option>
					
						<option value="lang" data-form-condition="#menu-lang">Language Switcher</option>
						<option value="hierarchy" data-form-condition="#menu-hierarchy">Current Section Hierarchy</option>
						<option value="manual" data-condition="#menu-manual">Add Items Manually</option>
						
						<optgroup label="Wordpress Menus">
							<?php
							
								if ( ! empty ( $menus ) ) {
									foreach ( $menus as $choice ) {
										$field['choices'][ $choice->menu_id ] = $choice->term_id;
										$field['choices'][ $choice->name ] = $choice->name;
						
										echo '<option value="menu-' . $field['choices'][ $choice->menu_id ] . '" ' . selected ( $field_value, $field['choices'][ $choice->menu_id ], false ) . ' >' . $field['choices'][ $choice->name ] . '</option>';
										
									}
								}
								
							?>
						</optgroup>
						
					</select>
				</div>
			</div>
			
			<div id="menu-lang" class="row row-cols-1 g-3 mb-3">
				<div class="col">
					<p class="form-label">Language Switcher</p>
			
					<div class="card p-3">
						<label for="inputs-display-lang" class="form-label">Link Text</label>
						
						<select name="inputs-display-lang" class="form-select form-select-sm">
							<option value="name">Language name i.e. English</option>
							<option value="code">Language code i.e. EN</option>
						</select>
						
					</div>
				</div>
			</div>
			
			<div id="menu-hierarchy" class="row row-cols-1 g-3 mb-3">
				<div class="col">
					<p class="form-label">Section Hierarchy</p>

					<div class="card p-3">
						<div class="form-check">
							<input class="form-check-input" type="checkbox" value="true" name="inputs-hierarchy-parent" id="inputs-hierarchy-parent">
							<label class="form-check-label" for="inputs-hierarchy-parent">Include Top Parent</label>
						</div>
					</div>
				</div>
			</div>
			
			<div class="row row-cols-2 g-3 mb-3">
				<div class="col">
					<label for="inputs-display-name" class="form-label">Display</label>
					
					<select name="inputs-display-name" class="form-select conditional-select">
					
						<option value="nested" data-form-condition="#display-list">Nested List</option>
						<option value="hover" data-form-condition="#display-list">List with hover dropdowns</option>
						<option value="dropdown" data-form-condition="#display-dropdown">Dropdown Menu</option>
						
					</select>
				</div>
				
			</div>
		
			<?php
			
				$types = array (
					'list' => array (
						'name' => 'List',
						'inputs' => array (
						)
					),
					'dropdown' => array (
						'name' => 'Dropdown',
						'inputs' => array (
							array (
								'cols' => 'col-6',
								'type' => 'text',
								'name' => 'inputs-toggle',
								'label' => 'Toggle Text / Icon'
							),
							array (
								'cols' => 'col-6',
								'type' => 'text',
								'name' => 'inputs-classes-toggle',
								'label' => 'Toggle Class'
							)
						)
					)
				);
				
				foreach ( $types as $type => $type_array ) {
					
			?>
			
			<div id="display-<?php echo $type; ?>" class="display-group type-<?php echo $type; ?> mb-3">
				<p class="form-label"><?php echo $type_array['name']; ?></p>
				
				<div class="card p-3">
					
					<div class="row g-3" data-type="<?php echo $type; ?>">
						<?php
						
							foreach ( $type_array['inputs'] as $input ) {
								
						?>
						
						<div class="<?php echo $input['cols']; ?>">
							<label for="<?php echo $input['name']; ?>" class="form-label"><?php echo $input['label']; ?></label>
							
							<?php
							
								switch ( $input['type'] ) {
									
									case 'text' :
										
							?>
							
							<input type="text" id="<?php echo $input['name']; ?>" name="<?php echo $input['name']; ?>" class="form-control">
							
							<?php
							
										break;
										
									case 'select' :
										
							?>
							
							<select name="<?php echo $input['name']; ?>">
								<?php
								
									foreach ( $input['choices'] as $value => $label ) {
										
								?>
								
								<option value="<?php echo $value; ?>"><?php echo $label; ?></option>
								
								<?php
								
									}
								
								?>
							</select>
							
							<?php
							
										break;
										
								}
								
							?>
						</div>
						
						<?php
						
							}
							
						?>
					</div>
				</div>
			</div>
			
			<?php
					
				}
				
			?>
			
			<p class="form-label">Classes</p>
			
			<div class="card p-3">
				<div class="row g-3 row-cols-3">
					<div class="col">
						<label for="inputs-classes-menu" class="form-label">Menu</label>
						<input type="text" id="inputs-classes-menu" name="inputs-classes-menu" class="form-control">
					</div>
					
					<div class="col">
						<label for="inputs-classes-item" class="form-label">Item</label>
						<input type="text" id="inputs-classes-item" name="inputs-classes-item" class="form-control">
					</div>
					
					<div class="col">
						<label for="inputs-classes-link" class="form-label">Link</label>
						<input type="text" id="inputs-classes-link" name="inputs-classes-link" class="form-control">
					</div>
					
				</div>
			</div>
			
		</div>
	</div>
</div>