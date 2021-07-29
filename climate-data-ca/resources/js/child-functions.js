//
// CONSTANTS
//

const k_to_c = 273.15;
const data_url = DATA_URL;
const geoserver_url = DATA_URL;

//
// GLOBAL VARS 
//

var chart_labels, legend_labels, l10n_labels;

(function ($) {

  $(function () {

    $.fn.validate_email = function (email_val) {

      var is_valid = false

      if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {
        if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {
          if (email_val.indexOf('@') !== 0) {

            var after_at = email_val.substring(email_val.indexOf('@'));

            if (after_at.indexOf('.') !== -1) {

              var after_dot = after_at.substring(after_at.indexOf('.'));

              if (after_dot.length > 1) {
                is_valid = true;
              }

            }

          }
        }
      }

      return is_valid;

    }

    // form validation

    function check_email(email_val) {

      var is_valid = false;

      if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {

        if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {

          if (email_val.indexOf('@') !== 0) {

            var after_at = email_val.substring(email_val.indexOf('@'));

            if (after_at.indexOf('.') !== -1) {

              var after_dot = after_at.substring(after_at.indexOf('.'));

              if (after_dot.length > 1) {

                is_valid = true;

              } else {
                //console.log('no chars after .');
              }

            } else {
              //console.log('no . after @');
            }

          } else {
            //console.log('no chars before @');
          }

        } else {
          //console.log('doesn\'t contains @ and .');
        }

      } else {
        //console.log('blank');
      }

      return is_valid;

    }

    function check_training_dl_form(dl_form) {

      is_valid = true

      // checkboxes

      dl_form.find('input[type="checkbox"]').each(function () {
        if ($(this).prop('checked') != true) {
          //           console.log($(this).attr('name') + ' not checked')
          is_valid = false
        }
      })

      if (dl_form.find('#name').val() != '' || dl_form.find('#email').val() != '') {

        // name

        if (dl_form.find('#name').val() == '') {
          is_valid = false
        }

        // email

        if (check_email(dl_form.find('#email').val()) != true) {
          is_valid = false
        }

        // captcha

        if (dl_form.find('#terms-captcha_code').val() == '') {
          is_valid = false
        }

      }

      //console.log('valid', is_valid)

      return is_valid

    }

    // overlay events

    $(document).on('overlay_hide', function () {

      console.log('overlay hide')
      $('#supermenu').supermenu('enable')

    });

    $(document).on('overlay_show', function () {

      $('#supermenu').supermenu('disable')

      if ($('.overlay').find('#download-terms-form').length) {

        var dl_form = $('.overlay').find('#download-terms-form'),
          submit_btn = dl_form.find('#download-terms-submit'),
          captcha = dl_form.find('#terms-captcha'),
          form_response = dl_form.find('#download-terms-response')

        submit_btn.prop('disabled', true)

        dl_form.find(':input').on('input', function () {

          if (check_training_dl_form(dl_form) == true) {
            submit_btn.prop('disabled', false).removeClass('disabled')
          } else {
            submit_btn.prop('disabled', true).addClass('disabled')
          }

        })

        submit_btn.click(function (e) {
          e.preventDefault()

          form_response.slideUp(125, function () {
            $(this).empty()

            var form_data = dl_form.serialize()

            $.ajax({
              url: child_theme_dir + 'resources/ajax/training-submit.php',
              data: form_data,
              success: function (data) {
                console.log(data)

                dl_form.find('#terms-captcha_code').val('')

                captcha_url = dl_form.find('#terms-captcha').attr('src')

                //           dl_form.find('#terms-captcha').attr('src', '')
                dl_form.find('#terms-captcha').attr('src', captcha_url)

                var response = JSON.parse(data)

                if (response.message == 'success') {

                  captcha.removeClass('border-secondary')

                  dataLayer.push({
                    'event': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                    'event_name': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                    'url': response.url
                  });

                  form_response.html('<div class="alert alert-primary col-6 offset-4 p-5" role="alert"><h5>' + response.message1 + '</h5><p class="mb-0"><a href="' + response.url + '" target="_blank">' + response.message2 + '</a>.</p></div>').slideDown(250);

                } else if (response.message == 'captcha failed') {

                  form_response.html('<div class="alert alert-danger col-6 offset-4" role="alert"><p class="mb-0">' + response.message1 + '</p></div>').slideDown(250);

                  captcha.addClass('border border-secondary')

                }
              }
            })

          })

        })

      }

    })

    //
    // TRANSLATIONS
    //

    chart_labels = {
      observation: 'Gridded Historical Data',
      historical: 'Modeled Historical',
      historical_range: 'Historical Range',
      rcp_26_median: 'RCP 2.6 Median',
      rcp_26_range: 'RCP 2.6 Range',
      rcp_45_median: 'RCP 4.5 Median',
      rcp_45_range: 'RCP 4.5 Range',
      rcp_85_median: 'RCP 8.5 Median',
      rcp_85_range: 'RCP 8.5 Range',
      rcp_85_enhanced: 'RCP 8.5 Enhanced Scenario',
      temperature: 'Temperature',
      precipitation: 'Precipitation',
      daily_avg_temp: 'Daily Average Temperature',
      daily_max_temp: 'Daily Maximum Temperature',
      daily_min_temp: 'Daily Minimum Temperature',
      click_to_zoom: 'Click and drag in the plot area to zoom in'
    };

    l10n_labels = {
      search_city: 'Search for a City/Town',
      selected: 'selected',
      label_field: 'label_en',
      temperature: 'temperature',
      precipitation: 'precipitation',
      other_variables: 'other variables',
      station_data: 'station data',
      misc: 'Miscellaneous',
      allbccaq: 'All BCCAQv2 variables',
      gridded_data: 'Gridded data',
      census: 'Census subdivisions',
      health: 'Health regions',
      watershed: 'Watersheds',
      ahccdLegend: 'Legend',
      ahccdLegendSquare: 'Temperature',
      ahccdLegendTriangle: 'Precipitation',
      ahccdLegendCircle: 'Both'
    };

    if ($('body').hasClass('lang-fr')) {

      chart_labels = {
        observation: 'Données observées interpolées',
        historical: 'Historique modélisé',
        historical_range: 'Répartition historique',
        rcp_26_median: 'RCP 2.6 médiane',
        rcp_26_range: 'RCP 2.6 portée',
        rcp_45_median: 'RCP 4.5 médiane',
        rcp_45_range: 'RCP 4.5 portée',
        rcp_85_median: 'RCP 8.5 médiane',
        rcp_85_range: 'RCP 8.5 portée',
        rcp_85_enhanced: 'RCP 8.5 scénario renforcé',
        temperature: 'Température',
        precipitation: 'Précipitation',
        daily_avg_temp: 'Température quotidienne moyenne',
        daily_max_temp: 'Température quotidienne maximale',
        daily_min_temp: 'Température quotidienne minimale',
        click_to_zoom: 'Cliquer et faire glisser dans la zone du tracé pour agrandir'
      };

      l10n_labels = {
        search_city: 'Cherchez une ville ou un village',
        selected: 'sélectionés',
        label_field: 'label_fr',
        temperature: 'température',
        precipitation: 'précipitation',
        other_variables: 'autres',
        station_data: 'données des stations',
        misc: 'Divers',
        allbccaq: 'Toutes les variables BCCAQv2',
        gridded_data: 'Données maillées',
        census: 'Subdivisions de recensement',
        health: 'Régions socio-sanitaires',
        watershed: 'Bassins versants',
        ahccdLegend: 'Légende',
        ahccdLegendSquare: 'Température',
        ahccdLegendTriangle: 'Précipitation',
        ahccdLegendCircle: 'Tous les deux'
      };

      if (typeof Highcharts !== 'undefined') {

        Highcharts.setOptions({
          lang: {
            downloadJPEG: 'Télécharger en image JPEG',
            downloadPDF: 'Télécharger en document PDF',
            downloadPNG: 'Télécharger en image PNG',
            downloadSVG: 'Télécharger en image vectorielle SVG',
            downloadXLS: 'Télécharger en document XLS',
            downloadCSV: 'Télécharger en document CSV',
            loading: 'Chargement',
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            printChart: 'Imprimer le graphique',
            viewData: 'Voir le tableau de données',
            viewFullscreen: 'Voir en mode plein écran',
            openInCloud: 'Ouvrir dans le nuage <em>Highcharts</em>'
          }
        });

      }

    }

    //
    // FEEDBACK
    //

    $('.feedback-form').submit(function (e) {
      e.preventDefault();

      var the_form = $(this);

      var form_data = the_form.serialize();

      //console.log(form_data);

      $.ajax({
        url: child_theme_dir + 'resources/ajax/form-submit.php',
        data: form_data,
        success: function (data) {
          //console.log(data);

          if (data == 'success') {

            $('#captcha_code').removeClass('border-secondary').tooltip('hide');

            $('<div class="row" style="display: none;"><div class="alert alert-success col-6 offset-3" role="alert">Thanks! We’ve received your feedback.</div></div>').insertBefore(the_form).slideDown(250);

            the_form.slideUp(250);

          } else if (data == 'captcha failed') {

            $('#captcha_code').addClass('border-secondary').tooltip('show');

          }
        }
      });
    });

    //
    // UX BEHAVIOURS
    //

    // add body class on show/hide of main header

    $('#header-primary-collapse').on('show.bs.collapse', function () {

      $('body').addClass('header-open');

    });

    $('#header-primary-collapse').on('hide.bs.collapse', function () {

      $('body').removeClass('header-open');

    });

    // click outside the menu to close

    $(document).mouseup(function (e) {

      if ($('body').hasClass('supermenu-open')) {

        var close_menu = true;

        /*
                console.log(e.target);
                console.log('has class supermenu-toggle', $(e.target).hasClass('supermenu-toggle'));
                console.log('has class overlay-toggle', $(e.target).hasClass('overlay-toggle'));
                console.log('is supermenu', $('#supermenu').is(e.target));
                console.log('child of supermenu', $('#supermenu').has(e.target).length);
        */

        if ($(e.target).hasClass('supermenu-toggle') || $(e.target).hasClass('overlay-toggle')) {

          // clicked element is a menu/overlay toggle, let the plugin deal with it

          close_menu = false;

        } else {

          if ($('body').hasClass('supermenu-disabled')) {

            // supermenu currently disabled, leave it alone

            close_menu = false;

          } else {

            // supermenu is open and active

            if (!$('#supermenu').is(e.target) && !$('#supermenu').has(e.target).length) {

              // clicked element is not a child of the supermenu, or the supermenu itself

              close_menu = true;

            } else {

              close_menu = false;

            }

          }

          if ($('.select2-container').has(e.target).length) {

            // clicked element is inside the appended select2 container

            close_menu = false;

          }

        }

        //console.log('close', close_menu);

        if (close_menu == true) {
          //console.log('close supermenu');
          $('#supermenu').supermenu('hide');
        }

      }

    });

    // close supermenu if a smooth-scroll link is clicked inside it

    $('#supermenu .smooth-scroll').click(function () {
      $('#supermenu').supermenu('hide')
    })

    //
    // VENDOR
    //

    // SELECT2

    $('.select2').select2({
      language: current_lang,
      width: '100%',
      minimumResultsForSearch: -1
    });

    function formatLocationSearch(item) {

      if (!item.id) {
        return item.text;
      }
      if (item.location === null) {
        show_comma = '';
        item.location = '';
      } else {
        show_comma = ', ';
      }
      var $item = $(
        '<span><div class="geo-select-title">' + item.text + ' (' + item.term + ')</div>' + item.location + show_comma + item.province + '</sup></span>'
      );
      return $item;
    }

    $('#location-search').select2({
      language: current_lang,
      ajax: {
        url: child_theme_dir + "resources/app/run-frontend-sync/select-place.php",
        dataType: 'json',
        delay: 0,
        data: function (params) {
          return {
            q: params.term,
            page: params.page
          };
        },
        processResults: function (data, page) {
          return {
            results: data.items
          };
        },
        cache: true
      },
      escapeMarkup: function (markup) { return markup; },
      minimumInputLength: 1,
      templateResult: formatLocationSearch
    });

    $('#location-search').on('select2:select', function (e) {

      var redirect_url = '/explore/location/';

      if (current_lang == 'fr') {
        redirect_url = '/explorer/emplacement/';
      }

      window.location.href = redirect_url + '?loc=' + e.params.data.id;

    });

    // STICKY KIT

    if ($('body').hasClass('has-alert')) {

      $('#header-primary .logo a').stick_in_parent({
        parent: 'body',
        offset_top: sticky_offset
      });

    }

    // JQUERY UI TABS

    if ($('.tabs').length) {

      $('.tabs').tabs({
        hide: { effect: 'fadeOut', duration: 250 },
        show: { effect: 'fadeIn', duration: 250 },
      });

    }

    // LISTNAV

    if ($('#glossary').length) {

      var listnav_alltext = 'All';

      if ($('body').hasClass('lang-fr')) {
        listnav_alltext = 'Liste complète';
      }

      $('#glossary-listnav').listnav({
        showCounts: false,
        includeNums: false,
        allText: listnav_alltext,
        list_class: 'navbar-nav tabs-nav justify-content-center col-10 offset-1',
        item_class: 'nav-item',
        link_class: 'px-3 py-3 all-caps'
      });

      //console.log('listnav');
    }

    if (typeof $.fn.renderer !== 'undefined' && $('.renderable').length) {
      $(document).renderer();
    }
    //console.log('end of child-functions');

  });
})(jQuery);
