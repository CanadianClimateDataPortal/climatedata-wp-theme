<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Image
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div
				class="row uploader-container"
				data-uploader-type="image"
				data-uploader-options='{
					"title": "Insert image",
					"library": {
						"type": "image"
					},
					"button": {
						"text": "Use this image"
					},
					"multiple": false
				}'
			>
				<div class="col-5">
					<span class="btn btn-outline-secondary element-form-upload-btn">Upload image</span>
					<span class="btn btn-outline-secondary image-remove d-none">Remove image</span>
					
					<input type="hidden" name="inputs-file-id" value="" class="uploader-file-id">
					<input type="hidden" name="inputs-file-url" value="" class="uploader-file-url">
				</div>
				
				<div class="col-5 offset-1">
					<div class="image-placeholder"></div>
				</div>
			</div>
			
		</div>
	</div>
</div>