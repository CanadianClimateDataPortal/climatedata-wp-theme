<div class="accordion-item">
	
	<h2 class="accordion-header" id="element-form-head-post">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-post" aria-expanded="true" aria-controls="element-form-post">
			Post Settings
		</button>
	</h2>
	
	<div id="element-form-post" class="accordion-collapse collapse show" aria-labelledby="element-form-head-post" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
			
			<input type="hidden" name="post_type" value="<?php echo explode ( '/', $_GET['content'] )[1]; ?>">
			
			<div class="row row-cols-2 g-3">
	
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
					
					<label for="layout" class="form-label">Layout</label>
					
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
				
				<div class="col">
					<label for="post_meta-asset_type" class="form-label">Resource Type</label>
					
					<select name="post_meta-asset_type" class="form-select">
						<option value="video">Video</option>
						<option value="podcast">Podcast</option>
						<option value="interactive">Interactive</option>
						<option value="article">Article</option>
					</select>
				</div>
				
			</div>
			
		</div>
	</div>
	
</div>
