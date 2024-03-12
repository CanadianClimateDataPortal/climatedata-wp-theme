<div class="p-2 position-relative">
	
	<div class="var-item-img bg-gray-200">
		<div class="bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'medium' ); ?>);"></div>
	</div>
	
	<div class="var-item-text p-3">
		<h5><?php echo get_the_title ( $item['id'] ); ?></h5>
		
		<a href="#" class="flex-drawer-trigger stretched-link"></a>
		</div>
	</div>
	
	<div class="flex-drawer-content d-none">
		<div class="row">
			<div class="col-5-of-12 offset-1-of-12 mb-5 pb-5 border-bottom border-gray-500">
				<h2 class="mb-0 font-family-serif text-secondary"><?php echo get_the_title ( $item['id'] ); ?></h2>
			</div>
			
			<div class="col-5-of-12 d-flex align-items-center mb-5 pb-5 border-bottom border-gray-500">
				<div class="offset-1-of-5">
					<a href="<?php echo home_url ( 'map' ); ?>?var_id=<?php echo $item['id']; ?>" class="btn btn-light rounded-pill px-4"><?php _e ( 'View on Map', 'cdc' ); ?></a>
				</div>
			</div>
		</div>
		
		<div class="row">
			<div class="col-5-of-12 offset-1-of-12">
				<?php echo fw_get_field ( 'var_description', $item['id'] ); ?>
				
				<?php
				
					if ( fw_get_field ( 'var_tech_description', $item['id'] ) != '' ) {
						
				?>
				
				<h6 class="all-caps text-secondary my-4"><?php _e ( 'Technical Description', 'cdc' ); ?></h6>
				
				<?php echo fw_get_field ( 'var_tech_description', $item['id'] ); ?>
				
				<?php
				
					}
			
				?>
			</div>
			
			<div class="col offset-1-of-12">
				<h6 class="all-caps text-secondary"><?php _e ( 'Relevant Sectors', 'cdc' ); ?></h6>
			</div>
		</div>
	</div>
	
</div>