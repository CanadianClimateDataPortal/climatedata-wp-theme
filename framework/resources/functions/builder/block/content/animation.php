<?php

	wp_enqueue_script ( 'lottie-player' );
	wp_enqueue_script ( 'lottie' );
	wp_enqueue_script ( 'inview' );
	wp_enqueue_script ( 'animation' );
	
?>

<!-- <div
	id="element-<?php echo $element['key']; ?>-animation"
	class="animation"
	data-anim-autoplay="<?php echo $element['inputs']['autoplay']; ?>"
	data-anim-loop="<?php echo $element['inputs']['loop']; ?>"
	data-anim-in-view="<?php echo $element['inputs']['inview']; ?>"
	data-anim-rewind="<?php echo $element['inputs']['rewind']; ?>"
	data-anim-path="<?php echo wp_get_attachment_url ( $element['inputs']['file']['id'] ); ?>"
> -->
	
	<lottie-player 
		id="element-<?php echo $element['key']; ?>-animation"
		class="fw-animation"
		src="<?php echo wp_get_attachment_url ( $element['inputs']['file']['id'] ); ?>" 
		<?php echo ( $element['inputs']['bg'] != '' ) ? 'background="' . $element['inputs']['bg'] . '" ' : ''; ?>
		<?php echo ( $element['inputs']['loop'] == 'true' ) ? 'loop' : ''; ?>
		<?php echo ( $element['inputs']['controls'] == 'true' ) ? 'controls' : ''; ?>
		<?php echo ( $element['inputs']['autoplay'] == 'true' ) ? 'autoplay' : ''; ?>
		<?php echo ( $element['inputs']['rewind'] == 'true' ) ? 'data-anim-rewind="true"' : ''; ?>
	></lottie-player>

<!-- </div> -->

<?php /*
// 
// 	wp_enqueue_script ( 'lottie' );
// 	wp_enqueue_script ( 'animation' );
// 	wp_enqueue_script ( 'inview' );
// 	
// ?>
// 
// <div
// 	id="element-<?php echo $element['key']; ?>-animation"
// 	class="fw-animation"
// 	data-anim-autoplay="<?php echo $element['inputs']['autoplay']; ?>"
// 	data-anim-loop="<?php echo $element['inputs']['loop']; ?>"
// 	data-anim-controls="<?php echo $element['inputs']['controls']; ?>"
// 	data-anim-bg="<?php echo $element['inputs']['bg']; ?>"
// 	data-anim-in-view="<?php echo $element['inputs']['inview']; ?>"
// 	data-anim-rewind="<?php echo $element['inputs']['rewind']; ?>"
// 	data-anim-path="<?php echo wp_get_attachment_url ( $element['inputs']['file']['id'] ); ?>"
// >
// 	
// </div>*/ ?>