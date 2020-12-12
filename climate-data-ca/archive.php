<?php
  
  get_header();
  
?>

<main>
  
  <?php
    
    $hero_fields['background'] = array ( 'hero_background', 'option' );
    $hero_fields['title'] = get_field ( 'hero_title', 'option' );
    $hero_fields['text'] = get_field ( 'hero_text', 'option' );
    
    include ( locate_template ( 'template/hero/hero.php' ) );
    
  ?>

<!--
<section id="archive-hero" class="page-section first-section bg-dark text-white">
  <div class="container-fluid">
    <div class="row">
      <div class="col-6 row">
          <div class="col-8 offset-2">
            <?php
              
              $current_query = get_queried_object();
              
            ?>
            
            <h1><?php echo $current_query->label; ?></h1>
            
            <p>Description</p>
          </div>
      </div>
  </div>
</section>
-->

<?php
  
  if ( have_posts() ) : 
  
    $archive_items = array();
  
?>

<nav id="archive-filter-wrap" class="navbar navbar-expand-lg navbar-light bg-light">
  
  <button class="navbar-toggler btn rounded-pill d-block d-lg-none mx-auto px-5 py-2 m-3" type="button" data-toggle="collapse" data-target="#archive-filter" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <i class="fas fa-filter"></i> <?php _e ( 'Filter', 'cdc' ); ?>
  </button>
  
  <aside id="archive-filter" class="collapse navbar-collapse">
    <ul class="navbar-nav tabs-nav w-100 justify-content-center">
      <li class="nav-item d-none d-lg-block head px-4 py-5 all-caps"><?php _e ( 'Filter', 'cdc' ); ?></li>

      <li class="nav-item"><a href="<?php echo get_post_type_archive_link ( 'variable' ); ?>" class="nav-link px-4 py-5 all-caps ui-state-active"><?php _e ( 'All', 'cdc' ); ?></a></li>
      
      <?php
        
        $var_types = get_terms ( array (
          'taxonomy' => 'var-type',
          'hide_empty' => false
        ) );
        
        foreach ( $var_types as $var_type ) {
          
      ?>
      
      <li class="nav-item"><a href="<?php echo get_term_link ( $var_type->term_id, 'var-type' ); ?>" class="nav-link px-4 py-5 all-caps"><?php echo $var_type->name; ?></a></li>
      
      <?php
          
        }
        
      ?>
    </ul>
  </aside>
</nav>

<section id="archive-posts" class="page-section container-fluid p-0">
  <?php
    
    while ( have_posts() ) : the_post();
    
      $item = array (
        'id' => get_the_ID(),
        'title' => get_the_title(),
        'permalink' => get_permalink(),
        'post_type' => get_post_type(),
        'content' => get_the_content()
      );

  ?>
  
  <div class="result">
    <?php
      
      include ( locate_template ( 'previews/variable.php' ) );
      
    ?>
  </div>
  
  <?php
    endwhile; 
    ?>  
 

  
<!--
  <div class="pagination row">
    <div class="col-8 offset-2 text-center py-6">
      <p><?php
        
        echo paginate_links ( array (
          'prev_text' => '<i class="fas fa-long-arrow-alt-left"></i>',
          'next_text' => '<i class="fas fa-long-arrow-alt-right"></i>',
        ) );
        
      ?></p>
    </div>
  </div>
-->
  
</section>

<?php
  
  endif;
  
?>

</main>
  
<?php
  
  get_footer();
  
?>