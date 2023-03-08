<?php

  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'card-img' );

?>

<div class="card h-100 bg-light">
  <?php

    if ( has_post_thumbnail ( $item['id'] ) ) {

  ?>

  <img src="<?php echo $bg_img; ?>" class="card-img-top">

  <?php

    }

  ?>

  <div class="card-body">
    <h6 class="card-date"><?php echo get_the_time( __('F j, Y', 'cdc'), $item['id'] ); ?></h6>
    <h5 class="card-title mb-2"><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h5>

    <?php

			if ( get_field ( 'post_author', $item['id'] ) != '' ) {

		?>

		<p class="card-author mb-4"><?php the_field ( 'post_author', $item['id'] ); ?></p>

		<?php

			}
      
      // tags
        
        $post_tags = get_the_terms ( $item['id'], 'post_tag' );
        
        if ( !empty ( $post_tags ) ) {
          
    ?>
    
    <h6 class="card-tags-head text-uppercase"><?php _e ( 'Topics', 'cdc' ); ?></h6>
    
    <p class="card-tags mb-4"><?php
    
        $i = 0;
        
        foreach ( $post_tags as $tag ) {
          if ( $i != 0 ) echo ', ';
          echo '<a href="' . get_permalink ( filtered_ID_by_path ( 'news', $GLOBALS['vars']['current_lang'] ) ) . '?t=' . $tag->term_id . '" class="tag-filter-item" data-tag="' . $tag->term_id . '">' . $tag->name . '</a>';
          $i++;
        }
        
    ?></p>
    
    <?php
    
      }

		?>

    <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-secondary"><?php _e ( 'Read more', 'cdc' ); ?></a>
  </div>
</div>
