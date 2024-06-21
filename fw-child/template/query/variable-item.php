<?php
// sectors
$this_sectors = get_the_terms( $item['id'], 'sector' );

// Get variable post slug.
$variable_slug = get_post_field( 'post_name', $item['id'] );
?>

<div class="card position-relative variable-item" id="v-<?php echo esc_attr( $variable_slug ); ?>">
	
	<a href="/variable#v-<?php echo esc_attr( $variable_slug ); ?>" class="flex-drawer-trigger stretched-link"></a>
	
	<div class="var-item-img bg-gray-400" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'medium_large' ); ?>);"></div>
	
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
					
						$map_slug = 'map/';
						$dl_slug = 'download/';
						
						if ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) {
							$map_slug = 'carte/';
							$dl_slug = 'telechargement/';
						}
						
					?>
					
					<a href="<?php echo home_url ( $map_slug ); ?>?var_id=<?php echo $item['id']; ?>" class="btn btn-primary rounded-pill px-4 me-3"><?php _e ( 'View on Map', 'cdc' ); ?></a>
					
					<a href="<?php echo home_url ( $dl_slug ); ?>?var_id=<?php echo $item['id']; ?>" class="btn btn-light rounded-pill px-4"><?php _e ( 'Download Data', 'cdc' ); ?></a>
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
				<?php
				
					$sectors = get_the_terms ( $item['id'], 'sector' );
					
					if ( !empty ( $sectors ) ) {
						
				?>
				
				<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Relevant Sectors', 'cdc' ); ?></h6>
				
				<div class="accordion accordion-flush" id="var-accordion-<?php echo $item['id']; ?>">
						
						
					<?php
					
						$i = 1;
					
						foreach ( $sectors as $sector ) {
								
					?>
					
					<div class="accordion-item">
						<h2 class="accordion-header" id="var-<?php echo $item['id']; ?>-heading-<?php echo $i; ?>">
							<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#var-<?php echo $item['id']; ?>-collapse-<?php echo $i; ?>" aria-expanded="false" aria-controls="var-<?php echo $item['id']; ?>-collapse-<?php echo $i; ?>">
								<?php echo $sector->name; ?>
							</button>
						</h2>
						<div id="var-<?php echo $item['id']; ?>-collapse-<?php echo $i; ?>" class="accordion-collapse collapse" aria-labelledby="var-<?php echo $item['id']; ?>-heading-<?php echo $i; ?>" data-bs-parent="#var-accordion-<?php echo $item['id']; ?>">
							<div class="accordion-body p-3">
								<?php 
								
									if ( $GLOBALS['fw']['current_lang_code'] == 'en' ) {
										
										echo $sector->description;
										
									} else {
										
										echo get_field ( 'description_' . $GLOBALS['fw']['current_lang_code'], 'sector_' . $sector->term_id );
										
									}
								
								?>
							</div>
						</div>
					</div>
					
					<?php
					
							$i++;
							
						}
						
					?>
						
				</div>
				
				<?php
				
					}	
				
				?>
					
			</div>
		</div>
	</div>
	
</div>
