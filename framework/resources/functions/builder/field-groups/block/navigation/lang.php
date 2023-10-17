<div class="modal-header">
	<h4 class="modal-title">Language Switcher</h4>
</div>

<div class="modal-body p-0">
	<form class="container-fluid">
		
		<div class="accordion accordion-flush" id="column-form">
			
			<div class="accordion-item">
				<h2 class="accordion-header" id="column-form-head-settings">
					<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#column-form-settings" aria-expanded="true" aria-controls="column-form-settings">
						Content
					</button>
				</h2>
				
				<div id="column-form-settings" class="accordion-collapse collapse show" aria-labelledby="column-form-head-settings" data-bs-parent="#column-form">
					<div class="accordion-body">
						
						<p class="form-label">Classes</p>
						
						<div class="card p-3">
							<div class="row g-3 row-cols-3">
								<div class="col">
									<label for="inputs-classes-menu" class="form-label">Menu</label>
									<input type="text" id="" name="inputs-classes-menu" class="form-control">
								</div>
								
								<div class="col">
									<label for="inputs-classes-menu" class="form-label">Item</label>
									<input type="text" id="" name="inputs-classes-item" class="form-control">
								</div>
								
								<div class="col">
									<label for="inputs-classes-menu" class="form-label">Link</label>
									<input type="text" id="" name="inputs-classes-link" class="form-control">
								</div>
								
							</div>
						</div>
						
					</div>
				</div>
			</div>
			
			<div class="accordion-item">
				<h2 class="accordion-header" id="column-form-head-breakpoints">
					<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#column-form-breakpoints" aria-expanded="false" aria-controls="column-form-breakpoints">
						Settings
					</button>
				</h2>
				
				<div id="column-form-breakpoints" class="accordion-collapse collapse" aria-labelledby="column-form-head" data-bs-parent="#column-form">
					<div class="accordion-body">
						<?php
						
							include ( locate_template ( 'resources/functions/builder/field-groups/settings.php' ) );
							
						?>
					</div>
				</div>
			</div>
			
		</div><?php // .accordion-flush ?>
		
	</form>
</div>
