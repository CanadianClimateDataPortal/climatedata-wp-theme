<div class="p-2 position-relative">
	
	<div class="var-item-img bg-gray-200">
		<div class="bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'medium' ); ?>);"></div>
	</div>
	
	<div class="var-item-text p-3">
		<h5><?php echo get_the_title ( $item['id'] ); ?></h5>
		
		<div class="var-item-links">
			<a href="#data" class="tab-drawer-trigger var-select" data-var-id="<?php echo $item['id']; ?>"><?php _e ( 'Select variable', 'cdc' ); ?></a>
			<span class="mx-2">•</span>
			<a href="#" class="flex-drawer-trigger"><?php _e ( 'Description', 'cdc' ); ?></a>
		</div>
	</div>
	
	<div class="flex-drawer-content d-none">
		<h4 class="mb-3"><?php echo get_the_title ( $item['id'] ); ?></h4>
		<?php echo fw_get_field ( 'var_description', $item['id'] ); ?>
	</div>
	
</div>