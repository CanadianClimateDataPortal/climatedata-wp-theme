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
				$lang = $globals['current_lang_code'];
				
				$body_ID = 'page-' . get_the_slug ( $globals['current_query']['ID'] );
			
			?>
			
			<div class="p-3">
				<?php
				
					$title_placeholder = get_the_title ( $page_ID );
					
					if (
						$lang != 'en' &&
						get_post_meta ( $page_ID, 'title_' . $lang, true ) != ''
					) {
						
						$title_placeholder = get_post_meta ( $page_ID, 'title_' . $lang, true );
						
					}
					
				?>
				
				<label for="page-form-title" class="form-label">Page Title</label>
				
				<input type="text" id="page-form-title" name="inputs-title-<?php echo $lang; ?>" class="form-control" value="<?php echo $title_placeholder; ?>">
				
			
				
				<!-- <div class="col">
					
					<label for="page-form-id" class="form-label">Body ID</label>
					
					<div class="input-group">
						<span class="input-group-text">#</span>
						<input type="text" id="page-form-id" name="inputs-id" class="form-control" placeholder="<?php echo $body_ID; ?>">
					</div>
					
				</div>
				
				<div class="col">
					
					<label for="page-form-classes" class="form-label">Body Classes</label>
					
					<input type="text" id="page-form-classes" name="inputs-class" class="form-control">
					
				</div> -->
				
			</div>
			
		</div>
	</div>
	
</div>