<?php
  
  $menu_items = array();
  $menu = array();
  $element_class = array();
  
  if ( get_sub_field ( 'class' ) != '' ) {
    $element_class = array_merge ($element_class, explode ( ' ', get_sub_field ( 'class' ) ) );
  }
  
  if ( get_sub_field ( 'type' ) == 'wp' ) {
    
    // WP MENU
    
    $menu_items = wp_get_nav_menu_items ( get_sub_field ( 'menu' ) );
    
    foreach ( $menu_items as $item ) {
      
      $item_ID = $item->ID;
      $parent_ID = $item->menu_item_parent;
      
      $new_item = array (
        'type' => $item->object,
        'url' => $item->url,
        'text' => $item->title,
        'class' => implode ( ' ', $item->classes ),
        'target' => 'same'
      );
      
      if ( get_sub_field ( 'text' ) != '' ) {
        $new_item['text'] = get_sub_field ( 'text' );
      }
      
      switch ( $item->object ) {
        
        case 'post' :
        case 'page' :
        
          $new_item['post'] = $item->object_id;
        
          break;
        
        case 'custom' :
        
          break;
        
      }
      
      if ( $item->menu_item_parent != 0 ) {
        
        $menu[$item->menu_item_parent]['children'][] = $new_item;
        
      } else {
        
        $menu[$item->ID] = $new_item;
        
      }
      
    }
    
  } elseif ( get_sub_field ( 'type' ) == 'manual' ) {
    
    $element_class[] = 'navbar-nav';
    $element_class[] = 'mr-auto';
    
    // ACF FIELDS
    
    if ( have_rows ( 'items' ) ) {
    
      $i = 0;
      $item_num = 0;
      $children = array();
      
      while ( have_rows ( 'items' ) ) {
        the_row();
        
        // create the new item array
        
        $new_item = array (
          'type' => get_sub_field ( 'type' )
        );
        
        if ( get_sub_field ( 'type' ) != 'divider' ) {
          
          $new_item['url'] = get_sub_field ( 'url' );
          $new_item['text'] = get_sub_field ( 'text' );
          $new_item['class'] = get_sub_field ( 'class' );
          $new_item['target'] = get_sub_field ( 'target' );
          
          if ( get_sub_field ( 'type' ) == 'post' ) {
            
            if ( get_sub_field ( 'text' ) == '') {
              $new_item['text'] = get_the_title ( get_sub_field ( 'post' ) );
            }
            
            $new_item['url'] = get_permalink ( get_sub_field ( 'post' ) );
            
          }
          
        }
        
        // if the item is a parent
        
        if ( get_sub_field ( 'hierarchy' ) == 'parent' ) {
          
          // add it to the array
          
          $menu[$item_num] = $new_item;
          
          // if the children array is not empty
          
          if ( !empty ( $children ) ) {
            
            // take whatever's currently in the children array and add it to the previous parent
            $menu[$item_num - 1]['children'] = $children;
          
            // reset the children array
            $children = array();
            
          }
          
          $item_num++;
          
        } elseif ( get_sub_field ( 'hierarchy' ) == 'child' ) {
          
          $children[] = $new_item;
          
        }
        
        $i++;
        
      }
    }
    
  }
  
?>

  <ul class="<?php echo implode ( ' ', $element_class ); ?>">
  
    <?php
      
      $i = 0;
      
      foreach ( $menu as $item ) {
        
        $item_class = array ( 'nav-item' );
        $link_class = array ( 'nav-link' );
        $link_atts = '';

        if (isset($item['class'])) {
            $link_class = array_merge($link_class, explode(' ', $item['class']));
        }
        
        if ( $item['type'] == 'divider' ) {
          
    ?>
    
    <li class="divider">|</li>
    
    <?php
      
        } else {
            
          $link_ID = $section_ID . '-link-' . $i;
          
          if ( isset ( $item['children'] ) ) {
            
            $item_class[] = 'dropdown';

          }
          
    ?>
    
    <li class="<?php echo implode ( ' ', $item_class ); ?>">
      <?php
        
        if ( isset ( $item['children'] ) ) {
          
      ?>
      
      <span class="btn">
        <a href="<?php echo $item['url']; ?>" id="<?php echo $link_ID; ?>" class="<?php echo implode ( ' ', $link_class ); ?>" <?php echo $link_atts; ?>><?php echo $item['text']; ?></a>
      </span>
      
      <button class="btn dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
      
      <div class="dropdown-menu">
        
        <?php
          
          foreach ( $item['children'] as $child ) {
            
            if ( $child['type'] == 'divider' ) {
              
        ?>
        
        <div class="dropdown-divider"></div>
        
        <?php
          
            } else {
              
        ?>
        
        <a class="dropdown-item" href="<?php echo $child['url']; ?>"><?php echo $child['text']; ?></a>
        
        <?php
          
            }
          }
          
        ?>    
      </div>
      
      <?php
        
        } else {
          
      ?>
      
      <a href="<?php echo $item['url']; ?>" id="<?php echo $link_ID; ?>" class="<?php echo implode ( ' ', $link_class ); ?>"><?php echo $item['text']; ?></a>
      
      <?php
          
        }
        
      ?>
    </li>
    
    <?php
      
        } // if
        
        $i++;
        
      } // for
      
    ?>
    
  </ul>
  