		<?php
		
			do_action ( 'fw_modals' );
		
			// do_action ( 'fw_global_css' );
			
			wp_footer();
			
		?>
		
		<style type="text/css">
			<?php
			
				foreach ( $GLOBALS['css'] as $element => $selectors) {
					
					foreach ( $selectors as $selector => $rules ) {
						
						echo "\n" . $element . ' ' . $selector . ' { ';
						
						foreach ( $rules as $rule ) {
							echo $rule . '; ';
						}
						
						echo '}';
						
					}
					
				}
			
			?>
			
		</style>
	</body>
</html>