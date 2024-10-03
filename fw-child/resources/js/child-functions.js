document.documentElement.classList.remove('spinner-on');

// fix for 'fakeStop is not a function'

if (typeof L !== 'undefined') {
  L.DomEvent.fakeStop = function () {
    return true;
  };
}

// make $ available in devtools
const $ = jQuery;

(function ($) {
  $(function () {
    let app_page = null;

    //
    // APPS
    //

    if ($('body').attr('id') == 'page-map') {
      app_page = 'map';

      // init apps
      $(document).cdc_app({
        page: app_page,
      });
      $(document).map_app();
    }

    if ($('body').attr('id') == 'page-download') {
      app_page = 'download';

      $(document).cdc_app({
        page: app_page,
        grid: {
          styles: {
            line: {
              default: {
                color: '#777',
                weight: 0.2,
                opacity: 0.6,
              },
              hover: {
                color: '#999',
                weight: 0.4,
                opacity: 0.8,
              },
              active: {
                color: '#f00',
                weight: 1,
                opacity: 1,
              },
            },
            fill: {
              default: {
                color: '#fff',
                opacity: 0,
              },
              hover: {
                color: '#fff',
                opacity: 0.2,
              },
              active: {
                color: '#fff',
                opacity: 0.6,
              },
            },
          },
        },
      });

      $(document).download_app();
    }

    if (app_page != null) {
      // help overlay

      let help_overlay = bootstrap.Offcanvas.getOrCreateInstance('#help');
      let info_overlay = bootstrap.Offcanvas.getOrCreateInstance('#info');

      console.log('cookie', Cookies.get('cdc-' + app_page + '-dismiss-help'));

      if (
        Cookies.get('cdc-' + app_page + '-dismiss-help') == undefined ||
        Cookies.get('cdc-' + app_page + '-dismiss-help') != 1
      ) {
        // show help
        help_overlay.toggle();
      }

      // listeners

      document
        .getElementById('help')
        .addEventListener('hide.bs.offcanvas', (event) => {
          // console.log('check', $('#map-overlay-dontshow').prop('checked'));

          $('#map-overlay-dontshow').closest('.form-check').hide();

          // is the 'don't show again' switch checked
          if ($('#map-overlay-dontshow').prop('checked') == true) {
            console.log('set cookie', 'cdc-' + app_page + '-dismiss-help');
            Cookies.set('cdc-' + app_page + '-dismiss-help', 1, {
              expires: 60,
            });
          }
        });

      // page tour
      let tour_options = JSON.parse($('#page-tour').attr('data-steps'));

      // todo
      // if (current_lang == 'fr') {
      //   tour_options.labels = {
      //     start_over: 'Recommencer',
      //     next: 'Suivant',
      //     close: 'Quitter',
      //     dont_show: 'Ne plus montrer',
      //   };
      // }

      $('#page-tour').page_tour({
        default_open: false,
        labels: {
          start_over: T('Start Over'),
          next: T('Next'),
          close: T('Close'),
          dont_show: T('Don’t show again'),
        },
      });

      $('.page-tour-start').click(function () {
        // reset page to initial view
        help_overlay.hide();
        info_overlay.hide();
        $('#control-bar').tab_drawer('update_path', '#', false);

        // start
        $('#page-tour').page_tour('show_tour');
      });
    }

    // CARD LINKS HOVERING

    function handleCardLinkHovering() {
      if ( $( '.card.has-links' ).length ) {
        $( '.card.has-links a.hover-toggle' ).hover(
          function() {
            $( this ).closest( '.card' ).addClass( 'card-enlarged' );
          },
          function() {
            $( this ).closest( '.card' ).removeClass( 'card-enlarged' );
          }
        );
      }
    }

    // Initial call on page load
    handleCardLinkHovering();

    // Bind to fw_query_success event for dynamically loaded content
    $( document ).on( 'fw_query_success', handleCardLinkHovering );

    // TAB DRAWER

    $('#menu-tabs').tab_drawer({
      history: {
        enabled: false,
      },
      debug: true,
    });

    //
    // BOOTSTRAP COMPONENTS
    //

    // get the menu instance
    // so we can create a close event

    const menu_offcanvas = document.getElementById('menu');

    menu_offcanvas.addEventListener('hide.bs.offcanvas', function (e) {
      $('#menu-tabs a[href="#browse-vars"]').removeClass('active');
      $('#menu-tabs').tab_drawer('close_content', ['#browse-vars']);
    });

    //

    if ($('body').attr('id') === 'page-feedback' || $('body').attr('id') === 'page-retroaction') {
      const feedback_accordion = document.getElementById('feedback-accordion');

      //  replace state on accordion change

      feedback_accordion.addEventListener('show.bs.collapse', (e) => {
        history.replaceState(
          {},
          '',
          window.location.href.split('#')[0] + '#' + $(e.target).attr('id'),
        );
      });

      // open tab on load

      if (window.location.hash !== null && window.location.hash !== '') {
        bootstrap.Collapse.getOrCreateInstance(
          document.querySelector(window.location.hash),
        ).toggle();
      }
    }

    // SMOOTH SCROLL

    let smoothScrollOffset = 0;

    $('a.smooth-scroll').click(function(event) {
      event.preventDefault();

      if ($('#glossary-list-nav').length) {
        smoothScrollOffset = $('#glossary-list-nav').outerHeight();
      }

      const target = $($(this).attr('href'));

      if (target.length) {
        const scrollPosition = target.offset().top - smoothScrollOffset;

        $('html, body').animate({
          scrollTop: scrollPosition
        }, 300);
      }
    });

    //
    // GLOSSARY
    //

    if ($('#glossary-list-nav').length) {
      new bootstrap.ScrollSpy(document.body, {
        target: '#glossary-list-nav'
      });
    }

    //
    // VENDOR
    //

    if ($('.query-page #control-bar').length) {
      $('.query-page #control-bar').tab_drawer({
        history: {
          enabled: false,
        },
      });
    }

    let pinned_item = null;

    function pin_item() {
      let scroll_offset = 0;

      if ($('#floating-header').length) {
        scroll_offset += $('#floating-header').outerHeight();
      }

      if ($('.query-page #control-bar-tabs').length) {
        if (pinned_item == null) {
          pinned_item = new $.Zebra_Pin($('#control-bar-tabs'), {
            top_spacing: scroll_offset,
            contain: true,
          });
        } else {
          pinned_item.settings.top_spacing = scroll_offset;
          pinned_item.update();
        }
      }
    }

    pin_item();

    if (document.querySelector('#control-bar')) {
      const resize_observer = new ResizeObserver( pin_item );
      resize_observer.observe( document.querySelector('#control-bar') );
    }

    /**
     * Ensure the control bar footer stays at the bottom of the screen while keeping it within its parent container.
     * Executes at page load, on scroll and on window resize.
     * Applies to the Apps page, or anywhere the #control-bar-tabs-footer id is used.
     *
     * #control-bar-tabs-footer must be initially set to position:fixed & bottom:0 in CSS.
     * #control-bar-tabs-footer.position-absolute must be width:100%!important in CSS.
     */
    if ($('#control-bar-tabs-footer').length) {
      function updateControlBarFooterPosition() {
        const controlBar = document.getElementById('control-bar');
        const footer = document.getElementById('control-bar-tabs-footer');
        const controlBarRect = controlBar.getBoundingClientRect();

        if (controlBarRect.bottom <= window.innerHeight || controlBarRect.top >= window.innerHeight) {
          if (!footer.classList.contains('position-absolute')) {
            footer.classList.add('position-absolute');
          }
          footer.style.bottom = '0';
        } else {
          if (footer.classList.contains('position-absolute')) {
            footer.classList.remove('position-absolute');
          }
          footer.style.bottom = '0';
        }
      }

      updateControlBarFooterPosition();
      document.addEventListener('scroll', updateControlBarFooterPosition);
      window.addEventListener('resize', updateControlBarFooterPosition);
    }

    // Functionalities for variable archive page.
    if ($( '.variable-archive-page' ).length > 0) {
      let isFirstPageLoad = true;
      $( document ).on( 'fw_query_success', function ( e, query_item ) {
        const query_items = query_item.find( '.fw-query-items' );

        let current_screen = null;

        if (query_items.data( 'flex_drawer' ) == undefined) {
          query_items.flex_drawer( {
            item_selector: '.fw-query-item',
          } );
        } else {
          // reinit if plugin is already loaded
          query_items.flex_drawer( 'init_items' );
        }

        const media_queries = {
          large_screen: '(min-width: 768px)',
          medium_screen: '(min-width: 576px) and (max-width: 767px)',
          small_screen: '(max-width: 575px)',
        };

        /**
         * Updates column count based on the current media queries.
         *
         * @param {Object} plugin_obj - flex_drawer object.
         * @param {string} screen - The current screen condition.
         *
         * @returns {[string, number]} - An array containing the screen condition
         *                               and updated column count.
         */
        const update_screen_condition = function ( plugin_obj, screen ) {
          let updated_column_count = plugin_obj.options.column_count;

          for (const screen_condition in media_queries) {
            if (window.matchMedia( media_queries[screen_condition] ).matches) {
              if (screen === screen_condition) {
                return [ screen_condition, updated_column_count ];
              }

              switch (screen_condition) {
                case 'small_screen':
                  updated_column_count = 1;
                  break;
                case 'medium_screen':
                  updated_column_count = 2;
                  break;
                default:
                  updated_column_count = 3;
              }

              plugin_obj.close_all();
              plugin_obj.init_items();

              return [ screen_condition, updated_column_count ];
            }
          }
        };

        // Initial check.
        const screen_columns = update_screen_condition( query_items.data( 'flex_drawer' ), current_screen );
        [ current_screen, query_items.data( 'flex_drawer' ).options.column_count ] = screen_columns;

        // Listen to resize event.
        $( window ).on( 'resize', function () {
          const screen_columns = update_screen_condition( query_items.data( 'flex_drawer' ), current_screen );
          [ current_screen, query_items.data( 'flex_drawer' ).options.column_count ] = screen_columns;
        } );

        /**
         * Auto-scroll and open variable details if a variable hash exists.
         */
        if ( window.location.hash ) {
          const variable_element = $( window.location.hash );

          if ( variable_element.length > 0 ) {
            const scroll_top = variable_element.parent().position().top;

            $( 'html, body' )
              .animate( { scrollTop: scroll_top }, 10, 'swing' )
              .promise()
              .done( function () {
                variable_element
                  .find( '.flex-drawer-trigger' )
                  .trigger( 'click' );
              } );
          }
        } else if ( !isFirstPageLoad ) {
          // Scroll to the top of the results if not first page load
          const scroll_top = $( '.query-page' ).position().top;

          $( 'html, body' ).animate( { scrollTop: scroll_top }, 10, 'swing' );
        }

        isFirstPageLoad = false;
      } );

      $( document ).on( 'fw_fd_open', function ( e, drawer_item ) {
        // Update the URL hash if the variable item hash exists.
        const variable_item = drawer_item.find( '.variable-item' );

        if (variable_item.length > 0) {
          const variable_item_hash = variable_item.attr( 'id' );

          if (variable_item_hash) { // Check if variable_item_hash is not empty
            window.location.hash = variable_item_hash;
          }

          // Fix jQuery collapse-o-matic duplicate ID bug.
          const fd_drawer_clone = drawer_item.parent().find( '.fd-drawer' );
          fd_drawer_clone.find( '.collapseomatic, .collapseomatic_content ' ).each( function () {
            $( this ).attr( 'id', $( this ).attr( 'id' ) + '_c' );

            if ($( this ).hasClass( 'collapseomatic_content' )) {
              $( this ).hide();
            }
          } );

          // Adjust auto-scroll position.
          const scroll_top = variable_item.parent().position().top;

          $( 'html, body' ).animate( {scrollTop: scroll_top}, 10, 'swing' );
        }
      } );

      $( document ).on( 'fw_fd_close', function ( e, drawer_item ) {
        // Remove the URL hash.
        const variable_item = drawer_item.find( '.variable-item' );

        if (variable_item.length > 0) {
          const variable_item_hash = '#' + variable_item.attr( 'id' );
          const url_hash = window.location.hash;

          if (variable_item_hash === url_hash) {
            history.replaceState(null, null, ' ');
          }
        }
      } );
    }

    // Functionalities for learning zone archive page.
    if ($( '#learn-grid' ).length > 0) {
      $( document ).on( 'fw_query_no_matches', function ( e, query_item ) {
        const module_id = query_item.attr( 'id' );

        // Hide query container and its associated filter.
        query_item.hide().addClass('no-matches');
        $( '.learn-zone-module-filter[data-module-id="' + module_id + '"]' ).addClass( 'disabled' );

        // Check if there are no matches in ALL query items.
        const query_items_count = $('#learn-grid .learn-module-grid').length;
        const query_items_no_matches_count = $('#learn-grid .learn-module-grid.no-matches').length;

        if (query_items_no_matches_count === query_items_count ) {
          // Show global no matches message.
          $('.fw-query-items-no-matches').show();
        }
      } );

      $( document ).on( 'fw_query_items_retrieved', function ( e, query_item ) {
        const module_id = query_item.attr( 'id' );

        // Show query container and its associated filter.
        query_item.show().removeClass('no-matches');
        $( '.learn-zone-module-filter[data-module-id="' + module_id + '"]' ).removeClass( 'disabled' );
      } );
    }

    // share widget

    if ($('#share').length) {
      window.fbAsyncInit = function () {
        FB.init({
          appId: '387199319682000',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v13.0',
        });
      };

      $('#share').share_widget({
        site_url: '//' + window.location.hostname,
        share_url: window.location.href,
        title: document.title,
        elements: {
          facebook: {
            display: true,
            icon: 'fab fa-facebook me-3',
          },
          twitter: {
            display: true,
            label: 'X',
            icon: 'fab fa-x-twitter me-3',
            text: null,
            via: null,
          },
          linkedin: {
            display: true,
            icon: 'fab fa-linkedin me-3',
          },
          permalink: {
            display: true,
            icon: 'fas fa-share-alt me-3',
            label: T('Copy link'),
            label_success: T('Copied to clipboard'),
            label_error: T('Error'),
          },
        },
        callback: null, // callback function
      });
    }

    //
    // NEWS
    //

    if ($('#news-grid').length) {
      $('#news-grid').fw_query({
        elements: {
          filters: $('#control-bar .fw-query-filter'),
          sort: $('#sort-menu'),
          reset: $('#control-bar .fw-query-reset'),
        },
      });
    }

    //
    // LEARN
    //

    if ($('.learn-module-grid').length) {
      $('.learn-module-grid').each(function (i) {
        $(this).fw_query({
          elements: {
            filters: $('#control-bar .fw-query-filter'),
            reset: $('#control-bar .fw-query-reset'),
          },
        });
      });
    }

    //
    // VAR ARCHIVE
    //

    if ($('#variable-grid').length) {
      $('#variable-grid').fw_query({
        elements: {
          filters: $('#control-bar .fw-query-filter'),
          sort: $('#sort-menu'),
          reset: $('#control-bar .fw-query-reset'),
        },
      });
    }

    //
    // APPS
    //

    if ($('#apps-grid').length) {
      $('#apps-grid').fw_query({
        elements: {
          filters: $('#control-bar .fw-query-filter'),
          sort: $('#sort-menu'),
          reset: $('#control-bar .fw-query-reset'),
        },
      });
    }

    //
    // FORMS
    //

    $('.form-control.other').hide();

    $('.form-select.has-other').on('change', function () {
      if ($(this).val() == 'Other') {
        $(this).parent().find('.other').show();
      } else {
        $(this).parent().find('.other').val('').hide();
      }
    });

    $('.feedback-form').submit(function (e) {
      e.preventDefault();

      let the_form = $(this),
        form_namespace = the_form.find('[name="namespace"]').val(),
        alert_container = $(this).find('.alert-container'),
        alert_header = alert_container.find('.alert-header'),
        alert_messages = alert_container.find('.alert-messages');

      alert_header.empty().removeClass().addClass('alert-header');
      alert_messages.empty();

      the_form.find('.border-danger').removeClass('border-danger');

      $.ajax({
        url: ajax_data.rest_url + 'cdc/v2/submit_' + form_namespace, // Use the namespace to target the right API endpoint
        data: {
          form: the_form.serializeArray(),
        },
        dataType: 'json',
        success: function (data) {

          alert_header.text(data.header);

          data.messages.forEach(function (msg) {
            alert_messages.append('<li>' + msg + '</li>');
          });

          if (data.invalid.length) {
            alert_header.addClass('alert alert-warning');

            data.invalid.forEach(function (input) {
              const $input = the_form.find('[name="' + input + '"]');
              const $parent = $input.closest('.error-input-parent');

              if ($parent.length) {
                $parent.addClass('border-danger');
              } else {
                $input.addClass('border-danger');
              }
            });
          }

          if (data.mail == 'success') {
            alert_header.addClass('alert alert-success');
            the_form[0].reset();
          } else {
            alert_header.addClass('alert alert-warning');
          }

          if (typeof window.captcha_img_audioObj !== 'undefined')
            captcha_img_audioObj.refresh();

          document.getElementById(form_namespace + '_captcha_img').src =
            '/site/assets/themes/fw-child/resources/php/securimage/securimage_show.php?namespace=' +
            form_namespace +
            '&' +
            Math.random();

          alert_container.show();
        },
      });
    });

    //
    // Learn block GSAP Animation on front page
    //

    if ($( '#page-home' ).length) {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      // Add GSAP animations after the "lg" breakpoint (992px) is reached
      mm.add( '(min-width: 992px)', () => {
        $( '.scroll-card' ).each(function () {
          const card = this;
          const isLastCard = $( card ).closest( '.fw-query-item' ).is( ':last-child' );

          // Set pointer-events to none at the beginning for every card
          $( card ).css( 'pointer-events', 'none' );

          // Define common properties
          const fromToProps = {
            y: '-85%',
            opacity: 0,
            scale: 0.75,
            zIndex: 0,
          };

          const toProps1 = {
            y: '-15%',
            opacity: 1,
            scale: 1,
            zIndex: 100,
            onStart: function() {
              $(card).css('pointer-events', ''); // Enable pointer-events as soon as the animation starts
            },
            onReverseComplete: function() {
              $(card).css('pointer-events', 'none'); // Disable pointer-events when reversing the animation
            },
          };

          const toProps2 = {
            y: '55%',
            opacity: 0,
            scale: 0.75,
            zIndex: 0,
            ease: 'power2.in',
            onComplete: function() {
              $(card).css('pointer-events', 'none');  // Disable pointer-events when this animation is complete
            },
            onReverseComplete: function() {
              $(card).css('pointer-events', '');  // Enable pointer-events when this animation is complete on reverse
            },
          };

          // Customize properties for the last card
          if ( isLastCard ) {
            toProps2.y = '0%';
            toProps2.opacity = 1;
            toProps2.scale = 1;
            toProps2.zIndex = 100;
          }

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: 'top 100%',
              end: 'top -50%',
              scrub: true,
              markers: false,    // Set to true to debug
              onLeave: function() {
                $( card ).css( 'pointer-events', 'none' );  // Disable pointer-events when card leaves
              },
              onEnterBack: function() {
                $(card).css( 'pointer-events', '' );  // Disable pointer-events when card enters back
              },
            }
          });

          timeline
            .fromTo(card, fromToProps, fromToProps)
            .to(card, toProps1)
            .to(card, toProps2);
        });
      } );

      //
      // Learn block Swiper Carousel on front page
      //

      // Function to add AOS attributes to the resources container when window width is under 992px
      function applyResourcesAosAttributes() {
        const resourcesContainer = document.querySelector('#resources-query');
        
        if (window.innerWidth < 992) {
          // Add AOS attributes
          resourcesContainer.setAttribute('data-aos', 'fade-up');
          resourcesContainer.setAttribute('data-aos-easing', 'ease-in-out-quad');
          resourcesContainer.setAttribute('data-aos-duration', '1000');
          resourcesContainer.setAttribute('data-aos-delay', '250');
          resourcesContainer.setAttribute('data-aos-index', '0');

          AOS.init();     // Initialize AOS if not already done
          AOS.refresh();  // Refresh AOS to detect new attributes
        } else {
          // Remove AOS attributes if window width is 992px or more
          resourcesContainer.removeAttribute('data-aos');
          resourcesContainer.removeAttribute('data-aos-easing');
          resourcesContainer.removeAttribute('data-aos-duration');
          resourcesContainer.removeAttribute('data-aos-delay');
          resourcesContainer.removeAttribute('data-aos-index');
        }
      }

      // Function to initialize Swiper
      function initializeResourcesSwiper() {
        const queryItemsContainer = document.querySelector('#resources-query .query-container');
        const queryItemsWrapper = document.querySelector('#resources-query .fw-query-items');
        const queryItemElements = document.querySelectorAll('#resources-query .fw-query-items .fw-query-item');

        // Add the 'swiper-container' class to #resources-query .query-container
        if (queryItemsContainer) {
          queryItemsContainer.classList.add('swiper-container');

          // Create and append the 'swiper-pagination' element
          const paginationElement = document.createElement('div');
          paginationElement.classList.add('swiper-pagination');
          queryItemsContainer.appendChild(paginationElement);
        }

        // Add the 'swiper-wrapper' class to #resources-query .fw-query-items
        if (queryItemsWrapper) {
          queryItemsWrapper.classList.add('swiper-wrapper');
        }

        // Add the 'swiper-slide' class to each .fw-query-item element
        queryItemElements.forEach(item => {
          item.classList.add('swiper-slide');
        });

        // Initialize Swiper
        const resourcesSwiper = new Swiper('#resources-query .swiper-container', {
          slidesPerView: 1,
          breakpoints: {
            0: {
              enabled: true,
              slidesPerView: 1,
            },
            576: {
              enabled: true,
              slidesPerView: 2,
            },
            992: {
              enabled: false,  // Disable Swiper for lg screens and up
            },
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
            type: 'bullets',
          }
        });
      }

      // Initial call to apply AOS attributes and initialize Swiper on resources
      applyResourcesAosAttributes();
      initializeResourcesSwiper();

      // Listen for window resize events to re-apply AOS attributes and refresh AOS when necessary
      $(window).resize(function () {
        applyResourcesAosAttributes();
        AOS.refresh();
      });

    };

    //
    // MISC
    //

    $('body').removeClass('spinner-on');

    //
    // Add 'scrolled' class on body after 50px scroll.
    //

    function toggleBodyScrolledClass() {
      if ( $( window ).scrollTop() > 50 ) {
        $( 'body' ).addClass( 'scrolled' );
      } else {
        $( 'body' ).removeClass( 'scrolled' );
      }
    }

    $( window ).on( 'scroll', toggleBodyScrolledClass );

    $( toggleBodyScrolledClass );

  });

})( jQuery );
