//
// GLOBAL CONSTANTS
//

const geoserver_url = 'https://data.climatedata.ca';
const canadaCenter = [62.51231793838694, -98.48144531250001];
const canadaBounds = L.latLngBounds(
  L.latLng(41, -141.1),
  L.latLng(83.6, -49.9),
);
const scenario_names = {
  cmip5: {
    low: 'RCP 2.6',
    medium: 'RCP 4.5',
    high: 'RCP 8.5',
  },
  cmip6: {
    low: 'SSP 1–2.6',
    medium: 'SSP 2–4.5',
    high: 'SSP 5–8.5',
  },
};

var pushes_since_input = 0;

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
