<div id="learn-grid" class="col row">
	<?php
	
		//
		// CONTROL BAR
		//
		
		include ( locate_template ( 'template/learn/control-bar.php' ) );
		
		//
		// QUERY
		//
		
		$item_options = array (
			'type' => 'items',
			'template' => 'learn-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);
		
		// dummy 'modules' array
		// replace with proper get_terms function
	
		$modules = array (
			array (
				'slug' => 'module-1',
				'id' => 16,
				'title' => __( 'Module 1', 'cdc' ) . ' — ' . get_field ( 'module_title', 'resource-category_' . 16 )
			),
			array (
				'slug' => 'module-2',
				'id' => 17,
				'title' => __( 'Module 2', 'cdc' ) . ' — ' . get_field ( 'module_title', 'resource-category_' . 17 )
			),
			array (
				'slug' => 'module-3',
				'id' => 24,
				'title' => __( 'Module 3', 'cdc' ) . ' — ' . get_field ( 'module_title', 'resource-category_' . 24 )
			)
		);
			
	?>
	
	<div class="col-13 offset-1">
		<div class="tab-drawer-bumper">
			<div>
				sort
			</div>
			
			<?php
				
				$i = 1;
				
				foreach ( $modules as $module ) {
				
					$module_args = array (
						'posts_per_page' => 12,
						'post_type' => 'resource',
						'orderby' => 'menu_order',
						'order' => 'asc',
						'post_parent' => 0,
						'post_status' => 'publish',
						'tax_query' => array (
							array (
								'taxonomy' => 'resource-category',
								'field' => 'slug',
								'terms' => array ( $module['slug'] )
							)
						)
					);
				
			?>
			
			<div id="module-<?php echo $i; ?>" class="learn-module-grid py-6" data-args='<?php echo json_encode ( $module_args ); ?>'>
				
				<h2 class="mb-5"><?php echo $module['title']; ?></h2>
				
				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-3" data-options='<?php echo json_encode ( $item_options ); ?>'>
						
						<div class="fw-query-item"></div>
					
					</div>
				</div>
			</div>
		
			<?php 
			
					$i++;
				}
		
			?>
			
		</div>
	</div>
	
</div>