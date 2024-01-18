<div class="mb-2">
	<h6 class="all-caps text-gray-300"><?php _e ( 'Date', 'cdc' ); ?></h6>
	
	<?php 
	
		the_time ( 'F j, Y' );
	
	?>
</div>

<div class="mb-2">
	<h6 class="all-caps text-gray-300"><?php _e ( 'Author', 'cdc' ); ?></h6>
	
	<?php
	
		the_field ( 'post_author' );
		
	?>
</div>

<?php
	
	$post_tags = get_the_terms ( get_the_ID(), 'post_tag' );
	
	if ( !empty ( $post_tags ) ) {
		
?>

<div class="mb-2">
	<h6 class="all-caps text-gray-300"><?php _e ( 'Topics', 'cdc' ); ?></h6>
	
	<p><?php
	
			$i = 0;
			
			foreach ( $post_tags as $tag ) {
				if ( $i != 0 ) echo ', ';
				echo '<a href="/news/">' . $tag->name . '</a>';
				$i++;
			}
			
	?></p>
</div>
	
<?php
	
}

?>