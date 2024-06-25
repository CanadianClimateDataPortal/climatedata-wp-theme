<div id="" class="col row bg-gray-200">
	<?php
	
		//
		// CONTROL BAR
		//
		
		include ( locate_template ( 'template/news/control-bar.php' ) );
		
		//
		// QUERY
		//
		
		$item_options = array (
			'type' => 'items',
			'template' => 'template/query/news-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);
		
	?>
	
	<div class="col-13 offset-1">
		<div class="tab-drawer-bumper">
			<div class="pt-6">
				
				<ul id="sort-menu" class="fw-query-sort list-unstyled d-flex all-caps">
					<li class="selected me-4" data-sort="date_desc"><i class="fas fa-arrow-up me-2"></i> <?php _e ( 'Newest First', 'cdc' ); ?></li>
					<li class="" data-sort="date_asc"><i class="fas fa-arrow-down me-2"></i> <?php _e ( 'Oldest First', 'cdc' ); ?></li>
				</ul>
				
			</div>
			
			<?php
				
				$module_args = array (
					'posts_per_page' => 9,
					'post_type' => 'post',
					'post_parent' => 0,
					'post_status' => 'publish'
				);
				
			?>
			
			<div id="news-grid" class="py-6" data-args='<?php echo json_encode ( $module_args ); ?>'>

				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6"
						 data-options='<?php echo json_encode( $item_options ); ?>'>

						<div class="fw-query-item"></div>

					</div>

					<div class="fw-query-pagination d-flex justify-content-between align-items-start mt-4">
						<div class="fw-query-pagination-btn previous btn btn-secondary me-3"><?php _e( 'Previous', 'cdc' ); ?></div>

						<div class="fw-query-pagination-pages d-flex gap-2 flex-1 flex-wrap me-3"></div>

						<div class="fw-query-pagination-btn next btn btn-secondary"><?php _e( 'Next', 'cdc' ); ?></div>
					</div>
				</div>
			</div>
		
		</div>
	</div>
	
</div>
