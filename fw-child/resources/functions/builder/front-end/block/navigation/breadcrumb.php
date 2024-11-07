<?php
/**
 * Breadcrumb.
 */
?>
<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		<?php
		// Show static parents only if it has ancestors, or if there is more than 1 static parent.
		if (
			( $element['inputs']['include']['ancestors'] && ! empty( $globals['current_ancestors'][0] ) )
			|| count( $element['inputs']['static']['rows'] ) > 1
		) {

			foreach ( $element['inputs']['static']['rows'] as $static_parent ) {

				$static_title = get_the_title( $static_parent['page'] );

				if ( ! empty( $static_parent['text'][ $globals['current_lang_code'] ] ) ) {
					$static_title = $static_parent['text'][ $globals['current_lang_code'] ];
				}

				?>

			<li class="breadcrumb-item"><a href="<?php echo esc_url( translate_permalink( get_permalink( $static_parent['page'] ), $static_parent['page'], $globals['current_lang_code'] ) ); ?>"><?php echo esc_html( $static_title ); ?></a>

				<?php
			}
		}

		// Posts page.

		if ( true === $element['inputs']['include']['posts'] ) {

			?>

		<li class="breadcrumb-item"><a href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>"><?php echo esc_html( get_the_title( get_option( 'page_for_posts' ) ) ); ?></a></li>

			<?php

		}

		// Ancestors.

		if (
			$element['inputs']['include']['ancestors'] &&
			! empty( $globals['current_ancestors'] )
		) {
			$reverse_ancestors = array_reverse( $globals['current_ancestors'] );
			foreach ( $reverse_ancestors as $ancestor_id ) {

				?>

		<li class="breadcrumb-item"><a href="<?php echo esc_url( get_permalink( $ancestor_id ) ); ?>"><?php echo esc_html( get_the_title( $ancestor_id ) ); ?></a></li>

				<?php

			}
		}

		// Category.

		if (
			true === $element['inputs']['include']['category'] &&
			! empty( wp_get_post_categories( $globals['current_query']['ID'] ) )
		) {


			foreach ( wp_get_post_categories( $globals['current_query']['ID'] ) as $category ) {

				$this_cat = get_term( $category );

				?>

		<li class="breadcrumb-item"><a href="<?php echo esc_url( get_term_link( $category, 'category' ) ); ?>"><?php echo esc_html( $this_cat->name ); ?></a></li>

				<?php

			}
		}

		// Post type.

		if ( true === $element['inputs']['include']['post_type'] ) {

			$this_type = get_post_type_object( $globals['current_query']['post_type'] );

			?>

		<li class="breadcrumb-item active" aria-current="page"><?php echo esc_html( $this_type->labels->singular_name ); ?></li>

			<?php

		}

		// Title.

		if ( true === $element['inputs']['include']['title'] ) {

			$current_title = '';

			if ( isset( $globals['current_query']['ID'] ) ) {
				$current_title = get_the_title( $globals['current_query']['ID'] );
			} elseif ( isset( $globals['current_query']['labels'] ) ) {
				$current_title = $globals['current_query']['labels']->name;
			}

			?>

		<li class="breadcrumb-item active" aria-current="page"><?php echo esc_html( $current_title ); ?></li>

			<?php

		}

		?>
	</ol>
</nav>
