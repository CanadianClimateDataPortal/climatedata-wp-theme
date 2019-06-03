<?php
  
  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'card-img' );
  
?>

<div id="subsector-<?php echo get_the_slug ( $item['id'] ); ?>" class="subsector-preview bg-dark col-10 offset-1 text-white">
  <?php
    
    $bg_URL = '';
  
    if ( have_rows ( 'background', $item['id'] ) ) {
      while ( have_rows ( 'background', $item['id'] ) ) {
        the_row();
        
        include ( locate_template ( 'elements/bg.php' ) );
        
      }
    }
    
  ?>
  
  <div class="preview-content">
    <div class="row">
      <div class="col-8-of-10 offset-1-of-10">
        <h4><a href="<?php echo $item['permalink']; ?>" class="text-white"><?php echo $item['title']; ?></a></h4>
      </div>
    </div>
    
    <div class="row align-items-start">
      <div class="col-5-of-10 offset-1-of-10">
        <?php echo apply_filters ( 'the_content', get_field ( 'hero_text', $item['id'] ) ); ?>
      </div>
      
      <a href="<?php echo $item['permalink']; ?>" class="col-2-of-10 offset-1-of-10 btn rounded-pill btn-outline-light all-caps"><?php _e ( 'Explore', 'cdc' ); ?> <span class="icon fas fa-long-arrow-alt-right"></span></a>
    </div>
    
  </div>
  
</div>