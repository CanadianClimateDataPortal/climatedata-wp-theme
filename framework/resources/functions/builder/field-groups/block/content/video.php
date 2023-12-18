<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Video
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
			
			<div class="row row-cols-2 g-3 mb-3">
					
				<div class="col">
					
					<label for="inputs-source" class="form-label">Video Source</label>
					
					<select class="form-select form-select conditional-select" name="inputs-source" id="inputs-source">
						<option value="url" data-form-condition="#source-url">Embed from URL</option>
						<option value="upload" data-form-condition="#source-upload">Media library</option>
						<option value="code" data-form-condition="#source-embed">Full embed code</option>
					</select>
					
				</div>
				
				<div class="col" id="source-url">
					<label for="inputs-url" class="form-label">Video URL</label>
					<input class="form-control" type="text" name="inputs-url-<?php echo $_GET['globals']['current_lang_code']; ?>" id="inputs-url-<?php $_GET['globals']['current_lang_code']; ?>">
				</div>
				
			</div>
			
			<div class="row row-cols-1 g-3" id="source-upload">
				<div class="col">
					
					<div class="fw-form-repeater-container">
						
						<div class="row border-bottom p-2 fw-form-repeater-head modal-label-sm">
							<div class="col">File</div>
							<div class="col">Type</div>
							<div class="col-1"></div>
						</div>
						
						<div class="fw-form-repeater p-2 border-bottom" data-key="upload" data-rows="1">
								
							<div class="fw-form-repeater-row row my-1" data-row-index="0">
								
								<div class="col pe-3">
									
									<div
										class="uploader-container d-flex align-items-center"
										data-uploader-type="video"
										data-uploader-options='{
											"title": "Insert video",
											"library": {
												"type": "video"
											},
											"button": {
												"text": "Use this video"
											},
											"multiple": false
										}'
									>
									
										<span class="btn btn-sm btn-outline-secondary element-form-upload-btn">Upload video</span>
										<span class="btn btn-sm btn-outline-secondary image-remove d-none">Remove video</span>
										
										<div class="image-placeholder ms-3"></div>
										
										<input type="hidden" name="inputs-upload-rows[]-file-id" value="" class="uploader-file-id">
										<input type="hidden" name="inputs-upload-rows[]-file-url" value="" class="uploader-file-url">
									
									</div>
									
								</div>
								
								<div class="col pe-3">
									
									<select class="form-select form-select-sm" name="inputs-upload-rows[]-encoding" id="inputs-upload-rows[]-encoding">
										<option value="mp4">MP4</option>
										<option value="webm">WebM</option>
										<option value="ogg">Ogg</option>
									</select>
									
								</div>
								
								<div class="col-1 d-flex align-items-end justify-content-center">
									<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
								</div>
								
								<input type="hidden" id="inputs-upload-rows[]-index" name="inputs-upload-rows[]-index" value="0">
								
							</div>
							
						</div>
						
						<div class="d-flex justify-content-end p-2">
							<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add file</div>
						</div>
						
					</div>
					
				</div>
				
				<div class="col">
					
					<label class="form-label d-block">Attributes</label>
					
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="checkbox" value="" name="inputs-upload-atts-loop" id="inputs-upload-atts-loop">
						<label class="form-check-label" for="inputs-upload-atts-loop">Loop</label>
					</div>
					
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="checkbox" value="" name="inputs-upload-atts-autoplay" id="inputs-upload-atts-autoplay">
						<label class="form-check-label" for="inputs-upload-atts-autoplay">Autoplay</label>
					</div>
					
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="checkbox" value="" name="inputs-upload-atts-muted" id="inputs-upload-atts-muted">
						<label class="form-check-label" for="inputs-upload-atts-muted">Muted</label>
					</div>
					
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="checkbox" value="" name="inputs-upload-atts-controls" id="inputs-upload-atts-controls">
						<label class="form-check-label" for="inputs-upload-atts-controls">Show controls</label>
					</div>
					
				</div>
			</div>
			
			<div class="row row-cols-1 g-3" id="source-embed">
				<div class="col">
					<label for="inputs-embed" class="form-label">Embed Code</label>
					<textarea class="form-control form-control-sm font-monospace" rows="6" name="inputs-code-<?php $_GET['globals']['current_lang_code']; ?>" id="inputs-code-<?php $_GET['globals']['current_lang_code']; ?>"></textarea>
				</div>
			</div>
			
		</div>
	</div>
</div>