<div class="col row bg-gray-200">
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
		<?php
			
			$module_args = array (
				'posts_per_page' => 12,
				'post_type' => 'app',
				'post_parent' => 0,
				'post_status' => 'publish'
			);
			
		?>
		
		<div id="apps-grid" class="py-4 py-sm-6 py-lg-8 py-xxl-10" data-args='<?php echo json_encode ( $module_args ); ?>'>
			
			<div class="query-container ">
				<div class="fw-query-items row row-cols-1 row-cols-md-2 g-3 g-lg-6" data-options='<?php echo json_encode ( $item_options ); ?>'>
				
					<div class="fw-query-item"></div>
				
				</div>
			</div>
		</div>
	</div>
	
</div>
