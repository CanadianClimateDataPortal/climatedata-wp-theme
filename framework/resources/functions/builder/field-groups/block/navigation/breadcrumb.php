
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
				
				<h6>Static Parents</h6>
				
				<div class="fw-form-repeater-container">
					
					<div class="row border-bottom p-2 fw-form-repeater-head modal-label-sm">
						<div class="col">Label</div>
						<div class="col">Page</div>
						<div class="col-1"></div>
					</div>
					
					<div class="fw-form-repeater p-2 border-bottom" data-key="static" data-rows="1">
							
						<div class="fw-form-repeater-row row my-1" data-row-index="0">
							
							<div class="col pe-3">
								
								<input type="text" class="form-control" placeholder="Leave blank to use page title" name="inputs-static-rows[]-text-<?php echo $_GET['globals']['current_lang_code']; ?>" id="inputs-static-rows[]-text-<?php echo $_GET['globals']['current_lang_code']; ?>">
								
							</div>
							
							<div class="col pe-3">
							
								<?php
								
									$top_query = get_posts ( array (
										'posts_per_page' => -1,
										'post_type' => 'page',
										'post_parent' => 0,
									));
									
								?>
								
								<select class="form-select" name="inputs-static-rows[]-page" id="inputs-static-rows[]-page">
									<?php
									
										foreach ( $top_query as $parent_page ) {
											
									?>
									
									<option value="<?php echo $parent_page->ID; ?>"><?php echo $parent_page->post_title; ?></option>
									
									<?php
									
										}
								
									?>
								</select>
								
							</div>
							
							<div class="col-1 d-flex align-items-end justify-content-center">
								<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
							</div>
							
							<input type="hidden" id="inputs-static-rows[]-index" name="inputs-static-rows[]-index" value="0">
							
						</div>
						
					</div>
					
					<div class="d-flex justify-content-end p-2">
						<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add row</div>
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