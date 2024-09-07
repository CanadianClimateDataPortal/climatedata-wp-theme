<?php
/**
 * This file contains the rewrite setup functions.
 */

/**
 * Check if a wildcard key exists in an array.
 *
 * @param array  $arr The array to search in.
 * @param string $search The key to search for (supports wildcard *).
 * @param string $return The return type ('' for keys, 'key-value' for key-value pairs).
 * @return mixed The result of the search.
 */
function array_key_exists_wildcard( $arr, $search, $return = '' ) {
	$search = str_replace( '\*', '.*?', preg_quote( $search, '/' ) );
	$result = preg_grep( '/^' . $search . '$/i', array_keys( $arr ) );

	if ( 'key-value' === $return ) {
		return array_intersect_key( $arr, array_flip( $result ) );
	}

	return $result;
}

add_action( 'init', 'fw_add_custom_rewrites', 10 );


/**
 * Add custom rewrites.
 */
function fw_add_custom_rewrites() {

	global $wp_rewrite;

	add_rewrite_tag( '%lang%', '([^&]+)' );

	$all_langs = get_option( 'fw_langs' );

	switch ( fw_get_rewrite_method() ) {

		case 'path':
			// rewrite method:
			// add language to path.

			/**
			 * ALL PAGES OTHER THAN HOME
			 */

			foreach ( $all_langs as $code => $lang ) {

				if ( 'en' !== $code ) {

					// custom post types.

					foreach ( get_post_types( array( 'public' => true ) ) as $cpt ) {

						add_rewrite_rule(
							'(^' . $code . ')/' . $cpt . '/(.*)([^/]+)?',
							'index.php?lang=$matches[1]&cpt=' . $cpt . '&slug_' . $code . '=$matches[2]',
							'top'
						);

					}

					// posts with permalink structure.

					// month and name.

					add_rewrite_rule(
						'(^' . $code . ')/([0-9]{4})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=$matches[1]&year=$matches[2]&monthnum=$matches[3]&slug_' . $code . '=$matches[4]&page=$matches[5]',
						'top'
					);

					// day and name.

					add_rewrite_rule(
						'(^' . $code . ')/([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})/([^/]+)(?:/([0-9]+))?/?$',
						'index.php?lang=$matches[1]&year=$matches[2]&monthnum=$matches[3]&day=$matches[4]&slug_' . $code . '=$matches[5]&page=$matches[6]',
						'top'
					);

					// archive.

					foreach ( get_taxonomies( array( 'public' => true ) ) as $taxonomy ) {

						if ( 'post_format' !== $taxonomy ) {

							$tax_slug = get_option( 'options_tax_' . $taxonomy . '_slug_' . $code );

							// taxonomy archive ie: /fr/tax/term/ .

							$taxonomy_rules = array(
								array(
									'rule'  => '(^' . $code . ')/' . $tax_slug . '/(.+?)/(feed|rdf|rss|rss2|atom)/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&feed=$matches[3]',
								),
								array(
									'rule'  => '(^' . $code . ')/' . $tax_slug . '/(.+?)/embed/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&embed=true',
								),
								array(
									'rule'  => '(^' . $code . ')/' . $tax_slug . '/(.+?)/page/?([0-9]{1,})/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]&paged=$matches[3]',
								),
								array(
									'rule'  => '(^' . $code . ')/' . $tax_slug . '/(.+?)/?$',
									'query' => 'index.php?lang=$matches[1]&archive=' . $taxonomy . '&slug_' . $code . '=$matches[2]',
								),
							);

							foreach ( $taxonomy_rules as $tax_rule ) {

								add_rewrite_rule(
									$tax_rule['rule'],
									$tax_rule['query'],
									'top'
								);

							}
						}
					}

					// page/post.

					add_rewrite_rule(
						'(^' . $code . ')/(.*)([^/]+)?',
						'index.php?lang=$matches[1]&path_' . $code . '=$matches[2]',
						'top'
					);

					// HOME.

					add_rewrite_rule(
						'(^' . $code . ')/?$',
						'index.php?lang=$matches[1]&page_id=' . get_option( 'page_on_front' ),
						'top'
					);

				}
			}

			break;

		case 'domain':
			// * unpleasant *
			// destroy the existing rewrite rules
			// completely, because we need to replace everything
			// with the lang=XX query.

			update_option( 'rewrite_rules', array() );

			$news_prefix = __( 'news', 'cdc-post-types' );
			add_permastruct( 'news', '/' . $news_prefix . '/%postname%', false );

			add_filter(
				'rewrite_rules_array',
				function ( $rules ) use ( $news_prefix ) {

					$rewrite_code    = $GLOBALS['fw']['current_lang_code'];
					$new_rules       = array();
					$rules_to_remove = array();

					if ( 'en' !== $rewrite_code ) {

						foreach ( $rules as $rule => $query ) {

							$add_rule = false;

							// add lang=XX .
							$new_query = $query . '&lang=' . $rewrite_code;

							// Modify the CPT rules based on slug translation.
							foreach ( get_post_types(
								array(
									'public'   => true,
									'_builtin' => false,
								)
							) as $cpt ) {

								if ( false === $add_rule ) {

									// If the query contains the CPT.
									if ( str_contains( $query, $cpt . '=' ) ) {

										$translated_slug = __( $cpt, 'cdc-post-types' );

										// Create the new query with the translated slug.
										$new_query = str_replace( $cpt . '=', 'cpt=' . $cpt . '&slug_' . $rewrite_code . '=', $new_query );

										// Modify the rule with the translated slug.
										$new_key = str_replace( $cpt . '/', $translated_slug . '/', $rule );

										// Add the new rule to the new_rules array.
										$new_rules[ $new_key ] = $new_query;

										// Mark the original rule for removal.
										$rules_to_remove[] = $rule;

										$add_rule = true;
									}
								}
							}

							// Modify the rule for post URLs to use translated news prefix.
							if ( false === $add_rule && str_contains( $rule, $news_prefix . '/([^/]+)' ) ) {

								$new_query = str_replace( 'name=', 'slug_' . $rewrite_code . '=', $new_query );

								$add_rule = true;
							}

							if ( false === $add_rule ) {

								$new_query = str_replace( '&name=', '&slug_' . $rewrite_code . '=', $new_query );

								$new_query = str_replace( 'pagename=', 'path_' . $rewrite_code . '=', $new_query );

								$add_rule = true;

							}

							if ( true === $add_rule ) {
								$rules[ $rule ] = $new_query;
							}
						}

						// Unset the original rules after the loop.
						foreach ( $rules_to_remove as $rule_to_remove ) {
							unset( $rules[ $rule_to_remove ] );
						}

						// Merge the new translated rules back into the original rules array.
						$rules = array_merge( $new_rules, $rules );

					}

					// taxonomies.

					foreach ( get_taxonomies( array( 'public' => true ) ) as $taxonomy ) {

						if ( 'post_format' !== $taxonomy ) {

							$tax_slug = get_option( 'options_tax_' . $taxonomy . '_slug_' . $rewrite_code );

							// taxonomy archive i.e. /tax(fr)/term(fr)/ .

							// find items in $rules that start with the taxonomy slug.

							$default_rules = array_key_exists_wildcard( $rules, $taxonomy . '*', 'key-value' );

							foreach ( $default_rules as $rule => $query ) {

								$new_key = str_replace( $taxonomy . '/', $tax_slug . '/', $rule );

								$new_query = $query . '&archive=' . $taxonomy;

								// replace category_name= with slug= .
								$new_query = str_replace( 'category_name=', 'slug_' . $rewrite_code . '=', $new_query );

								// replace tax= with slug= .
								$new_query = str_replace( $taxonomy . '=', 'slug_' . $rewrite_code . '=', $new_query );

								$rules = array( $new_key => $new_query ) + $rules;

							}
						}
					}

					return $rules;
				},
				1
			);

			break;

	}
}

// don't redirect the front page.

add_action(
	'template_redirect',
	function () {
		if ( is_front_page() ) {
			remove_action( 'template_redirect', 'redirect_canonical' );
		}
	},
	0
);

// add lang to query vars.

add_filter(
	'query_vars',
	function ( $query_vars ) {

		$query_vars[] = 'lang';
		$query_vars[] = 'archive';
		$query_vars[] = 'cpt';

		foreach ( get_option( 'fw_langs' ) as $code => $lang ) {
			$query_vars[] = 'slug_' . $code;
			$query_vars[] = 'path_' . $code;
		}

		return $query_vars;
	}
);

// use slug_lang query var to adjust query
// there's probably a better way to do all of this,
// someday.

add_action( 'pre_get_posts', 'get_post_by_lang_slug' );

/**
 * Get post by language slug.
 *
 * @param WP_Query $query The WP_Query object.
 */
function get_post_by_lang_slug( $query ) {

	if ( is_admin() ) {
		return $query;
	}

	if (
		! is_admin() &&
		$query->is_main_query()
	) {

		foreach ( get_option( 'fw_langs' ) as $code => $lang ) {

			if ( 'en' !== $code ) {

				$has_slug = false;
				$has_path = false;

				$query->set( 'post_status', array( 'publish', 'draft', 'private', 'inherit' ) );

				if (
					isset( $query->query_vars[ 'slug_' . $code ] ) &&
					! empty( $query->query_vars[ 'slug_' . $code ] )
				) {

					$has_slug = true;

					$query->set(
						'meta_query',
						array(
							array(
								'key'     => 'slug_' . $code,
								'value'   => $query->query_vars[ 'slug_' . $code ],
								'compare' => '=',
							),
						)
					);

					$query->set( 'post_type', array( 'post', 'page' ) );

				}

				if (
					isset( $query->query_vars[ 'path_' . $code ] ) &&
					! empty( $query->query_vars[ 'path_' . $code ] )
				) {

					$query->set(
						'meta_query',
						array(
							array(
								'key'     => 'path_' . $code,
								'value'   => $query->query_vars[ 'path_' . $code ],
								'compare' => '=',
							),
						)
					);

					$query->set( 'post_type', array( 'post', 'page' ) );

					$has_path = true;
				}

				if (
					true === $has_slug &&
					(
						isset( $query->query_vars['archive'] ) &&
						! empty( $query->query_vars['archive'] )
					)
				) {

					// TAXONOMY ARCHIVE.

					// find the term that matches the slug.

					$en_term = get_terms(
						array(
							'hide_empty' => false,
							'meta_query' => array(
								array(
									'key'     => 'slug_' . $code,
									'value'   => $query->query_vars[ 'slug_' . $code ],
									'compare' => 'LIKE',
								),
							),
						)
					);

					if ( ! empty( $en_term ) ) {

						$en_term = $en_term[0];

						$query->is_archive = true;
						$query->is_home    = false;

						if ( 'category' === $query->query_vars['archive'] ) {

							// category.

							$query->query['category_name']      = $en_term->slug;
							$query->query_vars['category_name'] = $en_term->slug;

							$query->is_category = true;

						} elseif ( 'post_tag' === $query->query_vars['archive'] ) {

							// tag.

							$query->is_tag = true;

						} else {

							// custom taxonomy.

							$query->is_tax = true;
							$query->query_vars[ $query->query_vars['archive'] ] = $en_term->slug;

						}
					}
				} elseif (
					true === $has_slug ||
					true === $has_path
				) {

					// tell the query what this isn't.
					$query->is_home    = false;
					$query->is_archive = false;
					$query->is_date    = false;
					$query->is_year    = false;
					$query->is_month   = false;
					$query->is_day     = false;

					// tell it what it is.
					$query->is_single   = true;
					$query->is_singular = true;

					if (
						isset( $query->query_vars['cpt'] ) &&
						! empty( $query->query_vars['cpt'] )
					) {

						// CPT SINGLE.

						$query->set( 'post_type', array( $query->query_vars['cpt'] ) );

					}
				}
			}
		} // foreach lang
	}
}

/**
 * PERMALINKS
 */

foreach ( array( 'post', 'page', 'attachment', 'post_type' ) as $single_type ) {

	add_filter(
		$single_type . '_link',
		function ( $url, $post_id, ?bool $sample = null ) use ( $single_type ) {
			return apply_filters( 'wpse_link', $url, $post_id, $sample, $single_type );
		},
		9999,
		3
	);
}

add_filter( 'wpse_link', 'fw_rewrite_link', 10, 4 );

/**
 * Rewrite the link.
 * Translate based on the language.
 * Add prefix for posts.
 *
 * @param string $url The original URL.
 * @param int    $post_id The ID or Object of the post.
 * @return string The rewritten URL.
 */
function fw_rewrite_link( $url, $post_id ) {

	if ( is_admin() && ! wp_doing_ajax() ) {
		return $url;
	}

	if ( gettype( $post_id ) === 'object' ) {
		$post_id = $post_id->ID;
	}

	// If not english, translate the URL.
	if ( 'en' !== $GLOBALS['fw']['current_lang_code'] ) {

		$url = translate_permalink( $url, $post_id, $GLOBALS['fw']['current_lang_code'] );

		// Else, if it's a post, add the news prefix.
	} elseif ( 'post' === get_post_type( $post_id ) ) {

		$url = trailingslashit( $GLOBALS['vars']['home_url'] ) . 'news/' . get_the_slug( $post_id );

	}

	return $url;
}

/**
 * Translate the path based on the language.
 *
 * @param int    $post_id The ID or Object of the post.
 * @param string $lang The language code.
 * @return array The translated path.
 */
function translate_path( $post_id, $lang ) {
	$all_langs = get_option( 'fw_langs' );

	if ( gettype( $post_id ) === 'object' ) {
		$post_id = $post_id->ID;
	}

	if (
		(
			'post' !== get_post_type( $post_id ) &&
			'page' !== get_post_type( $post_id )
		)
		&& in_array( get_post_type( $post_id ), array_keys( get_post_types() ) )
	) {
		$post_type        = get_post_type( $post_id );
		$post_type_object = get_post_type_object( $post_type );

		if (
			isset( $post_type_object->rewrite['slug'] )
		) {

			$current_locale = get_locale();
			switch_to_locale( $all_langs[ $lang ]['locale'] );
			$path[] = __( $post_type_object->rewrite['slug'], 'cdc-post-types' );
			switch_to_locale( $current_locale );

		} else {

			$path[] = get_post_type( $post_id );

		}
	}

	// parents.
	if ( has_post_parent( $post_id ) ) {
		$path = translate_path( wp_get_post_parent_id( $post_id ), $lang );
	}

	if ( 'en' === $lang ) {
		$path[] = get_the_slug( $post_id );
	} else {
		$path[] = get_post_meta( $post_id, 'slug_' . $lang, true );
	}

	return $path;
}

/**
 * Translate the permalink based on the language.
 *
 * @param string $url The original permalink.
 * @param int    $post_id The ID of the post.
 * @param string $lang The language code.
 * @return string The translated permalink.
 */
function translate_permalink( $url, $post_id, $lang ) {

	$post_obj = get_post( $post_id );

	$new_slug = $post_obj->post_name;

	if ( 'en' !== $lang ) {
		$new_slug = get_post_meta( $post_id, 'slug_' . $lang, true );
	}

	// todo
	// fix this so it's an independent function
	// use it in rewrite
	// and menu.

	// domain/prefix.

	// default to the current home URL.
	$new_url = $GLOBALS['vars']['home_url'];

	switch ( fw_get_rewrite_method() ) {

		case 'path':
			// add the language path.
			$new_url = $GLOBALS['vars']['original_home_url'];

			if ( 'en' !== $lang ) {
				$new_url .= $lang . '/';
			}

			if ( 'post' === $post_obj->post_type ) {

				$post_path = explode( '/', untrailingslashit( $url ) );

				$splice_index = 4;

				if (
					'en' === $GLOBALS['fw']['current_lang_code'] ||
					! str_contains( $url, '/' . $GLOBALS['fw']['current_lang_code'] . '/' )
				) {
					$splice_index = 3;
				}

				array_pop( $post_path );

				$post_path = implode( '/', array_splice( $post_path, $splice_index ) );

				$new_url .= $post_path . '/' . $new_slug;

			} elseif ( 'page' !== $post_obj->post_type ) {

				$new_url .= implode( '/', translate_path( $post_id, $lang ) );

			} elseif ( (int) get_option( 'page_on_front' ) !== (int) $post_id ) {

				$new_url .= implode( '/', translate_path( $post_id, $lang ) );

			}

			break;

		case 'domain':
			if ( 'en' === $lang ) {

				$new_url = $GLOBALS['vars']['original_home_url'];

			} elseif ( $lang !== $GLOBALS['fw']['current_lang_code'] ) {

				$all_langs = get_option( 'fw_langs' );

				$new_url = $_SERVER['REQUEST_SCHEME'] . '://' . $all_langs[ $lang ]['domain'] . '/';

			}

			if ( 'post' === $post_obj->post_type ) {

				// Define the news prefix based on the translation.
				$news_prefix = __( 'news', 'cdc-post-types' );

				// Get the translated slug for the post.
				$post_slug = get_post_meta( $post_id, 'slug_' . $lang, true );

				// Construct the new URL with the prefix and post slug.
				$new_url .= $news_prefix . '/' . $post_slug;

			} elseif ( (int) get_option( 'page_on_front' ) !== (int) $post_id ) {

				$new_url .= implode( '/', translate_path( $post_id, $lang ) );

			}

			break;

	}

	return trailingslashit( $new_url );
}

/**
 * TITLES
 */

add_filter( 'document_title_parts', 'translate_doc_title' );

/**
 * Translate the document title based on the language.
 *
 * @param array $title_array The array containing the document title parts.
 * @return array The translated document title parts.
 */
function translate_doc_title( $title_array ) {

	$lang = $GLOBALS['fw']['current_lang_code'];

	if ( is_archive() ) {

		$this_tax  = get_taxonomy( $GLOBALS['fw']['current_query']['taxonomy'] );
		$tax_name  = $this_tax->labels->singular_name;
		$term_name = '';

		if ( 'en' !== $lang ) {

			$tax_name = get_option( 'options_tax_' . $GLOBALS['fw']['current_query']['taxonomy'] . '_title_single_' . $lang );

			$term_name = get_term_meta( $GLOBALS['fw']['current_query']['term_id'], 'title_' . $lang, true );

		}

		if ( ! empty( $term_name ) ) {

			$title_array['title'] = get_term_meta( $GLOBALS['fw']['current_query']['term_id'], 'title_' . $lang, true );

		}

		if ( ! empty( $tax_name ) ) {

			$title_array = array_slice( $title_array, 0, 1, true )
				+ array( 'tax' => $tax_name )
				+ array_slice( $title_array, 1, true );

		}
	} elseif (
		( is_page() || is_singular() ) &&
		! empty( get_post_meta( get_the_ID(), 'title_' . $lang, true ) )
	) {

		$title_array['title'] = get_post_meta( get_the_ID(), 'title_' . $lang, true );

	}

	return $title_array;
}

add_filter( 'the_title', 'translate_post_title', 10, 2 );

/**
 * Translate the post title based on the language.
 *
 * @param string $title The original post title.
 * @param int    $id The ID of the post.
 * @return string The translated post title.
 */
function translate_post_title( $title, $id ) {

	if ( is_admin() && ! wp_doing_ajax() ) {
		return $title;
	}

	if (
		'en' !== $GLOBALS['fw']['current_lang_code'] &&
		! empty( get_post_meta( $id, 'title_' . $GLOBALS['fw']['current_lang_code'], true ) )
	) {
		$title = get_post_meta( $id, 'title_' . $GLOBALS['fw']['current_lang_code'], true );
	}

	return $title;
}
