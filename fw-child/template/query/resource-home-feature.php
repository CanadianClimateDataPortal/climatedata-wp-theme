<div 
	class="card mb-5" 
	data-aos="zoom-in-up" 
	data-aos-easing="ease-in-out-quad" 
	data-aos-duration="800"
	data-aos-offset="250"
>

	<?php
	
		if ( has_post_thumbnail ( $item['id'] ) ) {
			
	?>
	
	<div class="bg-dark">
		<div class="card-img item-thumb" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium' ); ?>);"></div>
	</div>
	
	<?php
	
		}

	?>
	
	<div class="card-body">
		<h5 class="card-title item-title"><a href="<?php echo $item['permalink']; ?>" class="text-secondary stretched-link"><?php echo $item['title']; ?></a></h5>
		
		<p><?php
		
			the_field ( 'asset_type', $item['id'] );
		
		?></p>
		
	</div>
</div>