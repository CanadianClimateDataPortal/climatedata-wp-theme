<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Data Options</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				<a href="#data-variable" class="tab-drawer-trigger">Variable</a>
			</div>
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<div id="data-variable" class="tab-drawer">
			<div class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Select a new variable</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
					
					<div class="control-tab-body">
						<ul>
							<?php
							
								$all_vars = get_posts ( array (
									'post_type' => 'variable',
									'posts_per_page' => -1,
									
								) );
								
								if ( !empty ( $all_vars ) ) {
									
									foreach ( $all_vars as $var_post ) {
										
										$this_ID = $var_post->ID;
										
							?>
							
							<li><span class="tab-drawer-close"><?php echo get_the_title ( $this_ID ); ?></span></li>
							
							<?php
										
									}
								}
								
							?>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>