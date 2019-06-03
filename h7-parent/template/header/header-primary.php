<?php
  
  $sticky = false;
  
  $show_logo = false;
  $show_menu = false;
  
  if ( have_rows ( 'primary', 'option' ) ) {
    while ( have_rows ( 'primary', 'option' ) ) {
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
                
                $logo_file = file_info ( get_sub_field ( 'logo' ) );
                
                if ( $logo_file['extension'] == 'svg' ) {
                  
                  $logo_URL = file_get_contents ( $logo_file['url'] );
                  
                } else {
                  
                  $logo_URL = '<img src="' . wp_get_attachment_image_url ( get_sub_field ( 'logo' ), 'full' ) . '" alt="' . get_bloginfo ( 'title' ) . '">';
                  
                }
                
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

<nav id="<?php echo $header_prefix; ?>-primary" class="header-nav primary <?php echo ( $sticky == true ) ? 'sticky' : ''; ?>">
  
  <div id="<?php echo $header_prefix; ?>-primary-menu-icon" class="menu-icon menu-trigger">
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
  <div id="<?php echo $header_prefix; ?>-primary-home-link" class="home-link">
    <a href="<?php echo $logo_link; ?>"><?php echo $logo_URL; ?></a>
  </div>
  
  <?php
    
    }
    
  ?>
  
  <?php
    
    wp_nav_menu ( array (
      'theme_location' => 'primary',
      'container_id' => $header_prefix . '-primary-menu',
      'container_class' => 'menu-container'
    ) );
    
  ?>
  
  <div id="<?php echo $header_prefix; ?>-social">
    <div id="social-share" class="social-menu">
      <div id="share" class="share">
        <span class="icon icon-share"></span><span class="label">Share</span>
      </div>
    </div>
  </div>
</nav>