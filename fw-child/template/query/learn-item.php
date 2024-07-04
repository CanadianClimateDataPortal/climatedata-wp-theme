<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}

$native_excerpt = apply_filters ( 'the_content', custom_excerpt ( 20, $item['id'] ) );

$excerpts = array (
    'en' => $native_excerpt ?: get_field( 'excerpt', $item['id'] ), // Overrides native excerpt with custom excerpt if present
    'fr' => get_field( 'excerpt_fr', $item['id'] ) ?: $native_excerpt // Defaults back to native excerpt if no custom FR not present
);
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
		
		<div class="mb-3">
			<?php
			
				echo $excerpts[ $item['lang'] ];
			
			?>
		</div>
		
		<div class="row row-cols-2">
			<div class="col">
				<h6 class="all-caps text-secondary"><?php _e ( 'Format', 'cdc' ); ?></h6>
	
				<?php
				
					$format_icon = '';
					$format_name = get_field ( 'asset_type', $item['id'] );
					
					switch ( get_field ( 'asset_type', $item['id'] ) ) {
						
						case 'video' :
							$format_icon = 'fas fa-video';
							$format_name = __ ( 'Video', 'cdc' );
							break;
							
						case 'audio' :
							$format_icon = 'fas fa-volume';
							$format_name = __ ( 'Audio', 'cdc' );
							break;
							
						case 'interactive' :
							$format_icon = 'far fa-hand-pointer';
							$format_name = __ ( 'Interactive', 'cdc' );
							break;
							
						case 'article' :
							$format_icon = 'far fa-newspaper';
							$format_name = __ ( 'Article', 'cdc' );
							break;
							
					}
					
				?>
				
				<p class="mb-0 small text-gray-600">
					<i class="<?php echo $format_icon; ?> me-2"></i><?php echo $format_name; ?>
				</p>
			</div>
			
			<div class="col">
				<h6 class="all-caps text-secondary"><?php _e ( 'Time', 'cdc' ); ?></h6>
			
				<p class="mb-0 small text-gray-600"><?php
				
					echo get_field ( 'asset_time', $item['id'] ) . ' minutes';
				
				?></p>
			</div>
		</div>
		
	</div>
</div>
