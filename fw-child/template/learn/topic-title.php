<?php
if ( isset( $GLOBALS['fw'] ) ) {

    $this_topics = get_the_terms( $GLOBALS['fw']['current_query']['ID'], 'topic' );

    if ( ! empty( $this_topics ) ) {

        echo '<p class="resource-hero-topics">';

        foreach ( $this_topics as $i => $topic ) {
            $topic_name  = $topic->name;
            $topic_title = fw_get_field( 'title', 'topic_' . $topic->term_id );

            if ( 
                $GLOBALS['fw']['current_lang_code'] !== 'en' &&
                get_field( 'term_' . $GLOBALS['fw']['current_lang_code'], 'topic_' . $topic->term_id )
            ) {
                $topic_name = get_field( 'term_' . $GLOBALS['fw']['current_lang_code'], 'topic_' . $topic->term_id );
            }

            // Echo comma in between each topic.
            echo ( 0 !== $i ) ? ', ' : '';

            echo ! empty( $topic_name ) ? esc_html( $topic_name ) : '';

            // Echo colon only if both name and title exists, are not empty, and not equal.
            if ( ! empty( $topic_name ) && ! empty( $topic_title ) && $topic_name !== $topic_title ) {
                echo ': ';
            }

            // Echo title only if it exists and is not equal to the name.
            if ( ! empty( $topic_title ) && $topic_name !== $topic_title ) {
                echo esc_html( $topic_title );
            }

        }

        echo '</p>';

    }

}
