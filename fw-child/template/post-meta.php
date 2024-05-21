<div class="news-meta-block p-3 border border-gray-600">
	<div class="news-meta-item mb-3 mb-lg-4">
		<h5 class="mb-2 all-caps text-blue-100"><?php _e ( 'Date', 'cdc' ); ?></h5>

		<?php

			the_time ( __( 'F j, Y', 'cdc' ) );

		?>
	</div>

	<div class="news-meta-item mb-3 mb-lg-4">
		<h5 class="mb-2 all-caps text-blue-100"><?php _e ( 'Author', 'cdc' ); ?></h5>

		<?php

			the_field ( 'post_author' );

		?>
	</div>

	<?php

		$post_tags = get_the_terms ( get_the_ID(), 'post_tag' );

		if ( !empty ( $post_tags ) ) {

	?>

	<div class="news-meta-item mb-3 mb-lg-4">
		<h5 class="mb-2 all-caps text-blue-100"><?php _e ( 'Topics', 'cdc' ); ?></h5>

		<p><?php

				$i = 0;

				foreach ( $post_tags as $tag ) {
					if ( $i != 0 ) echo ', ';
					echo '<a href="/news/">' . $tag->name . '</a>';
					$i++;
				}

		?></p>
	</div>

	<?php

	}

	?>

	<div class="news-meta-item">
		<h5 class="mb-2 all-caps text-blue-100"><?php _e ( 'Share this post', 'cdc' ); ?></h5>

		<div id="post-share-wrap">
			<div id="share"></div>
		</div>
	</div>
</div>
