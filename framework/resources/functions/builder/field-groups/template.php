<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Template
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<div class="row">
				
				<div class="col p-3">
					
					<label for="inputs-source">Template Source</label>
					
					<select class="form-select conditional-select" name="inputs-source" id="inputs-source">
						<option value="post" data-form-condition="#inputs-post_id">Post</option>
						<option value="include" data-form-condition="#inputs-path">File include</option>
					</select>
					
				</div>
				
				<div class="col-8 p-3">
					<div class="conditional-element-container">
						<?php
							
							$template_query = get_posts ( array (
								'post_type' => 'fw-template',
								'posts_per_page' => -1
							));
							
							if ( !empty ( $template_query ) ) {
							
						?>
						
						<label for="inputs-post_id">Template Post</label>
						
						<select class="form-select" name="inputs-post_id" id="inputs-post_id">
							<!-- <option selected disabled>Select a template</option> -->
							
							<?php
								
								foreach ( $template_query as $template ) {
									
							?>
							
							<option value="<?php echo $template->ID; ?>"><?php echo get_the_title ( $template->ID ); ?></option>
							
							<?php
							
								}
								
							?>
						</select>
						
						<?php
						
							}
							
						?>
						
						
					</div>
				
					<div class="conditional-element-container">
						
						<label for="inputs-path">Path</label>
						
						<div class="input-group">
							<span class="input-group-text">theme/template/</span>
							
							<input type="text" class="form-control" name="inputs-path" id="inputs-path" value="nav.php" placeholder="subdir/filename.php">
						</div>
					</div>
					
				</div>
				
				
			</div>
			
		</div>
	</div>
</div>
