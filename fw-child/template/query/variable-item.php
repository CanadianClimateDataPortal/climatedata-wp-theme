<?php

	// sectors
	$this_sectors = get_the_terms ( $item['id'], 'sector' );

?>

<div class="card position-relative">
	
	<a href="#" class="flex-drawer-trigger stretched-link"></a>
	
	<div class="var-item-img bg-gray-400" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'large' ); ?>);"></div>
	
	<div class="var-item-text bg-white">
		<div class="var-item-text-inner">
			<h5 class="var-item-title"><?php echo get_the_title ( $item['id'] ); ?></h5>
			
			<?php
			
				if ( fw_get_field ( 'var_brief', $item['id'] ) != '' ) {
					
			?>
			
			<div class="var-item-brief">
				<div class="var-item-brief-inner">
					<?php echo fw_get_field ( 'var_brief', $item['id'] ); ?>
				</div>
			</div>
			
			<?php
			
				}
				
				if ( !empty ( $this_sectors ) ) {
					
			?>
			
			<div class="var-item-sectors d-flex">
				<?php
					
						foreach ( $this_sectors as $sector ) {
							
				?>
				
				<span class="badge all-caps text-bg-light me-2"><?php echo $sector->name; ?></span>
				
				<?php
			
						}
						
				?>
			</div>
			
			<?php
					
				}
			
			?>
		</div>
	</div>
	
	<div class="flex-drawer-content d-none">
		<div class="row">
			<div class="col-5-of-12 offset-1-of-12 mb-5 pb-5 border-bottom border-gray-500">
				<h2 class="mb-0 font-family-serif text-secondary"><?php echo get_the_title ( $item['id'] ); ?></h2>
			</div>
			
			<div class="col-5-of-12 d-flex align-items-center mb-5 pb-5 border-bottom border-gray-500">
				<div class="offset-1-of-5 d-flex align-items-center">
					<?php
					
						$map_slug = 'map';
						$dl_slug = 'download';
						
						if ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) {
							$map_slug = 'carte';
							$dl_slug = 'telechargement';
						}
						
					?>
					
					<a href="<?php echo home_url ( $map_slug ); ?>?var_id=<?php echo $item['id']; ?>" class="btn btn-primary rounded-pill px-4 me-3"><?php _e ( 'View on Map', 'cdc' ); ?></a>
					
					<a href="<?php echo home_url ( $dl_slug ); ?>?var_id=<?php echo $item['id']; ?>" class="btn btn-light rounded-pill px-4"><?php _e ( 'Analyze Data', 'cdc' ); ?></a>
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