<?php

?>

<div class="card">
	<?php
	
		if ( has_post_thumbnail ( $item['id'] ) ) {
			
	?>
	
	<div class="bg-dark">
		<div class="card-img item-thumb" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium_large' ); ?>);"></div>
	</div>
	
	<?php
	
		}

	?>
	
	<div class="card-body">
		<h5 class="card-title item-title"><a href="<?php echo $item['permalink']; ?>" class="text-secondary stretched-link"><?php echo $item['title']; ?></a></h5>
		
		<div class="">
			<?php echo apply_filters ( 'the_content', fw_get_field ( 'app_brief', $item['id'] ) ); ?>
		</div>
	</div>
</div>