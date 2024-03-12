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
		
			$layout_items = array();
			
			$layouts_query = get_posts ( array (
				'post_type' => 'fw-layout', 
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'orderby' => 'menu_order',
				'order' => 'asc'
			) );
			
			if ( !empty ( $layouts_query ) ) {
				
				foreach ( $layouts_query as $layout ) {
					
					$this_type = get_the_terms ( $layout->ID, 'layout-type' );
					$this_type = ( empty ( $this_type ) ) ? 'General' : $this_type[0];
					
					if ( !isset ( $layout_items[$this_type->slug] ) ) {
						$layout_items[$this_type->slug] = array (
							'slug' => $this_type->slug,
							'name' => $this_type->name,
							'id' => $this_type->term_id,
							'items' => array()
						);
					}
					
					array_push ( $layout_items[$this_type->slug]['items'], array (
						'id' => $layout->ID,
						'title' => get_the_title ( $layout->ID )
					) );
				}
			}
		
			// dumpit ( $layout_items );
			
		?>
		
		<label for="inputs-post_id" class="form-label">Layout</label>
		
		<select name="inputs-post_id" id="inputs-post_id" class="form-select">
			<?php
			
				foreach ( $layout_items as $layout_group ) {
					
			?>
			
			<optgroup label="<?php echo $layout_group['name']; ?>">
				<?php
				
					foreach ( $layout_group['items'] as $item ) {
						
				?>
					
				<option value="<?php echo $item['id']; ?>"><?php echo $item['title']; ?></option>
				
				<?php
				
					}
			
				?>
			</optgroup>
			
			<?php
			
				}
		
			?>
		</select>
		
	</form>
	
</div>