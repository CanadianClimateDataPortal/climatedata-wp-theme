<div class="modal-header">
	<h4 class="modal-title">Page Settings</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<button type="button" class="btn btn-primary fw-page-settings-submit">Save</button>
	</div>
</div>

<div class="modal-body p-0">
	
	<form>
		
		<div class="p-3">
	
			<?php
			
				$page_ID = $globals['current_query']['ID'];
				$lang = $globals['current_lang_code'];
				
				$body_ID = 'page-' . get_the_slug ( $globals['current_query']['ID'] );
			
				$title_placeholder = get_the_title ( $page_ID );
				
				if (
					$lang != 'en' &&
					get_post_meta ( $page_ID, 'title_' . $lang, true ) != ''
				) {
					
					$title_placeholder = get_post_meta ( $page_ID, 'title_' . $lang, true );
					
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
				
				<input type="text" class="form-control" name="slug" id="slug" value="<?php echo $current_slug; ?>" placeholder="<?php echo $current_slug; ?>">
				
			</div>
		</div>
		
		<?php
		
			include ( locate_template ( 'resources/functions/builder/field-groups/settings/classes.php' ) );
		
		?>
			
		
	</form>
	
</div>