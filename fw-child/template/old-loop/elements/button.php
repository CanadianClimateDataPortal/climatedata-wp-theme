<?php
  
  $show_btn = true;
  
  if ( !isset ( $button ) )
    $button = array();
  
  if ( !isset ( $button['href'] ) )
    $button['href'] = '#';
  
  if ( !isset ( $button['text'] ) )
    $button['text'] = 'Learn more';
  
  if ( !isset ( $button['target'] ) )
    $button['target'] = '';
  
  if ( !isset ( $button['class'] ) ) {
    $button['class'] = array ( 'btn', 'rounded-pill', 'all-caps' );
  }
  
  switch ( get_sub_field ( 'type' ) ) {
    
    case 'none' :
    
      $show_btn = false;
      break;
      
    case 'next' :
    
      $button['class'][] = 'next-section';
      break;
    
    case 'post' :
    case 'page' :
    
      if ( get_sub_field ( get_sub_field ( 'type' ) ) != '' ) {
        $button['href'] = get_permalink ( get_sub_field ( get_sub_field ( 'type' ) ) );
        $button['text'] = get_the_title ( get_sub_field ( get_sub_field ( 'type' ) ) );
      }
      
      break;
      
    case 'url' :
    
      $button['href'] = get_sub_field ( 'url' );
      $button['text'] = get_sub_field ( 'text' );
      $button['target'] = '_blank';
      
      break;
      
    default :
    
      $show_btn = false;
      
      break;
    
  }
  
  if ( get_sub_field ( 'text' ) != '' ) {
    $button['text'] = get_sub_field ( 'text' );
  }
  
  if ( have_rows ( 'icon' ) ) {
    while ( have_rows ( 'icon' ) ) {
      the_row();
      
      if ( get_sub_field ( 'icon' ) != 'none' ) {
        
        $button['class'][] = 'has-icon';
        
        $button['icon'] = '<span class="icon ' . get_sub_field ( 'icon' ) . '"></span>';
      
        if ( get_sub_field ( 'placement' ) == 'before' ) {
          $button['class'][] = 'icon-before';
          $button['text'] = $button['icon'] . $button['text'];
        } elseif ( get_sub_field ( 'placement' ) == 'after' ) {
          $button['class'][] = 'icon-after';
          $button['text'] .= $button['icon'];
        }
        
      }
      
    }
  }
  
  switch ( get_sub_field ( 'style' ) ) {
    case 'outline' : 
      $button['class'][] = 'btn-outline-' . get_sub_field ( 'colour' );
      break;
      
    case 'large' :
      $button['class'][] = 'btn-lg btn-' . get_sub_field ( 'colour' );
      break;
      
    default :
      $button['class'][] = 'btn-' . get_sub_field ( 'colour' );
  }
  
  if ( $show_btn == true ) {
    
    echo '<a href="' . $button['href'] . '"';
    
    echo ( $button['target'] != '' ) ? ' target="' . $button['target'] . '"' : '';
    
    echo ' class="' . implode ( ' ', $button['class'] ) . '"';
    
    echo '>' . $button['text'] . '</a>';
    
  }