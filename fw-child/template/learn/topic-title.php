<?php

	if ( isset ( $GLOBALS['fw'] ) ) {
			
		$this_topics = get_the_terms ( $GLOBALS['fw']['current_query']['ID'], 'topic' );
		
		if ( !empty ( $this_topics ) ) {
			
			echo '<p class="resource-hero-topics">';
			
			$i = 0;
			
			foreach ( $this_topics as $topic ) {
				
				echo ( $i != 0 ) ? ', ' : '';
				
				if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
					echo get_field ( 'term_fr', 'topic_' . $topic->term_id );
				} else {
					echo $topic->name;
				}
				
				echo ': ' . fw_get_field ( 'title', 'topic_' . $topic->term_id );
				
				$i++;
				
			}
			
			echo '</p>';
			
		}
		
	}