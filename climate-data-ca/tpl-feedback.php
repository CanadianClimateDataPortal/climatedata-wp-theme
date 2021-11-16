<?php

  /*

    Template Name: Feedback

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

    wp_enqueue_script ( 'jquery-ui-core' );
    wp_enqueue_script ( 'jquery-ui-widget' );
    wp_enqueue_script ( 'jquery-effects-core' );
    wp_enqueue_script ( 'jquery-ui-tabs' );

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<main id="feedback-content" class="tabs">

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>

  <nav class="navbar navbar-expand navbar-light bg-light">

    <ul class="navbar-nav tabs-nav w-100 justify-content-center">
      <li class="nav-item"><a href="#feedback-online" class="nav-link px-4 py-5 all-caps"><?php _e ( 'Online Support', 'cdc' ); ?></a></li>
      <li class="nav-item"><a href="#feedback-data" class="nav-link px-4 py-5 all-caps"><?php _e ( 'Dataset Support', 'cdc' ); ?></a></li>
    </ul>

  </nav>

  <section id="feedback-online" class="page-section tab">

    <form id="feedback-online-form" class="feedback-form needs-validation" novalidate>
      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <label for="fullname" class="form-label"><?php _e ( 'Full name', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="fullname" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <label for="email" class="form-label"><?php _e ( 'Email', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="email" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <label for="phone" class="form-label"><?php _e ( 'Telephone', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="phone" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <label for="download-dataset" class="form-label"><?php _e ( 'Organization', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="organization" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-7 offset-1 mb-3">
          <label for="region" class="form-label"><?php _e ( 'Where are you contacting us from?', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 offset-1 d-flex">
					<select name="region" class="form-control form-control-lg text-center rounded-pill has-other">
						<option>- <?php _e ( 'Select your region', 'cdc' ); ?> -</option>
						<option><?php _e ( 'Alberta', 'cdc' ); ?></option>
						<option><?php _e ( 'British Columbia', 'cdc' ); ?></option>
						<option><?php _e ( 'Manitoba', 'cdc' ); ?></option>
						<option><?php _e ( 'New Brunswick', 'cdc' ); ?></option>
						<option><?php _e ( 'Newfoundland and Labrador', 'cdc' ); ?></option>
						<option><?php _e ( 'Northwest Territories', 'cdc' ); ?></option>
						<option><?php _e ( 'Nova Scotia', 'cdc' ); ?></option>
						<option><?php _e ( 'Nunavut', 'cdc' ); ?></option>
						<option><?php _e ( 'Ontario', 'cdc' ); ?></option>
						<option><?php _e ( 'Prince Edward Island', 'cdc' ); ?></option>
						<option><?php _e ( 'Québec', 'cdc' ); ?></option>
						<option><?php _e ( 'Saskwatchewan', 'cdc' ); ?></option>
						<option><?php _e ( 'Yukon', 'cdc' ); ?></option>
						<option><?php _e ( 'USA', 'cdc' ); ?></option>
						<option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
					</select>

					<input type="text" name="region-other" class="form-control form-control-lg other ml-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-7 offset-1 mb-3">
          <label for="role" class="form-label"><?php _e ( 'Which role best describes you?', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 offset-1 d-flex">
					<select name="role" class="form-control form-control-lg text-center rounded-pill has-other">
						<option>- <?php _e ( 'Select an option', 'cdc' ); ?> -</option>
						<option><?php _e ( 'General public', 'cdc' ); ?></option>
						<option><?php _e ( 'Academic / Research', 'cdc' ); ?></option>
						<option><?php _e ( 'Business / Industry', 'cdc' ); ?></option>
						<option><?php _e ( 'Government – federal', 'cdc' ); ?></option>
						<option><?php _e ( 'Government – Indigenous', 'cdc' ); ?></option>
						<option><?php _e ( 'Government – municipal', 'cdc' ); ?></option>
						<option><?php _e ( 'Government – provincial / territorial', 'cdc' ); ?></option>
						<option><?php _e ( 'Media', 'cdc' ); ?></option>
						<option><?php _e ( 'Not-for-profit organization', 'cdc' ); ?></option>
						<option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
					</select>

					<input type="text" name="role-other" class="form-control form-control-lg other ml-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-7 offset-1 mb-3">
          <label for="subject" class="form-label"><?php _e ( 'What is your inquiry related to?', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 offset-1 d-flex">
					<select name="subject" class="form-control form-control-lg text-center rounded-pill has-other">
						<option>- <?php _e ( 'Select an option', 'cdc' ); ?> -</option>
                        <option><?php _e ( 'Agriculture / Food / Fishing', 'cdc' ); ?></option>
                        <option><?php _e ( 'Conservation / Environment', 'cdc' ); ?></option>
                        <option><?php _e ( 'Construction / Buildings', 'cdc' ); ?></option>
                        <option><?php _e ( 'Education / Training', 'cdc' ); ?></option>
                        <option><?php _e ( 'Energy', 'cdc' ); ?></option>
                        <option><?php _e ( 'Finance / Insurance', 'cdc' ); ?></option>
                        <option><?php _e ( 'Forestry', 'cdc' ); ?></option>
                        <option><?php _e ( 'Health', 'cdc' ); ?></option>
                        <option><?php _e ( 'Information Technology', 'cdc' ); ?></option>
                        <option><?php _e ( 'Mining', 'cdc' ); ?></option>
                        <option><?php _e ( 'Municipal Services / Planning', 'cdc' ); ?></option>
                        <option><?php _e ( 'Public Safety', 'cdc' ); ?></option>
                        <option><?php _e ( 'Tourism / Recreation', 'cdc' ); ?></option>
                        <option><?php _e ( 'Transportation', 'cdc' ); ?></option>
                        <option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
					</select>

					<input type="text" name="subject-other" class="form-control form-control-lg other ml-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-7 offset-1 mb-3">
          <label for="referral" class="form-label"><?php _e ( 'How did you hear about ClimateData.ca?', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 offset-1 d-flex">
					<select name="referral" class="form-control form-control-lg text-center rounded-pill has-other">
						<option>- <?php _e ( 'Select an option', 'cdc' ); ?> -</option>
						<option><?php _e('Word of mouth', 'cdc' ); ?></option>
						<option><?php _e('Services offered by the Canadian Centre for Climate Services (e.g. webinar, workshop or Support Desk)', 'cdc' ); ?></option>
						<option><?php _e('Professional association', 'cdc' ); ?></option>
						<option><?php _e('Organization focused on climate/adaptation', 'cdc' ); ?></option>
						<option><?php _e('Conference', 'cdc' ); ?></option>
						<option><?php _e('Media (e.g. social media, online, TV, print, radio)', 'cdc' ); ?></option>
						<option><?php _e('Internet search', 'cdc' ); ?></option>
						<option value="Other"><?php _e('Other', 'cdc' ); ?></option>
					</select>

					<input type="text" name="referral-other" class="form-control form-control-lg other ml-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
        </div>
      </div>

      <div class="form-layout-row row">
        <p class="form-label-wrap col-3 offset-1">
          <label for="download-dataset" class="form-label"><?php _e ( 'Describe your inquiry', 'cdc' ); ?></label>
        </p>

        <div class="form-radio col-7 col-md-5 col-lg-4">
          <div class="form-check form-control-lg form-check-inline">
            <input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-general" value="general" checked>
            <label class="form-check-label" for="feedback-type-general"><?php _e ( 'General', 'cdc' ); ?></label>
          </div>
          <div class="form-check form-control-lg form-check-inline">
            <input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-bug" value="bug">
            <label class="form-check-label" for="feedback-type-bug"><?php _e ( 'Report a bug', 'cdc' ); ?></label>
          </div>
          <div class="form-check form-control-lg form-check-inline">
            <input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-demo" value="demo">
            <label class="form-check-label" for="feedback-type-demo"><?php _e ( 'Request a demo', 'cdc' ); ?></label>
          </div>
        </div>

        <div class="form-input form-textarea col-7 offset-1">
          <textarea name="feedback" rows="12" class="form-control"></textarea>
        </div>

        <div class="form-input form-textarea col-7 col-md-5 col-lg-4 offset-4 d-flex">
          <label for="captcha_code" class="w-50"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: <img id="captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>/resources/php/securimage/securimage_show.php?namespace=support" alt="CAPTCHA Image" /></label>
          <input type="text" name="captcha_code" id="captcha_code" class="form-control w-50" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
        </div>
      </div>

      <div id="feedback-online-submit-wrap" class="form-layout-row row align-items-center form-process">
        <div class="col-4 offset-4 input-group input-group-lg">
          <button class="btn btn-secondary all-caps rounded-pill" type="submit" id="feedback-online-submit"><?php _e ( 'Send Feedback', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-right"></i></button>
        </div>
      </div>
    </form>

  </section>

  <section id="feedback-data" class="page-section tab">

    <form id="feedback-data-form" class="feedback-form needs-validation" novalidate>
      <input type="hidden" name="feedback-type" value="data">
      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
          <label for="fullname" class="form-label"><?php _e ( 'Full name', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="fullname" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
          <label for="email" class="form-label"><?php _e ( 'Email', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="email" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-3 offset-1">
          <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">3</span>
          <label for="download-dataset" class="form-label"><?php _e ( 'Organization', 'cdc' ); ?></label>
        </p>

        <div class="form-text col-7 col-md-5 col-lg-4">
          <input type="text" name="organization" class="form-control form-control-lg text-center rounded-pill">
        </div>
      </div>

      <div class="form-layout-row row">
        <p class="form-label-wrap col-3 offset-1">
          <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">4</span>
          <label for="download-dataset" class="form-label"><?php _e ( 'Feedback', 'cdc' ); ?></label>
        </p>

        <div class="form-input form-textarea col-7 col-md-5 col-lg-4">
          <textarea name="feedback" rows="6" class="form-control"></textarea>
        </div>

        <div class="form-input form-textarea col-7 col-md-5 col-lg-4 offset-4 d-flex">
          <label for="captcha_code" class="w-50"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: <img id="captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>/resources/php/securimage/securimage_show.php?namespace=data" alt="CAPTCHA Image" /></label>
          <input type="text" name="captcha_code" id="captcha_code" class="form-control w-50" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
        </div>
      </div>

      <div id="feedback-data-submit-wrap" class="form-layout-row row align-items-center form-process">
        <div class="col-4 offset-4 input-group input-group-lg">
          <button class="btn btn-secondary all-caps rounded-pill" type="submit" id="feedback-data-submit"><?php _e ( 'Send Feedback', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-right"></i></button>
        </div>
      </div>
    </form>

  </section>

</main>

<?php

  endwhile; endif;

  get_footer();

?>
