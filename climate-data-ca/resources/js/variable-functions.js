(function ($) {

    $(function () {
        // GLOBAL vars

        has_mapRight = false;
        var hosturl = geoserver_url;
        var canadaBounds = L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.60, -49.9));

        var varData;

        function getVarData(callback) {
            if (varData !== undefined) {
                callback(varData);
            } else {
                $.ajax({
                    url: '/wp-json/acf/v3/variable/?per_page=10000&orderby=menu_order&order=asc',
                    dataType: 'json',
                    success: function (data) {
                        varData = new Map();
                        $.each(data, function (k, v) {
                            if (v.acf.var_name != 'slr') {   // exclude sea-level from filter menu since it's on another page
                                varData.set(v.acf.var_name, v.acf);
                            }
                        });
                        callback(varData);
                    }
                });
            }
        }

        varID = parseInt($('#varPostID').val());
        acfData = [];
        // if (varID > 0) {
        //     buildDropdownfromVarID(varID);
        // }

        moraval = getQueryVariable('mora');


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

        if ($('#var').length) {
            query['var'] = $('#var').val();
            query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');
        } else {
            query['var'] = 'tx_max';
            query['var-group'] = 'temperature';
        }

        if ($('#mora').length) {
            query['mora'] = $('#mora').val();
        } else {
            query['mora'] = 'ann';
        }

        if ($('#rcp').length) {
            query['rcp'] = $('#rcp').val();
        } else {
            query['rcp'] = 'rcp26';
        }

        if ($('#decade').length) {
            query['decade'] = $('#range-slider-container').attr('data-default') + 's';
        } else {
            query['decade'] = '1971-2000';
        }

        if ($('#sector').length) {
            query['sector'] = $('#sector').val();
        } else {
            query['sector'] = '';
        }

        var history_action = 'init', // global tracking variable for history action
            station_on = false, // flag for showing/hiding the stations layer,
            sector_on = false,
            geoselecting = false; // flag for moveend function to decide whether to update the geo-select parameter


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

        map1.createPane('labels');
        map1.getPane('labels').style.zIndex = 550;
        map1.getPane('labels').style.pointerEvents = 'none';

        // stations

        map1.createPane('idf');
        map1.getPane('idf').style.zIndex = 600;
        map1.getPane('idf').style.pointerEvents = 'all';
        map1.getPane('idf').style.opacity = 1;

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
            mapRight.getPane('grid').style.pointerEvents = 'none';

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
                hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                gridLayer_options
            ).on('click', function (e) {
                grid_click(e);
            }).on('mouseover', function (e) {
                grid_hover(e);
            }).addTo(mapRight);


            L.tileLayer('//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(mapRight);

            var_value = $("#var").val();


            wmsOptions = {
                format: 'image/png',
                transparent: true,
                tiled: true,
                opacity: 1,
                pane: 'raster',
                'VERSION': '1.3.0',
                bounds: canadaBounds,
                layers: 'CDC:' + query['var'] + '-ys-rcp26-p50-ann-30year'
            };

            rightLayer = L.tileLayer.wms(hosturl + '/geoserver/ows?', wmsOptions).addTo(mapRight);

            invalidate_maps();

            map1.sync(mapRight);
            mapRight.sync(map1);

        }

        function getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
            return (false);
        }

        function replaceGrid(gridname, gridstyle) {


            if (map1.hasLayer(gridLayer)) {
                map1.removeLayer(gridLayer);
            }

            if (typeof mapRight !== 'undefined' && mapRight.hasLayer(gridLayerRight)) {
                mapRight.removeLayer(gridLayerRight);
            }


            gridLayer = L.vectorGrid.protobuf(
                hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + gridname + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                gridstyle
            ).on('click', function (e) {
                grid_click(e);
            }).on('mouseover', function (e) {
                grid_hover(e);
            }).addTo(map1);
            if ($('#mapRight').length) {
                gridLayerRight = L.vectorGrid.protobuf(
                    hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + gridname + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
                    gridstyle
                ).on('click', function (e) {
                    grid_click(e);
                }).on('mouseover', function (e) {
                    grid_hover(e);
                }).addTo(mapRight);
            }

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

        var idf_layer, station_layer, highlight, highlight2, currentSector, colormap;
        //
        // var has_mapRight = false,
        //     grid_initialized = false;


        //
        // UX ELEMENTS
        //

        // ION SLIDER

        // opacity

        if ($('#opacity-slider').length) {

            var opacity_slider_options = {
                min: $('#opacity-slider-container').attr('data-min'),
                max: $('#opacity-slider-container').attr('data-max'),
                default: $('#opacity-slider-container').attr('data-default'),
            };

            $('#opacity-slider').ionRangeSlider({
                grid: false,
                skin: "round",
                from: opacity_slider_options.default,
                min: opacity_slider_options.min,
                max: opacity_slider_options.max,
                step: 5,
                hide_min_max: true,
                hide_from_to: true,
                prettify_enabled: false,
                onChange: function (data) {
                    sliderChange(data.from);
                }
            });

            let opacity_slider = $('#opacity-slider').data("ionRangeSlider");

        }

        // decade

        if ($('#range-slider').length) {


            var decade_slider_options = {
                min: parseInt($('#range-slider-container').attr('data-min')),
                max: parseInt($('#range-slider-container').attr('data-max')),
                interval: parseInt($('#range-slider-container').attr('data-interval')),
                default: parseInt($('#range-slider-container').attr('data-default')),
                from: parseInt($('#range-slider-container').attr('data-default')),
                values: []
            };


            //console.log('decade_slider_options');
            //console.log(decade_slider_options);
            z = 0;

            for (i = decade_slider_options.min; i <= decade_slider_options.max; i += 10) {

                // if (i === decade_slider_options.default) {
                //     decade_slider_options.from = z;
                // }

                decade_slider_options['values'].push(i + 1 + '-' + (i + decade_slider_options.interval));

                z += 1;

            }

            var $rs = $("#range-slider");


            $rs.ionRangeSlider({
                grid: false,
                skin: "round",
                from: decade_slider_options['from'],
                hide_min_max: true,
                prettify_enabled: false,
                values: decade_slider_options.values,

                onChange: function (data) {
                    newval = (data.from_value.split("-")[0] - 1) + "s";
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


        var leftLegend = L.control({ position: 'topright' });
        var rightLegend = L.control({ position: 'topright' });

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

        $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/assets/json/idf_curves.json', function (data) {


            idf_layer = L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(popup_markup(feature.properties));
                },
                /*
                 * When each feature is load{
                 maxWidth: "auto"
                 }ed from the GeoJSON this
                 * function is called. Here we create a cicle marker
                 * for the feature and style the circle marker.
                 */
                pointToLayer: function (feature, latlng) {

                    return L.circleMarker(latlng, {
                        // Stroke properties
                        color: '#FFF',
                        opacity: 1,
                        weight: 2,

                        pane: 'idf',
                        // Fill properties
                        fillColor: '#3869f6',
                        fillOpacity: 1,

                        radius: 5
                    });
                }
            }).on('mouseover', function (e) {
                e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng);
            }).on('click', function (e) {

                e.layer.bindPopup(popup_markup(e.layer.feature.properties));

                e.layer.bindPopup(getIDFLinks(e.layer.feature.properties.ID), {
                    maxWidth: 300
                });

            });

            if (query['var'] == 'idf') {
                idf_layer.addTo(map1);
            }

        });


        function set_datalayer_for_variable_download_IDFCurves(idf_curves_datalayer_event_name, file) {
            // ex: Download_IDF-Curves_Short Duration Rainfall Intensity−Duration−Frequency Data (PDF) -->  Download_IDF-Curves_Short_Duration_Rainfall_Intensity−Duration−Frequency_Data_PDF
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll(' ', '_');
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll('(', '');
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll(')', '');

            dataLayer.push({
                'event': idf_curves_datalayer_event_name,
                'variable-download-idf-curves-file': file,
            });
        }

        //Dynamically created
        $(document).on('click', '.variable-download-idf-curves', function (e) {
            // e.preventDefault();
            var idf_curves_href = $(this).attr('href');
            var last_index_found = idf_curves_href.lastIndexOf("/");
            idf_curves_href = idf_curves_href.substring(last_index_found + 1, idf_curves_href.length);

            var idf_curves_text = $(this).text().trim();
            set_datalayer_for_variable_download_IDFCurves("Variable_Download_IDF-Curves_" + idf_curves_text, idf_curves_href);
        });

        function getIDFLinks(idf) {

            var popup_labels = [
                "Short Duration Rainfall Intensity−Duration−Frequency Data",
                "Quantile",
                "Return Level",
                "Trend"
            ];

            if (current_lang == 'fr') {
                popup_labels = [
                    "Données sur l’intensité, la durée et la fréquence des chutes de pluie de courte durée",
                    "Quantile",
                    "Niveau de retour",
                    "Tendance",
                ];
            }

            $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/search_idfs.php?idf=' + idf, function (data) {

                $('.idfBody').empty();
                $.each(data, function (k, v) {
                    linktext = v;


                    if (v.includes("_A.pdf", 0) === true) {
                        linktext = popup_labels[0] + " (PDF)";
                    } else if (v.includes("_A.png", 0) === true) {
                        linktext = popup_labels[0] + " (PNG)";
                    } else if (v.includes(".txt", 0) === true) {
                        linktext = popup_labels[0] + " (TXT)";
                    } else if (v.includes("_qq.pdf", 0) === true) {
                        linktext = popup_labels[1] + " (PDF)";
                    } else if (v.includes("_qq.png", 0) === true) {
                        linktext = popup_labels[1] + " (PNG)";
                    } else if (v.includes("_r.pdf", 0) === true) {
                        linktext = popup_labels[2] + " (PDF)";
                    } else if (v.includes("_r.png", 0) === true) {
                        linktext = popup_labels[2] + " (PNG)";
                    } else if (v.includes("_t.pdf", 0) === true) {
                        linktext = popup_labels[3] + " (PDF)";
                    } else if (v.includes("_t.png", 0) === true) {
                        linktext = popup_labels[3] + " (PNG)";
                    } else if (v.includes(".pdf", 0) === true) {
                        linktext = popup_labels[0] + " (PDF)";
                    } else if (v.includes(".png", 0) === true) {
                        linktext = popup_labels[0] + " (PNG)";
                    }

                    $('.idfBody').append('<li><a class="variable-download-idf-curves" href="' + v + '" target="_blank">' + linktext + '</a></li>');
                });
            });
        };

        //
        // WEATHER STATIONS LAYER
        //


        map1.createPane('stations');
        map1.getPane('stations').style.zIndex = 600;
        map1.getPane('stations').style.pointerEvents = 'all';

        function loadClimateNormals() {
            $.getJSON('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID&startindex=0&HAS_NORMALS_DATA=Y', function (data) {
                station_layer = L.geoJson(data, {
                    pointToLayer: function (feature, latlng) {
                        markerColor = '#e50e40';
                        return L.circleMarker(latlng, {
                            // Stroke properties
                            color: '#fff',
                            opacity: 1,
                            weight: 2,
                            pane: 'stations',
                            fillColor: markerColor,
                            fillOpacity: 1,
                            radius: 5
                        });
                    }
                }).on('mouseover', function (e) {
                    e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME).openTooltip(e.latlng);
                }).on('click', function (e) {
                    genStationChart(e.layer.feature.properties.STN_ID, e.layer.feature.properties.STATION_NAME, e.latlng['lat'], e.latlng['lng']);
                });
            }).done(function () {
                if (query['var'] === 'weather-stations') {
                    station_layer.addTo(map1);
                }
            });
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

            //e.layer.bindTooltip(e.layer.properties.gid.toString() + " acres").openTooltip(e.latlng);

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

        // grid click

        function grid_click(e) {

            console.log('grid clicked');

            grid_initialized = true;

            var_value = $("#var").val();
            mora_value = $("#mora").val();

            // re-center the map on
            // half the map width minus 100px
            // so that the highlighted square shows beside the chart overlay

            var offset = (map1.getSize().x * 0.5) - 100;

            map1.panTo([e.latlng.lat, e.latlng.lng], { animate: false }); // pan to center
            map1.panBy(new L.Point(offset, 0), { animate: false }); // pan by offset

            // set the highlight

            var highlight_properties = {
                weight: 1,
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
            current_coords = [e.latlng.lat, e.latlng.lng];
            genChart(e.latlng.lat, e.latlng.lng, var_value, mora_value);

            L.DomEvent.stop(e);

        }

        // options

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

                }
            },
            bounds: canadaBounds,
            maxZoom: 12,
            minZoom: 7,
            pane: 'grid'
        };

        // create

        var_value = $("#var").val();

        var gridLayer;
        gridLayer = L.vectorGrid.protobuf(
            hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + 'canadagrid' + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            gridLayer_options
        ).on('click', function (e) {
            grid_click(e);
        }).on('mouseover', function (e) {
            grid_hover(e);
        });

        // add to map

        if (query['var-group'] != 'station-data' && query['sector'] == '') {
            gridLayer.addTo(map1);
        }


        //
        // SECTOR LAYER
        //

        map1.createPane('sector');
        map1.getPane('sector').style.zIndex = 403;

        var choroLayer = null,
            choroValues = [];

        var current_sector = [];
        var current_coords = [];

        function getColor(d) {

            for (let i = 0; i < colormap.length; i++) {
                if (d > colormap[i].quantity) {
                    return colormap[i].color;
                }
            }
            return colormap[colormap.length - 1].color;
        }

        function genChoro(sector, year, variable, rcp, frequency) {

            choroPath = hosturl + '/get-choro-values/' + sector + '/' + variable + '/' + rcp + '/' + frequency + '/?period=' + year;


            $.getJSON(choroPath).then(function (data) {

                choroValues = data;

                if (map1.hasLayer(choroLayer)) {
                    for (let i = 0; i < choroValues.length; i++)
                        choroLayer.resetFeatureStyle(i);
                } else {
                    var layerStyles = {};
                    layerStyles[currentSector] = function (properties, zoom) {
                        return {
                            weight: 0.5,
                            color: 'white',
                            fillColor: getColor(choroValues[properties.id]),
                            opacity: 1,
                            fill: true,
                            radius: 4,
                            fillOpacity: 1
                        }
                    };

                    choroLayer = L.vectorGrid.protobuf(
                        hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + sector + "/{z}/{x}/{-y}.pbf",
                        {
                            rendererFactory: L.canvas.tile,
                            interactive: true,
                            getFeatureId: function (f) {
                                return f.properties.id;
                            },
                            name: 'geojson',
                            pane: 'sector',
                            maxNativeZoom: 12,
                            bounds: canadaBounds,
                            maxZoom: 12,
                            minZoom: 3,
                            vectorTileLayerStyles: layerStyles
                        }
                    ).on('mouseover', function (e) {
                        choroLayer.setFeatureStyle(
                            e.layer.properties.id,
                            {
                                color: 'white',
                                fillColor: getColor(choroValues[e.layer.properties.id]),
                                weight: 1.5,
                                fill: true,
                                radius: 4,
                                opacity: 1,
                                fillOpacity: 1
                            });
                        choroLayer.bindTooltip(e.layer.properties[l10n_labels.label_field], { sticky: true }).openTooltip(e.latlng);
                    }
                    ).on('mouseout', function (e) {
                        choroLayer.resetFeatureStyle(e.layer.properties.id);
                    }
                    ).on('click', function (e) {

                        current_sector['id'] = e.layer.properties.id;
                        current_sector['label'] = e.layer.properties[l10n_labels.label_field];

                        var_value = $("#var").val();
                        mora_value = $("#mora").val();

                        genSectorChart(current_sector['id'], var_value, mora_value, current_sector['label']);
                    }).addTo(map1);
                }
            })
        };

        map1.on('zoom', function (e) {
            if (typeof choroLayer !== 'undefined' && choroLayer !== null) {
                choroLayer.unbindTooltip();
            }
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
            layers: 'CDC:' + query['var'] + '-ys-rcp26-p50-ann-30year'
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

        var frMonthDict = { // TODO: valiadate the keys 
            'janv.': 'Janvier',
            'févr.': 'Février',
            'mars': 'Mars',
            'avr.': 'Avril',
            'mai.': 'Mai',
            'juin.': 'Juin',
            'juil.': 'Juillet',
            'août.': 'Août',
            'sept.': 'Septembre',
            'oct.': 'Octobre',
            'nov.': 'Novembre',
            'déc.': 'Décembre',
        };

        var engMonthDict = {
            'jan': 'January',
            'feb': 'February',
            'mar': 'March',
            'apr': 'April',
            'may': 'May',
            'jun': 'June',
            'jul': 'July',
            'aug': 'August',
            'sep': 'September',
            'oct': 'October',
            'nov': 'November',
            'dec': 'December',
            'ann': 'Annual'
        };

        function getRealMonthName(keySelected, isEng = true) {
            var tempDict = engMonthDict;
            if (!isEng) {
                tempDict = frMonthDict;
            }

            var retVal = ""
            if (tempDict[keySelected]) {
                retVal = tempDict[keySelected];
            } else {
                throw new Error('Can not get the month with this key (' + (isEng ? 'english' : 'french') + '): ' + keySelected);
            }
            return retVal;
        }

        var variableDownloadDataTypes = {
            // GA4_event: Variable_Download-Data_*
            'tx_max': 'Hottest-Day',
            'tg_mean': 'Mean-Temperature',
            'tn_mean': 'Minimum-Temperature',
            'tnlt_-15': 'Days-with-Tmin_LesserThan_-15C',
            'tnlt_-25': 'Days-with-Tmin_LesserThan_-25C',
            'txgt_25': 'Days-with-Tmax_GreaterThan_25C',
            'txgt_27': 'Days-with-Tmax_GreaterThan_27C',
            'txgt_29': 'Days-with-Tmax_GreaterThan_29C',
            'txgt_30': 'Days-with-Tmax_GreaterThan_30C',
            'txgt_32': 'Days-with-Tmax_GreaterThan_32C',
            'tx_mean': 'Maximum-Temperature',
            'tn_min': 'Coldest-Day',
            'rx1day': 'Maximum-1-Day-Total-Precipitation',
            'r1mm': 'Wet-Days_GreaterThan_1mm',
            'r10mm': 'Wet-Days_GreaterThan_10mm',
            'r20mm': 'Wet-Days_GreaterThan_20mm',
            'prcptot': 'Total-Precipitation',
            'frost_days': 'Frost-Days',
            'cddcold_18': 'Cooling-Degree-Days',
            'gddgrow_10': 'Growing-Degree-Days-10C',
            'gddgrow_5': 'Growing-Degree-Days-5C',
            'gddgrow_0': 'Cumulative-degree-days-above-0C',
            'hddheat_18': 'Heating-degree-days',
            'ice_days': 'Ice-Days',
            'tr_18': 'Tropical-Nights-Days-with-Tmin_GreaterThan_18C',
            'tr_20': 'Tropical-Nights-Days-with-Tmin_GreaterThan_20C',
            'tr_22': 'Tropical-Nights-Days-with-Tmin_GreaterThan_22C',
            'spei_3m': 'SPEI(3-months)',
            'spei_12m': 'SPEI(12-months)',
            'weather-stations': 'MSC-Climate-Normals',
        };

        function getGA4EventNameForVariableDownloadData(chartDataFormat, keySelected) {
            var varName = "";
            if (variableDownloadDataTypes[keySelected]) {
                var eventType = '';
                if (chartDataFormat.includes('csv')) {
                    eventType = "Variable_Download-Data_";
                } else if (chartDataFormat.includes('pdf') || chartDataFormat.includes('png')) {
                    eventType = "Variable_Download-Image_";
                } else {
                    throw new Error('Invalid GA4 event file format (csv, pdf, png): ' + chartDataFormat);
                }
                varName = eventType + variableDownloadDataTypes[keySelected];
            } else {
                throw new Error('Invalid GA4 event name (Variable_Download-Data_*): ' + keySelected);
            }
            return varName;
        }

        function setDataLayerForChartData(chartDataFormat, chartData) {
            if (!chartDataFormat.length) {
                return;
            }
            var eventName = getGA4EventNameForVariableDownloadData(chartDataFormat, query['var']);
            var overlayTitle = $('.overlay-title').text();

            // Exlude: Navigator 5
            var addStr = "";
            for (let index = 0; index < chartData.series.length; index++) {
                var chartDataName = chartData.series[index].name;
                if (chartData.series[index].visible && !chartDataName.includes('Navigator 5')) {
                    addStr += chartData.series[index].name + ", ";
                }
            }

            // Remove last 2 char: ; 
            if (addStr.length > 0) {
                addStr = addStr.substring(0, addStr.length - 2);
            }

            // ex: Watersheds
            var variableDownloadDataVewBy = $('.variable-download-data-view_by').find(":selected").text();
            // ex: Région de la Montérégie, rcp26, January
            var chartDataSettings = overlayTitle + "; " + query['rcp'] + "; " + getRealMonthName(query['mora']);
            dataLayer.push({
                'event': eventName,
                'chart_data_event_type': eventName,
                'chart_data_settings': chartDataSettings,
                'chart_data_columns': addStr,
                'chart_data_format': chartDataFormat,
                'chart_data_view_by': variableDownloadDataVewBy
            });
        }

        var chartSeries = [];
        function disPlayChartData(data, varDetails) {

            chartUnit = varDetails.units.value === 'kelvin' ? "°C" : varDetails.units.label;
            chartDecimals = varDetails['decimals'];
            switch (varDetails.units.value) {
                case 'doy':
                    formatter = function () { return new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.value).toLocaleDateString(current_lang, { month: 'long', day: 'numeric' }) };
                    pointFormatter = function (format) {
                        if (this.series.type == 'line') {
                            return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.y).toLocaleDateString(current_lang, { month: 'long', day: 'numeric' })
                                + '</b><br/>';
                        } else {
                            return '<span style="color:' + this.series.color + '">●</span>' + this.series.name + ': <b>'
                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.low).toLocaleDateString(current_lang, { month: 'long', day: 'numeric' })
                                + '</b> - <b>'
                                + new Date(1546300800000 + 1000 * 60 * 60 * 24 * this.high).toLocaleDateString(current_lang, { month: 'long', day: 'numeric' })
                                + '</b><br/>';
                        }
                    };
                    break;
                default:
                    formatter = function () { return this.axis.defaultLabelFormatter.call(this) + chartUnit; };
                    pointFormatter = undefined;
            }



            chartSeries = [];
            if (data['observations'].length > 0) {
                chartSeries.push({
                    name: chart_labels.observation,
                    data: data['observations'],
                    zIndex: 1,
                    showInNavigator: true,
                    color: '#F47D23',
                    visible: false,
                    marker: {
                        fillColor: '#F47D23',
                        lineWidth: 0,
                        radius: 0,
                        lineColor: '#F47D23'
                    }
                });
            }

            if (data['modeled_historical_median'].length > 0) {
                chartSeries.push({
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
            }

            if (data['modeled_historical_range'].length > 0)
                chartSeries.push({
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
                    }
                });
            if (data['rcp26_range'].length > 0)
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
                    }
                });
            if (data['rcp45_median'].length > 0)
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
                    }
                });
            if (data['rcp45_range'].length > 0)
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
                    }
                });
            if (data['rcp85_median'].length > 0)
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
                    }
                });
            if (data['rcp85_range'].length > 0)
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
                    }
                });


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
                        dateFormat: '%Y-%m-%d'
                    }
                },

                series: chartSeries
            });



            $('.chart-export-data').click(function (e) {
                e.preventDefault();

                var dl_type = '';

                switch ($(this).attr('data-type')) {
                    case 'csv':
                        setDataLayerForChartData('csv', chart);
                        chart.downloadCSV();
                        break;
                }

            });

            $('.chart-export-img').click(function (e) {
                e.preventDefault();
                var dl_type = '';
                var fileFormat = '';

                switch ($(this).attr('data-type')) {
                    case 'png':
                        dl_type = 'image/png';
                        fileFormat = 'png'
                        break;
                    case 'pdf':
                        dl_type = 'application/pdf';
                        fileFormat = 'pdf'
                        break;
                }

                setDataLayerForChartData(fileFormat, chart);

                chart.exportChart({
                    type: dl_type
                });
            });


        }

        // LAYER CHART
        function genChart(lat, lon, variable, month) {
            $(document).overlay('show', {
                href: base_href + 'variable/' + $('#var').val() + '/',
                data: {
                    lat: lat,
                    lon: lon
                },
                content: 'location',
                position: 'right',
                callback: function (varDetails) {

                    $('#rcp').prop('disabled', true);

                    $.getJSON(
                        data_url + '/generate-charts/' + lat + '/' + lon + '/' + variable + '/' + month,
                        function (data) {
                            disPlayChartData(data, varDetails);


                        });

                }
            });
        };

        // SECTOR CHART
        function genSectorChart(id, variable, month, region_label) {
            $(document).overlay('show', {
                href: base_href + 'variable/' + variable + '/',
                data: {
                    sector: query['sector'],
                    region: region_label
                },
                content: 'sector',
                position: 'right',
                callback: function (varDetails) {
                    $('#rcp').prop('disabled', true);
                    var valuePath = hosturl + '/generate-regional-charts/' + query['sector'] + '/' + id + '/' + variable + '/' + month;

                    $.getJSON(valuePath).then(function (data) {
                        disPlayChartData(data, varDetails);
                    });


                }
            });

        };


        // STATION CHART

        function genStationChart(STN_ID, station_name, lat, lon) {


            var overlayTitle = $('.overlay-title').text(station_name);
            $(document).overlay('show', {
                href: base_href + 'variable/' + $('#var').val() + '/',
                data: {
                    lat: lat,
                    lon: lon,
                    station_name: station_name
                },
                content: 'location',
                position: 'right',
                callback: function (varDetails) {
                    $('.overlay-title').text(station_name);
                    $.getJSON(
                        'https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=1&sortby=MONTH',
                        function (data) {

                            var chartUnit = " °C",
                                chart_title = 'Climate normals 1981–2010',
                                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                timeSeries = [];

                            if (current_lang == 'fr') {

                                chart_title = 'Normales et moyennes climatiques de 1981–2010';
                                months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

                            }

                            $.each(data.features, function (k, v) {
                                if (k < 12) {
                                    timeSeries.push([months[k], v.properties.VALUE]);
                                }
                            });

                            var chart = Highcharts.chart('chart-placeholder', {
                                chart: {
                                    height: '360px',
                                },
                                title: {
                                    text: chart_title
                                },

                                xAxis: {
                                    categories: months
                                },

                                yAxis: [{
                                    lineWidth: 1,
                                    title: {
                                        text: chart_labels.temperature + ' (°C)'
                                    }
                                }, {
                                    lineWidth: 1,
                                    opposite: true,
                                    title: {
                                        text: chart_labels.precipitation + ' (mm)'
                                    }
                                }],
                                plotOptions: {
                                    series: {
                                        pointWidth: 20
                                    }
                                },
                                tooltip: {
                                    valueSuffix: chartUnit
                                },
                                exporting: {
                                    enabled: false,
                                    csv: {
                                        dateFormat: '%Y-%m-%d'
                                    }
                                }

                            });

                            $('.chart-export-data').click(function (e) {
                                e.preventDefault();

                                var dl_type = '';

                                switch ($(this).attr('data-type')) {
                                    case 'csv':
                                        setDataLayerForChartData('csv', chart);
                                        chart.downloadCSV();
                                        break;
                                }

                            });

                            $('.chart-export-img').click(function (e) {
                                e.preventDefault();
                                var dl_type = '';
                                var fileFormat = '';

                                switch ($(this).attr('data-type')) {
                                    case 'png':
                                        dl_type = 'image/png';
                                        fileFormat = 'png';
                                        break;
                                    case 'pdf':
                                        dl_type = 'application/pdf';
                                        fileFormat = 'pdf';
                                        break;
                                }

                                setDataLayerForChartData(fileFormat, chart);
                                chart.exportChart({
                                    type: dl_type
                                });
                            });

                            // 1 Daily Average (degree C)
                            // 5 Daily Maximum (degree C)
                            // 56 Precipitation (mm)
                            // 8 Daily Minimum (degree C)

                            $.getJSON('https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=1&sortby=MONTH', function (data) {
                                timeSeries = [];
                                $.each(data.features, function (k, v) {
                                    if (k < 12) {
                                        timeSeries.push([months[k], v.properties.VALUE]);
                                    }
                                });
                                chart.addSeries({
                                    name: chart_labels.daily_avg_temp + ' (°C)',
                                    data: timeSeries,
                                    zIndex: 4,
                                    showInNavigator: true,
                                    color: '#000',
                                    marker: {
                                        fillColor: '#000',
                                        lineWidth: 0,
                                        radius: 0,
                                        lineColor: '#000'
                                    }
                                });

                                $.getJSON('https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=5&sortby=MONTH', function (data) {
                                    timeSeries = [];
                                    $.each(data.features, function (k, v) {
                                        if (k < 12) {
                                            timeSeries.push([months[k], v.properties.VALUE]);
                                        }
                                    });
                                    chart.addSeries({
                                        name: chart_labels.daily_max_temp + ' (°C)',
                                        data: timeSeries,
                                        zIndex: 3,
                                        showInNavigator: true,
                                        color: '#F00',
                                        marker: {
                                            fillColor: '#F00',
                                            lineWidth: 0,
                                            radius: 0,
                                            lineColor: '#F00'
                                        }
                                    });

                                    $.getJSON('https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=8&sortby=MONTH', function (data) {
                                        timeSeries = [];
                                        $.each(data.features, function (k, v) {
                                            if (k < 12) {
                                                timeSeries.push([months[k], v.properties.VALUE]);
                                            }
                                        });
                                        chart.addSeries({
                                            name: chart_labels.daily_min_temp + ' (°C)',
                                            data: timeSeries,
                                            zIndex: 2,
                                            showInNavigator: true,
                                            color: '#00F',
                                            marker: {
                                                fillColor: '#00F',
                                                lineWidth: 0,
                                                radius: 0,
                                                lineColor: '#00F'
                                            }
                                        });

                                        $.getJSON('https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=56&sortby=MONTH', function (data) {
                                            timeSeries = [];
                                            $.each(data.features, function (k, v) {
                                                if (k < 12) {
                                                    timeSeries.push([months[k], v.properties.VALUE]);
                                                }
                                            });
                                            chart.addSeries({
                                                name: chart_labels.precipitation + ' (mm)',
                                                data: timeSeries,
                                                zIndex: 1,
                                                type: 'column',
                                                showInNavigator: true,
                                                yAxis: 1,
                                                color: '#0F0',
                                                opacity: .75,
                                                tooltip: {
                                                    valueSuffix: ' mm'
                                                },
                                                marker: {
                                                    fillColor: '#0F0',
                                                    lineWidth: 0,
                                                    radius: 0,
                                                    opacity: .75,
                                                    lineColor: '#0F0'
                                                }
                                            });
                                        });
                                    });
                                });
                            });

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
                    style = 'background:' + unitColor;

                    t = "";
                    if (i == 0) {
                        style = "; border-bottom: 10px solid " + unitColor +
                            "; border-left: 8px solid transparent" +
                            "; border-right: 8px solid transparent";
                        t = '<span class="legendLabel max">' + first_label + '</span>';

                        labels.push(
                            '<div class="legendRow">' +
                            '<span class="legendLabel max">' + unitValue + '</span>' +
                            '<div class="legendColor" style="border-bottom: 10px solid ' + unitColor +
                            '; border-left: 8px solid transparent; border-right: 8px solid transparent"></div>' +
                            '<span class="legendUnit">&gt; ' + unitValue + '</span>' +
                            '</div>'
                        );
                    }
                    else if (i == colormap.length - 1) {
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
                    if (i == colormap.length - 1) {
                        labels.push(
                            '<div class="legendRow">' +
                            '<span class="legendLabel ">0</span>' +
                            '<div class="legendColor" style="background:' + unitColor + '"></div>' +
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

            var_value = $("#var").val();
            mora_value = $("#mora").val();
            mora_text_value = $("#mora option:selected").text();
            rcp_value = $("#rcp").val();
            decade_value = parseInt($("#decade").val());

            query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');


            if (mora_value === 'ann') {
                msorys = 'ys';
                msorysmonth = '-ann';
            } else if (mora_value === 'spring') {
                msorys = 'qsdec';
                msorysmonth = '-spring';
            } else if (mora_value === 'summer') {
                msorys = 'qsdec';
                msorysmonth = '-summer';
            } else if (mora_value === 'fall') {
                msorys = 'qsdec';
                msorysmonth = '-fall';
            } else if (mora_value === 'winter') {
                msorys = 'qsdec';
                msorysmonth = '-winter';
            } else if (mora_value === '2qsapr') {
                msorys = '2qsapr';
                msorysmonth = '-2qsapr';
            } else {
                msorys = 'ms';
                msorysmonth = '-' + mora_value;
            }

            left_rcp_value = '';
            right_rcp_value = '';

            if (rcp_value === 'rcp26vs45') {
                left_rcp_value = 'rcp26';
                right_rcp_value = 'rcp45';
            } else if (rcp_value === 'rcp26vs85') {
                left_rcp_value = 'rcp26';
                right_rcp_value = 'rcp85';
            } else if (rcp_value === 'rcp45vs26') {
                left_rcp_value = 'rcp45';
                right_rcp_value = 'rcp26';
            } else if (rcp_value === 'rcp45vs85') {
                left_rcp_value = 'rcp45';
                right_rcp_value = 'rcp85';
            } else if (rcp_value === 'rcp85vs26') {
                left_rcp_value = 'rcp85';
                right_rcp_value = 'rcp26';
            } else if (rcp_value === 'rcp85vs45') {
                left_rcp_value = 'rcp85';
                right_rcp_value = 'rcp45';
            } else if (rcp_value === 'rcp26') {
                left_rcp_value = 'rcp26';
                right_rcp_value = 'rcp45';
            } else if (rcp_value === 'rcp45') {
                left_rcp_value = 'rcp45';
                right_rcp_value = 'rcp45';
            } else if (rcp_value === 'rcp85') {
                left_rcp_value = 'rcp85';
                right_rcp_value = 'rcp45';
            }

            singleLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-30year';
            leftLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-30year';
            rightLayerName = var_value + '-' + msorys + '-' + right_rcp_value + '-p50' + msorysmonth + '-30year';


            moraval = getQueryVariable('mora');


            var layer = leftLayerName;
            var legendTitle = mora_text_value;

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

                    if ($('#rcp').val().indexOf("vs") !== -1) {
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

        function generateSectorLegend(layer, legendTitle) {

            $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic" +
                "&layer=CDC:" + layer + "&format=application/json")
                .then(function (data) {

                    labels = [];
                    leftLegend.onAdd = function (map) {
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

                    colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                    colormap = colormap.map(function (c) { c.quantity = parseFloat(c.quantity); return c; });

                    var_value = $("#var").val();
                    mora_value = $("#mora").val();
                    mora_text_value = $("#mora option:selected").text();
                    rcp_value = $("#rcp").val();
                    decade_value = parseInt($("#decade").val()) + 1;
                    sector_value = $("#sector").val();


                    genChoro(sector_value, decade_value, var_value, rcp_value, mora_value);
                    if (currentSector !== sector_value) {
                        currentSector = sector_value;
                        if (map1.hasLayer(choroLayer)) {
                            map1.removeLayer(choroLayer);
                        }
                    }

                })
                .fail(function (err) {
                });

        }

        //
        //
        // UX BEHAVIOURS
        //
        //

        // sync'ed layer opacity

        function sliderChange(value) {

            leftLayer.setOpacity(value / 100);

            if (has_mapRight == true) {
                rightLayer.setOpacity(value / 100);
            }

            $('.leaflet-sector-pane').css('opacity', value / 100);
        }

        loadClimateNormals();

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

            switch (settings.layer) {

                case 'variable':

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

                        // show sliders

                        sliderChange($('#opacity-slider').data('ionRangeSlider')['old_from']);

                        // turn on right map if the RCP is set to a 'compare' scenario

                        if ($('#rcp').val().indexOf("vs") !== -1) {

                            $('body').addClass('map-compare');
                            invalidate_maps();

                        }

                        // enable filters

                        $('#mora').prop('disabled', false);
                        $('#rcp').prop('disabled', false);

                        // turn off stations & sector

                        layer_swap({
                            layer: 'sector',
                            action: 'off'
                        });

                        layer_swap({
                            layer: 'stations',
                            action: 'off'
                        });

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

                        // hide sliders

                        //sliderChange(0);

                        // turn off right map

                        $('body').removeClass('map-compare');

                        invalidate_maps();

                    }

                    break;

                case 'stations':

                    if (settings.action === 'on') {


                        // set global var & body class

                        station_on = true;

                        // add station layer

                        console.log('settings.station');
                        console.log(settings.station);

                        if (settings.station === 'idf') {



                            if (typeof idf_layer !== 'undefined') {
                                map1.addLayer(idf_layer);
                            }

                            if (typeof station_layer !== 'undefined') {
                                console.log("REMOVE STATION LAYER")
                                map1.removeLayer(station_layer).closePopup();
                            }

                        } else if (settings.station === 'weather-stations') {



                            if (typeof station_layer !== 'undefined') {
                                map1.addLayer(station_layer);
                            }

                            if (typeof idf_layer !== 'undefined') {
                                map1.removeLayer(idf_layer).closePopup();
                            }

                        }

                        // disable filters

                        // $('#sector').prop('disabled', true);

                        $('#mora').prop('disabled', true);
                        $('#rcp').prop('disabled', true);

                        // turn off variable & sector


                        layer_swap({
                            layer: 'sector',
                            action: 'off'
                        });

                        layer_swap({
                            layer: 'variable',
                            action: 'off'
                        });

                    } else {

                        // set global var & body class

                        station_on = false;

                        // hide station layers

                        if (typeof idf_layer !== 'undefined' && idf_layer !== null) {
                            map1.removeLayer(idf_layer).closePopup();
                        }

                        if (typeof station_layer !== 'undefined' && station_layer !== null) {
                            map1.removeLayer(station_layer).closePopup();
                        }

                        // enable filters

                        $('#sector').prop('disabled', false);

                    }

                    break;

                case 'sector':


                    if (settings.action == 'on') {

                        // set global var & body class

                        sector_on = true;

                        // disable station data options

                        $('#var').find('optgroup[data-slug="station-data"] option').each(function () {
                            $(this).prop('disabled', true);
                        });

                        // turn off stations & variable

                        layer_swap({
                            layer: 'stations',
                            action: 'off'
                        });

                        layer_swap({
                            layer: 'variable',
                            action: 'off'
                        });

                        //map1.addLayer(choroLayer);

                    } else {

                        // set global var & body class

                        sector_on = false;

                        // enable station data options

                        $('#var').find('optgroup[data-slug="station-data"] option').each(function () {
                            $(this).prop('disabled', false);
                        });

                        if (typeof choroLayer !== 'undefined' && choroLayer !== null) {
                            map1.removeLayer(choroLayer);
                        }

                        //toggle_variable('on');

                    }

                    // re-initialize select2 with new disabled/enabled options
                    //           $('#var').select2();

                    break;

                default:

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

                        if (key === 'var') {

                            query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');

                            if (query['var-group'] === 'station-data') {

                                // station data

                                layer_swap({
                                    layer: 'stations',
                                    station: query['var']
                                });

                                layer_swap({
                                    layer: 'variable',
                                    action: 'off'
                                });

                            } else if (query['sector'] != '') {

                                // sector

                                layer_swap({
                                    layer: 'sector',
                                });

                                layer_swap({
                                    layer: 'variable',
                                    action: 'off'
                                });

                            } else {

                                // station data not set and
                                // sector not set

                                if (station_on == true) {
                                    layer_swap({
                                        layer: 'stations',
                                        action: 'off'
                                    });
                                }

                                if (sector_on == true) {
                                    layer_swap({
                                        layer: 'sector',
                                        action: 'off'
                                    });
                                }

                            }

                            /*
                             if (station_on == true) {
                             toggle_stations('off');
                             toggle_sector('off');
                             }
                             */

                        } else if (key === 'decade') {

                            //$('#' + key).val(query[key]).trigger('change');

                            // rs_instance.update({
                            //     from: $("#decade").prop('selectedIndex')
                            // });

                        } else if (key === 'coords') {

                            // if the current center is different from the query['coords'] value

                            var current_center = map1.getCenter();
                            var current_zoom = map1.getZoom();

                            var query_center = [query[key].split(',')[0], query[key].split(',')[1]];
                            var query_zoom = query[key].split(',')[2];

                            if (current_zoom !== query_zoom || current_center.lat !== query_center[0] || current_center.lng !== query_center[1]) {

                                /*
                                 if (current_zoom != query_zoom) {
                                 console.log('zoom is not equal');
                                 }

                                 if (current_center.lat != query_center[0]) {
                                 console.log('lat is not equal');
                                 //console.log(current_center.lat, query_center[0]);
                                 }

                                 if (current_center.lng != query_center[1]) {
                                 console.log('lng is not equal');
                                 //console.log(current_center.lng, query_center[1]);
                                 }
                                 */

                                // console.log('set view', query[key].split(',')[0], query[key].split(',')[1], query[key].split(',')[2]);
                                map1.setView([query[key].split(',')[0], query[key].split(',')[1]], query[key].split(',')[2], { animate: false });

                            }

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

        var update_param = function (key, val) {
            // update the query key
            query[key] = val;
            // input values that are not changed by mouse interactions
            // i.e. they are not select menus
            if (key === 'coords') {
                $('#coords').val(val);
            }
        };

        // push/replace state

        function update_query_string() {
            // convert the current object back to a string
            var new_query_string = query_obj_to_str();
            //console.log('new', new_query_string);
            var new_url = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + new_query_string;
            // if the string has changed
            if (window.location.href !== new_url) {
                //console.log(history_action);
                var new_title = title_pre + ' — ' + $('#var :selected').text() + ' — ' + title_post;
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

        //
        // var_value = $("#var").val();
        // buildDropdownfromVarID(var_value);


        $('#var').change(function (e) {
            var select2ID = $(this).attr('id')
            var select2Val = $(this).val();
            // console.log('var change triggered');
            moraval = $('#mora').val();

            update_param('var', select2Val);
            buildFilterMenu();
            generateLeftLegend();
            changeLayers();
        });

        $('#decade').change(function (e) {
            //console.log('decade changed');
            changeLayers();
        });


        $('#mora').change(function (e) {

            mora_value = $(this).val();
            var_value = $('#var').val();

            console.log("MORA CHANGED");
            update_param('mora', $(this).val());
            update_query_string();
            generateLeftLegend();
            changeLayers();

            if ($('body').hasClass('overlay-position-right')) {
                if (query['sector'] !== '') {
                    genSectorChart(current_sector['id'], var_value, mora_value, current_sector['label']);
                } else if (query['var-group'] !== 'station-data') {
                    genChart(current_coords[0], current_coords[1], var_value, mora_value);
                } else {
                    $(document).overlay('hide');
                }
            }
        });


        $('#rcp').change(function (e) {
            //console.log('rcp changed', $(this).val());

            update_param('rcp', $(this).val());
            update_query_string();
            generateLeftLegend();
            changeLayers();
        });


        $('#sector').change(function (e) {


            sectorSelected = $('#sector').val();



            // if (sectorSelected && ((window.location.href.indexOf("explore/variable") > 0) || (window.location.href.indexOf("explorer/variable") > 0))) {
            //     if (sectorSelected === 'health') {
            //         sectorSelected = "health/map";
            //     } else if (sectorSelected === 'census') {
            //         sectorSelected = "census/map";
            //     } else if (sectorSelected === 'watershed') {
            //         sectorSelected = "watershed/data-by-watershed/";
            //     }
            //     window.location.replace("/explore/sector/" + sectorSelected);
            // }
            //
            // if (!sectorSelected && ((window.location.href.indexOf("explore/sector") > 0) || (window.location.href.indexOf("explorer/secteur") > 0))) {
            //     sectorSelected = "/variable/tx_max/";
            //     window.location.replace(sectorSelected);
            // }


            update_param('sector', sectorSelected);
            update_query_string();
            buildFilterMenu();


        });


        function changeLayers() {


            rcp_value = $("#rcp").val();
            // decade_value = $("#decade").val();
            decade_value = parseInt($("#decade").val());
            mora_value = $("#mora").val();

            if (query['var-group'] === 'station-data') {

                // activate station data

                layer_swap({
                    layer: 'stations',
                    station: query['var']
                });

            } else {

                // not station data so make sure it's turned off



                if (station_on === true) {
                    layer_swap({
                        layer: 'stations',
                        action: 'off'
                    });
                }

                if (query['sector'] !== '') {


                    // activate sector

                    if (sector_on === false) {


                        layer_swap({
                            layer: 'sector'
                        });

                        layer_swap({
                            layer: 'variable',
                            action: 'off'
                        });
                    }

                } else {

                    // not sector so make sure it's turned off

                    if (sector_on === true) {
                        layer_swap({
                            layer: 'sector',
                            action: 'off'
                        });
                    }

                    layer_swap({
                        layer: 'variable'
                    });

                }

                //console.log("Single Layer: " + singleLayerName);
                //console.log("Left Layer: " + leftLayerName);
                //console.log("Right Layer: " + rightLayerName);
                //console.log("Year: " + decade_value);

                // always generate/re-generate the left legend

                msorys = 'ys';
                msorysmonth = '-ann';
                legendmsorys = 'ann';

                if (query['sector'] !== '') {
                    switch (mora_value) {
                        case 'ann':
                            msorys = 'ys';
                            msorysmonth = '-ann';
                            legendmsorys = 'ann';
                            break;
                        case 'spring':
                        case 'summer':
                        case 'fall':
                        case 'winter':
                            msorys = 'qsdec';
                            msorysmonth = '-' + mora_value;
                            legendmsorys = 'qsdec';
                            break;
                        case '2qsapr':
                            msorys = '2qsapr';
                            msorysmonth = '-' + mora_value;
                            legendmsorys = '2qsapr';
                            break;
                        default:
                            msorys = 'ms';
                            msorysmonth = '-' + mora_value;
                            legendmsorys = 'mon';
                    }

                    legendLayer = var_value + "_health_" + legendmsorys;
                    generateSectorLegend(var_value + '-' + msorys + '-' + rcp_value + '-p50-' + mora_value + '-30year', '');
                } else {
                    generateLeftLegend();
                }


                singleLayerName = var_value + '-' + msorys + '-' + rcp_value + '-p50' + msorysmonth + '-30year';


                // if a compare scenario was selected

                if (rcp_value.indexOf("vs") !== -1) {

                    $('body').addClass('map-compare');

                    invalidate_maps();


                    leftLayer.setParams({
                        format: 'image/png',
                        transparent: true,
                        opacity: 1,
                        pane: 'raster',
                        'TIME': decade_value + '-01-00T00:00:00Z',
                        'VERSION': '1.3.0',
                        layers: 'CDC:' + leftLayerName
                    });


                    if (has_mapRight === true) {
                        rightLayer.setParams({
                            format: 'image/png',
                            transparent: true,
                            opacity: 1,
                            pane: 'raster',
                            'TIME': decade_value + '-01-00T00:00:00Z',
                            'VERSION': '1.3.0',
                            layers: 'CDC:' + rightLayerName
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
        }




        function buildFilterMenu() {
            getVarData(function (data) {
                queryVar = getQueryVariable('var');

                varID = $('#var').val();
                rawsectorSelected = getQueryVariable('sector');

                if (!rawsectorSelected) {
                    rawsectorSelected = 'gridded_data';
                }


                $('#var').empty();
                currentOptGroup = '';

                data.forEach(function (sv, var_name) {

                    if (sv.var_name === varID) {
                        selectedVar = true;
                    } else {
                        selectedVar = false;
                    }


                    if ($.inArray(rawsectorSelected, sv.availability) !== -1) {

                        if (sv.var_name) {
                            if (currentOptGroup !== sv.variable_type) {

                                if (sv.variable_type === 'station_data') {
                                    optgroupSlug = 'station-data';
                                } else if (sv.variable_type === 'other_variables') {
                                    optgroupSlug = 'other';
                                } else if (sv.variable_type === 'precipitation') {
                                    optgroupSlug = 'precipitation';
                                } else if (sv.variable_type === 'temperature') {
                                    optgroupSlug = 'temperature';
                                }

                                $('#var').append("<optgroup id=optgroup_" + sv.variable_type + " label='" + l10n_labels[sv.variable_type] + "' data-slug='" + optgroupSlug + "'>");
                                currentOptGroup = sv.variable_type;
                            }


                            varnewOption = new Option(sv.var_title, sv.var_name, false, selectedVar);
                            $('#optgroup_' + sv.variable_type).append(varnewOption);
                        }



                        if (sv.var_name === varID) {
                            selectedSector = getQueryVariable('sector');
                            if (!selectedSector) {
                                selectedSector = 'gridded_data';
                            }

                            $('#sector').empty();
                            $.each(sv.availability, function (k, v) {


                                if (selectedSector === v) {
                                    defaultSelectedSector = true;
                                } else {
                                    defaultSelectedSector = false;
                                }

                                if (v === 'gridded_data') {
                                    var newOption = new Option(l10n_labels[v], '', defaultSelectedSector, defaultSelectedSector);
                                } else {
                                    var newOption = new Option(l10n_labels[v], v, defaultSelectedSector, defaultSelectedSector);
                                }



                                $('#sector').append(newOption);
                            });


                            var_value = $("#var").val();
                            dec_value = $("#decade").val();

                            updated_slider_values = [];

                            //console.log('sv.time_slider_max_value');
                            //console.log(sv);

                            tsmax = parseInt(sv.time_slider_max_value);
                            tsmin = parseInt(sv.time_slider_min_value);
                            tsdef = parseInt(sv.time_slider_default_value);
                            tsint = parseInt(sv.time_slider_interval);

                            z = 0;

                            for (i = tsmin; i <= tsmax; i += 10) {

                                $('#rcp').append(rcpDropGroup);

                                getRCPvar = getQueryVariable('rcp');

                                // check to see if comparing exists on sector load
                                if (getRCPvar.length > 5 && selectedSector !== 'gridded_data') {
                                    // since comparison value is comparing, get new default from first 5 chars
                                    firstRCP = getRCPvar.slice(0, 5);
                                    // set default to best option available from compare value.
                                    $('#rcp option[value=' + firstRCP + ']').attr('selected', 'selected');
                                    // update url with new default
                                    update_param('rcp', firstRCP);
                                    // remove compare since no longer comparing
                                    $('body').removeClass('map-compare');
                                    // tell leaflet about changes
                                    invalidate_maps();
                                } else {
                                    // update selected value of newly generated rcp list
                                    $('#rcp option[value=' + getRCPvar + ']').attr('selected', 'selected');
                                }


                                if (i === parseInt(dec_value)) {
                                    newfrom = z;
                                }
                                z += 1;
                            }

                            //console.log("newfrom");
                            //console.log(newfrom);
                            //console.log(updated_slider_values);


                            rs_instance.update({
                                values: updated_slider_values,
                                min: tsmin,
                                max: tsmax,
                                from: newfrom,
                                to: tsmax,
                                step: tsint,
                            });

                            var $rs = $("#range-slider");

                            //console.log('slider updated');
                            //console.log(sv.time_slider_min_value,sv.time_slider_max_value,sv.time_slider_default_value,sv.time_slider_max_value,sv.time_slider_interval);

                            if ((selectedSector === 'gridded_data') && $.inArray('gridded_data', sv.availability) !== -1) {
                                replaceGrid(sv.grid, gridLayer_options);
                            }

                            acfTimeStep = sv.timestep;

                            $('#mora').empty();
                            $('#rcp').empty();

                            if (selectedSector === 'gridded_data') {
                                rcpDropGroup = '<option value="rcp26">RCP 2.6</option> ' +
                                    '<option value="rcp26vs45">RCP 2.6 vs RCP 4.5</option> ' +
                                    '<option value="rcp26vs85">RCP 2.6 vs RCP 8.5</option> ' +
                                    '<option value="rcp45">RCP 4.5</option> ' +
                                    '<option value="rcp45vs26">RCP 4.5 vs RCP 2.6</option> ' +
                                    '<option value="rcp45vs85">RCP 4.5 vs RCP 8.5</option> ' +
                                    '<option value="rcp85">RCP 8.5</option> ' +
                                    '<option value="rcp85vs26">RCP 8.5 vs RCP 2.6</option> ' +
                                    '<option value="rcp85vs45">RCP 8.5 vs RCP 4.5</option>';
                            } else {
                                rcpDropGroup = '<option value="rcp26">RCP 2.6</option> ' +
                                    '<option value="rcp45">RCP 4.5</option> ' +
                                    '<option value="rcp85">RCP 8.5</option>';
                            }


                            updated_slider_values.push(i + 1 + '-' + (i + tsint));


                            // doo the timesets

                            if (acfTimeStep.includes("annual")) {
                                // if ($('#mora').find("option[value='2qsapr']").length) {
                                //     console.log('Quarterly Already Exist');
                                // } else {
                                // Create a DOM Option and pre-select by default

                                if (current_lang === 'fr') {
                                    var newOption = new Option('Annuel', 'ann', false, false);
                                } else {
                                    var newOption = new Option('Annual', 'ann', false, false);
                                }

                                $('#mora').append(newOption);
                                // }
                                if (moraval === 'ann') {

                                    //$("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                    //$("#mora").val(moraval).prop('selected', true);
                                }
                            }

                            if (acfTimeStep.includes("monthly")) {

                                if (current_lang === 'fr') {

                                    var moptgroup = "<optgroup label='Mensuel'>";
                                    moptgroup += "<option value='jan'>Janv.</option>";
                                    moptgroup += "<option value='feb'>Févr.</option>";
                                    moptgroup += "<option value='mar'>Mars</option>";
                                    moptgroup += "<option value='apr'>Avr.</option>";
                                    moptgroup += "<option value='may'>Mai</option>";
                                    moptgroup += "<option value='jun'>Juin</option>";
                                    moptgroup += "<option value='jul'>Juil.</option>";
                                    moptgroup += "<option value='aug'>Août</option>";
                                    moptgroup += "<option value='sep'>Sept.</option>";
                                    moptgroup += "<option value='oct'>Oct.</option>";
                                    moptgroup += "<option value='nov'>Nov.</option>";
                                    moptgroup += "<option value='dec'>Déc.</option>";
                                    moptgroup += "</optgroup>";
                                    $('#mora').append(moptgroup);

                                    if (!acfTimeStep.includes("annual") && moraval === 'ann') {
                                        $('#mora option:eq(0)').prop('selected', true).trigger('change.select2');
                                        update_param('mora', 'jan');
                                        update_query_string();
                                    }

                                    //
                                    // update_param('mora', moraval);
                                    // update_query_string();

                                }

                                var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                                if (months.includes(moraval)) {
                                    // $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                    $("#mora").val(moraval).prop('selected', true);
                                }

                            }

                            if (acfTimeStep.includes("qsdec")) {

                                // check to see if comparing exists on sector load
                                if (getRCPvar.length > 5 && selectedSector !== 'gridded_data') {
                                    // since comparison value is comparing, get new default from first 5 chars
                                    firstRCP = getRCPvar.slice(0, 5);
                                    // set default to best option available from compare value.
                                    $('#rcp option[value=' + firstRCP + ']').attr('selected', 'selected');
                                    // update url with new default
                                    update_param('rcp', firstRCP);
                                    // remove compare since no longer comparing
                                    $('body').removeClass('map-compare');
                                    // tell leaflet about changes
                                    invalidate_maps();
                                } else {
                                    // update selected value of newly generated rcp list
                                    $('#rcp option[value=' + getRCPvar + ']').attr('selected', 'selected');
                                }


                                // buildDropdownfromVarID(var_value);

                                var seasons = ["spring", "summer", "fall", "winter"];
                                if (seasons.includes(moraval)) {
                                    $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                }

                            }

                            if (acfTimeStep.includes("2qsapr")) {
                                // if ($('#mora').find("option[value='2qsapr']").length) {
                                //     console.log('Quarterly Already Exist');
                                // } else {
                                // Create a DOM Option and pre-select by default


                                if (acfTimeStep.includes("monthly")) {

                                    if (current_lang === 'fr') {

                                        var moptgroup = "<optgroup label='Mensuel'>";
                                        moptgroup += "<option value='jan'>Janv.</option>";
                                        moptgroup += "<option value='feb'>Févr.</option>";
                                        moptgroup += "<option value='mar'>Mars</option>";
                                        moptgroup += "<option value='apr'>Avr.</option>";
                                        moptgroup += "<option value='may'>Mai</option>";
                                        moptgroup += "<option value='jun'>Juin</option>";
                                        moptgroup += "<option value='jul'>Juil.</option>";
                                        moptgroup += "<option value='aug'>Août</option>";
                                        moptgroup += "<option value='sep'>Sept.</option>";
                                        moptgroup += "<option value='oct'>Oct.</option>";
                                        moptgroup += "<option value='nov'>Nov.</option>";
                                        moptgroup += "<option value='dec'>Déc.</option>";
                                        moptgroup += "</optgroup>";
                                        $('#mora').append(moptgroup);

                                    } else {
                                        var moptgroup = "<optgroup label='Monthly'>";
                                        moptgroup += "<option value='jan'>January</option>";
                                        moptgroup += "<option value='feb'>February</option>";
                                        moptgroup += "<option value='mar'>March</option>";
                                        moptgroup += "<option value='apr'>April</option>";
                                        moptgroup += "<option value='may'>May</option>";
                                        moptgroup += "<option value='jun'>June</option>";
                                        moptgroup += "<option value='jul'>July</option>";
                                        moptgroup += "<option value='aug'>August</option>";
                                        moptgroup += "<option value='sep'>September</option>";
                                        moptgroup += "<option value='oct'>October</option>";
                                        moptgroup += "<option value='nov'>November</option>";
                                        moptgroup += "<option value='dec'>December</option>";
                                        moptgroup += "</optgroup>";
                                        $('#mora').append(moptgroup);

                                        moraval = getQueryVariable('mora')

                                        // $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                        $("#mora").val(moraval).prop('selected', true);
                                    }

                                }

                                if (acfTimeStep.includes("qsdec")) {

                                    if (current_lang === 'fr') {
                                        var soptgroup = "<optgroup label='Saisonnier'>";
                                        soptgroup += "<option value='spring'>Printemps</option>";
                                        soptgroup += "<option value='summer'>Été</option>";
                                        soptgroup += "<option value='fall'>Automne</option>";
                                        soptgroup += "<option value='winter'>Hiver</option>";
                                        soptgroup += "</optgroup>";
                                    } else {
                                        var soptgroup = "<optgroup label='Seasonal'>";
                                        soptgroup += "<option value='spring'>Spring</option>";
                                        soptgroup += "<option value='summer'>Summer</option>";
                                        soptgroup += "<option value='fall'>Fall</option>";
                                        soptgroup += "<option value='winter'>Winter</option>";
                                        soptgroup += "</optgroup>";
                                    }


                                    $('#mora').append(soptgroup);

                                    var seasons = ["spring", "summer", "fall", "winter"];
                                    if (seasons.includes(moraval)) {
                                        $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                    }

                                }

                                if (acfTimeStep.includes("2qsapr")) {
                                    // if ($('#mora').find("option[value='2qsapr']").length) {
                                    //     console.log('Quarterly Already Exist');
                                    // } else {
                                    // Create a DOM Option and pre-select by default


                                    if (current_lang === 'fr') {
                                        var newOption = new Option('Avril à Septembre', '2qsapr', false, false);
                                    } else {
                                        var newOption = new Option('April to September', '2qsapr', false, false);
                                    }


                                    if (moraval === '2qsapr') {
                                        $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                    }

                                    $('#mora').append(newOption);
                                    // }
                                }

                                if (!acfTimeStep.includes("annual") && moraval === 'ann') {
                                    $('#mora option:eq(0)').prop('selected', true).trigger('change.select2');
                                    update_param('mora', 'jan');
                                    update_query_string();
                                }

                                //
                                // update_param('mora', moraval);
                                // update_query_string();

                                moraval = getQueryVariable('mora')

                                // $("#mora").val(moraval).prop('selected', true).trigger('change.select2');
                                var_value = $("#var").val();
                                mora_value = $("#mora").val();
                                mora_text_value = $("#mora option:selected").text();
                                rcp_value = $("#rcp").val();
                                decade_value = parseInt($("#decade").val());
                            }




                        }
                    }
                });

            });


            queryVal = getQueryVariable('val');
            var varExists = false;
            $('#var option').each(function () {
                if (this.value === queryVal) {
                    varExists = true;
                    return false;
                }
            });

            if (varExists) {
                $('#var').val(queryVal);
                varval = queryVal;
            } else {
                varval = $('#var').val();
            }

            query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');

            // IF THE CHART OVERLAY IS OPEN

            if ($('body').hasClass('overlay-position-right')) {


                if (query['sector'] != '') {

                    genSectorChart(current_sector['id'], var_value, mora_value, current_sector['label']);

                } else if (query['var-group'] != 'station-data') {


                    genChart(current_coords[0], current_coords[1], var_value, mora_value);

                } else {

                    $(document).overlay('hide');

                }

            }


            if (history_action === 'push') {
                update_query_string();
            }
            changeLayers();

        };  // buildFilterMenu()

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

        // set the href of the (i) icon in the filter
        // when the variable changes

        $('#var').change(function () {
            var new_href = base_href + 'variable/' + $(this).val();
            $('#var-filter-variable .icon').attr('href', new_href);
        });

        // HISTORY

        // on initial load

        // convert the current URL string to an object
        query_str_to_obj();

        // initial layer opacity

        sliderChange(parseInt($('#opacity-slider-container').attr('data-default')));

        // evaluate query

        eval_query_obj();

        // generate initial legends

        mora_value = $("#mora").val();
        var_value = $("#var").val();
        rcp_value = $("#rcp").val();
        if (query['sector'] != '') {
            switch (mora_value) {
                case 'ann':
                    msorys = 'ys';
                    break;
                case 'spring':
                case 'summer':
                case 'fall':
                case 'winter':
                    msorys = 'qsdec';
                    break;
                case '2qsapr':
                    msorys = '2qsapr';
                    break;
                default:
                    msorys = 'ms';
            }

            generateSectorLegend(var_value + '-' + msorys + '-' + rcp_value + '-p50-' + mora_value + '-30year', '');


        } else {

            generateLeftLegend();

        }

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

            var new_title = title_pre + ' — ' + $('#var :selected').text() + ' — ' + title_post;

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
            }
        });

        $(document).on('overlay_show', function () {
            $('#var-filter-view').hide();

            if ($('body').find('#chart-tour').length) {

                var tour_options_chart = { default_open: false }
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
