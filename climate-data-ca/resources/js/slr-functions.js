(function ($) {

    $(function () {
        // GLOBAL vars

        var landmassLayerLeft, landmassLayerRight;

        has_mapRight = false;
        var hosturl = geoserver_url;
        var canadaBounds = L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.60, -49.9));

        //
        // QUERY OBJECT
        //

        var query = {};

        if ($('#coords').length) {
            query['coords'] = $('#coords').val();
        } else {
            query['coords'] = '62.5325943454858,-98.525390625,4';
        }

        if ($('#geo-select').length) {
            query['geo-select'] = $('#geo-select').val();
        } else {
            query['geo-select'] = '';
        }

        if ($('#rcp').length) {
            query['rcp'] = $('#rcp').val();
        } else {
            query['rcp'] = 'rcp26-p50';
        }

        if ($('#decade').length) {
            query['decade'] = $('#range-slider-container').attr('data-default');
        } else {
            query['decade'] = '2020';
        }



        var history_action = 'init', // global tracking variable for history action
            station_on = false, // flag for showing/hiding the stations layer,
            sector_on = false,
            geoselecting = false; // flag for moveend function to decide whether to update the geo-select parameter

        var gridLayer_options = {

            rendererFactory: L.canvas.tile,
            interactive: true,
            getFeatureId: function (f) {
                return f.properties.gid;
            },
            maxNativeZoom: 12,
            vectorTileLayerStyles: {
                'canadagrid': function (properties, zoom) {
                    return {
                        weight: 0.1,
                        color: gridline_color,
                        opacity: 1,
                        fill: true,
                        radius: 4,
                        fillOpacity: 0
                    }
                },
                'canadagrid1deg': function (properties, zoom) {
                    return {
                        weight: 0.1,
                        color: gridline_color,
                        opacity: 1,
                        fill: true,
                        radius: 4,
                        fillOpacity: 0
                    }
                },
                'slrgrid': function (properties, zoom) {
                    return {
                        weight: 0.1,
                        color: '#89cff0',
                        opacity: 1,
                        fill: true,
                        radius: 4,
                        fillOpacity: 0
                    }
                }
            },
            bounds: canadaBounds,
            maxZoom: 12,
            minZoom: 7,
            pane: 'grid'
        };

        var map1 = L.map("map1", {
            zoomControl: false,
            maxZoom: 12,
            minZoom: 3,
            center: [query['coords'].split(',')[0], query['coords'].split(',')[1]],
            zoom: query['coords'].split(',')[2]
        });

        // layers

        map1.createPane('basemap');
        map1.getPane('basemap').style.zIndex = 399;
        map1.getPane('basemap').style.pointerEvents = 'none';

        map1.createPane('raster');
        map1.getPane('raster').style.zIndex = 400;
        map1.getPane('raster').style.pointerEvents = 'none';

        map1.createPane('grid');
        map1.getPane('grid').style.zIndex = 500;
        map1.getPane('grid').style.pointerEvents = 'all';

        map1.createPane('landmass');
        map1.getPane('landmass').style.zIndex = 510;
        map1.getPane('landmass').style.pointerEvents = 'none';

        map1.createPane('labels');
        map1.getPane('labels').style.zIndex = 550;
        map1.getPane('labels').style.pointerEvents = 'none';


        //
        // BASEMAP
        //

        L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap',
            maxZoom: 12
        }).addTo(map1);


        if ($('#mapRight').length) {


            has_mapRight = true;

            var mapRight = L.map("mapRight", {
                zoomControl: false,
                maxZoom: 12,
                minZoom: 3,
                center: [query['coords'].split(',')[0], query['coords'].split(',')[1]],
                zoom: query['coords'].split(',')[2]
            });


            mapRight.createPane('basemap');
            mapRight.getPane('basemap').style.zIndex = 399;
            mapRight.getPane('basemap').style.pointerEvents = 'none';

            mapRight.createPane('raster');
            mapRight.getPane('raster').style.zIndex = 400;
            mapRight.getPane('raster').style.pointerEvents = 'none';

            mapRight.createPane('grid');
            mapRight.getPane('grid').style.zIndex = 500;
            mapRight.getPane('grid').style.pointerEvents = 'all';

            mapRight.createPane('landmass');
            mapRight.getPane('landmass').style.zIndex = 510;
            mapRight.getPane('landmass').style.pointerEvents = 'none';

            mapRight.createPane('labels');
            mapRight.getPane('labels').style.zIndex = 550;
            mapRight.getPane('labels').style.pointerEvents = 'none';



            L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                pane: 'basemap',
                maxZoom: 12,
                minZoom: 3,
            }).addTo(mapRight);


            gridLayerRight = L.vectorGrid.protobuf(
                hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:slrgrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                gridLayer_options
            ).on('click', function (e) {
                grid_click(e);
            }).on('mouseover', function (e) {
                grid_hover(e);
            }).on('mouseout', function (e) {
                grid_hover_cancel(e);
            }).addTo(mapRight);



            L.tileLayer('//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(mapRight);




             wmsOptions = {
             format: 'image/png',
             transparent: true,
             tiled: true,
             opacity: 1,
             pane: 'raster',
             'VERSION': '1.3.0',
             bounds: canadaBounds,
             layers: 'CDC:' + 'slr-ys-rcp26-p50-ann-30year'
             };
             rightLayer = L.tileLayer.wms(hosturl + '/geoserver/ows?', wmsOptions).addTo(mapRight);

             invalidate_maps();

             map1.sync(mapRight);
             mapRight.sync(map1);

        }
        // get initial page title to manipulate for history pushes

        var init_title = $('title').text().split(' — ');
        var title_pre = init_title[0],
            title_post = init_title[2];

        //
        //
        // GLOBAL OPTIONS
        //
        //

        var colormap;

        //
        // UX ELEMENTS
        //

        // ION SLIDER

        // decade

        if ($('#range-slider').length) {


            var $rs = $("#range-slider");
            console.log($('#decade').val);

            $rs.ionRangeSlider({
                grid: false,
                skin: "round",
                from_value: 2100,
                hide_min_max: true,
                prettify_enabled: false,
                values: [2006,2010,2020,2030,2040,2050,2060,2070,2080,2090,2100],

                onChange: function (data) {
                    newval = data.from_value;
                    $('#decade').val(newval).trigger('change');

                    update_param('decade', newval);

                    update_query_string();

                }
            });

            var rs_instance = $("#range-slider").data("ionRangeSlider");

            $rs.on("finish", function (e) {

                e.stopPropagation();
                var $inp = $(this);
                var from = $inp.prop("value"); // reading input value
                //var from2 = $inp.data("from"); // reading input data-from attribute

            });

        }

        // SELECT2

        // geo-select

        function formatGeoSelect(item) {

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

        $("#geo-select").select2({
            language: current_lang,
            ajax: {
                url: child_theme_dir + "resources/app/run-frontend-sync/select-place.php",
                dataType: 'json',
                delay: 0,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        search: params,
                        page: params.page
                    };
                },
                transport: function (params, success, failure) {
                    var $request = $.ajax(params);

                    var llcheck = new RegExp('^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)\\s*,\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$');

                    term = params.data.q;


                    if (llcheck.test(term)) {
                        $request.fail(failure);
                        // $('.select2-results__option').text('custom');
                        $('.select2-results__options').empty();
                        $('.select2-results__options').append('<li style="padding:10px"><strong>Custom Lat/Lon Detected:</strong><br>Map has panned to validated coordinates.</li>');
                        var term_segs = term.split(',');
                        var term_lat = term_segs[0];
                        var term_lon = term_segs[1];
                        map1.panTo([term_lat, term_lon]);
                    } else {
                        $request.then(success);
                        return $request;
                    }
                },
                processResults: function (data, page) {
                    // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data
                    return {
                        results: data.items
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            minimumInputLength: 1,
            width: '100%',
            //width: "300px",
            templateResult: formatGeoSelect,
            //theme: "bootstrap4"
            //templateResult: formatRepo, // omitted for brevity, see the source of this page
            //templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
        });

        //
        // MAP STUFF
        //

        // VARS

        // data URLs


        // grid line/fill options

        var gridline_color = '#fff';
        var gridline_color_hover = '#fff';
        var gridline_color_active = '#fff';
        var gridline_width = '0.2';
        var gridline_width_active = '1';

        var gridfill_color_hover = '#fff';

        // UTILITIES

        function invalidate_maps() {

            map1.invalidateSize();

            if (has_mapRight == true) {
                mapRight.invalidateSize();
            }

        }

        //
        // MAIN / LEFT MAP
        //

        // object


        var leftLegend = L.control({position: 'topright'});
        var rightLegend = L.control({position: 'topright'});

        var idfLayer;

        var highlightGridFeature;
        var highlightGridFeatureRightLayer;

        //
        // IDF CURVES LAYER
        //

        function popup_markup(properties) {

            var popup_headings = [
                'Name',
                'Elevation',
                'Downloads (will open in a new window)'
            ];

            if (current_lang == 'fr') {
                popup_headings = [
                    'Nom',
                    'Altitude',
                    'Téléchargement (Une nouvelle fenêtre s’ouvrira)'
                ];
            }

            return '<div class="idf-popup-row">' +
                '<h6>' + popup_headings[0] + '</h6>' +
                '<h5 class="idfTitle">' + properties.Name + '</h5>' +
                '</div>' +
                '<div class="idf-popup-row">' +
                '<h6>' + popup_headings[1] + '</h6>' +
                '<h5 class="idfElev">' + properties.Elevation_ + '</h5>' +
                '</div>' +
                '<h6>' + popup_headings[2] + '</h6>' +
                '<ul class="idfBody list-unstyled"></ul>';

        }

        //
        // GRID LAYER
        //

        var clearGridHighlight = function () {
            if (highlightGridFeature) {
                gridLayer.resetFeatureStyle(highlightGridFeature);
                gridLayerRight.resetFeatureStyle(highlightGridFeature);
            }
            highlightGridFeature = null;
        };

        // grid hover functions

        function grid_hover(e) {

            grid_initialized = true;

            grid_hover_cancel(e);
            let rcp = e.target.rcp;
            let percentile = e.target.percentile;

            gridHoverTimeout = setTimeout(function () {
                let decade_value = parseInt($("#decade").val());
                let values_url;
                let varDetails = {units: {value: 'cm', label: 'cm'}, decimals:0};

                values_url = data_url + "/get-slr-gridded-values/" +
                    e.latlng['lat'] + "/" + e.latlng['lng'] +
                    "?period=" + decade_value;

                gridHoverAjax = $.ajax({
                    url: values_url,
                    dataType: "json",
                    success: function (data) {
                        let tip = [];
                        val1 = value_formatter(data[rcp][percentile], varDetails, false);
                        tip.push("<b>" + val1 + "</b><br/>");

                        e.target.bindTooltip(tip.join("\n"), {sticky: true}).openTooltip(e.latlng);


                        if ($('body').hasClass('map-compare')) {
                            rcp = e.target.opposite.rcp;
                            percentile = e.target.opposite.percentile;
                            tip = [];
                            val1 = value_formatter(data[rcp][percentile], varDetails, false);
                            tip.push("<b>" + val1 + "</b><br/>");


                            e.target.opposite.bindTooltip(tip.join("\n")).openTooltip(e.latlng);
                        }
                    }
                });
            }, 100);



            // set the highlight

            highlight_properties = {
                weight: 0,
                color: gridline_color_hover,
                opacity: 1,
                fillColor: gridfill_color_hover,
                fill: true,
                fillOpacity: 0.25
            };

            if (highlightGridFeature) {
                gridLayer.resetFeatureStyle(highlightGridFeature);
            }

            highlightGridFeature = e.layer.properties.gid;

            gridLayer.setFeatureStyle(highlightGridFeature, highlight_properties);

            if (has_mapRight) {

                gridLayerRight.resetFeatureStyle(highlightGridFeatureRightLayer);

                highlightGridFeatureRightLayer = e.layer.properties.gid;

                gridLayerRight.setFeatureStyle(highlightGridFeatureRightLayer, highlight_properties);

            }

        }

        function grid_hover_cancel(e) {
            // cancel current timeout
            if (typeof gridHoverTimeout !== 'undefined' && gridHoverTimeout !== null) {
                clearTimeout(gridHoverTimeout);
                if (e) {
                    e.target.unbindTooltip();
                }
                gridHoverTimeout = null;
            }

            // cancel in-flight ajax call to avoid duplicated tooltips
            if (typeof gridHoverAjax !== 'undefined' && gridHoverAjax !== null) {
                gridHoverAjax.abort();
                gridHoverAjax = null;
            }

        }


        // grid click

        function grid_click(e) {

            console.log('grid clicked');

            grid_initialized = true;

            // re-center the map on
            // half the map width minus 100px
            // so that the highlighted square shows beside the chart overlay

            var offset = (map1.getSize().x * 0.5) - 100;

            map1.panTo([e.latlng.lat, e.latlng.lng], {animate: false}); // pan to center
            map1.panBy(new L.Point(offset, 0), {animate: false}); // pan by offset

            // set the highlight

            var highlight_properties = {
                weight: 1.6,
                color: gridline_color_active,
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0
            };

            if (highlightGridFeature) {
                gridLayer.resetFeatureStyle(highlightGridFeature);
            }

            highlightGridFeature = e.layer.properties.gid;
            gridLayer.setFeatureStyle(highlightGridFeature, highlight_properties);

            if (has_mapRight == true) {

                gridLayerRight.resetFeatureStyle(highlightGridFeatureRightLayer);

                highlightGridFeatureRightLayer = e.layer.properties.gid;

                gridLayerRight.setFeatureStyle(highlightGridFeatureRightLayer, highlight_properties);

            }

            // open the chart
            current_coords=[e.latlng.lat, e.latlng.lng];
            genChart(e.latlng.lat, e.latlng.lng, 'slr', 'ann');

            L.DomEvent.stop(e);

        }



        var gridHoverTimeout, gridHoverAjax;
        var gridLayer;
        gridLayer = L.vectorGrid.protobuf(
            hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + 'slrgrid' + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            gridLayer_options
        ).on('click', function (e) {
            grid_click(e);
        }).on('mouseover', function (e) {
            grid_hover(e);
        }).on('mouseout', function (e) {
            grid_hover_cancel(e);
        });

        // add to map
        gridLayer.addTo(map1);
        gridLayerRight.opposite = gridLayer;
        gridLayer.opposite = gridLayerRight;


        landmassLayer_options = {
            rendererFactory: L.canvas.tile,
            interactive: false,
            maxNativeZoom: 12,
            vectorTileLayerStyles: {
                'landmass': function (properties, zoom) {
                    return {
                        weight: 0.1,
                        color: '#686968',
                        fillColor: '#fafaf8',
                        opacity: 1,
                        fill: true,
                        radius: 4,
                        fillOpacity: 1
                    }
                }
            },
            bounds: L.latLngBounds(L.latLng(24, -180), L.latLng(83.50, -52.1)),
            maxZoom: 12,
            minZoom: 3,
            pane: 'landmass'
        };

        landmassLayerLeft= L.vectorGrid.protobuf(
            hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:landmass@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            landmassLayer_options
        ).addTo(map1);
        if (has_mapRight) {
            landmassLayerRight= L.vectorGrid.protobuf(
                hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:landmass@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                landmassLayer_options
            ).addTo(mapRight);
        }

        map1.on('zoom', function (e) {
            grid_hover_cancel(null);
        });

        //
        // CITY LABELS
        //

        L.tileLayer('//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
            pane: 'labels'
        }).addTo(map1);

        //
        // DEFAULT RASTER
        //

        leftLayer = L.tileLayer.wms(hosturl + '/geoserver/ows?', {
            format: 'image/png',
            opacity: 1,
            transparent: true,
            tiled: true,
            pane: 'raster',
            VERSION: '1.3.0',
            bounds: canadaBounds,
            layers: 'CDC:slr-ys-rcp26-p50-ann-30year'
        }).addTo(map1);

        leftLayer.setOpacity(10);

        invalidate_maps();

        // get map bounds

        bounds = map1.getBounds().toBBoxString();

        //
        // RIGHT MAP
        //

        var mapRight, gridLayerRight, rightLayer;


        //
        //
        // CHART STUFF
        //
        //
        function disPlayChartData(data, varDetails) {
            chartUnit = varDetails.units.value === 'kelvin' ? "°C" : varDetails.units.label;
            chartDecimals = varDetails['decimals'];
            switch (varDetails.units.value) {
                case 'doy':
                    formatter = function () {return new Date(1546300800000+1000*60*60*24*this.value).toLocaleDateString(current_lang, { month:'long', day:'numeric'})};
                    pointFormatter = function (format) {
                        if (this.series.type == 'line') {
                            return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name+ ': <b>'
                                + new Date(1546300800000+1000*60*60*24*this.y).toLocaleDateString(current_lang, { month:'long', day:'numeric'})
                                + '</b><br/>';
                        } else {
                            return '<span style="color:' + this.series.color + '">●</span>' + this.series.name + ': <b>'
                                + new Date(1546300800000+1000*60*60*24*this.low).toLocaleDateString(current_lang, { month:'long', day:'numeric'})
                                + '</b> - <b>'
                                + new Date(1546300800000+1000*60*60*24*this.high).toLocaleDateString(current_lang, { month:'long', day:'numeric'})
                                + '</b><br/>';
                        }};
                    break;
                default:
                    formatter = function () {return this.axis.defaultLabelFormatter.call(this) + ' ' + chartUnit;};
                    pointFormatter = undefined;
            }

            chartSeries = [];

            chartSeries.push({
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
                }});

            chartSeries.push({
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
                }});

            chartSeries.push({
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
                }});

            chartSeries.push({
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
                }});

            chartSeries.push({
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
                }});

            chartSeries.push({
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
                }});

            chartSeries.push({
                name: chart_labels.rcp_85_enhanced,
                data: data['rcp85_enhanced'],
                zIndex: 1,
                showInNavigator: true,
                color: '#B97900',
                marker: {
                    fillColor: '#B97900',
                    enabled: true,
                    lineWidth: 0,
                    radius: 15,
                    lineColor: '#B97900'
                }});


            var chart = Highcharts.stockChart('chart-placeholder', {

                title: {
                    text: varDetails['title']
                },
                subtitle: {
                    align: 'left',
                    text: document.ontouchstart === undefined ?
                        chart_labels.click_to_zoom : 'Pinch the chart to zoom in'
                },

                xAxis: {
                    ordinal:false,
                    min: Date.UTC(2000, 1, 1),
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
                    valueDecimals: chartDecimals,
                    valueSuffix: ' ' + chartUnit
                },

                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },

                exporting: {
                    csv: {
                        columnHeaderFormatter: function (item, key) {
                            if (!item || item instanceof Highcharts.Axis) {
                                return false;
                            }
                            // Item is not axis, now we are working with series.
                            // Key is the property on the series we show in this column.
                            if (key == 'low') {
                                return item.name.substring(0,7) + ' lower (5th percentile)';
                            }
                            if (key == 'y') {
                                return item.name.substring(0,7) + ' median (50th percentile)';
                            }
                            if (key == 'high') {
                                return item.name.substring(0,7) + ' upper (95th percentile)';
                            }




                            return false;
                        },
                    dateFormat: '%Y-%m-%d'
                    }
                },

                series: chartSeries
            });


            $('.chart-export-data').click(function (e) {
                e.preventDefault();

                var dl_type = '';

                switch ($(this).attr('data-type')) {
                    case 'csv' :
                        try {
                            setDataLayerForChartData('csv', chart);
                        } catch (e) {
                            console.error(e);
                        }

                        chart.downloadCSV();
                        break;
                }

            });

            $('.chart-export-img').click(function (e) {
                e.preventDefault();

                var dl_type = '';
                let file_format = $(this).attr('data-type');

                switch (file_format) {
                    case 'png' :
                        dl_type = 'image/png';
                        break;
                    case 'pdf' :
                        dl_type = 'application/pdf';
                        break;
                }
                setDataLayerForChartData(file_format, chart);
                chart.exportChartLocal({
                    type: dl_type
                });
            });
        }

        var variableDownloadDataTypes = {
            // Variable_Download-Data_*
            'slr': 'Sea-Level_Change'
        };

        function getGA4EventNameForVariableDownloadData(chartDataFormat, keySelected) {
            var gA4EventNameForVariableDownloadData = "undefined";
            keySelected = keySelected.toLowerCase();

            if (keySelected in variableDownloadDataTypes) {
                var eventType = '';
                if (chartDataFormat.includes('csv')) {
                    eventType = "Variable_Download-Data_";
                } else if (chartDataFormat.includes('pdf') || chartDataFormat.includes('png')) {
                    eventType = "Variable_Download-Image_";
                } else {
                    throw ('Invalid GA4 event file format (csv, pdf, png): ' + chartDataFormat);
                }
                gA4EventNameForVariableDownloadData = eventType + variableDownloadDataTypes[keySelected];
            }

            return gA4EventNameForVariableDownloadData;
        }


        function setDataLayerForChartData(chartDataFormat, chartData) {

            if (!chartDataFormat.length) {
                throw new Error('Value undefined or empty, please specify the file format (ex. csv, pdf, png, etc.)') ;
            }
            var eventName = getGA4EventNameForVariableDownloadData(chartDataFormat, "slr");
            var overlayTitle = $('.overlay-title').text();

            var addStr = "";
            for (let index = 0; index < chartData.series.length; index++) {
                if (chartData.series[index].visible && chartData.series[index].type != 'areaspline') {
                    addStr += chartData.series[index].name + ", ";
                }
            }

            // Remove last 2 char: ;
            if (addStr.length > 0) {
                addStr = addStr.substring(0, addStr.length - 2);
            }

            // ex: Région de la Montérégie; rcp26; Annuel
            let chartDataSettings = overlayTitle + "; " + query['rcp'] + "; " + (($('body').hasClass('lang-fr')) ? 'Annuel' : 'Annual');

            console.log("download file type: " + chartDataFormat)
            // console.log("eventName: " + eventName)

            dataLayer.push({
                'event': eventName,
                'chart_data_event_type': eventName,
                'chart_data_settings': chartDataSettings,
                'chart_data_columns': addStr,
                'chart_data_format': chartDataFormat,
                'chart_data_view_by': "Gridded data"
            });
        }

        // LAYER CHART
        function genChart(lat, lon, variable, month) {
            $(document).overlay('show', {
                href: base_href + 'variable/' + 'slr' + '/',
                data: {
                    lat: lat,
                    lon: lon
                },
                content: 'slr-location',
                position: 'right',
                callback: function (varDetails) {

                    $('#rcp').prop('disabled', true);
                    $('#rightrcp').prop('disabled', true);

                    $.getJSON(
                        data_url + '/generate-charts/' + lat + '/' + lon + '/' + variable + '/' + month,
                        function (data) {
                            disPlayChartData(data,varDetails);


                        });

                }
            });
        };

        //
        //
        // LEGEND STUFF
        //
        //

        function legend_markup(legendTitle, colormap) {

            labels = [];

            labels.push('<h6 class="legendTitle">' + legendTitle + '</h6>');

            var first_label = colormap[0].label;

            if (current_lang == 'fr') {
                first_label = first_label.replace('Degree Days', 'Degrés-jours');
                first_label = first_label.replace('Days', 'Jours');
            }

           // labels.push('<span class="legendLabel max">' + first_label + '</span>');

            labels.push('<div class="legendRows">');

            var min_label = '';

            for (let i = 0; i < colormap.length; i++) {
                unitValue = colormap[i].label;
                unitColor = colormap[i].color;

                if (unitValue !== 'NaN') {

                    if (current_lang == 'fr') {
                        unitValue = unitValue.replace('Degree Days', 'Degrés-jours');
                        unitValue = unitValue.replace('Days', 'Jours');
                    }
                    style='background:' + unitColor;

                    t="";
                    if (i==0) {
                        style="; border-bottom: 10px solid " + unitColor +
                            "; border-left: 8px solid transparent" +
                            "; border-right: 8px solid transparent";
                        t='<span class="legendLabel max">' + first_label + '</span>';

                        labels.push(
                            '<div class="legendRow">' +
                            '<span class="legendLabel max">' + unitValue + '</span>' +
                            '<div class="legendColor" style="border-bottom: 10px solid ' + unitColor +
                            '; border-left: 8px solid transparent; border-right: 8px solid transparent"></div>' +
                            '<span class="legendUnit">&gt; ' + unitValue + '</span>' +
                            '</div>'
                        );
                    }
                    else if (i==colormap.length -1) {
                        labels.push(
                            '<div class="legendRow">' +
                            '<span class="legendLabel min">' + unitValue + '</span>' +
                            '<div class="legendColor" style="border-top: 10px solid ' + unitColor +
                            '; border-left: 8px solid transparent; border-right: 8px solid transparent"></div>' +
                            '<span class="legendUnit">&lt; ' + unitValue + '</span>' +
                            '</div>');
                    } else {
                        labels.push(
                            '<div class="legendRow">' +
                            '<div class="legendColor" style="' + style + '"></div>' +
                            '<div class="legendUnit">' + unitValue + '</div>' +
                            '</div>');
                    }

                } else {
                    if (i==colormap.length -1) {
                        labels.push(
                            '<div class="legendRow">' +
                            '<span class="legendLabel ">0</span>' +
                            '<div class="legendColor" style="background:' + unitColor +'"></div>' +
                            '<span class="legendUnit">0</span>' +
                            '</div>');
                    }
                }
            }

            labels.push('</div><!-- .legendRows -->');


            return labels;

        }

        // LEFT LEGEND

        function generateLeftLegend() {

            rcp_value = $("#rcp").val();
            decade_value = parseInt($("#decade").val());

            var layer = 'slr-ys-' + rcp_value + '-ann-30year';

            var legendTitle = "";// mora_text_value;

            $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:" + layer + "&format=application/json")
                .then(function (data) {

                    let colormap = '';

                    labels = [];
                    leftLegend.onAdd = function (map1) {
                        let div = L.DomUtil.create('div', 'info legend legendTable');
                        colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                        let unitValue;
                        let unitColor;

                        colormap = colormap.reverse();

                        labels = legend_markup(legendTitle, colormap);

                        div.innerHTML = labels.join('');
                        return div;

                    };

                        leftLegend.addTo(map1);

                    if ($('#rightrcp').val() !== 'disabled') {
                        generateRightLegend(layer, legendTitle, data);
                    }

                })
                .fail(function (err) {

                });


        }

        function generateRightLegend(layer, legendTitle, data) {

            labels = [];
            rightLegend.onAdd = function (mapRight) {
                let div = L.DomUtil.create('div', 'info legend legendTable');
                let colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                let unitValue;
                let unitColor;

                labels = legend_markup(legendTitle, colormap);

                div.innerHTML = labels.join('');
                return div;

            };

            rightLegend.addTo(mapRight);

        }

        //
        //
        // UX BEHAVIOURS
        //
        //

        function layer_swap(fn_options) {


            var defaults = {
                layer: null,
                action: 'on'
            };

            var settings = $.extend(true, defaults, fn_options);


            if (settings.action === 'on') {
                $('body').addClass(settings.layer + '-on');
            } else {
                $('body').removeClass(settings.layer + '-on');
            }


            if (settings.action === 'on') {

                // set global var & body class

                var_on = true;

                // show variable layer


                map1.addLayer(gridLayer);
                map1.addLayer(leftLayer);

                // set grid click/hover functions if they haven't already been
                // i.e. if the sector filter exists but its value is ""

                gridLayer.on('click', function (e) {

                    if (grid_initialized == false) {
                        grid_click(e);
                    }

                }).on('mouseover', function (e) {

                    if (grid_initialized == false) {
                        grid_hover(e);
                    }

                });

                if (has_mapRight == true) {
                    mapRight.addLayer(gridLayerRight);
                    mapRight.addLayer(rightLayer);

                    gridLayerRight.on('click', function (e) {

                        if (grid_initialized == false) {
                            grid_click(e);
                        }

                    }).on('mouseover', function (e) {

                        if (grid_initialized == false) {
                            grid_hover(e);
                        }

                    });

                }

                // turn on right map if the RCP is set to a 'compare' scenario

                if ($('#rcp').val().indexOf("vs") !== -1) {

                    $('body').addClass('map-compare');
                    invalidate_maps();

                }

                // enable filters

                $('#rcp').prop('disabled', false);
                $('#rightrcp').prop('disabled', false);


            } else {

                // set global var & body class

                var_on = false;

                // hide variable layer

                map1.removeLayer(gridLayer);
                map1.removeLayer(leftLayer);

                if (has_mapRight == true) {
                    mapRight.removeLayer(gridLayerRight);
                    map1.removeLayer(rightLayer);
                }

                // turn off right map

                $('body').removeClass('map-compare');

                invalidate_maps();

            }



        }



        //
        //
        // QUERY STUFF
        //
        //

        // convert coords value to array

        function coords_to_array() {

            var coords_split = query['coords'].split(',');

            return {
                lat: coords_split[0],
                lon: coords_split[1],
                lng: coords_split[1],
                z: coords_split[2]
            }
        }

        // convert query string to object

        function query_str_to_obj() {

            if (window.location.search !== '') {

                // get the current query string and split it into an array

                var queryArr = window.location.search.substr(1).split('&');

                for (q = 0; q < queryArr.length; q++) {

                    var qArr = queryArr[q].split('=');

                    var q_key = qArr[0];
                    var q_val = qArr[1];

                    // populate the global 'query' variable

                    if (typeof q_key !== 'undefined') {
                        query[q_key] = q_val;
                    }

                }

            }

        }

        // convert query object to string

        function query_obj_to_str() {
            var str = [];
            for (var p in query) {
                if (query.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + query[p]);
                }
            }
            return str.join('&');
        }

        // evaluate query object

        function eval_query_obj() {


            // update the UX elements to reflect each query value

            for (var key in query) {
                if (query.hasOwnProperty(key)) {

                    if ($('#' + key).length) {


                        if ($('#' + key).val() != query[key]) {
                            $('#' + key).val(query[key]).trigger('change');
                        }

                        // extra conditionals

                        if (key === 'coords') {

                            // if the current center is different from the query['coords'] value

                            var current_center = map1.getCenter();
                            var current_zoom = map1.getZoom();

                            var query_center = [query[key].split(',')[0], query[key].split(',')[1]];
                            var query_zoom = query[key].split(',')[2];

                            if (current_zoom !== query_zoom || current_center.lat !== query_center[0] || current_center.lng !== query_center[1]) {

                                // console.log('set view', query[key].split(',')[0], query[key].split(',')[1], query[key].split(',')[2]);
                                map1.setView([query[key].split(',')[0], query[key].split(',')[1]], query[key].split(',')[2], {animate: false});

                            }

                        } else if (key === 'decade') {

                            $('#' + key).val(query[key]).trigger('change');

                             rs_instance.update({
                                 from: $("#decade").prop('selectedIndex')
                             });

                        } else if (key == 'geo-select') {

                            //$('#geo-select').trigger('change');

                        }

                    }

                }

            }

            // console.log('done evaluating the query, updating URL string', history_action);
            update_query_string();

        }

        // update parameter

        function update_param (key, val) {
            // update the query key
            query[key] = val;
            // input values that are not changed by mouse interactions
            // i.e. they are not select menus
            if (key === 'coords') {
                $('#coords').val(val);
            }
        }

        // push/replace state

        function update_query_string() {
            // convert the current object back to a string
            var new_query_string = query_obj_to_str();
            //console.log('new', new_query_string);
            var new_url = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + new_query_string;
            // if the string has changed
            if (window.location.href !== new_url) {
                //console.log(history_action);
                var new_title = title_pre + ' — ' + 'Sea-Level Change' + ' — ' + title_post;
                $('title').text(new_title);
                if (history_action == 'push') {
                    // console.log('----- push -----');
                    window.history.pushState('', new_title, new_url);
                } else if (history_action == 'replace' || history_action == 'init') {
                    // console.log('----- replace -----');
                    window.history.replaceState('', new_title, new_url);
                } else {
                    // console.log('----- ' + history_action + ' -----');
                }
            }
            history_action = 'push';
        }


        $('#geo-select').on('select2:select', function (e) {

            // console.log('geo-select');

            thislat = e.params.data.lat;
            thislon = e.params.data.lon;

            geoselecting = true;

            //update_param('coords', thislat + ',' + thislon + ',11');
            map1.setView([thislat, thislon], 10);

        });



        $('#decade').change(function (e) {
            //console.log('decade changed');
            changeLayers();
        });


        $('#rcp').change(function (e) {
            //console.log('rcp changed', $(this).val());

            update_param('rcp', $(this).val());
            update_query_string();
            generateLeftLegend();
            changeLayers();
        });
        $('#rightrcp').change(function (e) {
            //console.log('rcp changed', $(this).val());

            update_param('rightrcp', $(this).val());
            update_query_string();
            generateLeftLegend();
            changeLayers();
        });

        function changeLayers() {
            rcp_value = $("#rcp").val();
            right_rcp_value =  $("#rightrcp").val();
            gridLayer.rcp = rcp_value.split("-")[0];
            gridLayer.percentile = rcp_value.split("-")[1];
            gridLayerRight.rcp = right_rcp_value.split("-")[0];
            gridLayerRight.percentile = right_rcp_value.split("-")[1];

            // decade_value = $("#decade").val();
            decade_value = parseInt($("#decade").val());

            layer_swap({
                layer: 'variable'
            });


            msorys = 'ys';
            msorysmonth = '-ann';
            legendmsorys = 'ann';

            generateLeftLegend();


            singleLayerName = 'slr-ys-' + rcp_value + '-ann-30year';

            if (rcp_value === 'rcp85plus65-p50' || right_rcp_value === 'rcp85plus65-p50' ) {
                // disable decade slider
                if (rs_instance.options.disable == false) {
                    rs_instance.update({
                        from: 2100,
                        disable: true
                    });
                }
            } else {
                if (rs_instance.options.disable == true) {
                    rs_instance.update({
                        disable: false
                    });
                }
            }


            // if a compare scenario was selected

            if (right_rcp_value !== 'disabled') {

                $('body').addClass('map-compare');

                invalidate_maps();


                leftLayer.setParams({
                    format: 'image/png',
                    transparent: true,
                    opacity: 1,
                    pane: 'raster',
                    'TIME': decade_value + '-01-00T00:00:00Z',
                    'VERSION': '1.3.0',
                    layers: 'CDC:' + 'slr-ys-' + rcp_value + '-ann-30year'
                });


                if (has_mapRight === true) {
                    rightLayer.setParams({
                        format: 'image/png',
                        transparent: true,
                        opacity: 1,
                        pane: 'raster',
                        styles: 'slr-' + rcp_value,
                        'TIME': decade_value + '-01-00T00:00:00Z',
                        'VERSION': '1.3.0',
                        layers: 'CDC:' + 'slr-ys-' + right_rcp_value + '-ann-30year'
                    });
                }

                // also generate the right legend

                //generateRightLegend(rightLayerName, mora_text_value);

            } else {

                $('body').removeClass('map-compare');

                invalidate_maps();

                leftLayer.setParams({
                    format: 'image/png',
                    transparent: true,
                    opacity: 1,
                    'TIME': decade_value + '-01-00T00:00:00Z',
                    'VERSION': '1.3.0',
                    layers: 'CDC:' + singleLayerName
                });

            }


        }




        // MAP EVENTS

        $('#map-controls span').click(function () {

            var current_zoom = map1.getZoom();
            var new_zoom;

            if ($(this).attr('id') == 'zoom-in') {
                new_zoom = current_zoom + 1;
            } else {
                new_zoom = current_zoom - 1;
            }

            map1.setZoom(new_zoom);

        });

        // on zoom/pan

        var centering_on_init = true;
        var duplicate = false;

        function mapMoveEnd(e) {

            if (history_action != 'pop') {

                var old_zoom = query['z'];
                var new_zoom = map1.getZoom();

                var old_xy = query['coords'].split(',');
                var new_xy = L.latLng(map1.getCenter());

                update_param('coords', new_xy.lat + ',' + new_xy.lng + ',' + new_zoom);

                if (geoselecting == true) {
                    update_param('geo-select', $('#geo-select').val());
                    geoselecting = false;
                }

                update_query_string();

            }

            // prevent from firing multiple times
            map1.off('moveend', mapMoveEnd);
            setTimeout(function () {
                map1.on('moveend', mapMoveEnd);
            }, 300);

        }

        map1.on('moveend', mapMoveEnd);

        // OVERLAY

        $('#page-variable .overlay-close').click(function () {
            clearGridHighlight();
        });

        // HISTORY

        // on initial load

        // convert the current URL string to an object
        query_str_to_obj();


        // evaluate query

        eval_query_obj();

        // generate initial legends

        rcp_value = $("#rcp").val();
        generateLeftLegend();


        // hide spinner

        $('body').removeClass('spinner-on');

        // POP STATE

        window.onpopstate = function () {

            // convert the current query string to an object
            query_str_to_obj();

            // set the history action to 'pop' while the updates happen
            history_action = 'pop';

            // evaluate the query object
            eval_query_obj();

            var new_title = title_pre + ' — ' + 'Sea-Level Change' + ' — ' + title_post;

            $('title').text(new_title);

            $('body').removeClass('spinner-on');

        };

        // set history_action to 'push'
        history_action = 'push';

        //
        // LISTENERS
        //

        $(document).on('overlay_hide', function () {
            $('#var-filter-view').show();
            if (!$('body').hasClass('stations-on')) {
                $('#rcp').prop('disabled', false);
                $('#rightrcp').prop('disabled', false);
            }
        });

        $(document).on('overlay_show', function () {
            $('#var-filter-view').hide();

            if ($('body').find('#chart-tour').length) {

                var tour_options_chart = {default_open: false}
                if (current_lang == 'fr') {
                    tour_options_chart.labels = {
                        start_over: 'Recommencer',
                        next: 'Suivant',
                        close: 'Quitter',
                        dont_show: 'Ne plus montrer'
                    }
                }

                $('body').find('#chart-tour').page_tour(tour_options_chart)

            }

        })

        // PAGE TOUR

        var tour_options = {};

        if (current_lang == 'fr') {
            tour_options = {
                labels: {
                    start_over: 'Recommencer',
                    next: 'Suivant',
                    close: 'Quitter',
                    dont_show: 'Ne plus montrer'
                }
            }
        }

        $('#page-tour').page_tour(tour_options);

        var flag = true;
        if (flag) {
            $('#var-filter .select2').trigger('change');
            flag = false;
            // console.log('var changed triggered manually');
        }



    });
})(jQuery);
