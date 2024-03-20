<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Image
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<div
				class="row row-cols-2 uploader-container border-bottom"
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
				<div class="col p-3 border-end">
					<span class="btn btn-outline-secondary element-form-upload-btn">Upload image</span>
					<span class="btn btn-outline-secondary image-remove d-none">Remove image</span>
					
					<input type="hidden" name="inputs-file-id" value="" class="uploader-file-id">
					<input type="hidden" name="inputs-file-url" value="" class="uploader-file-url">
				</div>
				
				<div class="col p-3">
					<div class="image-placeholder"></div>
				</div>
				
			</div>
			
			<div class="row row-cols-3">
				<div class="col p-3 border-end">
					<label for="inputs-link-type" class="form-label mb-1">Add link</label>
					
					<select name="inputs-link-type" class="form-select conditional-select">
						<option value="">None</option>
						<option value="post" data-form-condition="#img-link-post">Internal</option>
						<option value="url" data-form-condition="#img-link-url">URL</option>
					</select>
				</div>
				
				<div id="img-link-post" class="col p-3 border-end">
					<label for="inputs-link-post" class="form-label mb-1">Internal link</label>
					
					<select name="inputs-link-post" class="form-select">
						<?php
						
							// each post type
							
							$post_types = array_diff (
								get_post_types ( array ( 'public' => true ) ),
								[ 'fw-template', 'fw-layout' ]
							);
							
							foreach ( $post_types as $post_type ) {
								
						?>
						
						<optgroup label="<?php echo $post_type; ?>">
							
							<?php
								
								// all posts
								
								$pt_query = get_posts ( array (
									'post_type' => $post_type,
									'posts_per_page' => -1,
								) );
								
								foreach ( $pt_query as $item ) {
						
							?>
						
							<option value="<?php echo $item->ID; ?>"><?php echo $item->post_title; ?></option>
							
							<?php
						
								}
								
							?>
							
						</optgroup>
						
						<?php
								
							}
								
						?>
					</select>
				</div>
				
				<div id="img-link-url" class="col p-3 border-end">
					<label for="inputs-link-url" class="form-label mb-1">URL</label>
					
					<input type="text" class="form-control" name="inputs-link-url">
				</div>
				
				<div id="img-link-target" class="col p-3">
					<label for="inputs-link-target" class="form-label mb-1">Link target</label>
					
					<select name="inputs-link-target" class="form-select">
						<option value="">Same window</option>
						<option value="blank">New window</option>
					</select>
				</div>
				
			</div>
			
		</div>
		
	</div>
</div>