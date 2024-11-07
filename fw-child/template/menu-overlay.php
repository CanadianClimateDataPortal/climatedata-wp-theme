<div id="menu" class="offcanvas-start offcanvas bg-light" data-bs-scroll="false" data-bs-backdrop="true">
	
	<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>

	<div class="d-flex flex-column h-100">
		<div id="menu-header" class="row align-items-center">
			<div id="" class="fw-block-type-image fw-block col-1-of-4 p-3">
				<div id="" class="">
					<a href="<?php echo home_url(); ?>"><?php
					
						echo file_get_contents ( locate_template ( 'resources/img/climate-data-ca.svg' ) );
						
					?></a>
				</div>
			</div>
			
			<div id="" class="fw-block-type-text fw-block col">
				<div id="" class=""><p><?php _e ( 'Climate Data', 'cdc' ); ?></p></div>
			</div>
		</div>
				
		<div id="menu-tabs" class="flex-grow-1 d-flex flex-column tab-drawer-tabs-container overflow-auto">
			
			<div id="menu-primary" class="fw-block-type-menu fw-block flex-grow-1">
				<div id="menu-primary-inner" class=" ">
					
					<div class="tab-drawer-tabs w-100 pt-2">
					
						<?php 
						
							$nav_items = wp_get_nav_menu_items ( 'Primary Navigation' );
							
							$menu_items = array();
							
							foreach ( $nav_items as &$item ) {
							
								$menu_items[] = array (
									'id' => $item->ID,
									'type' => $item->type,
									'url' => $item->url,
									'title' => $item->title,
									'classes' => $item->classes,
									'parent' => $item->menu_item_parent
								);
							
							}
							
							$menu = fw_build_menu ( $menu_items, 0, 1 );
							
						?>
						
						<div class="fw-menu">
							<?php
							
								fw_menu_output ( $menu, 1, 'list', array (
									'menu' => 'ps-3',
									'item' => '',
									'link' => 'p-3'
								) );
								
							?>
						</div>
						
					</div>
				
				</div>
			</div>
			
			<div id="menu-secondary" class="fw-block-type-menu fw-block mb-2">
				<div id="menu-secondary-inner" class=" ">
					
					<?php 
					
						$nav_items = wp_get_nav_menu_items ( 'Secondary Navigation' );
						
						// dumpit ( $nav_items );
						
						$menu_items = array();
						
						foreach ( $nav_items as &$item ) {
						
							$menu_items[] = array (
								'id' => $item->ID,
								'type' => $item->type,
								'url' => $item->url,
								'title' => $item->title,
								'classes' => $item->classes,
								'parent' => $item->menu_item_parent
							);
						
						}
						
						$menu = fw_build_menu ( $menu_items, 0, 1 );
						
					?>
					
					<div class="fw-menu">
						<?php
						
							fw_menu_output ( $menu, 1, 'list', array (
								'menu' => 'ps-3',
								'item' => 'ps-3 mb-2',
								'link' => ''
							) );
							
						?>
					</div>
				
				</div>
			</div>
			
			<div id="menu-footer" class="ps-3 py-3 bg-gray-200">
					
				<div class="ms-3 me-5 pb-3 mb-3 border-bottom border-gray-400">
					<h6 class="all-caps text-body mb-3"><?php _e ( 'Join the newsletter', 'cdc' ); ?></h6>
					<div class="pe-3">
					<?php include ( locate_template ( 'template/newsletter-signup.php' ) ); ?>
					</div>
				</div>

				<div id="" class="d-flex justify-content-between px-3">
					<div>
						<a href="https://www.linkedin.com/company/climate-data-canada/" target="_blank" class="text-secondary me-2" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
						
						<a href="https://twitter.com/ClimateData_ca" target="_blank" class="text-secondary me-2" title="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
						
						<a href="https://www.facebook.com/ClimateData.ca.Donneesclimatiques.ca" target="_blank" class="text-secondary me-2" title="Facebook"><i class="fab fa-facebook"></i></a>
						
						<a href="https://www.instagram.com/climatedata.ca/" target="_blank" class="text-secondary me-2" title="Instagram"><i class="fab fa-instagram"></i></a>
						
						<a href="https://soundcloud.com/climate-data-canada" target="_blank" class="text-secondary" title="SoundCloud"><i class="fab fa-soundcloud"></i></a>
						
						
					</div>
					
					<div id="menu-langs" class="fw-menu pe-3">
						
						<?php
						
							$menu = array();
							
							foreach ( get_field ( 'fw_languages', 'option' ) as $lang ) {

								if ( is_404() ) {
									$home_post_id = get_option( 'page_on_front' );
									$lang_URL = translate_permalink( $GLOBALS['vars']['home_url'], $home_post_id, $lang['code'] );
								} else {
									$lang_URL = translate_permalink ( $GLOBALS['vars']['current_url'], $GLOBALS['fw']['current_query']['ID'], $lang['code'] );
								}

								$lang_title = $lang['name'];
								
								$menu[] = array(
									'id' => $GLOBALS['fw']['current_query']['ID'],
									'type' => get_post_type ( $GLOBALS['fw']['current_query']['ID'] ),
									'url' => trailingslashit ( $lang_URL ),
									'title' => $lang_title,
									'classes' => array(),
									'parent' => 0
								);
								
							}
							
							fw_menu_output ( $menu, 1, 'list', array (
								'menu' => 'd-flex',
								'item' => 'ms-3',
								'link' => ''
							) );
							
						?>
					
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
