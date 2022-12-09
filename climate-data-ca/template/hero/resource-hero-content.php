<?php
    
    $hero_content_class = 'col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1';
    
    if ( get_field ( 'asset_type' ) == 'video' ) $hero_content_class = 'col-10 offset-1';
    
?>

<div id="hero-asset-type-<?php echo get_field ( 'asset_type' ); ?>" class="<?php echo $hero_content_class; ?>">
    <?php
        
        $training_page = filtered_ID_by_path ( 'learn' );
            
    ?>
    
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $training_page ); ?>"><?php echo get_the_title ( $training_page ); ?></a></li>
            
            <?php
                
                $post_cat = get_the_terms ( get_the_ID(), 'resource-category' );
                
                $post_cat = $post_cat[0];
                    
            ?>
        
            <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $training_page ) . '#' . $post_cat->slug; ?>" class=""><?php 
                
                echo $post_cat->name; 
                
                if ( get_field ( 'module_title', 'resource-category_' . $post_cat->term_id ) != '' ) {
                    echo ': ' . get_field ( 'module_title', 'resource-category_' . $post_cat->term_id );
                }
                
            ?></a></li>
            
        </ol>
    </nav>
    
    <?php
        
        
    ?>
    
    <h1><?php
        
        if ( $hero_fields['title'] != '' ) {
            echo $hero_fields['title'];
        } else {
            the_title();
        }
        
    ?></h1>
    
    <?php
        
        if ( 
            get_field ( 'asset_type' ) == 'video' &&
            get_field ( 'asset_video' ) != ''
        ) {
            
    ?>
    
    <div id="asset-video">
        <?php echo wp_oembed_get ( 'http://vimeo.com/' . get_field ( 'asset_video' ) ); ?>
    </div>
    
    <?php
            
        } else {
            
            echo apply_filters ( 'the_content', custom_excerpt ( get_the_ID(), 999 ) );
            
    ?>
    
    <div id="hero-btns" class="d-flex align-items-center">
        <?php
        
            if ( get_field ( 'asset_time' ) != '' ) {
                
        ?>
        
        <div id="hero-asset-time" class="asset-time d-flex align-items-center mr-5">
            <h6 class="mb-0 all-caps"><?php _e ( 'Time to completion', 'cdc' ); ?></h6>
            <span class="border border-secondary text-white rounded-pill ml-4 py-2 px-4"><?php echo get_field ( 'asset_time' ); ?> min</span>
        </div>
        
        <?php
            
            }
            
        ?>
    
        <div id="hero-tts" class="d-flex align-items-center">
            
            <h6 class="mb-0 all-caps">Speak</h6>
            
            <div class="btn-group ml-4" role="group">
              <button id="tts-speak" type="button" class="tts-btn btn btn-outline-secondary">
                  <i class="fas fa-play"></i>
                  <span class="text-white"><?php _e ( 'Play', 'cdc' ); ?></span>
              </button>
              
              <button id="tts-pause" type="button" class="tts-btn btn btn-outline-secondary disabled">
                  <i class="fas fa-pause"></i>
                  <span class="text-white"><?php _e ( 'Pause', 'cdc' ); ?></span>
              </button>
            </div>
            
            <!-- <div id="speak-btn" class="tts-btn btn btn-outline-secondary rounded-pill text-white ml-4 py-2 px-4">
                <i class="fas fa-play"></i>
                <span><?php _e ( 'Play', 'cdc' ); ?></span>
            </div>
            
            <div id="pause-btn" class="tts-btn btn btn-outline-secondary rounded-pill text-white ml-4 py-2 px-4">
                <i class="fas fa-play"></i>
                <span><?php _e ( 'Pause', 'cdc' ); ?></span>
            </div> -->
            
            <!-- <div id="restart-btn" class="tts-btn btn btn-outline-secondary rounded-pill text-white ml-4 py-2 px-4" style="display: none;">
                <i class="fas fa-redo fa-flip-horizontal"></i>
                <span><?php _e ( 'Restart', 'cdc' ); ?></span>
            </div> -->
            
        </div>
        
    </div>
    
    <?php
    
        }
    
    ?>
</div>