<?php

$menu = array();

$menu_items = array();

$top_parent = get_top_parent ( $globals['current_query']['ID'] );
$build_menu_top = $top_parent;

// get children

$all_children = get_page_children ( $top_parent, get_pages ( array (
    'post_type' => 'page',
    'post_status' => array ( 'publish' ),
    'sort_column' => 'menu_order',
    'sort_order' => 'asc'
) ) );

if ( !empty ( $all_children ) ) {

    foreach ( $all_children as $item ) {

        $menu_items[] = array (
            'id' => $item->ID,
            'type' => $item->post_type,
            'url' => get_permalink ( $item->ID ),
            'title' => get_the_title ( $item->ID ),
            'parent' => $item->post_parent
        );
    }

    $menu = fw_build_menu ( $menu_items, $build_menu_top, 1 );

}

?>

<div class="climatedata-menu">
	<?php
        function climatedata_aside_menu( $menu_structure, $is_submenu ) {
            echo '<ul class="climatedata-menu-list';

            if ( $is_submenu ) {
                echo ' submenu';
            }

            echo '">';

            foreach ( $menu_structure as $item ) {

                echo '<li class="';

                if (
                    isset ( $GLOBALS['vars']['current_url'] ) &&
                    $GLOBALS['vars']['current_url'] == $item['url']
                ) {
                    echo 'current-nav-item ';
                }

                // if the page is an ancestor of the current ID

                if (
                    isset ( $GLOBALS['vars']['current_ancestors'] ) &&
                    in_array ( $item['id'], $GLOBALS['vars']['current_ancestors'] )
                ) {
                    echo 'ancestor-nav-item ';
                }

                if ( isset ( $item['children'] ) ) {
                    echo 'has-children ';
                }

                echo 'climatedata-menu-item">';

                if ( isset ( $item['children'] ) ) {
                    echo '<div class="climatedata-collapsible-item">';
                }

                echo '<a href="' . $item['url'] . '"';

                if ( isset ( $item['target'] ) && $item['target'] == 'blank' ) {
                    echo ' target="_blank"';
                }

                echo ' class="';

                if (
                    isset ( $GLOBALS['vars']['current_url'] ) &&
                    $GLOBALS['vars']['current_url'] == $item['url']
                ) {
                    echo 'current-nav-link ';
                }

                if ( isset ( $item['classes'] ) && is_array ( $item['classes'] ) ) echo ' ' . implode ( ' ', $item['classes'] );

                echo '">';

                if ( isset ( $item['icon'] ) && $item['icon'] != '' ) {
                    echo '<i class="icon ' . $item['icon'] . ' mr-3"></i>';
                }

                echo $item['title'] . '</a>';

                if ( isset ( $item['children'] ) ) {

                    echo '<button class="climatedata-expand fa-solid fa-caret-down"></button>';
                    echo '</div>';
                    climatedata_aside_menu ( $item['children'], TRUE );

                }

                echo '</li>';

            }

            echo '</ul>';
        }

        climatedata_aside_menu( $menu, FALSE );

    ?>

</div>
