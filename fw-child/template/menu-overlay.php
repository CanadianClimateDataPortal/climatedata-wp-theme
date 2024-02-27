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
									'item' => '',
									'link' => 'p-3'
								) );
								
							?>
						</div>
						
					</div>
				
				</div>
			</div>
			
			<div id="menu-secondary" class="fw-block-type-menu fw-block">
				<div id="menu-secondary-inner" class=" ">
					
					<div class="fw-menu">
	
						<ul class="fw-menu-list menu-level-1 ps-3 fw-menu-nested"><li class="ps-3 mb-2 fw-menu-item"><a href="https://climatedata2.crim.ca/news/" class="">News</a></li><li class="ps-3 mb-2 fw-menu-item"><a href="https://climatedata2.crim.ca/about/" class="">About</a></li><li class="ps-3 mb-2 fw-menu-item"><a href="https://climatedata2.crim.ca/glossary/" class="">Glossary</a></li></ul>
					
					</div>
				
				</div>
			</div>
			
			<div id="menu-footer" class="ps-3 py-3 bg-gray-200">
				
				<!-- Begin Mailchimp Signup Form -->
				<div id="mc_embed_signup" class="ms-3 pb-3 mb-3 border-bottom border-gray-400">
					<h6 class="all-caps text-body mb-3"><?php _e ( 'Join the newsletter', 'cdc' ); ?></h6>
			
					<form action="https://climatedata.us1.list-manage.com/subscribe/post?u=c52e1be341cba7905716a66b4&amp;id=727cebaf22" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate pe-3" target="_blank" novalidate>
						<div id="mc_embed_signup_scroll">
		
							<label for="mce-EMAIL" class="sr-only">Email Address</label>

							<div class="input-group mc-field-group border pe-3">
								<input type="email" value="" name="EMAIL" class="required email form-control" id="mce-EMAIL" placeholder="<?php _e ( 'Your email address', 'cdc' ); ?>">

								<button type="submit" name="subscribe" id="mc-embedded-subscribe" class="btn btn-gray-400"><i class="fas fa-caret-right"></i></button>
							</div>
	
							<div id="mce-responses" class="clear">
								<div class="response" id="mce-error-response" style="display:none"></div>
								<div class="response" id="mce-success-response" style="display:none"></div>
							</div>
							
							<!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
	
							<div style="position: absolute; left: -5000px;" aria-hidden="true">
								<input type="text" name="b_c52e1be341cba7905716a66b4_727cebaf22" tabindex="-1" value="">
							</div>
						</div>
					</form>
				</div>
				<!--End mc_embed_signup-->

				<div id="" class="d-flex justify-content-between px-3">
					<div>
						<a href="" target="_blank" class="me-2"><i class="fab fa-facebook"></i></a>
						<a href="" target="_blank" class="me-2"><i class="fab fa-twitter"></i></a>
						<a href="" target="_blank" class="me-2"><i class="fab fa-youtube"></i></a>
					</div>
					
					<div id="menu-langs" class="fw-menu pe-3">
	
						<ul class="fw-menu-list menu-level-1 d-flex fw-menu-nested">
							<li class="current-nav-item ms-3 fw-menu-item"><a href="https://climatedata2.crim.ca/" class="current-nav-link ">English</a></li>
							<li class="ms-3 fw-menu-item"><a href="https://donneesclimatiques2.crim.ca/" class="">Français</a></li>
						</ul>
					
					</div>
				</div>
			</div>
			
			<div id="tab-drawer-container" class="tab-drawer-container">
				
				<div id="browse-vars" class="tab-drawer">
					<div class="tab-drawer-content">
						<div class="tab-drawer-content-inner bg-white ps-3 py-3">
							<span class="tab-drawer-close btn-close"></span>
							
							<div id="popular-vars" class="pt-3 mb-3 border-bottom">
								<h6 class="all-caps text-secondary px-3 mb-3"><?php _e ( 'Popular Variables', 'cdc' ); ?></h6>
								
								<ul class="list-unstyled">
									<?php
									
										foreach ( get_field ( 'menu_popvars', 'option' ) as $var_ID ) {
									
									?>
									
									<li class="px-3 py-2">
										<span class="var-title"><?php echo get_the_title ( $var_ID ); ?></span>
										
										<span class="var-links d-flex">
											<a href="/map/?var_id=<?php echo $var_ID; ?>"><?php _e ( 'View on map', 'cdc' ); ?></a>
											
											<a href="/download/?var_id=<?php echo $var_ID; ?>"><?php _e ( 'Download', 'cdc' ); ?></a>
											
											<a href="#"><?php _e ( 'Description', 'cdc' ); ?></a>
										</span>
									</li>
									
									<?php
									
										}
								
									?>
								</ul>
							</div>
							
							<div class="pt-3 mb-3 border-bottom">
								<h6 class="all-caps text-secondary px-3 mb-3"><?php _e ( 'Variables by Sector', 'cdc' ); ?></h6>
								
								<ul class="list-unstyled">
									<?php
									
										$sectors = get_terms ( array (
											'taxonomy' => 'sector',
											'hide_empty' => false
										) );
									
										foreach ( $sectors as $term ) {
									
									?>
									
									<li class="var-title">
										<a href="#" class="d-block px-3 py-2"><?php echo $term->name; ?></a>
									</li>
									
									<?php
									
										}
								
									?>
								</ul>
							</div>
							
							<div class="pt-3 d-flex justify-content-center">
								<a href="<?php echo get_post_type_archive_link ( 'variable' ); ?>" class="btn btn-outline-primary rounded-pill py-2 px-5"><?php _e ( 'All Variables', 'cdc' ); ?></a>
							</div>
							
						</div>
					</div>
				</div>
				
				
			</div>
		</div>
	</div>
</div>