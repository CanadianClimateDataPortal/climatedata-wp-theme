(function ($) {
  $(function () {
    if ($('body').attr('id') == 'page-map') {
      $(document).cdc_app();
      $(document).map_app();
    }

    if ($('body').attr('id') == 'page-download') {
      $(document).cdc_app();
      $(document).download_app();
    }

    if ($('.query-page .tab-drawer').length) {
      $('.query-page .tab-drawer').tab_drawer({
        history: false,
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
          filters: $('#control-bar .filter'),
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
            filters: $('#control-bar .filter'),
          },
        });
      });

      //       $('.learn-module-grid').each(function (i) {
      //         if (i == 0) {
      //           $(this).fw_query({
      //             elements: {
      //               filters: $('#control-bar .filter'),
      //             },
      //           });
      //         } else {
      //           $(this).fw_query();
      //         }
      //       });
      //
      //       $('#control-bar .filter-item').click(function () {
      //         // sync filtering with each module query
      //
      //         $('.learn-module-grid:not(#module-1)').each(function () {
      //           $(this).fw_query('update_filters');
      //         });
      //       });
    }
  });
})(jQuery);
