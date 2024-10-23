<?php
/**
 * Template Name: Map PoC
 */
?>

<div id="root"></div>
<?php $child_theme_dir = get_stylesheet_directory_uri() . '/'; ?>
<!-- TODO: I'd recommend adding the files hash and this directions dynamically,
maybe the we can use the file map-poc/dist/.vite/manifest.json to get the correct files. -->
<!-- TODO: I prefer to leave this to a Wordpress expert -->

<script type="module" crossorigin src="<?php echo $child_theme_dir; ?>map-poc/dist/index-Cb5Uvenv.js"></script>
<link rel="stylesheet" crossorigin href="<?php echo $child_theme_dir; ?>map-poc/dist/index-B5bqoSbT.css" />
