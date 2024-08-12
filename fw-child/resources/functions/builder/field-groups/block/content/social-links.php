<?php
/**
 * Content for the "Add social links" block edit.
 */

$lang = $_GET[ 'globals' ][ 'current_lang_code' ];

?>

<div class="accordion-item">
	<h2 class="accordion-header" id="element-form-head-content">
		<button
			class="accordion-button"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#element-form-content"
			aria-expanded="true"
			aria-controls="element-form-content"
		>
			Social links list
		</button>
	</h2>

	<div
		id="element-form-content"
		class="accordion-collapse collapse show"
		aria-labelledby="element-form-head-content"
		data-bs-parent="#element-form"
	>
		<div class="accordion-body p-3">
			<div class="fw-form-repeater-container">
				<div class="small p-2">
					<strong>Note:</strong> The <em>list</em> of networks is
					common to all languages, but the <em>URL</em> of each link
					can be redefined per language. To hide a network in only
					one language, leave the URL empty.
				</div>

				<div class="row border-bottom p-2 fw-form-repeater-head modal-label-sm">
					<div class="col">Link URL</div>
					<div class="col">Network</div>
					<div class="col-1"></div>
				</div>

				<div class="fw-form-repeater p-2 border-bottom" data-key="links" data-rows="1">
					<div class="fw-form-repeater-row row my-1" data-row-index="0">

						<div class="col pe-3">
							<input
								type="text"
								class="form-control"
								name="inputs-links-rows[]-url-<?php echo $lang; ?>"
								id="inputs-links-rows[]-url-<?php echo $lang; ?>"
							>
						</div>

						<div class="col pe-3">
							<select class="form-select" name="inputs-links-rows[]-network" id="inputs-links-rows[]-network">
								<option value="linkedin">LinkedIn</option>
								<option value="x-twitter">X (Twitter)</option>
								<option value="facebook">Facebook</option>
								<option value="instagram">Instagram</option>
								<option value="soundcloud">SoundCloud</option>
							</select>
						</div>

						<div class="col-1 d-flex align-items-end justify-content-center">
							<div class="fw-form-repeater-delete-row btn btn-sm btn-outline-danger">Delete</div>
						</div>

						<input type="hidden" id="inputs-links-rows[]-index" name="inputs-links-rows[]-index" value="0">

					</div>

				</div>

				<div class="d-flex justify-content-end p-2">
					<div class="fw-form-repeater-add-row btn btn-sm btn-outline-primary">+ Add row</div>
				</div>

			</div>

			<div class="form-check form-check-inline">
				<input class="form-check-input" type="checkbox" value="true" name="inputs-show_name" id="inputs-show_name">
				<label class="form-check-label" for="inputs-show_name">Show network names</label>
			</div>

		</div>
	</div>
</div>
