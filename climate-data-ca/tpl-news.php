<?php

  /*

    Template Name: News

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // QUERY
  //
  
  $init_tag = null;
  
  if ( isset ( $_GET['t'] ) && !empty ( $_GET['t'] ) ) {
    
    $init_tag = (int) $_GET['t'];
    
  }

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<main>

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>
    
  <div id="news-main">
    <div id="news-header" class="bg-light">
    
      <div class="container">
        <div class="row">
              
          <div class="col-8 d-flex align-items-center py-4">
            <h6 class="mb-0 mr-4 text-uppercase"><?php _e ( 'Popular topics', 'cdc' ); ?></h6>
            
            <div id="popular-tags">
              <?php
              
                $popular_tags = get_field ( 'news_popular' );
                
                if ( !empty ( $popular_tags ) ) {
                  foreach ( $popular_tags as $tag ) {
                    
                    $this_tag = get_term ( $tag );
                    
              ?>
              
              <span class="tag-filter-item btn rounded-pill py-1 px-4 mr-2 <?php echo ( $this_tag->term_id == $init_tag ) ? 'selected' : ''; ?>" data-tag="<?php echo $this_tag->term_id; ?>"><i class="fas fa-times mr-3"></i><?php
              
                echo $this_tag->name;
                
              ?></span>
              
              <?php
                    
                  }
                }
                
              ?>
            </div>
          </div>
          
          <div id="news-header-actions" class="col-4 d-flex justify-content-end text-uppercase">
          
            <a id="all-tags-btn" class="d-flex align-items-center p-4 text-uppercase" data-toggle="collapse" href="#all-tags" role="button" aria-expanded="false" aria-controls="all-tags">
              <span><?php _e ( 'All topics', 'cdc' ); ?></span>
              <i class="fas fa-caret-down ml-3"></i>
            </a>
            
            <div id="news-clear" class="d-flex align-items-center p-4 disabled">
              <i class="fas fa-redo mr-3"></i>
              <?php _e ( 'Clear filters', 'cdc' ); ?>
            </div>
            
          </div>
          
        </div>
      </div>
      
      <div id="all-tags" class="collapse">
        <div class="bg-light py-5">
          <div class="container">
            <div class="row pt-5 border-top">
              <?php
              
                $all_tags = get_terms ( array (
                  'hide_empty' => false,
                  'taxonomy' => 'post_tag'
                ) );
                
                if ( !empty ( $all_tags ) ) {
                  
                  foreach ( $all_tags as $tag ) {
                    
              ?>
              
              <div class="tag-filter-item col-12 col-sm-6 col-md-4 col-lg-3 mb-2 <?php echo ( $tag->term_id == $init_tag ) ? 'selected' : ''; ?>" data-tag="<?php echo $tag->term_id; ?>"><i class="fas fa-times mr-3"></i><?php echo $tag->name; ?></div>
              
              <?php
                    
                  }
                }
              
              ?>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  
    <section id="news-body" class="page-section bg-white py-5">
  
      <div class="container">
        <div id="news-posts" class="row">
          
        </div>
      </div>
  
    </section>
    
  </div>
</main>

<div id="news-footer" class="bg-light text-uppercase">

  <div class="container">
    <div class="row">
          
      <div id="news-pagination" class="col-9 d-flex align-items-center py-5" data-page="1">
        <span class="pagination-btn previous disabled"><i class="fas fa-caret-left mr-3"></i><?php _e ( 'Previous', 'cdc' ); ?></span>
        
        <div id="page-num" class="mx-5">
          <?php
          
            printf ( __ ( 'Page %s of %s' , 'cdc' ), '<span id="page-num-current">1</span>', '<span id="page-num-total">1</span>' );
          
          ?>
        </div>
        
        <span class="pagination-btn next"><?php _e ( 'Next', 'cdc' ); ?><i class="fas fa-caret-right ml-3"></i></span>
      </div>
      
    </div>
  </div>
  
</div>

<?php

  endwhile; endif;

  get_footer();

?>
