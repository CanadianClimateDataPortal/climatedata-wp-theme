document.documentElement.classList.remove('no-js');

//
// LANGUAGE
//

var current_lang = 'en';

//
// URLs
//

var site_url = '/';//$('base[href]').attr('href') + '/';

var scripts = document.querySelectorAll('script[src]'),
    src = scripts[scripts.length-1].src,
    filename = src.split('/').pop();

var theme_dir = src.replace('/resources/js/' + filename, '');

var child_theme_dir = site_url + 'site/assets/themes/climate-data-ca/';

//
// INITIAL LOCATION HASH
//

if (window.location.hash) {
  var init_scroll = window.location.hash;
  
  //console.log(window.location.hash);
  //console.log(init_scroll);
  
  if (document.getElementById(init_scroll.substr(1)) !== null) {
    //history.replaceState(null, document.title, location.protocol + '//' + location.host + location.pathname);
    console.log('scroll to ' + init_scroll);
  }
}
    
//
// HELPER FUNCTIONS
//

// is object empty

function is_empty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  
  return true;
}

// replace all substrings

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
  
  console.log('replaced ' + find  + ' with ' + replace);
}

var sticky_offset = 0,
    scroll_offset = 0,
    chart_globals;

(function($) {
  
  $(function() {
    
    scroll_offset += $('#main-header').outerHeight();
    
    if ($('body').hasClass('lang-fr')) {
      current_lang = 'fr';
    }
    
    // highcharts options
    
    chart_globals = {
      
      chart: {
        height: '700px',
        zoomType: 'x',
        animation: false,
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'CDCSans'
        }
      },
      title: {
        align: 'left',
        style: {
          fontWeight: 600
        }
      },
      
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'top',
        itemStyle: {
          textTransform: 'uppercase',
          color: '#727c9a'
        }
      },
      
      rangeSelector: {
        inputEnabled: false,
        buttonTheme: {
          visibility: 'hidden'
        },
        labelStyle: {
          visibility: 'hidden'
        }
      },
    
      tooltip: {
        crosshairs: true,
        shared: true,
        split: false
      },
      
      exporting: {
        filename: 'ClimateData.ca Export',
        scale: 2,
        sourceWidth: 1600,
        sourceHeight: 800,
        chartOptions: {
          navigator: {
            enabled: false
          },
          scrollbar: {
            enabled: false
          },
          legend: {
            itemDistance: 50
          }
        }
      },
      
      lang: {
        downloadJPEG: 'Download JPEG',
        downloadPDF: 'Download PDF',
        downloadPNG: 'Download PNG',
        downloadSVG: 'Download SVG',
        downloadXLS: 'Download XLS',
        downloadCSV: 'Download CSV',
        loading: 'Loading',
        printChart: 'Print Chart'
      }
          
    };
    
    if (current_lang == 'fr') {
      chart_globals.lang = {
        downloadJPEG: 'Télécharger en image JPEG',
        downloadPDF: 'Télécharger en document PDF',
        downloadPNG: 'Télécharger en image PNG',
        downloadSVG: 'Télécharger en image vectorielle SVG',
        downloadXLS: 'Télécharger en document XLS',
        downloadCSV: 'Télécharger en document CSV',
        loading: 'Chargement',
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        printChart: 'Imprimer le graphique',
        contextButtonTitle: 'Menu contextuel du graphique'
      };
      
    }
    
    if (typeof Highcharts !== 'undefined') {
    
      Highcharts.setOptions(chart_globals);
      
    }
    
    $('.animsition')
      .on('animsition.inEnd', function(){
        $('body').removeClass('spinner-on');
      })
      .on('animsition.outStart', function(){
        $('body').addClass('spinner-on');
      })
      .animsition({
        linkElement: 'a:not([target="_blank"]):not([href^="#"]):not(.supermenu-toggle):not(.overlay-toggle), .animsition-link',
        inDuration: 500,
        outDuration: 250,
        loading: false
      });
    
    $('body').on('click', '.prevent-default', function(e) {
      e.preventDefault();
    });
	  
	  //
	  // BOOTSTRAP
	  //
	  
	  // ALERT
	  
	  $('#alert .alert-close').click(function() {
  	  $('body').addClass('alert-closing');
  	  
  	  $('#alert').slideUp(400, function() {
    	  $('body').removeClass('alert-closing').addClass('alert-closed');
    	  $('#main-header-nav').trigger('sticky_kit:detach');
    	  $('#header-primary .logo a').trigger('sticky_kit:detach');
  	  });
	  });
	  
	  // DROPDOWN SELECT
	  
	  $('body').on('click', '.dropdown-select .dropdown-item', function(e) {
	  
  	  $(this).siblings().removeClass('active');
  	  $(this).addClass('active');
  	  $(this).closest('.dropdown-select').find('.dropdown-label').text($(this).text());
  	  
  	  var item_val = $(this).attr('data-value');
  	  
  	  console.log(item_val);
  	  
  	  if ($(this).closest('.dropdown-select').siblings('select').length) {
    	  console.log($(this).closest('.dropdown-select').siblings('select'));
    	  $(this).closest('.dropdown-select').siblings('select').val(item_val).trigger('change');
  	  }
  	  
	  });
    
    //
    // COMPONENTS
    //
    
    if ($('body').hasClass('admin-bar')) {
      
      if ($(window).width() > 782) {
        sticky_offset += 32;
      } else {
        sticky_offset += 46;
      }
    }
    
    // SMOOTH SCROLL
    
    $('.smooth-scroll').click(function(e) {
      
      var link_href = '';
      
      // find out if the element is an <a> or a parent
      
      if ($(this).is('a')) {
        link_href = $(this).attr('href');
      } else {
        link_href = $(this).find('a').attr('href');
      }
      
      if (link_href != '') {
        
        if (link_href.charAt(0) == '#') {
            
          e.preventDefault();
          
          // if the link is just an anchor
          
          if ($(link_href).length) {
            
            // if the ID exists on the page
          	
          	console.log('smooth scroll to ' + link_href);
          	
          	$(document).smooth_scroll({
            	id: link_href,
            	speed: 1000,
            	ease: 'swing',
            	offset: scroll_offset
            });
            
          }
          
        } else {
          
          // if the URL part of the link is the current page
          
          if (link_href.substring(0, link_href.indexOf("#")) == window.location.pathname) {
            
            e.preventDefault();
            
            link_href = link_href.substring(link_href.indexOf("#"));
            
            $(document).smooth_scroll({
            	id: link_href,
            	speed: 1000,
            	ease: 'swing',
            	offset: scroll_offset
            });
            
          }
          
        }
        
      }
    	
    });
    
    $('.next-section').click(function(e) {
      e.preventDefault();
      
      var current_section = $(this).parents('section').attr('id');
      var next_section = '';
      var section_flag = false;
      
      $('section').each(function() {
        if (section_flag == true) {
          next_section = '#' + $(this).attr('id');
          return false;
        }
        
        if ($(this).attr('id') == current_section) {
          section_flag = true;
        }
        
      });
      
      if (next_section != '') {
      
        $(document).smooth_scroll({
        	id: next_section,
        	speed: 1000,
          ease: 'swing',
          offset: scroll_offset
        });
      
      }
      
    });
    
    if (init_scroll) {
      
      if ($(init_scroll).length) {
      
        setTimeout(function() {
          console.log('smooth scroll');
          console.log(init_scroll);
          
          $(document).smooth_scroll({
          	id: init_scroll,
          	speed: 2000,
            ease: 'swing',
            offset: scroll_offset
          });
          
        }, 1000);
      
      }
	  
      console.log('init scroll');
      
	  }
	  
	  // SUPERMENU
  
    $('#header-primary .supermenu-toggle').each(function() {
      var caret = $('<i class="nav-item-caret fas fa-caret-down"></i>').appendTo($(this));
    });
	  
	  $('#supermenu').supermenu({
  	  events: {
    	  slide_change: function() {
      	  
      	  if ($('#supermenu').find('.slick-current').find('.select2').length) {
        	  
        	  $('#location-search').select2('open');
        	  
      	  }
      	  
    	  }
  	  }
	  });
    
	  // OVERLAY
	  
	  $(document).overlay();
	  
    //
    // SOCIAL WIDGETS
    //
    
/*
    $('.share').each(function() {
      
      var share_url = window.location.href;
      
      if (typeof $(this).attr('data-share-url') !== 'undefined') {
        share_url = $(this).attr('data-share-url');
      }
      
      $(this).share_widget({
        site_url: '//' + window.location.hostname,
        theme_dir: null,
        share_url: share_url,
        title: document.title,
        
        elements: {
          facebook: {
            display: true,
            label: 'Facebook',
            icon: 'icon-social-facebook'
          },
          twitter: {
            display: true,
            label: 'Twitter',
            icon: 'icon-social-twitter',
            text: null,
            via: null
          },
          permalink: {
            display: true,
            label: 'Copy Permalink',
            icon: 'icon-permalink'
          }
        },
        callback: null
      });
      
    });
    
    $('.follow').follow_widget({
      elements: {
        twitter: {
          url: 'https://twitter.com/',
          icon: 'icon-social-twitter'
        }
      }
    });
    
    console.log('social widgets');
*/
    
    //
    // GRAPHICS
    //
    
    // RENDERER
    
/*
    $(document).renderer({
      
    });
    
    console.log('renderer');
*/
    
    //
    // VENDOR
    //
    
    
	  
    // SLICK CAROUSEL
    
    $('[data-slick]').each(function() {
      
      $(this).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        $(this).addClass('sliding');
      });
      
      $(this).on('afterChange', function(event, slick, currentSlide) {
        $(this).removeClass('sliding');
      });
              
		  if (!$(this).hasClass('slick-initialized')) {
  		  $(this).slick();
  		}
  		
    });
	  
	  // STICKY KIT
	  
	  if ($('body').hasClass('has-alert')) {
  	  
  	  function sticky_classes() {
    	  
    	  if ($('#main-header-nav').hasClass('is_stuck')) {
  	      $('body').addClass('header-stuck');
  	    } else {
    	    $('body').removeClass('header-stuck');
  	    }
  	    
  	    if ($('#header-primary .logo a').hasClass('is_stuck')) {
  	      $('body').addClass('logo-stuck');
  	    } else {
    	    $('body').removeClass('logo-stuck');
  	    }
    	  
  	  }
  	  
	    $('#main-header-nav').stick_in_parent({
  	    parent: 'body',
  	    offset_top: sticky_offset
	    }).on('sticky_kit:stick', function() {
  	    
  	    sticky_classes();
  	    
	    }).on('sticky_kit:unstick', function() {
  	    
  	    sticky_classes();
  	    
	    });
	    
	  }
    
    console.log('end of global-functions');
    console.log('- - - - -');
    
  });
})(jQuery);
