<div id="details" class="modal modal-lg" tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title"><?php _e ( 'About this app', 'cdc' ); ?></h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<h3 class="text-secondary"><?php the_title(); ?></h3>
				
				<?php
				
					the_field ( 'app_description' );
				
				?>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-light" data-bs-dismiss="modal"><?php _e ( 'Close', 'cdc' ); ?></button>
				
				<a href="#feedback" data-bs-toggle="modal" class="btn btn-primary"><?php _e ( 'Provide Feedback', 'cdc' ); ?></a>
			</div>
		</div>
	</div>
</div>

<div id="feedback" class="modal modal-lg" tabindex="-1">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title"><?php _e ( 'Provide Feedback', 'cdc' ); ?></h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				
				<form>
					
					<div class="mb-3">
						<label for="exampleFormControlInput1" class="form-label">Email address</label>
						<input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
					</div>
					<div class="mb-3">
						<label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
						<textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
					</div>
					
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-primary"><?php _e ( 'Submit Feedback', 'cdc' ); ?></button>
			</div>
		</div>
	</div>
</div>