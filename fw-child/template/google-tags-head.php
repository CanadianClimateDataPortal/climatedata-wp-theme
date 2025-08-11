<?php
$current_lang = $GLOBALS['fw']['current_lang_code'];
$analytics_ua_key = ( $current_lang == 'fr' ) ? 'analytics_ua_fr' : 'analytics_ua_en';
$analytics_ua = array_key_exists( $analytics_ua_key, $GLOBALS['vars'] ) ?
    $GLOBALS['vars'][$analytics_ua_key] :
    null;
$tag_id = array_key_exists( 'googletag_id', $GLOBALS['vars'] ) ?
    $GLOBALS['vars']['googletag_id'] :
    null;
$cross_domains = array_key_exists( 'ga_cross_domain', $GLOBALS['vars'] ) ?
    $GLOBALS['vars']['ga_cross_domain'] :
    null;
?>

<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
</script>

<?php
if ( $analytics_ua ) {
?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $analytics_ua; ?>"></script>
<script>
    <?php
    if ( $cross_domains ) {
        echo "gtag('set', 'linker', {'domains': $cross_domains});\n";
    }
    ?>
    gtag('js', new Date());
    gtag('config', '<?php echo $analytics_ua; ?>');
</script>
<?php
}
?>

<?php
if ( $tag_id ) {
?>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','<?php echo $tag_id; ?>');</script>
<?php
}
