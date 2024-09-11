<div id="learn-grid" class="col row bg-gray-200 position-relative z-0">

	<?php
	//
	// CONTROL BAR
	//
	include( locate_template( 'template/learn/control-bar.php' ) );

	//
	// QUERY
	//
	$item_options = array(
		'type'       => 'items',
		'template'   => 'template/query/learn-item.php',
		'id'         => '',
		'class'      => array( 'row', 'row-cols-3' ),
		'item_class' => 'col'
	);
	?>

	<div class="col-12 offset-1 col-sm-13">
		<?php
		$tax_topic_terms = get_terms(
			array(
				'taxonomy'   => 'topic',
				'hide_empty' => true,
			)
		);

			foreach ( $tax_topic_terms as $topic_term ) {
				$posts_args = array(
					'posts_per_page' => -1,
					'post_type'      => array( 'page', 'resource', 'app' ),
					'orderby'        => 'date',
					'order'          => 'desc',
					'post_status'    => 'publish',
					'tax_query'      => array(
						array(
						'taxonomy' => 'topic',
						'field'    => 'slug',
						'terms'    => array( $topic_term->slug ),
					),
				),
				'meta_query'    => array(
					array(
						'key'   => 'display_in_learning_zone',
						'value' => '1',
					),
				),
			);
		?>

		<div id="topic-<?php echo esc_attr( $topic_term->term_id ); ?>"
			class="learn-topic-grid py-7"
			data-args='<?php echo json_encode( $posts_args ); ?>'>

			<h4 class="learn-topic-title mb-5">
				<?php
				echo fw_get_field( 'title', 'topic_' . $topic_term->term_id );
				?>
			</h4>

			<div class="query-container">
				<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6"
					data-options='<?php echo json_encode( $item_options ); ?>'>
					<div class="fw-query-item"></div>
				</div>
			</div>

		</div>

		<?php

		}

		?>

		<div class="fw-query-items-no-matches py-7" style="display: none;">
			<p class="alert alert-warning"><?php _e( 'No items found.', 'cdc' ); ?></p>
		</div>

	</div>

</div>
