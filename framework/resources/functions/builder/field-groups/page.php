<div class="accordion-item">
	
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Content
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body">
	
			<?php
			
				$page_ID = $globals['current_query']['ID'];
				$body_ID = 'page-' . get_the_slug ( $globals['current_query']['ID'] );
			
			?>
			
			<div class="p-3">
				<?php
				
					$title_placeholder = get_the_title ( $page_ID );
					
					if (
						$globals['current_lang_code'] != 'en' &&
						get_post_meta ( $page_ID, 'title_' . $globals['current_lang_code'], true ) != ''
					) {
						
						$title_placeholder = get_post_meta ( $page_ID, 'title_' . $globals['current_lang_code'], true );
						
					}
					
				?>
				
				<label for="page-form-title" class="form-label">Page Title</label>
				
				<input type="text" id="title" name="title" class="form-control" value="<?php echo $title_placeholder; ?>" placeholder="<?php echo $title_placeholder; ?>">
				
				<?php 
				
					// slug
					
					// current lang
					
					$slug_prefix = site_url() . '/';
					$current_slug = get_the_slug ( $globals['current_query']['ID'] );
					
					if ( $globals['current_lang_code'] != 'en' ) {
					
						$current_slug = get_post_meta ( $globals['current_query']['ID'], 'slug_' . $globals['current_lang_code'], true );
						
						if (
							get_option ( 'options_fw_language_settings_rewrite' ) == 'domain' &&
							$globals['current_lang_obj']['domain'] != ''
						) {
						
							$slug_prefix = $globals['current_lang_obj']['domain'] . '/';
							
						} else {
							
							$slug_prefix .= $globals['current_lang_code'] . '/';
							
						}
						
					}
					
				?>
				
				<label for="page-form-title" class="form-label">Page Slug</label>
				
				<div class="input-group mb-3">
					
					<span class="input-group-text"><?php echo $slug_prefix; ?></span>
					
					<input type="text" class="form-control" name="slug" id="slug" value="<?php echo $current_slug; ?>">
					
				</div>
				
				
			</div>
			
		</div>
	</div>
	
</div>