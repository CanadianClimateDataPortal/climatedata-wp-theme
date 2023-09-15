<?php

?>

<div class="fw-form-flex-item settings-form settings-form-offcanvas card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Offcanvas</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body">
		
		<label>Breakpoint</label>
		
		<?php
		
			$offcanvas_breakpoints = array (
				'xs' => 'X-Small',
				'sm' => 'Small',
				'md' => 'Medium',
				'lg' => 'Large',
				'xl' => 'X-Large',
				'xxl' => 'XX-Large'
			);
			
		?>
		
		<select id="inputs-settings[]-offcanvas-breakpoint" name="inputs-settings[]-offcanvas-breakpoint">
			<?php
			
				foreach ( $offcanvas_breakpoints as $key => $value ) {
					
			?>
			
			<option value="<?php echo $key; ?>" <?php if ( $_GET['setting_data']['breakpoint'] == $key ) echo 'selected'; ?>><?php echo $value; ?></option>
			
			<?php
			
				}
			
			?>
		</select>
		
		<label>Button</label>
		
	</div>
</div>