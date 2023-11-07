<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Custom Field
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div class="row row-cols-2 g-3">
				<div class="col">
					<label for="inputs-args-posts_per_page" class="form-label">Field Key</label>
					<input class="form-control form-control-sm" type="text" name="inputs-key" id="inputs-key">
				</div>
				
				<div class="col">
					<label for="inputs-args-posts_per_page" class="form-label">Post ID</label>
					<input class="form-control form-control-sm" type="text" name="inputs-post_id" id="inputs-post_id">
				</div>
				
				<div class="col">
					
					<label for="inputs-display" class="form-label">Display</label>
					
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
				
				<div class="col">
					<label class="form-label">Translate</label>
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-translate" id="inputs-translate">
						<label class="form-check-label" for="inputs-translate">Add language to field key</label>
					</div>
				</div>
				
				<div class="col">
					<label class="form-label">Apply <code>the_content</code> Filter</label>
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-content" id="inputs-content">
						<label class="form-check-label" for="inputs-content">Output rich text</label>
					</div>
				</div>
				
			</div>
			
		</div>
	</div>
</div>