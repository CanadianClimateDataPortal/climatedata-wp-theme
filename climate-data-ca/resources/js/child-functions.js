//
// CONSTANTS
//

const k_to_c = 273.15;
const data_url = '//data.climatedata.ca';
const geoserver_url = '//data.climatedata.ca';

//
// GLOBAL VARS
//

var chart_labels, legend_labels;

(function($) {
  
  $(function() {
    
    //
    // TRANSLATIONS
    //
    
    chart_labels = {
      historical: 'Historical',
      historical_range: 'Historical Range',
      rcp_26_median: 'RCP 2.6 Median',
      rcp_26_range: 'RCP 2.6 Range',
      rcp_45_median: 'RCP 4.5 Median',
      rcp_45_range: 'RCP 4.5 Range',
      rcp_85_median: 'RCP 8.5 Median',
      rcp_85_range: 'RCP 8.5 Range',
      temperature: 'Temperature',
      precipitation: 'Precipitation',
      daily_avg_temp: 'Daily Average Temperature',
      daily_max_temp: 'Daily Maximum Temperature',
      daily_min_temp: 'Daily Minimum Temperature',
      click_to_zoom: 'Click and drag in the plot area to zoom in'
    };
    
    if ($('body').hasClass('lang-fr')) {
      
      chart_labels = {
        historical: 'Historique',
        historical_range: 'Répartition historique',
        rcp_26_median: 'RCP 2.6 médiane',
        rcp_26_range: 'RCP 2.6 portée',
        rcp_45_median: 'RCP 4.5 médiane',
        rcp_45_range: 'RCP 4.5 portée',
        rcp_85_median: 'RCP 8.5 médiane',
        rcp_85_range: 'RCP 8.5 portée',
        temperature: 'Température',
        precipitation: 'Précipitation',
        daily_avg_temp: 'Température quotidienne moyenne',
        daily_max_temp: 'Température quotidienne maximale',
        daily_min_temp: 'Température quotidienne minimale',
        click_to_zoom: 'Cliquer et faire glisser dans la zone du tracé pour agrandir'
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
    
    $('.feedback-form').submit(function(e) {
      e.preventDefault();
      
      var the_form = $(this);
      
      var form_data = the_form.serialize();
      
      //console.log(form_data);
      
      $.ajax({
        url: child_theme_dir + 'resources/ajax/form-submit.php',
        data: form_data,
        success: function(data) {
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
	  
	  $('#header-primary-collapse').on('show.bs.collapse', function() {
  	  
  	  $('body').addClass('header-open');
  	  
	  });
	  
	  $('#header-primary-collapse').on('hide.bs.collapse', function() {
  	  
  	  $('body').removeClass('header-open');
  	  
	  });
	  
	  // click outside the menu to close
    
    $(document).mouseup(function(e) {
      
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
	  
	  //
	  // VENDOR
	  //
	  
	  // SELECT2

    $('.select2').select2({
      language: current_lang,
      width: '100%',
      minimumResultsForSearch: -1
    });
    
    function formatLocationSearch (item) {

        if (!item.id) {
            return item.text;
        }
        if (item.location == 'null') {
          show_comma = '';
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
		
	  
    //console.log('end of child-functions');
    
  });
})(jQuery);
