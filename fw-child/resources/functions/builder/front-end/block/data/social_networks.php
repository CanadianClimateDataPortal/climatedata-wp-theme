<div class="social-networks">
    <ul>
        <?php
            // LinkedIn
            if ( !empty($element['inputs']['linkedin']) ) {
                echo '<li><a href="' . $element['inputs']['linkedin']['url'] . '" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i></a></li>';
            }

            // X (Twitter)
            if ( !empty($element['inputs']['linkedin']) ) {
                echo '<li><a href="' . $element['inputs']['twitter']['url'] . '" target="_blank" rel="noopener"><i class="fa-brands fa-x-twitter"></i></a></li>';
            }

            // Facebook
            if ( !empty($element['inputs']['linkedin']) ) {
                echo '<li><a href="' . $element['inputs']['facebook']['url'] . '" target="_blank" rel="noopener"><i class="fa-brands fa-facebook"></i></a></li>';
            }

            // Instagram
            if ( !empty($element['inputs']['linkedin']) ) {
                echo '<li><a href="' . $element['inputs']['instagram']['url'] . '" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a></li>';
            }

            // SoundCloud
            if ( !empty($element['inputs']['linkedin']) ) {
                echo '<li><a href="' . $element['inputs']['soundcloud']['url'] . '" target="_blank" rel="noopener"><i class="fa-brands fa-soundcloud"></i></a></li>';
            }
        ?>
    </ul>
</div>
