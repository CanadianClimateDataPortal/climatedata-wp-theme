<?php

$category = get_the_terms( $item['id'], 'category' );
$author = get_the_terms( $item['id'], 'author' );

?>

<div class="card">
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
		
			echo get_post_time ( 'F j, Y', false, $item['id'] );
		
		?></p>
		
		<?php if ( ! empty( $category ) || ! empty( $author ) ) { ?>
			<div class="card-meta d-flex flex-row">
				<div class="card-category w-50">
					<?php if ( ! empty( $category ) ) { ?>
						<span class="mb-2 all-caps text-secondary fw-medium"><?php _e ( 'Category', 'cdc' ); ?></span>
						<p><?php the_terms( $item['id'], 'category' ); ?></p>
					<?php } ?>
				</div>
				<div class="card-author w-50">
					<?php if ( ! empty( $author ) ) { ?>
						<span class="mb-2 all-caps text-secondary fw-medium"><?php _e ( 'Author', 'cdc' ); ?></span>
						<p><?php the_terms( $item['id'], 'author' ); ?></p>
					<?php } ?>
				</div>
			</div>
		<?php } ?>
	</div>
</div>
