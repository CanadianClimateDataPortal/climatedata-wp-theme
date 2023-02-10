<?php
  
?>

<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
  <?php
    
    $page_ancestors = array_reverse ( array_slice ( get_ancestors ( get_the_ID(), 'page' ), 0, -1 ) );
    
    if ( !empty ( $page_ancestors ) ) {
      
  ?>
  
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      
      <?php
          
        $ancestor_num = 1;
        
        foreach ( $page_ancestors as $ancestor ) {
          
      ?>
    
      <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $ancestor ); ?>" class="<?php echo ( $ancestor_num == 1 ) ? 'supermenu-toggle' : ''; ?>"><?php echo get_the_title ( $ancestor ); ?></a></li>
      
      <?php
        
          $ancestor_num++;
        
        }
        
      ?>
    </ol>
  </nav>
  
  <?php
    
    }
    
  ?>
  
  <h1><?php
    
    if ( $hero_fields['title'] != '' ) {
      echo $hero_fields['title'];
    } else {
      the_title();
    }
    
  ?></h1>
  
  <?php echo $hero_fields['text']; ?>
  
</div>