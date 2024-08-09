<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Template
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<div class="row row-cols-3 py-3 ps-3">
				
				<div class="col pe-3">
					
					<label for="inputs-source" class="form-label">Template Source</label>
					
					<select class="form-select conditional-select" name="inputs-source" id="inputs-source">
						<option value="post" data-form-condition="#inputs-post_id,#inputs-output">Post</option>
						<option value="include" data-form-condition="#inputs-path">File include</option>
					</select>
					
				</div>
				
				<div class="col flex-grow-1 pe-3">
					<div class="conditional-element-container">
						<?php
						
							$layout_items = array();
							
							$layouts_query = get_posts ( array (
								'post_type' => 'fw-template', 
								'post_status' => 'publish',
								'posts_per_page' => -1,
								'orderby' => 'menu_order',
								'order' => 'asc'
							) );
							
							if ( !empty ( $layouts_query ) ) {
								
								foreach ( $layouts_query as $layout ) {
									
									$this_type = get_the_terms ( $layout->ID, 'template_tag' );
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
						
						<label for="inputs-post_id" class="form-label">Template Object</label>
						
						<select name="inputs-post_id" id="inputs-post_id" class="form-select">
							<option checked disabled>Select a template</option>
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
				
					<div class="conditional-element-container">
						
						<label for="inputs-path" class="form-label">Path</label>
						
						<div class="input-group">
							<span class="input-group-text">theme/template/</span>
							
							<input type="text" class="form-control" name="inputs-path" id="inputs-path" value="nav.php" placeholder="subdir/filename.php">
						</div>
					</div>
					
				</div>
				
			</div>
			
			<div class="row row-cols-3 py-3 ps-3 conditional-element-container">
				
				<div class="col pe-3">
					
					<label for="inputs-output" class="form-label">Output</label>
					
					<select class="form-select conditional-select" name="inputs-output" id="inputs-output">
						<option value="template">Insert as template</option>
						<option value="copy">Copy editable elements to page</option>
					</select>
					
				</div>
				
				
			</div>
			
		</div>
	</div>
</div>
