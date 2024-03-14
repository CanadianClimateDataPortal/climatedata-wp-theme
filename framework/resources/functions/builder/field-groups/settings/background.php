<div class="fw-form-flex-item settings-form settings-form-background card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Background</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
		<div class="row row-cols-2 border-bottom">
			<div class="col p-3 border-end">
				<label for="inputs-settings[]-background-source" class="form-label modal-label-sm">Image Source</label>
				
				<select name="inputs-settings[]-background-source" class="form-select form-select-sm conditional-select">
					<option value="field" data-form-condition="#bg-field">Field Value</option>
					<option value="upload" data-form-condition="#bg-upload">Media Library</option>
					<option value="thumbnail">Post Thumbnail</option>
				</select>
			</div>
			
			<div id="bg-field" class="col p-3">
				<label for="inputs-settings[]-background-field" class="form-label modal-label-sm">Custom Field Key</label>
				
				<input type="text" name="inputs-settings[]-background-field" class="form-control form-control-sm">
			</div>
			
			<div id="bg-upload" 
				class="col p-3 uploader-container"
				data-uploader-type="image" 
				data-uploader-options='{
					"title": "Select background image",
					"library": {
						"type": "image"
					},
					"button": {
						"text": "Use this image"
					},
					"multiple": false
				}'
			>
				<input type="hidden" id="inputs-settings[]-background-type" name="inputs-settings[]-background-type" value="background">
				
				<div class="image-placeholder pb-2"></div>
				
				<span class="btn btn-outline-secondary element-form-upload-btn">Select Image</span>
				<input type="hidden" name="inputs-settings[]-background-file-id" value="" class="uploader-file-id">
				<input type="hidden" name="inputs-settings[]-background-file-url" value="" class="uploader-file-url">
			</div>
		</div>
		
		<div class="row row-cols-4">
					
			<div class="col p-2">
				<label for="inputs-settings[]-background-position" class="form-label modal-label-sm">Position</label>
				
				<select name="inputs-settings[]-background-position" class="form-select form-select-sm">
					<option value="top left">Top Left</option>
					<option value="top center">Top Center</option>
					<option value="top right">Top Right</option>
					<option value="center left">Center Left</option>
					<option value="center center" selected>Center</option>
					<option value="center right">Center Right</option>
					<option value="bottom left">Bottom Left</option>
					<option value="bottom center">Bottom Center</option>
					<option value="bottom right">Bottom Right</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-background-attachment" class="form-label modal-label-sm">Attachment</label>
				
				<select name="inputs-settings[]-background-attachment" class="form-select form-select-sm">
					<option value="scroll">Scroll</option>
					<option value="fixed">Fixed</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-background-size" class="form-label modal-label-sm">Size</label>
				
				<select name="inputs-settings[]-background-size" class="form-select form-select-sm">
					<option value="cover"">Cover</option>
					<option value="width">100% width, auto height</option>
					<option value="height">100% height, auto width</option>
				</select>
				
			</div>
			
			<div class="col p-2">
				
				<label for="inputs-settings[]-background-opacity" class="form-label modal-label-sm">Opacity — <span>1</span></label>
				<input type="range" class="form-range" id="inputs-settings[]-background-opacity" name="inputs-settings[]-background-opacity" value="1" min="0" max="1" step="0.1">
				
			</div>
			
		</div>
		
	</div>
</div>