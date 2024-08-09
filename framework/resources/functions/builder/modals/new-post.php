<div class="modal-header">
	<h4 class="modal-title">New Post</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<button type="button" class="btn btn-primary fw-new-post-submit">Submit</button>
	</div>
</div>

<div class="modal-body p-0">
	
	<form class="accordion accordion-flush" id="element-form">
		
		<div class="accordion-item">
			
			<h2 class="accordion-header" id="element-form-head-post">
				<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-post" aria-expanded="true" aria-controls="element-form-post">
					Post Settings
				</button>
			</h2>
			
			<div id="element-form-post" class="accordion-collapse collapse show" aria-labelledby="element-form-head-post" data-bs-parent="#element-form">
				<div class="accordion-body p-3">
			
					<div class="row row-cols-2 g-3">
						<div class="col">
							<label for="post_type" class="form-label">Post Type</label>
					
							<?php
							
								$post_types = array();
								
								// create array of all public post types
								
								foreach ( get_post_types ( array ( 'public' => true ), 'objects' ) as $post_type ) {
									
									$post_types[$post_type->name] = array (
										'value' => $post_type->name,
										'label' => $post_type->labels->singular_name,
										'conditional' => null
						 			);
									
								}
								
								// filter post types array
								
								$post_types = apply_filters ( 'fw_modal_post_types_select', $post_types, 1 );
								
								// look for conditionals
								
								$has_conditionals = false;
								
								foreach ( $post_types as $post_type ) {
									
									if (
										isset ( $post_type['conditional'] ) &&
										!empty ( $post_type['conditional'] ) &&
										$post_type['conditional'] != null
									) {
										
										$has_conditionals = true;
										break;
										
									}
									
								}
								
							?>
							
							<select name="post_type" class="form-select <?php if ( $has_conditionals == true ) echo 'conditional-select'; ?>">
								<?php
									
									foreach ( $post_types as $post_type ) {
										
								?>
								
								<option
									value="<?php echo $post_type['value']; ?>"
									<?php if ( isset ( $post_type['conditional'] ) ) echo 'data-form-condition="' . $post_type['conditional'] . '"'; ?>
								><?php echo $post_type['label']; ?></option>
								
								<?php
										
									}
									
								?>
							</select>
						</div>
						
						<div class="col">
							<label for="post_title" class="form-label">Title</label>
							<input type="text" name="post_title" class="form-control">
						</div>
						
						<div class="col">
							<label for="post_status" class="form-label">Status</label>
							
							<select name="post_status" class="form-select">
								<option value="publish">Published</option>
								<option value="draft">Draft</option>
							</select>
						</div>
					
						<div class="col">
							<label for="layout" class="form-label">Layout</label>
							
							<?php
								
								$layout_items = array();
								
								// foreach ( get_terms ( array ( 'taxonomy' => 'layout-type' ) ) as $layout_type ) {
							
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
										
										if ( empty ( $this_type ) ) {
											$this_type = 'General';
										} else {
											$this_type = $this_type[0];
										}
										
										if ( !isset ( $layout_items[$this_type->slug] ) ) {
											$layout_items[$this_type->slug] = array(
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
								
							?>
							
							<select name="layout" class="form-select">
								<option value="">Blank</option>
								
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
						</div>
						
					</div>
					
				</div>
			</div>
			
		</div>
		
		<?php
		
			do_action ( 'fw_modal_accordion_items', 'new-post' );
			
		?>
		
	</form>
	
</div>