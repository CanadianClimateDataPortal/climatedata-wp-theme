<?php

	$glossary = array();
	
	$glossary_query = new WP_Query ( array (
		'post_type' => 'definition',
		'posts_per_page' => -1,
		'orderby' => 'title',
		'order' => 'asc'
	) );
	
	
	// convert FR
	
	if ( isset ( $_GET['convert'] ) && $_GET['convert'] == '1' ) {
		
		if ( !defined ( 'ICL_LANGUAGE_CODE' ) ) {
			
			echo '<p>WPML not active</p>';
			
		} else {
			
			if ( $glossary_query->have_posts() ) {
				
				while ( $glossary_query->have_posts() ) {
					$glossary_query->the_post();
					
					
					echo get_the_title() . '<br>';
					
					$en_ID = get_the_ID();
					$fr_ID = apply_filters ( 'wpml_object_id', get_the_ID(), 'definition', false, 'fr' );
					
					// content -> field
					
					update_field ( 'glossary_definition', get_the_content(), $en_ID );
					
					// echo 'en: ' . $en_ID . '<br>';
					// echo 'fr: ' . $fr_ID . '<br>';
					
					if ( $fr_ID != '' ) {
						
						// get fr post
						
						$fr_post = get_post ( $fr_ID );
						
						update_field ( 'glossary_term_fr', get_the_title ( $fr_ID ), $en_ID );
						
						update_field ( 'glossary_definition_fr', $fr_post->post_content, $en_ID );
						
						wp_update_post ( array (
							'ID' => $fr_ID,
							'post_status' => 'draft'
						) );
						
					}
					
				}
			}
			
	
		}
	}
	
	
	
	if ( $glossary_query->have_posts() ) {
		
		$current_letter = '';
		
		while ( $glossary_query->have_posts() ) {
			$glossary_query->the_post();
			
			$first_letter = substr ( get_the_title(), 0, 1 );
			
			if ( !isset ( $glossary[$first_letter] ) ) {
				$glossary[$first_letter] = array();
			}
			
			$term = array (
				'id' => get_the_ID(),
				'term' => get_the_title(),
				'definition' => get_field ( 'glossary_definition' )
			);
			
			if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
				
				$term = array (
					'id' => get_the_ID(),
					'term' => get_field ( 'glossary_term_fr'),
					'definition' => get_field ( 'glossary_definition_fr' )
				);
				
			}
			
			$glossary[$first_letter][] = $term;
			
		}
	}
	
	// dumpit ( $glossary );
	
	if ( !empty ( $glossary ) ) {
		foreach ( $glossary as $letter => $terms ) {
			
?>

<div class="row">
	<div class="col-1 letter border-bottom border-gray-400">
		<h2 class="font-family-serif text-secondary"><?php echo $letter; ?></h2>
	</div>
	
	<dl class="col term-list mb-0 border-bottom">
		
		<?php
		
			foreach ( $terms as $term ) {
				
		?>
		
		<div class="row py-4 align-items-start">
		
			<dt class="col-4-of-15 offset-1-of-15 pe-3">
				<?php echo $term['term']; ?>
			</dt>
			
			<dd class="col-6-of-15">
				<?php echo $term['definition']; ?>
			</dd>
			
		</div>
		
		<?php
		
			}
			
		?>
	</dl>

</div>

<?php

		}
	}
	
	//
	
?>

