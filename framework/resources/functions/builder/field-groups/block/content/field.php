<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Display
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
			
			<div class="row row-cols-2 g-3 mb-3">
				<div class="col">
					<label for="inputs-key" class="form-label">Custom Field Key</label>
					<input class="form-control form-control-sm" type="text" name="inputs-key" id="inputs-key">
				</div>
				
				<div class="col d-flex align-items-end">
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-translate" id="inputs-translate">
						<label class="form-check-label" for="inputs-translate">Add <code>_[lang]</code> to key</label>
					</div>
				</div>
				
				<div class="col">
					
					<label for="inputs-display" class="form-label">Display As</label>
					
					<select class="form-select form-select-sm" name="inputs-display" id="inputs-display">
						<option value="p">Paragraph</option>
						<option value="h1">Heading 1</option>
						<option value="h2">Heading 2</option>
						<option value="h3">Heading 3</option>
						<option value="h4">Heading 4</option>
						<option value="h5">Heading 5</option>
						<option value="h6">Heading 6</option>
					</select>
					
				</div>
				
				<div class="col d-flex align-items-end">
					<!-- <label class="form-label">Apply <code>the_content</code> Filter</label> -->
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-content" id="inputs-content">
						<label class="form-check-label" for="inputs-content">Output rich text</label>
					</div>
				</div>
				
				
				<div class="col">
					<label class="form-label">Prepend</label>
					<input class="form-control form-control-sm" type="text" name="inputs-prepend" id="inputs-prepend">
				</div>
				
				<div class="col">
					<label for="inputs-prepend" class="form-label">Append</label>
					<input class="form-control form-control-sm" type="text" name="inputs-append" id="inputs-append">
				</div>
				
				<div class="col">
					<label for="inputs-post_id" class="form-label">Post ID</label>
					<input class="form-control form-control-sm" type="text" name="inputs-post_id" id="inputs-post_id" placeholder="Leave blank to use the current post">
				</div>
				
			</div>
			
		</div>
	</div>
</div>