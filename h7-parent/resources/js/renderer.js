// renderer
// v1.0

(function ($) {

    // custom select class

    function renderer(item, options) {

        // options

        var defaults = {
            chart_dir: 'charts',
            chart_options: null,
            has_charts: false,
            charts: {},
            debug: true
        };

        this.options = $.extend(true, defaults, options);

        this.item = $(item);
        this.init();
    }

    renderer.prototype = {

        // init

        init: function () {

            var plugin_instance = this;
            var plugin_item = this.item;
            var plugin_settings = plugin_instance.options;
            var plugin_elements = plugin_settings.elements;

            //
            // INITIALIZE
            //

            if (plugin_settings.debug == true) {
                console.log('initializing renderer');
            }

            if (typeof Highcharts !== 'undefined' && plugin_settings.chart_options != null) {
                Highcharts.setOptions(plugin_settings.chart_options);
            }

            $('body').data('chart_dir', plugin_settings.chart_dir);

            plugin_instance.find_objects();

        },

        find_objects: function (fn_options) {

            var plugin_instance = this;
            var plugin_item = this.item;
            var plugin_settings = plugin_instance.options;
            var plugin_elements = plugin_settings.elements;

            // options

            var defaults = {
                parent: 'body'
            };

            var settings = $.extend(true, defaults, fn_options);

            console.log('finding objects', settings.parent);

            $(settings.parent).find('.renderable').each(function () {

                var container = $(this);

                var render_success = false;

                console.log(container.attr('id'));

                if (container.hasClass('map-object')) {

                    //
                    // MAP
                    //

                    var map_settings = {
                        variables: JSON.parse(container.attr('data-map-variables')),
                        rcp: container.attr('data-map-rcp'),
                        maps: {
                            main: {
                                id: container.find('.map-full').attr('id')
                            },
                            right: {
                                id: container.find('.map-right').attr('id')
                            }
                        }
                    }

                    if (
                        (container.attr('data-map-lat') != '' && container.attr('data-map-lng') != '') ||
                        container.attr('data-map-zoom') != ''
                    ) {
                        map_settings.map_settings = {}
                    }

                    if (container.attr('data-map-lat') != '' && container.attr('data-map-lng') != '') {
                        map_settings.map_settings.center = [container.attr('data-map-lat'), container.attr('data-map-lng')]
                    }

                    if (container.attr('data-map-zoom') != '') {
                        map_settings.map_settings.zoom = container.attr('data-map-zoom')
                    }

                    container.map_renderer(map_settings)

                } else if (container.hasClass('chart-container')) {

                    //
                    // CHART
                    //

                    var container_ID = container.attr('id'),
                        variable = container.attr('data-chart-variable'),
                        lat = container.attr('data-chart-lat'),
                        lon = container.attr('data-chart-lon'),
                        month = container.attr('data-chart-month');

                    var units = JSON.parse(container.attr('data-chart-units'));

                    var varDetails = {
                        units: units,
                        decimals: container.attr('data-chart-decimals')
                    };

                    plugin_settings.charts[container_ID] = {
                        unit: null,
                        decimals: null,
                        series: [],
                        element: null
                    }

                    let layerVariableName = variable == "building_climate_zones" ? "hddheat_18" : variable;

                    $.getJSON(DATA_URL + '/generate-charts/' + lat + '/' + lon + '/' + layerVariableName + '/' + month,
                        function (data) {

                            plugin_settings.charts[container_ID]['unit'] = varDetails.units.value === 'kelvin' ? '°C' : ' ' + varDetails.units.label;
                            plugin_settings.charts[container_ID]['decimals'] = varDetails['decimals'];

                            switch (varDetails.units.value) {
                                case 'doy':
                                    formatter = function () {
                                        return new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.value).toLocaleDateString(current_lang, {
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                    };
                                    pointFormatter = function (format) {
                                        if (this.series.type == 'line') {
                                            return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
                                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.y).toLocaleDateString(current_lang, {
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                + '</b><br/>';
                                        } else {
                                            return '<span style="color:' + this.series.color + '">●</span>' + this.series.name + ': <b>'
                                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.low).toLocaleDateString(current_lang, {
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                + '</b> - <b>'
                                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.high).toLocaleDateString(current_lang, {
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                + '</b><br/>';
                                        }
                                    };
                                    break;
                                default:
                                    formatter = function () {
                                        return this.axis.defaultLabelFormatter.call(this) + ' ' + plugin_settings.charts[container_ID]['unit'];
                                    };
                                    pointFormatter = undefined;
                            }

                            if (data['observations'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.observation,
                                    data: data['observations'],
                                    zIndex: 1,
                                    showInNavigator: true,
                                    color: '#777777',
                                    dashStyle: 'ShortDash',
                                    visible: false,
                                    marker: {
                                        fillColor: '#777777',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#777777'
                                    }
                                });
                            if (data['modeled_historical_median'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.historical,
                                    data: data['modeled_historical_median'],
                                    zIndex: 1,
                                    showInNavigator: true,
                                    color: '#000000',
                                    marker: {
                                        fillColor: '#000000',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#000000'
                                    }
                                });
                            if (data['modeled_historical_range'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.historical_range,
                                    data: data['modeled_historical_range'],
                                    type: 'arearange',
                                    lineWidth: 0,
                                    linkedTo: ':previous',
                                    color: '#000000',
                                    fillOpacity: 0.2,
                                    zIndex: 0,
                                    marker: {
                                        radius: 0,
                                        enabled: false
                                    }
                                });
                            if (data['rcp26_median'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_26_median,
                                    data: data['rcp26_median'],
                                    zIndex: 1,
                                    showInNavigator: true,
                                    color: '#00F',
                                    marker: {
                                        fillColor: '#00F',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#00F'
                                    }
                                });
                            if (data['rcp26_range'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_26_range,
                                    data: data['rcp26_range'],
                                    type: 'arearange',
                                    lineWidth: 0,
                                    linkedTo: ':previous',
                                    color: '#00F',
                                    fillOpacity: 0.2,
                                    zIndex: 0,
                                    marker: {
                                        radius: 0,
                                        enabled: false
                                    }
                                });
                            if (data['rcp45_median'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_45_median,
                                    data: data['rcp45_median'],
                                    zIndex: 1,
                                    showInNavigator: true,
                                    color: '#00640c',
                                    marker: {
                                        fillColor: '#00640c',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#00640c'
                                    }
                                });
                            if (data['rcp45_range'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_45_range,
                                    data: data['rcp45_range'],
                                    type: 'arearange',
                                    lineWidth: 0,
                                    linkedTo: ':previous',
                                    color: '#00640c',
                                    fillOpacity: 0.2,
                                    zIndex: 0,
                                    marker: {
                                        radius: 0,
                                        enabled: false
                                    }
                                });
                            if (data['rcp85_median'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_85_median,
                                    data: data['rcp85_median'],
                                    zIndex: 1,
                                    showInNavigator: true,
                                    color: '#F00',
                                    marker: {
                                        fillColor: '#F00',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#F00'
                                    }
                                });
                            if (data['rcp85_range'].length > 0)
                                plugin_settings.charts[container_ID]['series'].push({
                                    name: chart_labels.rcp_85_range,
                                    data: data['rcp85_range'],
                                    type: 'arearange',
                                    lineWidth: 0,
                                    linkedTo: ':previous',
                                    color: '#F00',
                                    fillOpacity: 0.2,
                                    zIndex: 0,
                                    marker: {
                                        radius: 0,
                                        enabled: false
                                    }
                                });
                            plugin_settings.charts[container_ID]['chart'] = Highcharts.stockChart(container.find('.chart-placeholder')[0], {
                                subtitle: {
                                    align: 'left',
                                    text: document.ontouchstart === undefined ?
                                        chart_labels.click_to_zoom : 'Pinch the chart to zoom in'
                                },

                                xAxis: {
                                    type: 'datetime'
                                },

                                yAxis: {
                                    title: {
                                        text: varDetails['title']
                                    },

                                    labels: {
                                        align: 'left',
                                        formatter: formatter
                                    }
                                },

                                legend: {
                                    enabled: true
                                },

                                tooltip: {
                                    pointFormatter: pointFormatter,
                                    valueDecimals: plugin_settings.charts[container_ID]['decimals'],
                                    valueSuffix: ' ' + plugin_settings.charts[container_ID]['unit']
                                },


                                navigation: {
                                    buttonOptions: {
                                        enabled: false
                                    }
                                },
                                exporting: {
                                    csv: {
                                        dateFormat: '%Y-%m-%d'
                                    }
                                },

                                series: plugin_settings.charts[container_ID]['series']
                            });

                            if (plugin_settings.has_charts == false) {

                                plugin_settings.has_charts = true

                                $('.chart-export-data').click(function (e) {
                                    e.preventDefault();

                                    var this_container = $(this).closest('.chart-container').attr('id')

                                    switch ($(this).attr('data-type')) {
                                        case 'csv' :
                                            plugin_settings.charts[this_container]['chart'].downloadCSV();
                                            break;
                                    }

                                });

                                $('.chart-export-img').click(function (e) {
                                    e.preventDefault();

                                    var this_container = $(this).closest('.chart-container').attr('id'),
                                        dl_type = '';

                                    switch ($(this).attr('data-type')) {
                                        case 'png' :
                                            dl_type = 'image/png';
                                            break;
                                        case 'pdf' :
                                            dl_type = 'application/pdf';
                                            break;
                                    }

                                    plugin_settings.charts[this_container]['chart'].exportChart({
                                        type: dl_type
                                    });

                                });

                            }


                        }
                    );

                }

                if (render_success == true) {
                    container.addClass('rendered');
                }

            });

        },


        _eval: function (fn_code) {

            return Function('return ' + fn_code)();

        }

    }

    // jQuery plugin interface

    $.fn.renderer = function (opt) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {

            var item = $(this);
            var instance = item.data('renderer');

            if (!instance) {

                // create plugin instance if not created
                item.data('renderer', new renderer(this, opt));

            } else {

                // otherwise check arguments for method call
                if (typeof opt === 'string') {
                    instance[opt].apply(instance, args);
                }

            }
        });
    }

}(jQuery));
