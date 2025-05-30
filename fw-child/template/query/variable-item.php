<?php
$this_sectors = get_the_terms( $item['id'], 'sector' );

$variable_slug = get_post_field( 'post_name', $item['id'] );
$variable_id = get_field( 'var_id', $item['id'] );
$variable_datasets = get_the_terms( $item['id'], 'variable-dataset' );

// The variable may be part of multiple datasets, but for the "View on map" and
// "Download data" links, we want to preselect only the first non-AHCCD dataset.
$variable_dataset = $variable_datasets[0]; // Default value
foreach ( $variable_datasets as $dataset) {
	$dataset_type = get_field( 'dataset_type', 'variable-dataset_' . $dataset->term_id );
	if ( $dataset_type !== 'ahccd' ) {
		$variable_dataset = $dataset;
		break;
	}
}

// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}
?>

<div class="card position-relative variable-item no-enlarge" id="v-<?php echo esc_attr( $variable_slug ); ?>">

	<a href="/variable#v-<?php echo esc_attr( $variable_slug ); ?>" class="flex-drawer-trigger stretched-link"></a>

	<div class="var-item-img bg-gray-400" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $item['id'], 'medium_large' ); ?>);"></div>

	<div class="var-item-text bg-white">
		<div class="var-item-text-inner">
			<h5 class="var-item-title"><?php echo get_the_title ( $item['id'] ); ?></h5>

			<?php

				if ( !empty ( $this_sectors ) ) {

			?>

			<div class="var-item-sectors d-flex flex-wrap mt-1">
				<?php
						foreach ( $this_sectors as $sector ) {
							$sector_term_id   = $sector->term_id;
							$sector_term_name = $sector->name;

							if ( 'fr' === $current_lang ) {
								$sector_term_name_fr = get_field( 'admin_term_title_fr', $sector );
								$sector_term_name    = ( empty( $sector_term_name_fr ) ) ? $sector_term_name : $sector_term_name_fr;
							}
				?>

				<span class="badge all-caps text-bg-light mt-1 me-1"><?php echo esc_html( $sector_term_name ); ?></span>

				<?php

						}

				?>
			</div>

			<?php

				}

			?>
		</div>
	</div>

	<div class="flex-drawer-content d-none variable-details">
		<div class="row">
			<div class="col col-lg-6 col-14 offset-1 variable-details__title">
				<h2 class="mb-0 font-family-serif text-secondary"><?php echo get_the_title ( $item['id'] ); ?></h2>
			</div>

			<div class="col col-lg-8 offset-lg-0 col-14 offset-1 variable-details__links">
				<?php
				$page_availability = get_field( 'variable_availability', $item['id'] );
				$map_slug = 'maps/';
				$dl_slug  = 'download/';

				if ( 'fr' === $GLOBALS['fw']['current_lang_code'] ) {
					$map_slug = 'cartes/';
					$dl_slug  = 'telechargement/';
				}

				if ( is_array( $page_availability ) && ! empty( $page_availability ) ) {
					if ( in_array( 'map', $page_availability, true ) ) {
						?>
						<a href="<?php echo home_url( $map_slug ); ?>?var=<?php echo $variable_id; ?>&dataset=<?php echo $variable_dataset->term_id; ?>"
						   class="btn btn-primary btn-sm rounded-pill px-3"><?php _e( 'View on Map', 'cdc' ); ?></a>
						<?php
					}

					if ( in_array( 'download', $page_availability, true ) ) {
						?>
						<a href="<?php echo home_url( $dl_slug ); ?>?var=<?php echo $variable_id; ?>&dataset=<?php echo $variable_dataset->term_id; ?>"
						   class="btn btn-light btn-sm rounded-pill px-3"><?php _e( 'Download Data', 'cdc' ); ?></a>
						<?php
					}
				}
				?>
			</div>

			<div class="col col-14 offset-1 border-bottom border-gray-500 variable-details__separator"></div>
		</div>

		<div class="row">
			<div class="col col-lg-7 col-14 offset-1">
				<?php echo fw_get_field ( 'var_description', $item['id'] ); ?>

				<?php

					if ( fw_get_field ( 'var_tech_description', $item['id'] ) != '' ) {

				?>

				<h6 class="all-caps text-secondary mb-3 mt-5"><?php _e ( 'Technical Description', 'cdc' ); ?></h6>

				<?php echo fw_get_field ( 'var_tech_description', $item['id'] ); ?>

				<?php

					}

				?>
			</div>

			<div class="col col-lg-6 col-14 offset-1 variable-details__relevant">
				<?php
				$relevant_sectors = get_field( 'relevant_sectors', $item['id'] );

				if ( is_array( $relevant_sectors ) && ! empty ( $relevant_sectors ) ) {
					?>
					<h6 class="all-caps text-secondary mb-3"><?php _e( 'Relevant Sectors', 'cdc' ); ?></h6>

					<div class="accordion accordion-flush" id="var-accordion-<?php echo $item['id']; ?>">
						<?php

						foreach ( $relevant_sectors as $relevant_sector ) {
							$relevant_sector_term_id   = $relevant_sector['sector_term']->term_id;
							$relevant_sector_term_name = $relevant_sector['sector_term']->name;

							if ( 'fr' === $current_lang ) {
								$relevant_sector_term_name_fr = get_field( 'admin_term_title_fr', $relevant_sector['sector_term'] );
								$relevant_sector_term_name    = ( empty( $relevant_sector_term_name_fr ) ) ? $relevant_sector_term_name : $relevant_sector_term_name_fr;
							}
							?>
							<div class="accordion-item">
								<h2 class="accordion-header"
									id="var-<?php echo $item['id']; ?>-heading-<?php echo esc_attr( $relevant_sector_term_id ); ?>">
									<button class="accordion-button collapsed"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target="#var-<?php echo $item['id']; ?>-collapse-<?php echo esc_attr( $relevant_sector_term_id ); ?>"
											aria-expanded="false"
											aria-controls="var-<?php echo $item['id']; ?>-collapse-<?php echo esc_attr( $relevant_sector_term_id ); ?>">
										<?php echo esc_html( $relevant_sector_term_name ); ?>
									</button>
								</h2>
								<div id="var-<?php echo $item['id']; ?>-collapse-<?php echo esc_attr( $relevant_sector_term_id ); ?>"
									 class="accordion-collapse collapse"
									 aria-labelledby="var-<?php echo $item['id']; ?>-heading-<?php echo esc_attr( $relevant_sector_term_id ); ?>"
									 data-bs-parent="#var-accordion-<?php echo $item['id']; ?>">
									<div class="accordion-body p-3 bg-gray-200">
										<?php
										$sector_description = ( 'fr' === $current_lang ) ? $relevant_sector['sector_description_fr'] : $relevant_sector['sector_description'];

										echo esc_html( $sector_description );
										?>
									</div>
								</div>
							</div>
							<?php
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
