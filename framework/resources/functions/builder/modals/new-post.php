<div class="modal-header">
	<h4 class="modal-title">New Post</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<button type="button" class="btn btn-primary fw-new-post-submit">Submit</button>
	</div>
</div>

<div class="modal-body">
	
	<form>
	
		<label for="post_type" class="form-label">Post Type</label>
		
		<select name="post_type" class="form-select">
			<?php
			
				foreach ( get_post_types ( array ( 'public' => true ), 'objects' ) as $post_type ) {
					
			?>
			
			<option value="<?php echo $post_type->name; ?>"><?php echo $post_type->labels->singular_name; ?></option>
			
			<?php
			
				}
				
			?>
		</select>
		
		<label for="post_title" class="form-label">Title</label>
		
		<input type="text" name="post_title" class="form-control">
		
		<label for="post_status" class="form-label">Status</label>
		
		<select name="post_status" class="form-select">
			<option value="publish">Published</option>
			<option value="draft">Draft</option>
		</select>
		
		<label for="layout" class="form-label">Layout</label>
		
		<select name="layout" class="form-select">
			<option value="">Blank</option>
			
			<?php
			
				$layouts_query = get_posts ( array (
					'post_type' => 'fw-layout', 
					'post_status' => 'publish',
					'posts_per_page' => -1,
					'orderby' => 'menu_order',
					'order' => 'asc'
				) );
				
				if ( !empty ( $layouts_query ) ) {
					
					foreach ( $layouts_query as $layout ) {
					
			?>
			
			<option value="<?php echo $layout->ID; ?>"><?php echo get_the_title ( $layout->ID ); ?></option>
			
			<?php
			
					}
			
				}
		
			?>
		</select>
		
	</form>
	
</div>