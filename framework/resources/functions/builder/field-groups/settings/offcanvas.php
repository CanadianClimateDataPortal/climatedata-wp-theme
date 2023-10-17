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
			<label for="inputs-settings[]-offcanvas-breakpoint" class="form-label modal-label-sm">Breakpoint</label>
			
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
		
			<label for="inputs-settings[]-offcanvas-placement" class="form-label modal-label-sm">Placement</label>
			
			<select name="inputs-settings[]-offcanvas-placement" class="form-select form-select-sm">
				<option value="start">Start</option>
				<option value="end">End</option>
				<option value="top">Top</option>
				<option value="bottom">Bottom</option>
			</select>
			
		</div>
		
		<div class="col p-2">
		
			<label for="inputs-settings[]-offcanvas-backdrop" class="form-label modal-label-sm">Backdrop</label>
			
			<select name="inputs-settings[]-offcanvas-backdrop" class="form-select form-select-sm">
				<option value="backdrop">On, no scrolling</option>
				<option value="scroll">On, with scrolling</option>
				<option value="off">Off</option>
			</select>
			
		</div>
		
		<div class="col p-2">
		
			<label for="inputs-settings[]-offcanvas-close" class="form-label modal-label-sm">Add Close Button</label>
			
			<select name="inputs-settings[]-offcanvas-close" class="form-select form-select-sm">
				<option value="true">Yes</option>
				<option value="false">No</option>
			</select>
			
		</div>
		
		<div class="col p-2">
		
			<label for="inputs-settings[]-offcanvas-trigger" class="form-label modal-label-sm">Trigger Button</label>
			
			<select name="inputs-settings[]-offcanvas-trigger" class="form-select form-select-sm conditional-select">
				<option value="insert">Insert after element</option>
				<option value="selector" data-form-condition="#offcanvas-selector">Use selector</option>
			</select>
			
		</div>
		
		<div class="col p-2" id="offcanvas-selector">
		
			<label for="inputs-settings[]-offcanvas-selector" class="form-label modal-label-sm">Trigger Selector</label>
			
			<input type="text" class="form-control form-control-sm" id="inputs-settings[]-offcanvas-selector" name="inputs-settings[]-offcanvas-selector" placeholder="#trigger-id">
			
		</div>
		
	</div>
</div>