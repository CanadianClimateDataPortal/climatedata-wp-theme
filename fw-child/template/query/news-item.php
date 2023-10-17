<?php

?>

<div class="card">
	
	<h4 class="item-title"><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h4>
	
	<p><?php
	
		echo get_post_time ( 'F j, Y', false, $item['id'] );
	
	?></p>
	
</div>