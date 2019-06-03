<?php
  
  //
  // ENQUEUE
  //
  
  function carousel_enqueue() {
    
    wp_enqueue_script ( 'slick' );
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'carousel_enqueue' );
  
  //
  // CREATE QUERY
  //
  
  $post_carousel[$block_ID] = array();
  
  $new_post_carousel = array();
  
  include ( locate_template ( 'resources/bower_components/pe-acf-query/acf-query.php' ) );
  
  $post_carousel[$block_ID] = $new_query;
  
  //
  // LAYOUT
  //

  if ( isset ( $post_carousel[$block_ID]['items'] ) ) {

?>

<div class="post-carousel-wrap">
  <div class="row">
    <div class="post-carousel col-10 col-sm-12" data-slick='{
      "slidesToShow": 4,
      "slidesToScroll": 1,
      "prevArrow": false,
      "nextArrow": "<div class=\"post-carousel-next\"><i class=\"fas fa-long-arrow-alt-right\"></i></div>",
      "responsive": [
        {
          "breakpoint": 992,
          "settings": {
            "slidesToShow": 3
          }
        }, {
          "breakpoint": 576,
          "settings": {
            "slidesToShow": 1
          }
        }
      ]
    }'>
      
      <?php
        
        $item_num = 1;
        
        foreach ( $post_carousel[$block_ID]['items'] as $item ) {
          
      ?>
      
      <div id="<?php echo $block_ID; ?>-item-<?php echo $item['id']; ?>" class="query-item post-preview type-<?php echo $item['post_type']; ?> col-9 col-sm-6 col-lg-4">
        
        <?php
          
          if ( locate_template ( 'previews/' . $item['post_type'] . '.php'  ) != '' ) {
            
            include ( locate_template ( 'previews/' . $item['post_type'] . '.php' ) );
            
          } else {
          
        ?>
        
        <div class="card h-100">
          <div class="card-body">
            <h5><?php echo $item['title']; ?></h5>
            <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-secondary text-white">Explore</a>
          </div>
        </div>
        
        <?php
        
          }
          
        ?>
        
      </div>
      
      <?php
        
          $item_num++;
          
        }
        
      ?>
      
    </div>
  </div>
</div>

<?php
  
  } else {
    
    echo '<div class="bg-warning">';
    _e ( 'No items found.', 'cdc' );
    echo '</div>';
    
  }
  
?>