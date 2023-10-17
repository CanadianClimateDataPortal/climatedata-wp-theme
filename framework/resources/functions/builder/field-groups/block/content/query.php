<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-parameters">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-parameters" aria-expanded="true" aria-controls="element-form-parameters">
			Query
		</button>
	</h2>
	
	<div id="element-form-parameters" class="accordion-collapse collapse show" aria-labelledby="element-form-head-parameters" data-bs-parent="#element-form">
		<div class="accordion-body">
			
			<div class="p-3 border-bottom">
				
				<h5>Basic</h5>
				
				<div class="row g-3">
					<div class="col-6">
						<label for="inputs-args-posts_per_page" class="form-label">Number of Items</label>
						<input class="form-control form-control-sm" type="number" name="inputs-args-posts_per_page" id="inputs-args-posts_per_page" min="-1" max="9999" value="-1">
					</div>
					
					<div class="col-6">
						
						<label for="inputs-type" class="form-label">Query Type</label>
						
						<select class="form-select form-select-sm conditional-select" name="inputs-type" id="inputs-type">
							<option value="posts" data-form-condition="#query-post-types">Posts</option>
							<option value="terms" data-form-condition="">Taxonomy Terms</option>
						</select>
						
					</div>
						
					<div class="col-12" id="query-post-types">
						
						<label class="form-label d-block">Post Type(s)</label>
						
						<?php
						
							$i = 0;
						
							foreach ( get_post_types ( array ( 'public' => true ) ) as $post_type ) {
								
						?>
							
						<div class="form-check form-check-inline">
							<input class="form-check-input" type="checkbox" value="<?php echo $post_type; ?>" name="inputs-args-post_type-<?php echo $post_type; ?>" id="inputs-args-post_type-<?php echo $post_type; ?>">
							<label class="form-check-label" for="inputs-args-post_type-<?php echo $post_type; ?>">
								<?php echo $post_type; ?>
							</label>
						</div>
						
						<?php
						
								$i++;
								
							}
					
						?>
						
					</div>
					
					<div class="col-6">
						
						<label for="inputs-args-orderby" class="form-label">Sort By</label>
						
						<select class="form-select form-select-sm" name="inputs-args-orderby" id="inputs-args-orderby">
							<option value="date">Date</option>
							<option value="title">Title</option>
							<option value="menu_order">Wordpress Menu Order</option>
							<option value="meta_value_num">Custom Field Value (0–9)</option>
							<option value="meta_value">Custom Field Value (A–Z)</option>
							<option value="rand">Random</option>
						</select>
						
					</div>
					
					<div class="col-6">
						
						<label for="inputs-args-order" class="form-label">Sort Order</label>
						
						<select class="form-select form-select-sm" name="inputs-args-order" id="inputs-args-order">
							<option value="asc">Ascending</option>
							<option value="desc">Descending</option>
						</select>
						
					</div>
					
				</div>
				
			</div>
			
			<div class="p-3 border-bottom">
				
				<h5>Taxonomy Query</h5>
				
				<div class="fw-form-repeater-container">
					
					<div class="row border-bottom p-2 fw-form-repeater-head modal-label-sm">
						<div class="col">Taxonomy</div>
						<div class="col">Field</div>
						<div class="col">Terms</div>
						<div class="col">Filterable</div>
						<div class="col">Multi-Select</div>
						<div class="col-1"></div>
					</div>
					
					<div class="fw-form-repeater p-2 border-bottom" data-key="args-tax_query" data-rows="1">
							
						<div class="fw-form-repeater-row row my-1" data-row-index="0">
							
							<input type="hidden" id="inputs-args-tax_query[]-index" name="inputs-args-tax_query[]-index" value="0">
							
							<div class="col pe-3">
								
								<select class="form-select form-select-sm" name="inputs-args-tax_query[]-taxonomy" id="inputs-args-tax_query[]-taxonomy">
									<?php
									
										foreach ( get_taxonomies ( array ( 'public' => true ), 'objects' ) as $taxonomy ) {
											
									?>
									
									<option value="<?php echo $taxonomy->name; ?>"><?php echo $taxonomy->labels->singular_name; ?></option>
									
									<?php
									
										}
									
									?>
								</select>
								
							</div>
							
							<div class="col pe-3">
								
								<select class="form-select form-select-sm" name="inputs-args-tax_query[]-field" id="inputs-args-tax_query[]-field">
									<option value="slug">Slug</option>
									<option value="term_id">ID</option>
								</select>
								
							</div>
							
							<div class="col pe-3">
								
								<input class="form-control form-control-sm" type="text" name="inputs-args-tax_query[]-terms" id="inputs-args-tax_query[]-terms">
								
							</div>
							
							<div class="col pe-3">
								
								toggle
								
							</div>
							
							<div class="col pe-3">
								
								toggle
								
							</div>
							
							<div class="col-1 d-flex align-items-end justify-content-center">
								<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
							</div>
							
						</div>
						
					</div>
					
					<div class="d-flex justify-content-end p-2">
						<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add row</div>
					</div>
					
				</div>
				
			</div>
			
			<div class="p-3">
			
				<h5>Meta Query</h5>
				
				<div class="row">
				</div>
				
			</div>
			
		</div>
	</div>
</div>

<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-display">
		<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-display" aria-expanded="false" aria-controls="element-form-display">
			Display
		</button>
	</h2>
	
	<div id="element-form-display" class="accordion-collapse collapse" aria-labelledby="element-form-head-display" data-bs-parent="#element-form">
		<div class="accordion-body">
			
			<div id="" class="fw-form-flex-container p-3" data-input="output" data-path="block/content/query/output">
				<div class="d-flex align-items-center">
				
					<h5 class="mb-0 me-3">Add an item</h5>
					
					<div class="dropdown">
						<button class="d-block btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="query-builder-form-add" data-bs-toggle="dropdown" aria-expanded="false">
							Items
						</button>
						
						<ul id="query-builder-form-add-items" class="dropdown-menu fw-form-flex-menu" aria-labelledby="query-builder-form-add">
							<li><span class="dropdown-item" data-flex-item="container">Container</span></li>
							<li><span class="dropdown-item" data-flex-item="items">Items</span></li>
						</ul>
					</div>
					
				</div>
				
				<div class="fw-form-flex-rows row mt-3"></div>
			</div>
			
			<?php /*<div class="fw-form-flex-container">
			
				<div class="fw-form-flex p-2 border-bottom" data-rows="1">
						
					<div class="fw-form-flex-row row my-1" data-row-index="0">
						
						<input type="hidden" id="inputs-items-flex-index" name="inputs-items-flex-index" value="0">
						
						<div class="fw-form-flex-row-content"></div>
						
					</div>
					
				</div>
				
				<div class="d-flex justify-content-end p-2">
					
					<div class="dropdown">
						<button class="btn btn-secondary dropdown-toggle" type="button" id="element-form-display-flex-add-menu" data-bs-toggle="dropdown" aria-expanded="false">
							Add item
						</button>
						
						<ul class="dropdown-menu" aria-labelledby="element-form-display-flex-add-menu">
							<div class="dropdown-item fw-form-flex-add-row" data-item-content="container">Container</div>
							<div class="dropdown-item fw-form-flex-add-row" data-item-content="items">Items</div>
							<div class="dropdown-item fw-form-flex-add-row" data-item-content="filter">Filter</div>
						</ul>
					</div>
					
				</div>
			
			</div><?php // flex-container ?>
			
			*/ ?>
			
			
			
		</div>
		
	</div>
</div>