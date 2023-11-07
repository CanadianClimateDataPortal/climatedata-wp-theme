
<?php

$menus = wp_get_nav_menus();

?>

<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Breadcrumb
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<div class="p-3 border-bottom">
				
				<h6>Top-level Item</h6>
				
				<div class="row row-cols-3">
					
					<div class="col pe-3">
						<label for="inputs-include-top_label" class="form-label">Label</label>
						
						<input type="text" class="form-control" placeholder="Leave blank to use page title" name="inputs-include-top_label-<?php echo $_GET['globals']['current_lang_code']; ?>">
					</div>
					
					<div class="col pe-3">
						<label for="inputs-include-top" class="form-label">Page</label>
						
						<select name="inputs-include-top" id="inputs-include-top" class="form-select conditional-select">
							<option value="none">None</option>
							<option value="home" selected>Home Page</option>
							<option value="posts">Posts Page</option>
							<option value="other" data-form-condition="#include-other-page">Other</option>
						</select>
					</div>
					
					<div class="col" id="include-other-page">
						
						<label for="inputs-include-top_other" class="form-label">Other</label>
						
						<?php
						
							$top_query = get_posts ( array (
								'posts_per_page' => -1,
								'post_type' => 'page',
								'post_parent' => 0,
							));
							
						?>
						
						<select class="form-select" name="inputs-include-top_other" id="inputs-include-top_other">
							<?php
							
								foreach ( $top_query as $parent_page ) {
									
							?>
							
							<option value="<?php echo $parent_page->ID; ?>"><?php echo $parent_page->post_title; ?></option>
							
							<?php
							
								}
						
							?>
						</select>
						
					</div>
				</div>
			</div>
			
			<div class="p-3 border-bottom">
				<h6>Parent Items</h6>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="" name="inputs-include-posts" id="inputs-include-posts">
					<label class="form-check-label" for="inputs-include-posts">Posts Page</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="" name="inputs-include-ancestors" id="inputs-include-ancestors">
					<label class="form-check-label" for="inputs-include-ancestors">Page Ancestors</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="" name="inputs-include-category" id="inputs-include-category">
					<label class="form-check-label" for="inputs-include-category">Category</label>
				</div>
				
			</div>
			
			<div class="p-3">
					
				<h6>Current Page</h6>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="" name="inputs-include-post_type" id="inputs-include-post_type">
					<label class="form-check-label" for="inputs-include-post_type">Post Type</label>
				</div>
				
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="checkbox" value="" name="inputs-include-title" id="inputs-include-title">
					<label class="form-check-label" for="inputs-include-title">Title</label>
				</div>
				
			</div>
		
		</div>
	</div>
</div>