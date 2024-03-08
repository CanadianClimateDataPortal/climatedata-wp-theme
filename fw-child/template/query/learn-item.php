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
		
		<div class="mb-3">
			<?php
			
				echo apply_filters ( 'the_content', custom_excerpt ( 20, $item['id'] ) );
			
			?>
		</div>
		
		<div class="row row-cols-2">
			<div class="col">
				<h6 class="all-caps text-secondary"><?php _e ( 'Format', 'cdc' ); ?></h6>
	
				<p class="mb-0"><?php
				
					the_field ( 'asset_type', $item['id'] );
				
				?></p>
			</div>
			
			<div class="col">
				<h6 class="all-caps text-secondary"><?php _e ( 'Time', 'cdc' ); ?></h6>
			
				<p class="mb-0"><?php
				
					the_field ( 'asset_time', $item['id'] );
				
				?></p>
			</div>
		</div>
		
	</div>
</div>