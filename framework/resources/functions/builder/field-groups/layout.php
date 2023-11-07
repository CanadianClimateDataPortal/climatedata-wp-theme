<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Layout
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
			
			<p class="alert alert-danger m-3"><strong>Warning:</strong> This action will replace the entire page with the contents of the selected layout.</p>
	
			<div class="row row-cols-2">
				
				<div class="col p-3">
					
					<?php
						
						$layout_query = get_posts ( array (
							'post_type' => 'fw-layout',
							'posts_per_page' => -1
						));
						
						if ( !empty ( $layout_query ) ) {
						
					?>
					
					<label for="inputs-post_id" class="form-label">Layout</label>
					
					<!-- <small class="form-text text-muted">Select the layout to apply it to the current page.</small> -->
					
					<select class="form-select" name="inputs-post_id" id="inputs-post_id">
						<?php
							
							foreach ( $layout_query as $layout ) {
								
						?>
						
						<option value="<?php echo $layout->ID; ?>"><?php echo get_the_title ( $layout->ID ); ?></option>
						
						<?php
						
							}
							
						?>
					</select>
					
					<?php
					
						}
						
					?>
					
				</div>
				
				
			</div>
			
		</div>
	</div>
</div>
