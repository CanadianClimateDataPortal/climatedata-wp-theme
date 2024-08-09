<?php
/**
 * Content for the "Mailchimp form" block edit.
 */
?>
<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Mailchimp signup form
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div class="editor row row-cols-2">
				<div class="col">
					<label for="inputs-submit_color" class="form-label">Submit button color</label>

					<select class="form-select form-select conditional-select" name="inputs-submit_color" id="inputs-submit_color">
						<option value="secondary">Blue</option>
						<option value="gray">Gray</option>
					</select>
				</div>
			</div>
			
		</div>
	</div>
</div>
