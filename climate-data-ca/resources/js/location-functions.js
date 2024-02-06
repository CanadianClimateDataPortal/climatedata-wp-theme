(function ($) {

    $(function () {

        // PAGE TOUR


        var current_location = {
            id: $('#location-content').attr('data-location'),
            lat: $('#location-content').attr('data-lat'),
            lon: $('#location-content').attr('data-lon'),
        };

        //
        // MAP
        //

        var hosturl = geoserver_url

        var map1 = L.map('location-map', {
            zoomControl: false,
            zoom: 11,
            center: [current_location.lat, current_location.lon],
            dragging: false,
            boxZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false
        });

        map1.createPane('basemap');
        map1.getPane('basemap').style.zIndex = 399;
        map1.getPane('basemap').style.pointerEvents = 'none';

        map1.createPane('grid');
        map1.getPane('grid').style.zIndex = 500;
        map1.getPane('grid').style.pointerEvents = 'none';


        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap'
        }).addTo(map1);

        var highlightGridFeature;

        var pbfLayer = L.vectorGrid.protobuf(hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf", {

            rendererFactory: L.canvas.tile,

            attribution: '',
            interactive: false,
            getFeatureId: function (f) {
                return f.properties.gid;
            },

            vectorTileLayerStyles: {
                'canadagrid': function (properties, zoom) {
                    return {
                        weight: 1,
                        //color: '#e50e40',
                        color: '#9a9fb7',
                        opacity: 0.3,
                        fill: true,
                        radius: 4,
                        //dashArray: '2, 20',
                        fillOpacity: 0
                    }
                }
            },
            pane: 'grid',
        }).on('click', function (e) {

            //console.log('hover', e.layer.properties.gid);

            if (highlightGridFeature) {
                pbfLayer.resetFeatureStyle(highlightGridFeature);
            }

            highlightGridFeature = e.layer.properties.gid;

            pbfLayer.setFeatureStyle(highlightGridFeature, {
                weight: 0,
                color: '#FFF',
                opacity: 1,
                fillColor: '#FFF',
                fill: true,
                fillOpacity: 0.25
            });

        }).addTo(map1);

        var marker = L.marker([current_location.lat, current_location.lon]).addTo(map1);

        // highlight gridcell
        $.ajax({
            url: hosturl + "/geoserver/CDC/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo" +
            "&QUERY_LAYERS=CDC%3Acanadagrid&LAYERS=CDC%3Acanadagrid&INFO_FORMAT=application%2Fjson" +
            "&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG%3A4326&WIDTH=101&HEIGHT=101&BBOX=" +
            current_location.lon + "%2C" + current_location.lat + "%2C" +
            (parseFloat(current_location.lon) + 0.0001) + "%2C" + (parseFloat(current_location.lat) + 0.00001),
            dataType: 'json',
            success: function (data) {
                id = data.features[0].properties.gid;
                pbfLayer.setFeatureStyle(id, {
                    weight: 1.5,
                    color: '#f00',
                    opacity: 1,
                    fill: true,
                    radius: 4,
                    fillOpacity: 0.3
                });
            }
        });


        //highlight = current_location.id;

        /*
         pbfLayer.setFeatureStyle(highlight, {
         weight: 1,
         color: '#f00',
         opacity: 1,
         fill: true,
         radius: 4,
         fillOpacity: 0
         });
         */

        //
        // CHARTS
        //

        var chart_objects = {};

        function update_query(select, val) {

            if (window.location.search != '') {
                var current_search = window.location.search.substr(1).split('&')

                var current_query = {}

                current_search.forEach(function (entry) {
                    var split_entry = entry.split('=')
                    current_query[split_entry[0]] = split_entry[1]
                });

                current_query[select] = val

                //console.log(window.location)

                history.replaceState({}, $('title').text(), window.location.href.split('?')[0] + '?' + $.param(current_query))
            }

        }

        function load_var_by_location(variable, container) {

            let dataset_name = $('input[name="location-dataset"]:checked').val();
            if ($('body').hasClass('page-tour-open')) {
                $('#page-tour').page_tour('hide_tour')
                $('#page-tour').page_tour('destroy')
            }

            chart_objects[container.attr('id')] = {
                container: container,
                variable: variable,
                varDetails: null,
                chartDecimals: null
            }

            //console.log('load var', variable);

            $('body').addClass('spinner-on');

            container.animate({
                opacity: 0.1
            }, {
                duration: 250,
                complete: function () {

                    let ajax_url = site_url + 'variable/' + variable;

                    $.ajax({
                        url: ajax_url,
                        data: {
                            content: 'chart',
                            loc: current_location.id
                        },
                        success: function (data) {
                            let varDetails = JSON.parse($(data).filter('#callback-data').html());
                            let download_url = data_url + '/download-30y/' + current_location.lat + '/' + current_location.lon + '/' + variable + '/ann?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;


                            if ($(data).filter('#callback-data').length) {
                                chart_objects[container.attr('id')]['varDetails'] = JSON.parse($(data).filter('#callback-data').html());
                            }

                            container.html(data);

                            let layerVariableName = variable == "building_climate_zones" ? "hddheat_18" : variable;

                            let json_url = data_url + '/generate-charts/' + current_location.lat + '/' + current_location.lon + '/' + layerVariableName + '?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;

                            //console.log('load chart JSON from ' + 'get_values.php?lat=' + current_location.lat + '&lon=' + current_location.lon + '&var=' + layerVariableName + '&month=ann');

                            $.ajax({
                                url: json_url,
                                dataType: 'json',
                                success: function (chartdata) {

                                    displayChartData(chartdata, varDetails, download_url,
                                        {
                                            'dataset': dataset_name,
                                            'var': layerVariableName,
                                            'mora': 'ann',
                                            'lat': current_location.lat,
                                            'lon': current_location.lon,
                                            'delta': "",
                                        }, $('body').find('#' + layerVariableName + '-chart')[0]);
                                },
                                complete: function () {
                                    $('body').removeClass('spinner-on');
                                }
                            });
                        },
                        complete: function () {
                            container.animate({
                                opacity: 1
                            }, 250);
                        }
                    });


                }
            });

        }



        function update_location_values() {
            let dataset_name = $('input[name="location-dataset"]:checked').val();
            $.ajax({
                url: data_url + '/get-location-values/' + current_location.lat + '/' + current_location.lon + '?dataset_name=' + dataset_name,
                success: function (data) {

                    let location_data = JSON.parse(data);

                    $('#location-hero-default').hide();
                    $('#location-hero-data').show();

                    $.each(location_data, function (variable, variable_data) {
                        $.each(variable_data, function (period, value) {
                            $('#{0}_{1}'.format(variable, period)).text(value);
                        });
                    });
                }
            });
        }

        // INITIAL LOAD
        update_location_values();

        $('.location-data-select').each(function () {

            var first_var = $(this).find(':selected');

            //console.log('initial load', first_var.val());

            update_query($(this).attr('name'), first_var.val())

            load_var_by_location(first_var.val(), $(this).closest('.var-type').find('.var-data-placeholder'));

        });

        // ON CHANGE VAR

        $('.location-data-select').on('select2:select', function (e) {

            update_query($(this).attr('name'), $(this).val())

            load_var_by_location($(this).val(), $(this).closest('.var-type').find('.var-data-placeholder'));

        });

        $('input[name="location-dataset"]').on('change', function (e) {
            let dataset_name = e.target.value;
            update_query('dataset_name', dataset_name);
            update_location_values();

            $('.location-data-select').each(function () {
                let selected_var = $(this).find(':selected');
                load_var_by_location(selected_var.val(), $(this).closest('.var-type').find('.var-data-placeholder'));

            });

        });


        // STICKY KIT

        $('#location-tag-wrap').stick_in_parent({
            offset_top: sticky_offset + $('#main-header').outerHeight()
        });

        $('body').on('click', '.chart-tour-trigger', function (e) {
            e.preventDefault()

            var this_ID = $(this).attr('data-container')
            var chart_pos = $('#' + this_ID).offset()

            var scroll_to = chart_pos.top - ($('#main-header').outerHeight() + 20)

            $('body').addClass('spinner-on')

            $('body, html').animate({
                scrollTop: scroll_to
            }, {
                duration: 1000,
                complete: function () {

                    $('body').css('overflow', 'hidden')

                    var new_options = JSON.parse($('#page-tour').attr('data-steps'))

                    for (var key in new_options) {
                        new_options[key].position.of = '#' + this_ID
                    }
                    if (current_lang == 'fr') {
                        new_options.labels = {
                            start_over: 'Recommencer',
                            next: 'Suivant',
                            close: 'Quitter',
                            dont_show: 'Ne plus montrer'
                        }
                    }

                    $('#page-tour').attr('data-steps', JSON.stringify(new_options))

                    setTimeout(function () {

                        $('#page-tour').page_tour(new_options).page_tour('show_tour')

                        $('body').removeClass('spinner-on')

                    }, 1000)

                }
            })


        })

        $('body').on('click', '.page-tour-close', function (e) {
            $('body').css('overflow', '')
            $('#page-tour').page_tour('destroy')
        })

        //console.log('end of location-functions');
        $.fn.prepare_raster = function(){
            $('#main-header').remove();
            $('.chart-tour-trigger').remove();
            $('.var-chart').first().addClass('to-raster');
        };


    });
})(jQuery);
