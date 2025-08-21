<?php
$tag_id = array_key_exists( 'googletag_id', $GLOBALS['vars'] ) ?
    $GLOBALS['vars']['googletag_id'] :
    null;
?>


<?php
if ($tag_id) {
?>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id='<?php echo $tag_id;?>'" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<?php
}
