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
    //
    // APPS
    //

    if ($('body').attr('id') == 'page-map') {
      $(document).cdc_app();
      $(document).map_app();
    }

    if ($('body').attr('id') == 'page-download') {
      $(document).cdc_app({
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

    //
    // BOOTSTRAP COMPONENTS
    //

    $('#menu-tabs').tab_drawer({
      history: {
        enabled: false,
      },
      debug: true,
    });

    // get the menu instance
    // so we can create a close event

    const menu_offcanvas = document.getElementById('menu');

    menu_offcanvas.addEventListener('hide.bs.offcanvas', function (e) {
      $('#menu-tabs a[href="#browse-vars"]').removeClass('active');
      $('#menu-tabs').tab_drawer('close_content', ['#browse-vars']);
    });

    //

    if ($('body').attr('id') == 'page-feedback') {
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

    let scroll_offset = 0;

    if ($('#floating-header').length) {
      scroll_offset += $('#floating-header').outerHeight();
    }

    if ($('.query-page #control-bar-tabs').length) {
      new $.Zebra_Pin($('#control-bar-tabs'), {
        top_spacing: scroll_offset,
        contained: true,
      });
    }

    if ($('body').hasClass('post-type-archive-variable')) {
      $(document).on('fw_query_success', function (e, query_item) {
        let query_items = query_item.find('.fw-query-items');

        if (query_items.data('flex_drawer') == undefined) {
          query_items.flex_drawer({
            item_selector: '.fw-query-item',
          });
        } else {
          // reinit if plugin is already loaded
          query_items.flex_drawer('init_items');
        }
      });
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
            icon: 'fab fa-twitter me-3',
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
        },
      });
    }

    //
    // LEARN
    //

    if ($('.learn-topic-grid').length) {
      $('.learn-topic-grid').each(function (i) {
        $(this).fw_query({
          elements: {
            filters: $('#control-bar .fw-query-filter'),
            sort: $('#sort-menu'),
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
        },
      });
    }

    //
    // BETA APPS
    //

    if ($('#apps-grid').length) {
      $('#apps-grid').fw_query({
        elements: {
          filters: $('#control-bar .fw-query-filter'),
          sort: $('#sort-menu'),
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
        alert_container = $(this).find('.alert-container'),
        alert_header = alert_container.find('.alert-header'),
        alert_messages = alert_container.find('.alert-messages');

      alert_header.empty().removeClass().addClass('alert-header');
      alert_messages.empty();

      the_form.find('border-danger').removeClass('border-danger');

      $.ajax({
        url: ajax_data.url,
        data: {
          action: 'cdc_submit_feedback_form',
          form: the_form.serializeArray(),
        },
        dataType: 'json',
        success: function (data) {
          console.log(data);

          alert_header.text(data.header);

          data.messages.forEach(function (msg) {
            alert_messages.append('<li>' + msg + '</li>');
          });

          if (data.invalid.length) {
            alert_header.addClass('alert alert-warning');

            data.invalid.forEach(function (input) {
              the_form.find('[name="' + input + '"]').addClass('border-danger');
            });
          }

          if (data.mail == 'success') {
            alert_header.addClass('alert alert-success');
            the_form.find('.submit-btn').addClass('disabled');
          } else {
            alert_header.addClass('alert alert-warning');
          }

          alert_container.show();
        },
      });
    });
  });
})(jQuery);
