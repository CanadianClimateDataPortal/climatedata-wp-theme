<?php

//
// Code adapted from parent theme menu
// framework/resources/functions/builder/front-end/block/navigation/menu.php
//

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

<div class="hierarchical-menu">
	<?php
        /**
         * Displays the menu hierarchy and makes it collapsible.
         *
         * @param array $menu_structure The entire menu structure generated.
         * @param boolean $is_submenu Defines whether the current tree is a
         *                            submenu or not.
         * @param int $submenu_id Optional. Ordinal to create unique ID for
         *                        submenu. Default: NULL.
         * @param boolean $in_active_trail Optional. Defines if the current
         *                                 menu is part of the active trail.
         *                                 Default: NULL.
         */
        function cdc_hierarchical_menu( $menu_structure, $is_submenu, $submenu_id = NULL, $in_active_trail = NULL ) {
            if ( is_null( $submenu_id ) ) {
                $submenu_id = 0;
            }

            echo '<ul';

            if ( ! empty( $submenu_id ) ) {
                echo ' id="hierarchical-submenu-' . $submenu_id . '"';
            }

            echo ' class="hierarchical-menu-list';

            if ( $is_submenu ) {
                echo ' submenu collapse';

                if ( $in_active_trail ) {
                    echo ' show';
                }
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

                if ( in_array ( $item['id'], get_post_ancestors( get_the_ID() ) ) ) {
                    echo 'in-active-trail ';
                }

                if ( isset ( $item['children'] ) ) {
                    echo 'has-children ';
                }

                echo 'menu-item">';

                if ( isset ( $item['children'] ) ) {
                    echo '<div class="collapsible-item">';
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

                    $submenu_id++;
                    $in_active_trail = false;
                    if ( in_array ( $item['id'], get_post_ancestors( get_the_ID() ) ) ) {
                        $in_active_trail = true;
                    }
                    echo '<button class="button-expand fa-solid fa-chevron-down" data-bs-toggle="collapse" data-bs-target="#hierarchical-submenu-' . $submenu_id . '" ';
                    if ( $in_active_trail ) {
                        echo 'aria-expanded="true"';
                    } else {
                        echo 'aria-expanded="false"';
                    }
                    echo '></button>';
                    echo '</div>';
                    cdc_hierarchical_menu ( $item['children'], true, $submenu_id, $in_active_trail );

                }

                echo '</li>';

            }

            echo '</ul>';
        }

        cdc_hierarchical_menu( $menu, false );

    ?>

</div>
