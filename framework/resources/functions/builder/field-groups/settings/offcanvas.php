<?php

?>

<div class="fw-form-flex-item settings-form settings-form-offcanvas card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Offcanvas</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>

	<div class="card-body p-0">
		
		<div class="row row-cols-3">
		
		<input type="hidden" id="inputs-settings[]-offcanvas-type" name="inputs-settings[]-offcanvas-type" value="offcanvas">
		
		<div class="col p-2">
			<label>Breakpoint</label>
			
			<?php
			
				$offcanvas_breakpoints = array (
					'xs' => 'X-Small (Always on)',
					'sm' => 'Small',
					'md' => 'Medium',
					'lg' => 'Large',
					'xl' => 'X-Large',
					'xxl' => 'XX-Large'
				);
				
			?>
			
			<select name="inputs-settings[]-offcanvas-breakpoint" class="form-select form-select-sm">
				<?php
				
					foreach ( $offcanvas_breakpoints as $key => $value ) {
						
				?>
				
				<option value="<?php echo $key; ?>" <?php if ( $_GET['setting_data']['breakpoint'] == $key ) echo 'selected'; ?>><?php echo $value; ?></option>
				
				<?php
				
					}
				
				?>
			</select>
		</div>
		
		<div class="col p-2">
		
			<label>Placement</label>
			
			<select name="inputs-settings[]-offcanvas-placement" class="form-select form-select-sm">
				<option value="start">Start</option>
				<option value="end">End</option>
				<option value="top">Top</option>
				<option value="bottom">Bottom</option>
			</select>
			
		</div>
		
	</div>
</div>