<div class="modal-header">
	<h4 class="modal-title">Apply Layout</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<button type="button" class="btn btn-primary fw-do-layout-submit">Apply</button>
	</div>
</div>

<div class="modal-body">
	
	<form>
	
		<p class="alert alert-danger"><strong>Warning:</strong> This action will replace the entire page with the contents of the selected layout.</p>
		
				
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
		
	</form>
	
</div>