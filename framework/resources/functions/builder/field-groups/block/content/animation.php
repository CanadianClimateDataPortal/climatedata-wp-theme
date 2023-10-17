<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Animation
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<div class="row bg-light border-bottom">
				<div class="col-4 p-3">
					<span class="btn btn-outline-secondary element-form-upload-btn">Upload file</span>
				</div>
				
				<div class="col-8 py-3 pe-3">
					<input type="text" name="inputs-file-id">
					<input type="text" name="inputs-file-url">
					<p id="upload-filename"></p>
				</div>
			</div>
			
			<div class="row row-cols-3">
				
				<div class="col p-3">
					
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-autoplay" id="inputs-autoplay">
						<label class="form-check-label" for="inputs-autoplay">Autoplay</label>
					</div>
					
				</div>
				
				<div class="col p-3">
					
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-loop" id="inputs-loop">
						<label class="form-check-label" for="inputs-loop">Loop</label>
					</div>
					
				</div>
				
				<div class="col p-3">
					
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-controls" id="inputs-controls">
						<label class="form-check-label" for="inputs-controls">Controls</label>
					</div>
					
				</div>
				
				<div class="col p-3">
					
					<label for="inputs-bg" class="mb-1">Background Color</label>
					<input class="form-control form-control-sm" type="text" name="inputs-bg" id="inputs-bg">
					
				</div>
				
				<div class="col p-3">
					
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-inview" id="inputs-inview" data-form-condition="#inputs-rewind">
						<label class="form-check-label" for="inputs-inview">Start / stop when in view</label>
					</div>
					
				</div>
				
				<div class="col p-3 conditional-element-container">
					
					<div class="form-check">
						<input class="form-check-input" type="checkbox" value="true" name="inputs-rewind" id="inputs-rewind">
						<label class="form-check-label" for="inputs-rewind">Rewind to first frame when stopped</label>
					</div>
					
				</div>
			</div>
			
		</div>
	</div>
</div>