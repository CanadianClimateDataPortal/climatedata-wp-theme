<div class="fw-form-flex-item settings-form settings-form-background card mt-3">
	<div class="card-header d-flex justify-content-between">
		<span>Animate on Scroll</span>
		<button type="button" class="fw-form-flex-item-remove btn-close" aria-label="Close"></button>
	</div>
	
	<div class="card-body p-0">
		
		<div class="row row-cols-4">
		
			<div class="col p-2">
				<label for="inputs-settings[]-aos-effect" class="form-label modal-label-sm">Effect</label>
				
				<select name="inputs-settings[]-aos-effect" class="form-select form-select-sm">
					<option value="fade">fade</option>
					<option value="fade-up">fade-up</option>
					<option value="fade-down">fade-down</option>
					<option value="fade-left">fade-left</option>
					<option value="fade-right">fade-right</option>
					<option value="fade-up-right">fade-up-right</option>
					<option value="fade-up-left">fade-up-left</option>
					<option value="fade-down-right">fade-down-right</option>
					<option value="fade-down-left">fade-down-left</option>
					<option value="flip-up">flip-up</option>
					<option value="flip-down">flip-down</option>
					<option value="flip-left">flip-left</option>
					<option value="flip-right">flip-right</option>
					<option value="slide-up">slide-up</option>
					<option value="slide-down">slide-down</option>
					<option value="slide-left">slide-left</option>
					<option value="slide-right">slide-right</option>
					<option value="zoom-in">zoom-in</option>
					<option value="zoom-in-up">zoom-in-up</option>
					<option value="zoom-in-down">zoom-in-down</option>
					<option value="zoom-in-left">zoom-in-left</option>
					<option value="zoom-in-right">zoom-in-right</option>
					<option value="zoom-out">zoom-out</option>
					<option value="zoom-out-up">zoom-out-up</option>
					<option value="zoom-out-down">zoom-out-down</option>
					<option value="zoom-out-left">zoom-out-left</option>
					<option value="zoom-out-right">zoom-out-right</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-aos-easing" class="form-label modal-label-sm">Easing</label>
				
				<select name="inputs-settings[]-aos-easing" class="form-select form-select-sm">
					<option value="linear">linear</option>
					<option value="ease">ease</option>
					<option value="ease-in">ease-in</option>
					<option value="ease-out">ease-out</option>
					<option value="ease-in-out">ease-in-out</option>
					<option value="ease-in-back">ease-in-back</option>
					<option value="ease-out-back">ease-out-back</option>
					<option value="ease-in-out-back">ease-in-out-back</option>
					<option value="ease-in-sine">ease-in-sine</option>
					<option value="ease-out-sine">ease-out-sine</option>
					<option value="ease-in-out-sine">ease-in-out-sine</option>
					<option value="ease-in-quad">ease-in-quad</option>
					<option value="ease-out-quad">ease-out-quad</option>
					<option value="ease-in-out-quad">ease-in-out-quad</option>
					<option value="ease-in-cubic">ease-in-cubic</option>
					<option value="ease-out-cubic">ease-out-cubic</option>
					<option value="ease-in-out-cubic">ease-in-out-cubic</option>
					<option value="ease-in-quart">ease-in-quart</option>
					<option value="ease-out-quart">ease-out-quart</option>
					<option value="ease-in-out-quart">ease-in-out-quart</option>
				</select>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-aos-offset" class="form-label modal-label-sm">Offset</label>
				
				<div class="input-group input-group-sm">
					<input type="number" class="form-control form-control-sm" id="inputs-settings[]-aos-offset" name="inputs-settings[]-aos-offset">
					
					<span class="input-group-text">pixels</span>
				</div>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-aos-duration" class="form-label modal-label-sm">Duration</label>
				
				<div class="input-group input-group-sm">
					<input type="number" class="form-control form-control-sm" id="inputs-settings[]-aos-duration" name="inputs-settings[]-aos-duration" min="0">
					
					<span class="input-group-text">ms</span>
				</div>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-aos-delay" class="form-label modal-label-sm">Delay</label>
				
				<div class="input-group input-group-sm">
					<input type="number" class="form-control form-control-sm" id="inputs-settings[]-aos-delay" name="inputs-settings[]-aos-delay" min="0">
					
					<span class="input-group-text">ms</span>
				</div>
			</div>
			
			<div class="col p-2">
				<label for="inputs-settings[]-aos-anchor" class="form-label modal-label-sm">Anchor</label>
				
				<input type="text" class="form-control" id="inputs-settings[]-aos-anchor" name="inputs-settings[]-aos-anchor" placeholder="#trigger-id">
				
			</div>
			
			<div class="col p-2">
				
				<label for="inputs-settings[]-aos-once" class="form-label modal-label-sm">Repeat effect</label>
				
				<select name="inputs-settings[]-aos-once" class="form-select form-select-sm">
					<option value="">Every time</option>
					<option value="true">Once</option>
				</select>
				
			</div>
		
		</div>
		
		<div class="card-footer settings-form-note">
			Note: scroll effects won’t display in builder mode.
		</div>
	</div>
</div>