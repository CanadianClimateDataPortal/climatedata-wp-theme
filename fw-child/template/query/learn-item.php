<?php

?>

<div class="card">
	
	<h4 class="item-title"><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h4>
	
	<p><?php
	
		the_field ( 'asset_type', $item['id'] );
	
	?></p>
	
</div>