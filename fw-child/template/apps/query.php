<div id="" class="col row bg-gray-200">
	<?php
	
		//
		// CONTROL BAR
		//
		
		include ( locate_template ( 'template/apps/control-bar.php' ) );
		
		//
		// QUERY
		//
		
		$item_options = array (
			'type' => 'items',
			'template' => 'template/query/app-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);
		
	?>
	
	<div class="col-12 offset-1 col-sm-13">
		<div class="tab-drawer-bumper">
			<div class="pt-6">
				
				<ul id="sort-menu" class="fw-query-sort list-unstyled d-flex all-caps">
					<li class="selected me-4" data-sort="date_desc"><i class="fas fa-arrow-up me-2"></i> <?php _e ( 'Newest First', 'cdc' ); ?></li>
					<li class="" data-sort="date_asc"><i class="fas fa-arrow-down me-2"></i> <?php _e ( 'Oldest First', 'cdc' ); ?></li>
				</ul>
				
			</div>
			
			<?php
				
				$module_args = array (
					'posts_per_page' => 12,
					'post_type' => 'app',
					'post_parent' => 0,
					'post_status' => 'publish'
				);
				
			?>
			
			<div id="apps-grid" class="py-6" data-args='<?php echo json_encode ( $module_args ); ?>'>
				
				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6" data-options='<?php echo json_encode ( $item_options ); ?>'>
						
						<div class="fw-query-item"></div>
					
					</div>
				</div>
			</div>
		
		</div>
	</div>
	
</div>
