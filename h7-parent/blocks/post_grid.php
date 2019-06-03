<?php
  
  // array to hold the grid items
  
  if ( !isset ( $post_grid[$block_ID] ) ) $post_grid[$block_ID] = array();
  
  //
  // RUN ACF QUERY
  //

  include ( locate_template ( 'resources/bower_components/pe-acf-query/acf-query.php' ) );
  
  // populate the array with the returned $new_query items
  
  $post_grid[$block_ID] = array_merge ( $post_grid[$block_ID], $new_query );
  
  //$post_grid[$block_ID] = $new_query;
  
  //
  // DISPLAY SETTINGS
  //
  
  if ( get_sub_field ( 'columns' ) != '' ) {
    $post_grid[$block_ID]['display']['columns'] = get_sub_field ( 'columns' );
  }
  
  if ( !isset ( $post_grid[$block_ID]['display']['columns'] ) ) {
    $post_grid[$block_ID]['display']['columns'] = 3;
  }
  
  //
  // OUTPUT
  //
  
/*
  echo '<pre>';
  print_r ( $post_grid[$block_ID] );
  echo '</pre>';
*/

  if ( isset ( $post_grid[$block_ID]['items'] ) ) {

?>

  <div class="post-grid-wrap row">
    
    <?php
      
      // LOOP
      
      foreach ( $post_grid[$block_ID]['items'] as $item ) {
        
    ?>
    
    <div id="<?php echo $block_ID; ?>-item-<?php echo $item['id']; ?>" class="query-item post-preview type-<?php echo $item['post_type']; ?> col-lg-<?php echo 12 / $post_grid[$block_ID]['display']['columns']; ?>">
      
      <?php
        
        if ( 
          isset ( $post_grid[$block_ID]['display']['template'] ) && 
          locate_template ( 'previews/' . $post_grid[$block_ID]['display']['template'] . '.php'  ) != '' 
        ) {
          
          include ( locate_template ( 'previews/' . $post_grid[$block_ID]['display']['template'] . '.php' ) );
          
        } elseif ( locate_template ( 'previews/' . $item['post_type'] . '.php'  ) != '' ) {
          
          include ( locate_template ( 'previews/' . $item['post_type'] . '.php' ) );          
          
        } else {
        
      ?>
    
      <div class="card h-100 bg-primary text-center text-white">
        <div class="card-body">
          <h5><?php echo $item['title']; ?></h5>
          <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-secondary text-white"><?php _e ( 'Learn More', 'cdc' ); ?></a>
        </div>
      </div>
    
      <?php
      
        }
        
      ?>
    
    </div>
    
    <?php
        
      }
      
    ?>
    
  </div>

<?php
  
    unset ( $new_query );
  
  } else {
    
    echo '<div class="bg-warning col-6 offset-3">No items found.</div>';
    
  }
  
?>