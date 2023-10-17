<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Text
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div class="editor row">
				<div class="col">
					<?php
						
						wp_editor ( '', 'inputs-text-' . $_GET['globals']['current_lang_code'] );
						
					?>
				</div>
			</div>
			
		</div>
	</div>
</div>