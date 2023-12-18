<?php

// add conditional 'resource' accordion to new post modal

add_filter ( 'fw_modal_post_types_select', function ( $post_types ) {
	
	$post_types['resource']['conditional'] = '#resource-fields';
	
	return $post_types;
	
} );

// output

add_action ( 'fw_modal_accordion_items', function ( $modal_name ) {
	
	if ( $modal_name == 'new-post' ) {
	
?>

	<div class="accordion-item" id="resource-fields">
		<h2 class="accordion-header" id="element-form-head-display">
			<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-display" aria-expanded="false" aria-controls="element-form-display">
				Resource
			</button>
		</h2>
		
		<div id="element-form-display" class="accordion-collapse collapse" aria-labelledby="element-form-head-display" data-bs-parent="#element-form">
			<div class="accordion-body p-3">
				<div class="row row-cols-2 g-3">
					<div class="col">
						<label for="post_meta-asset_type" class="form-label">Resource Type</label>
						
						<select name="post_meta-asset_type" class="form-select">
							<option value="video">Video</option>
							<option value="audio">Audio</option>
							<option value="interactive">Interactive</option>
							<option value="article">Article</option>
						</select>
					</div>
					
				</div>
				
			</div>
		</div>
	</div>
	
<?php

	}
	
}, 10, 1 );