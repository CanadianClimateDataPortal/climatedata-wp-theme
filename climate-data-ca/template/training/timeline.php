<?php

	wp_enqueue_script ( 'gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.3/gsap.min.js', array ( 'jquery' ), null, true );
	wp_enqueue_script ( 'scrolltrigger', 'https://assets.codepen.io/16327/ScrollTrigger.min.js?v=32', array ( 'gsap' ), null, true );
	wp_enqueue_script ( 'scroll', get_stylesheet_directory_uri() . '/resources/js/scroll.js', array ( 'scrolltrigger' ), null, true );

?>

<div id="timeline">

	<?php

		$section_query = new WP_Query ( array (
			'post_type' => 'resource',
			'posts_per_page' => -1,
			'orderby' => 'menu_order',
			'order' => 'asc',
			'post_parent' => get_the_ID()
		) );

		if ( $section_query->have_posts() ) {

			$section_num = 1;

			while ( $section_query->have_posts() ) {
				$section_query->the_post();

				if ( have_rows ( 'tl_section' ) ) {
					while ( have_rows ( 'tl_section' ) ) {
						the_row();

						$section_class = array (
							'tl-section',
							'bg-' . get_sub_field ( 'section_bg' ),
							'headings-' . get_sub_field ( 'section_headings' ),
							'text-' . get_sub_field ( 'section_text' ),
							'links-' . get_sub_field ( 'section_links' )
						);

			?>

			<section id="tl-section-<?php echo $section_num; ?>" class="<?php echo implode ( ' ', $section_class ); ?>">

				<?php

					$scroll_elements = array();
					$scroll_tl = array();

					//
					// CREATE ELEMENTS
					//

					while ( have_rows ( 'elements' ) ) {
						the_row();

						$element_ID = get_sub_field ( 'id' );

						$new_element = array (
							'type' => get_sub_field ( 'content' ),
							'class' => array ( 'element', 'type-' . get_sub_field ( 'content' ), get_sub_field ( 'classes' ) ),
							'position' => get_sub_field ( 'position' ),
							'size' => get_sub_field ( 'size' ),
							'z_index' => ( get_sub_field ( 'z_index' ) != '' ) ? get_sub_field ( 'z_index' ) : 1
						);

						if ( get_sub_field ( 'content' ) == 'img' ) {
							$new_element['content'] = get_sub_field ( 'image' );
						} elseif ( get_sub_field ( 'content' ) == 'video' ) {
							$new_element['content'] = get_sub_field ( 'video' );
						} elseif ( get_sub_field ( 'content' ) == 'text' ) {
							$new_element['content'] = get_sub_field ( 'text' );
						}

						$scroll_elements[$element_ID] = $new_element;

					}

					//
					// CREATE TIMELINE
					//

					while ( have_rows ( 'timeline' ) ) {
						the_row();

						$new_tween = array (
							'id' => get_sub_field ( 'id' ),
							'effect' => get_sub_field ( 'effect' ),
							'duration' => ( get_sub_field ( 'duration' ) != '' ) ? get_sub_field ( 'duration' ) : 1,
							'position' => ( get_sub_field ( 'tl_position' ) != '' ) ? get_sub_field ( 'tl_position' ) : '+=0',
				// 						'delay' => ( get_sub_field ( 'delay' ) != '' ) ? get_sub_field ( 'delay' ) : '0'
						);

						if ( get_sub_field ( 'effect' ) == 'manual' ) {

							$new_tween['properties'] = array();

							while ( have_rows ( 'properties') ) {
								the_row();

								if ( get_row_layout() == 'position' ) {

									$new_tween['properties']['css'] = array ();

									$new_pos = get_sub_field ( 'position' );

									if ( $new_pos['value1'] != '' ) {

										if ( $new_pos['anchor1'] == 'top' ) {
											$new_pos['value1'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $new_pos['value1'] / 100 ) . '))';
										} else {
											$new_pos['value1'] .= '%';
										}

										$new_tween['properties']['css'][$new_pos['anchor1']] = $new_pos['value1'];
									}

									if ( $new_pos['value2'] != '' ) {

										if ( $new_pos['anchor2'] == 'top' ) {
											$new_pos['value2'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $new_pos['value2'] / 100 ) . '))';
										} else {
											$new_pos['value2'] .= '%';
										}

										$new_tween['properties']['css'][$new_pos['anchor2']] = $new_pos['value2'];
									}

								} elseif ( get_row_layout() == 'css' ) {

									$new_tween['properties']['css'] = array();

									foreach ( get_sub_field ( 'rules' ) as $rule ) {
										$new_tween['properties']['css'][$rule['property']] = $rule['value'];
									}

								} else {

									$new_tween['properties'][get_row_layout()] = get_sub_field ( get_row_layout() );

								}

							}

						}

						$scroll_tl[] = $new_tween;

					}

				?>

				<div id="section-<?php echo $section_num; ?>" class="tl-container" data-timeline='<?php echo json_encode ( $scroll_tl, JSON_PRETTY_PRINT ); ?>'>

					<?php

						// dumpit($scroll_elements);

						foreach ( $scroll_elements as $id => $element ) {

					?>

					<div id="section-<?php echo $section_num; ?>-element-<?php echo $id; ?>"
						class="<?php echo implode ( ' ', $element['class'] ); ?>"
						data-position-z="<?php echo $element['z_index']; ?>"
						data-size-x="<?php echo $element['size']['x']; ?>"
						data-size-y="<?php echo $element['size']['y']; ?>"
						style="<?php

							if ( $element['position']['value1'] != '' && $element['position']['value1'] != '0' ) {

								if ( $element['position']['anchor1'] == 'top' ) {
									$element['position']['value1'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $element['position']['value1'] / 100 ) . '))';
								} else {
									$element['position']['value1'] .= '%';
								}

								echo $element['position']['anchor1'] . ': ' . $element['position']['value1'] . '; ';
							}

							if ( $element['position']['value2'] != '' && $element['position']['value2'] != '0' ) {

								if ( $element['position']['anchor2'] == 'top' ) {
									$element['position']['value2'] = 'calc(130px + ((100vh - 130px) * ' . ( (int) $element['position']['value2'] / 100 ) . '))';
								} else {
									$element['position']['value2'] .= '%';
								}

								echo $element['position']['anchor2'] . ': ' . $element['position']['value2'] . ';';
							}

						?>"
					>

						<?php

							if ( $element['type'] == 'img' ) {

								echo '<img src="' . wp_get_attachment_image_url ( $element['content'], 'large' ) . '">';

							} elseif ( $element['type'] == 'video' ) {

								echo '<video id="section-' . $section_num . '-element-' . $id . '-video" src="' . wp_get_attachment_url ( $element['content'] ) . '" playsinline="true" webkit-playsinline="true" preload="auto" muted="muted" class="video-background"></video>';

							} elseif ( $element['type'] == 'text' ) {

								echo $element['content'];

							}

						?>

					</div>

					<?php

						}

					?>

				</div>

			</section>

			<?php

					} // while tl_section
				} // if tl_section

				$section_num++;

			} // while posts

			wp_reset_postdata();
		}

	?>

</div>
