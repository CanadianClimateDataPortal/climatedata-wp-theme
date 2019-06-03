<?php
  
  $sticky = false;
  
  $show_logo = false;
  $show_menu = false;
  
  if ( have_rows ( 'secondary', 'option' ) ) {
    while ( have_rows ( 'secondary', 'option' ) ) {
      the_row();
      
      // STICKY
      
      if ( get_sub_field ( 'sticky' ) == 1 ) {
        $sticky = true;
      }
      
      // LOGO
      
      if ( have_rows ( 'logo' ) ) {
        while ( have_rows ( 'logo' ) ) {
          the_row();
      
          if ( get_sub_field ( 'show' ) != 'none' ) {
            
            $show_logo = true;
            
            if ( get_sub_field ( 'link' ) == 'network' ) {
              $logo_link = network_site_url();
            } else {
              $logo_link = get_bloginfo ( 'url' );
            }
            
            if ( get_sub_field ( 'show' ) == 'logo' ) {
            
              if ( get_sub_field ( 'logo' ) != '' ) {
                $logo_URL = '<img src="' . wp_get_attachment_image_url ( get_sub_field ( 'logo' ), 'full' ) . '" alt="' . get_bloginfo ( 'title' ) . '">';
              } else {
                $logo_URL = get_bloginfo ( 'title' );
              }
              
            } elseif ( get_sub_field ( 'show' ) == 'text' ) {
              
              $logo_URL = get_sub_field ( 'text' );
              
            }
            
          }
          
        }
      }
      
      // MENU TRIGGER
      
      if ( have_rows ( 'menu' ) ) {
        while ( have_rows ( 'menu' ) ) {
          the_row();
          
          if ( get_sub_field ( 'show' ) == 1 ) {
            
            $show_menu = true;
            $menu_trigger_text = get_sub_field ( 'text' );
            
          }
          
        }
        
      }
      
    }
    
  }
  
?>

<nav id="<?php echo $header_prefix; ?>-secondary" class="header-nav secondary">
  
  <div id="<?php echo $header_prefix; ?>-secondary-menu-icon" class="menu-icon menu-trigger">
    <?php
      
      if ( $show_menu == true ) {
        
    ?>
    <a href="#" class=""><span class="icon icon-menu"></span><span class="label"><?php echo $menu_trigger_text; ?></span></a>
    <?php
      
      }
      
    ?>
  </div>
  
  <?php
      
    if ( $show_logo == true ) {
    
  ?>
  
  <div id="<?php echo $header_prefix; ?>-secondary-home-link" class="home-link">
    <a href="<?php echo $logo_link; ?>"><?php echo $logo_URL; ?></a>
  </div>
  
  <?php
    
    }
    
  ?>
  
  
  <?php
    
    if ( $show_menu == true ) {
      
  ?>
  
  
  
  <?php
    
    }
    
    if ( $show_logo == true ) {
      
  ?>
  
  
  
  <?php
    
    }
    
  ?>
  
  <div id="<?php echo $header_prefix; ?>-lang" class="header-lang">
    <?php
      
      if ( function_exists( 'pll_the_languages' ) ) {
        
    ?>
    
    <ul>
      <?php
        
        pll_the_languages( array (
          'display_names_as' => 'slug'
        ) );
        
      ?>
    </ul>
    
    <?php
      
      }
      
    ?>
  </div>
  
  <?php 
    
    wp_nav_menu ( array (
      'theme_location' => 'secondary',
      'container_id' => $header_prefix . '-secondary-menu',
      'container_class' => 'menu-container'
    ) );
    
  ?>
  
  <div id="<?php echo $header_prefix; ?>-search" class="header-search">
    <?php
    
      get_search_form();
    
    ?>
  </div>
</nav>