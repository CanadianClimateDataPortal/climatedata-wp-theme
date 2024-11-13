<?php
$lang = 'en';

if ( isset ( $globals['current_lang_code'] ) ) {
	$lang = $globals['current_lang_code'];
}
?>

<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-content" aria-expanded="true" aria-controls="element-form-content">
			Text
		</button>
	</h2>
	
	<div id="element-form-content" class="accordion-collapse collapse show" aria-labelledby="element-form-head-content" data-bs-parent="#element-form">
		<div class="accordion-body p-3">
	
			<div class="fw-text-editor row">
				<div class="col">
					<textarea
						id="<?php echo 'inputs-text-' . $_GET['globals']['current_lang_code'] ?>"
						name="inputs-text-<?php echo $lang ?>"
						style="opacity: 0;"
						rows="15"
					></textarea>
				</div>
			</div>
			
		</div>
	</div>
</div>
