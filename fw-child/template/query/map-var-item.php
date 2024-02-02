<div class="p-2">
	
	<div class="var-item-img bg-gray-200">
		<div class="bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'medium' ); ?>);"></div>
	</div>
	
	<div class="var-item-text p-3">
		<h5><?php echo get_the_title ( $item['id'] ); ?></h5>
		<a href="#data" class="tab-drawer-trigger var-select" data-var-id="<?php echo $item['id']; ?>"><?php _e ( 'View on map', 'cdc' ); ?></a>
		<a href="<?php echo home_url ( 'download' ); ?>" class=""><?php _e ( 'Download', 'cdc' ); ?></a>
	</div>
	
</div>