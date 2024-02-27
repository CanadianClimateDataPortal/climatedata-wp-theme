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
      $(document).cdc_app();
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

    // $('body').find('[href="#browse-vars"').attr('data-bs-toggle', 'offcanvas')

    // const vars_offcanvas = document.querySelector('#browse-vars')
    //
    // <a class="btn btn-primary" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">
    //   Link with href
    // </a>

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
  });
})(jQuery);
