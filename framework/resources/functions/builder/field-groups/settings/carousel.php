<div class="fw-form-flex-item settings-form settings-form-background card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Carousel</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
		
		<input type="hidden" id="inputs-settings[]-carousel-type" name="inputs-settings[]-carousel-type" value="carousel">
		
		<div class="row row-cols-6 border-bottom">
			
			<div class="col w-100 p-2 pb-0">
				<h6 class="mb-0">Slides per view</h6>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-xs" class="form-label modal-label-sm">Default</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-xs" name="inputs-settings[]-carousel-slidesPerView-xs">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-sm" class="form-label modal-label-sm">Small</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-sm" name="inputs-settings[]-carousel-slidesPerView-sm">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-md" class="form-label modal-label-sm">Medium</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-md" name="inputs-settings[]-carousel-slidesPerView-md">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-lg" class="form-label modal-label-sm">Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-lg" name="inputs-settings[]-carousel-slidesPerView-lg">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-xl" class="form-label modal-label-sm">X-Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-xl" name="inputs-settings[]-carousel-slidesPerView-xl">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerView-xxl" class="form-label modal-label-sm">XX-Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerView-xxl" name="inputs-settings[]-carousel-slidesPerView-xxl">
			</div>
			
		</div>
		
		<div class="row row-cols-6 border-bottom">
			
			<div class="col w-100 p-2 pb-0">
				<h6 class="mb-0">Slides per group</h6>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-xs" class="form-label modal-label-sm">Default (X-Small)</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-xs" name="inputs-settings[]-carousel-slidesPerGroup-xs">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-sm" class="form-label modal-label-sm">Small</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-sm" name="inputs-settings[]-carousel-slidesPerGroup-sm">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-md" class="form-label modal-label-sm">Medium</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-md" name="inputs-settings[]-carousel-slidesPerGroup-md">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-lg" class="form-label modal-label-sm">Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-lg" name="inputs-settings[]-carousel-slidesPerGroup-lg">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-xl" class="form-label modal-label-sm">X-Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-xl" name="inputs-settings[]-carousel-slidesPerGroup-xl">
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-slidesPerGroup-xxl" class="form-label modal-label-sm">XX-Large</label>
				
				<input type="text" class="form-control form-control-sm" id="inputs-settings[]-carousel-slidesPerGroup-xxl" name="inputs-settings[]-carousel-slidesPerGroup-xxl">
			</div>
			
		</div>
		
		<div class="row row-cols-4 border-bottom">
		
			<div class="col w-100 p-2 pb-0">
				<h6 class="mb-0">Navigation</h6>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-navigation" class="form-label modal-label-sm">Arrows</label>
				
				<select name="inputs-settings[]-carousel-navigation" class="form-select form-select-sm">
					<option value="true">On</option>
					<option value="false">Off</option>
				</select>
				
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-pagination" class="form-label modal-label-sm">Pagination</label>
				
				<select name="inputs-settings[]-carousel-pagination" class="form-select form-select-sm">
					<option value="true">On</option>
					<option value="false">Off</option>
				</select>
				
			</div>
		</div>
		
		<div class="row row-cols-4">
			
			<div class="col w-100 p-2 pb-0">
				<h6 class="mb-0">Settings</h6>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-autoplay" class="form-label modal-label-sm">Autoplay</label>
				
				<input type="number" class="form-control form-control-sm" id="inputs-settings[]-carousel-autoplay" name="inputs-settings[]-carousel-autoplay" value="0" min="0" max="20">
				
				<div class="form-text">Seconds between slide transitions. Enter 0 to disable autoplay.</div>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-loop" class="form-label modal-label-sm">Loop</label>
				
				<select name="inputs-settings[]-carousel-loop" class="form-select form-select-sm">
					<option value="true">On</option>
					<option value="false">Off</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-effect" class="form-label modal-label-sm">Transition Effect</label>
				
				<select name="inputs-settings[]-carousel-effect" class="form-select form-select-sm">
					<option value="slide">Slide</option>
					<option value="fade">Fade</option>
					<option value="cube">Cube</option>
					<option value="coverflow">Coverflow</option>
					<option value="flip">Flip</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-autoHeight" class="form-label modal-label-sm">Auto-height</label>
				
				<select name="inputs-settings[]-carousel-autoHeight" class="form-select form-select-sm">
					<option value="true">On</option>
					<option value="false" selected>Off</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-carousel-centeredSlides" class="form-label modal-label-sm">Centered Slides</label>
				
				<select name="inputs-settings[]-carousel-centeredSlides" class="form-select form-select-sm">
					<option value="true">On</option>
					<option value="false" selected>Off</option>
				</select>
			</div>
		</div>
		
		<input type="hidden" id="inputs-settings[]-carousel-index" name="inputs-settings[]-carousel-index" value="0">
	</div>
	
	<div class="card-footer settings-form-note">
		Note: Direct children of this element will be rendered as the slides of this carousel i.e. if a carousel setting is applied to a <strong>section</strong>, any <strong>container</strong> inside it will become a slide.
	</div>
</div>