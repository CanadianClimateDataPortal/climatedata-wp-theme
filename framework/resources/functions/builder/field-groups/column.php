<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-breakpoints">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-breakpoints" aria-expanded="true" aria-controls="element-form-breakpoints">
			Breakpoints
		</button>
	</h2>
	
	<div id="element-form-breakpoints" class="accordion-collapse collapse show" aria-labelledby="element-form-head-breakpoints" data-bs-parent="#element-form">
		<div class="accordion-body">
			<?php
			
				$breakpoints = array (
					'xs' => 'X-Small',
					'sm' => 'Small',
					'md' => 'Medium',
					'lg' => 'Large',
					'xl' => 'X-Large',
					'xxl' => 'XX-Large',
				);
				
				foreach ( $breakpoints as $key => $title ) {
					
			?>
			
			<div class="p-3 border-bottom">
				<div class="row row-cols-4 g-3 align-items-center">
					<div class="col form-settings-input element-form-input d-flex align-items-center justify-content-between">
						<h6 class="mb-0"><?php echo $title; ?></h6>
						<input type="hidden" name="inputs-breakpoints-<?php echo $key; ?>-d" id="breakpoints-<?php echo $key; ?>-d" value="y">
						<span class="breakpoint-hide btn btn-outline-secondary">Hide</span>
					</div>
					
					<div class="col form-settings-input element-form-input">
						
						<div class="input-group">
							<span class="input-group-text"><label for="inputs-breakpoints-<?php echo $key; ?>-col">Columns</label></span>
							<input type="number" name="inputs-breakpoints-<?php echo $key; ?>-col" class="form-control" min="0" max="12">
						</div>
						
					</div>
					
					<div class="col form-settings-input element-form-input">
						
						<div class="input-group">
							<span class="input-group-text"><label for="inputs-breakpoints-<?php echo $key; ?>-offset">Offset</label></span>
							<input type="number" name="inputs-breakpoints-<?php echo $key; ?>-offset" class="form-control" min="-12" max="12">
						</div>
						
					</div>
					
					<div class="col form-settings-input element-form-input">
						
						<div class="input-group">
							<span class="input-group-text"><label for="inputs-breakpoints-<?php echo $key; ?>-order">Order</label></span>
							<input type="number" name="inputs-breakpoints-<?php echo $key; ?>-order" class="form-control" min="0">
						</div>
						
					</div>
				</div>
			</div>
			
			<?php
				
				}
		
			?>
			
		</div>
	</div>
</div>
