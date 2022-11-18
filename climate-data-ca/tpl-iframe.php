<?php

  /*

    Template Name: IFrame

  */
  
  get_header();
  if (have_posts()) : while (have_posts()) : the_post();
?>

<main id="iframe-content">
  

  <?php

    include (locate_template('template/hero/hero.php'));

  ?>

  <section id="iframe-section" class="page-section bg-white" >
    <div class="iframe-container">
      <?php echo getIframe(get_field("url")) ?>
    </div>
  </section>

</main>


<?php
  endwhile; endif;
  
  get_footer();

?>

<?php
   function getHttpResponseCode(string $url)
   {
    $handle = curl_init($url);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($handle);
    $httpCode = curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    return $httpCode;
   }

   function getIframe(string $url)
   {
    $httpResponseCode = getHttpResponseCode($url);
    if ($httpResponseCode == 201) {
      return '<iframe src="' . $url . '" title="iframe" allow="fullscreen" ></iframe>';
    } else {
      $messageURL = "Sorry,  <b style='color:blue;'>" . $url . "</b> is unreachable.";
      $messageStatusCode = "http response code : <b style='color:red;'>" . $httpResponseCode . "</b>.";
      return "<p> $messageURL </p> <p>$messageStatusCode</p>";
    }
   }
?>