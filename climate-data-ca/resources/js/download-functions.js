(function ($) {

    $(function () {

        //
        // GLOBAL VARS
        //

        var hosturl = geoserver_url;

        var maps = {};

        var var_map, station_map;

        var chart;

        var gridline_color = '#9a9fb7';
        var gridline_color_active = '#e50e40';
        var gridline_width = '0.2';
        var gridline_width_active = '1';

        var ajax_url = base_href.replace('fr/', '');
        var bbox_layer;

        // returns the maximum number of grid cells that can be requested
        function get_download_limits(freq, format) {
            switch (freq) {
                case 'all':
                    return 80;
                case 'daily':
                    switch (format) {
                        case 'netcdf':
                            return 200;
                        case 'csv':
                            return 20;
                    }
                default:
                    return 1000;
            }
        }

        //
        // VENDOR
        //

        // SELECT2

        // create array of default variable select options

        var var_default = $('#download-variable').clone();

        var all_vars = [];
        var daily_vars = [];

        $('#download-variable optgroup').each(function () {

            var new_group = {
                label: $(this).attr('label'),
                options: []
            };

            $(this).find('option').each(function () {

                var new_object = {
                    value: $(this).attr('value'),
                    text: $(this).text()
                };

                if ($(this).hasClass('daily')) {

                    daily_vars.push(new_object);

                }

                new_group['options'].push(new_object);

            });

            all_vars.push(new_group);

        });

        // location formatter

        function formatLocationSearch(item) {

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

        $('.download-location').select2({
            language: current_lang,
            containerCssClass: 'big-menu btn btn-lg btn-outline-primary rounded-pill',
            ajax: {
                url: child_theme_dir + "resources/app/run-frontend-sync/select-place.php",
                dataType: 'json',
                delay: 0,
                data: function (params) {
                    return {
                        q: params.term,
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
                        // $('.select2-results__options').append('<li style="padding:10px"><strong>Custom Lat/Lon Detected:</strong><br>Map has panned to validated coordinates.</li>');
                        
                        
                        var term_segs = term.split(',');
                        var term_lat = term_segs[0];
                        var term_lon = term_segs[1];
                        
                        $('.select2-results__options').append('<div class="geo-select-instructions p-4"><h6 class="mb-3">' + T('Coordinates detected') + '</h6><p class="mb-0"><span class="geo-select-pan-btn btn btn-outline-secondary btn-sm rounded-pill px-4" data-lat="' + term_lat + '" data-lon="' + term_lon + '">' + T('Set map view') + '</span></p></div>');
                        
                        // maps['variable'].panTo([term_lat, term_lon]);
                    } else {
                        $request.then(success);
                        return $request;
                    }
                },
                processResults: function (data, page) {
                    return {
                        results: data.items
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumInputLength: 1,
            width: '100%',
            templateResult: formatLocationSearch
        });
        
        var highlighted_feature;
        
        $('body').on('click', '.geo-select-pan-btn', function() {
            
            let thislat = parseFloat($(this).attr('data-lat')),
                thislon = parseFloat($(this).attr('data-lon')),
                this_zoom = maps['variable'].getZoom()
            
            if (this_zoom < 9) {
                this_zoom = 9
            }
            
            maps['variable'].setView([thislat, thislon], this_zoom);
            
            $('#select2-download-location-container').text($(this).attr('data-lat') + ', ' + $(this).attr('data-lon'))
            
            $(".download-location").select2('close')
            
            // highlight grid
            
            if (!highlighted_feature) {
                
                highlighted_feature = L.circleMarker([thislat, thislon], {
                    pane: 'markers',
                    color: '#fff',
                    opacity: 1,
                    weight: 2,
                    fillColor: '#e00',
                    fillOpacity: 1,
                    radius: 5
                }).addTo(maps['variable'])
                
            } else {
                
                highlighted_feature.setLatLng([thislat, thislon]); 
                
            }
            
        })

        $('.download-location').on('select2:select', function (e) {

            location_map = $(this).attr('data-map');

            thislat = e.params.data.lat;
            thislon = e.params.data.lon;

            let this_zoom = maps['variable'].getZoom()
            
            if (this_zoom < 9) {
                this_zoom = 9
            }
            
            maps[location_map].setView([thislat, thislon], this_zoom)
            
            // highlight grid
            
            if (!highlighted_feature) {
                
                highlighted_feature = L.circleMarker([thislat, thislon], {
                    pane: 'markers',
                    color: '#fff',
                    opacity: 1,
                    weight: 2,
                    fillColor: '#e00',
                    fillOpacity: 1,
                    radius: 5
                }).addTo(maps[location_map])
                
            } else {
                
                highlighted_feature.setLatLng([thislat, thislon]); 
                
            }

        });

        //
        // TABS
        //

        $('#download-content').tabs({
            hide: { effect: 'fadeOut', duration: 250 },
            show: { effect: 'fadeIn', duration: 250 },
            create: function (e, ui) {

                $('body').removeClass('spinner-on');

                if (ui.panel.attr('id') === 'var-download') {

                    if (typeof maps['variable'] == 'undefined') {
                        var_init();
                    }

                } else if (ui.panel.attr('id') === 'station-download') {
                
                    if (typeof maps['station'] == 'undefined') {
                        station_init();
                    }
                
                } else if (ui.panel.attr('id') === 'normals-download') {
                
                    if (typeof maps['normals'] == 'undefined') {
                        normals_init()
                    }
                
                } else if (ui.panel.attr('id') === 'idf-download') {

                    if (typeof maps['idf'] == 'undefined') {
                        idf_init()
                    }
                } else if (ui.panel.attr('id') === 'bdv-download') {

                    if (typeof maps['bdv'] == 'undefined') {
                        bdv_init()
                    }

                } else if (ui.panel.attr('id') === 'ahccd-download') {

                    if (typeof maps['ahccd'] == 'undefined') {
                        ahccd_init()
                    }

                }
            },
            activate: function (e, ui) {
                history.replaceState(null, null, '#' + ui.newPanel.attr('id'));

                if (ui.newPanel.attr('id') === 'var-download') {

                    if (typeof maps['variable'] == 'undefined') {
                        var_init();
                    }

                    $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

                } else if (ui.newPanel.attr('id') === 'station-download') {
                
                    if (typeof maps['station'] == 'undefined') {
                        station_init();
                    }
                
                } else if (ui.newPanel.attr('id') === 'normals-download') {
                
                    if (typeof maps['normals'] == 'undefined') {
                        normals_init()
                    }
                
                } else if (ui.newPanel.attr('id') === 'idf-download') {

                    if (typeof maps['idf'] == 'undefined') {
                        idf_init()
                    }

                } else if (ui.newPanel.attr('id') === 'bdv-download') {

                    if (typeof maps['bdv'] == 'undefined') {
                        bdv_init()
                    }

                } else if (ui.newPanel.attr('id') === 'ahccd-download') {

                    if (typeof maps['ahccd'] == 'undefined') {
                        ahccd_init();
                    }

                }

            }
        });

        $('#map-overlay .btn').click(function (e) {
            e.preventDefault()
            $('#map-overlay').fadeOut()
        })



        //
        // VARIABLE
        //

        subtractValue = 0
        varDetails = {}

        selectedGrids = []
        selectedPoints = []
        latlons = []

        function var_init() {

            create_map('variable');

            var highlightGridFeature;

            var clearHighlight = function () {
                if (highlightGridFeature) {
                    pbfLayer.resetFeatureStyle(highlightGridFeature);
                }
                highlightGridFeature = null;
            };
            addGrid('canadagrid');


            $('#var-download .select2').on('select2:select', function (e) {
                checkform()
            })

            maps['variable'].on('pm:create', function (e){
                bbox_layer = e.layer;
                bbox_layer.pm.enable({}); // enable edition
                bbox_layer.on('pm:edit', handle_bbox_event);
                handle_bbox_event(e);
            });
        }

        function addGrid(gridName) {
            if (gridName === 'slrgrid') {
                var vectorTileOptions = {

                    rendererFactory: L.canvas.tile,

                    attribution: '',
                    interactive: true,
                    getFeatureId: function (f) {
                        return f.properties.gid;
                    },

                    maxNativeZoom: 12,
                    vectorTileLayerStyles: {
                        'slrgrid': function (properties, zoom) {
                            return {
                                weight: 0.2,
                                color: '#89cff0',
                                opacity: 1,
                                fill: true,
                                radius: 4,
                                fillOpacity: 0
                            }
                        }
                    },
                    maxZoom: 12,
                    minZoom: 7,
                    pane: 'grid',
                };
            } else {
                var vectorTileOptions = {
                    rendererFactory: L.canvas.tile,
                    attribution: '',
                    interactive: true,
                    getFeatureId: function (f) {
                        return f.properties.gid;
                    },
                    maxNativeZoom: 12,
                    vectorTileLayerStyles: {},
                    maxZoom: 12,
                    minZoom: 7,
                    pane: 'grid',
                };
                vectorTileOptions.vectorTileLayerStyles[gridName] = function (properties, zoom) {
                    return {
                        weight: 0.1,
                        color: gridline_color,
                        opacity: 1,
                        fill: true,
                        radius: 4,
                        fillOpacity: 0
                    }
                };
            }

            var pbfURL = hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + gridName + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf";
            pbfLayer = L.vectorGrid.protobuf(pbfURL, vectorTileOptions).on('click', function (e) {
                if ($('input[name="download-select"]:checked').val() == 'gridded') {

                    highlightGridFeature = e.layer.properties.gid;
                    selectedPoints[highlightGridFeature] = e.latlng;

                    var selectedExists = selectedGrids.includes(highlightGridFeature);

                    if (selectedExists === false) {

                        selectedGrids.push(highlightGridFeature);

                        pbfLayer.setFeatureStyle(highlightGridFeature, {
                            weight: 1,
                            color: '#F00',
                            opacity: 1,
                            fill: true,
                            radius: 4,
                            fillOpacity: 0.1
                        });

                    } else {

                        for (var i = selectedGrids.length - 1; i >= 0; i--) {

                            if (selectedGrids[i] === highlightGridFeature) {
                                selectedGrids.splice(i, 1);
                            }
                        }

                        for (var key in selectedPoints) {

                            if (key === highlightGridFeature) {
                                delete selectedPoints[key]
                            }
                        }

                        pbfLayer.setFeatureStyle(highlightGridFeature, {
                            weight: 0.1,
                            color: gridline_color,
                            opacity: 1,
                            fill: true,
                            radius: 4,
                            fillOpacity: 0
                        });

                    }


                    var points_to_process = selectedGrids.length

                    if (selectedGrids.length > 0) {
                        $('#download-location').parent().find('.select2-selection__rendered').text(selectedGrids.length + ' ' + l10n_labels.selected)
                    } else {
                        $('#download-location').parent().find('.select2-selection__rendered').text(l10n_labels.search_city)
                    }

                    var current_coords = ''

                    selectedGrids.forEach(function (grid_id) {
                        current_coords += '|' + selectedPoints[grid_id].lat + ',' + selectedPoints[grid_id].lng + ',' + grid_id
                    })

                    $('#download-coords').val(current_coords)

                    L.DomEvent.stop(e)

                    checkform();

                }}).addTo(maps['variable']);

            pbfLayer.myTag = 'gridlayer';
            pbfLayer.gridType = gridName;

        }

        /**
         * Used to handle any changes to the bouding box (created and edited)
         * @param e JS event
         */
        function handle_bbox_event(e) {
            let bounds = e.layer.getBounds();
            let sw = bounds.getSouthWest();
            let ne = bounds.getNorthEast();

            // store the bounds in #download-coords
            $('#download-coords').val([sw.lat, sw.lng, ne.lat, ne.lng].join('|'));

            let cells = count_selected_gridcells();

            $('#download-location').parent().find('.select2-selection__rendered').text(T("Around {0} grid boxes selected").format(cells));
            checkform();
        }

        // Clear all selections (bbox or gridded) for variable download
        function clear_var_selections() {
            for (var i = 0 ; i < selectedGrids.length; i++) {
                pbfLayer.resetFeatureStyle(selectedGrids[i]);
            }
            selectedGrids = [];
            $('#download-location').val('');
            $('#download-coords').val('');
            $('#download-location').parent().find('.select2-selection__rendered').text(l10n_labels.search_city);
            if (bbox_layer !== undefined) {
                maps['variable'].removeLayer(bbox_layer);
                bbox_layer = undefined;
                maps['variable'].pm.enableDraw('Rectangle', {});
            }
            checkform();

        }

        function count_selected_gridcells() {
            let coords = $('#download-coords').val().split('|');


            switch ($('input[name="download-select"]:checked').val()) {
                case 'gridded':
                    return selectedGrids.length;
                    break;
                case 'bbox':
                    return Math.round((coords[2] - coords[0]) * (coords[3] - coords[1]) / grid_resolution[curValData.grid] ** 2);
                    break;
            }
        }


        //
        // FORM VALIDATION
        //
        function checkform() {
            $('#download-result').slideUp(125)

            let freq = $('#download-frequency').val();
            let format = $('input[name="download-format"]:checked').val();

            let limit = get_download_limits(freq, format);
            let cells = count_selected_gridcells();
            $('#download-limit-label').text(T('With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}').format(limit));

            if (cells > limit) {
                $('#download-limit-label').addClass('border-danger');
                $('#download-limit-label').addClass('border');
            } else {
                $('#download-limit-label').removeClass('border-danger');
                $('#download-limit-label').removeClass('border');

            }
            // approximate number of gridcell


            if (freq === 'daily') {
                // DAILY DATA
                if (
                    $('body').validate_email($('#daily-email').val()) === true &&
                    $('#daily-captcha_code').val() !== '' &&
                    $('#download-coords').val() !== '' &&
                    cells <= limit
                ) {
                    $('#daily-process').removeClass('disabled');
                } else {
                    $('#daily-process').addClass('disabled');
                }
            } else {
                // MONTHLY OR ANNUAL
                // if a filename is entered and the hidden lat/lon inputs have values
                if ($('#download-filename').hasClass('valid') &&
                    $('#download-coords').val() !== '' &&
                    cells <= limit) {
                    $('#download-process').removeClass('disabled');
                } else {
                    $('#download-process').addClass('disabled');
                }
            }
        }

        //
        // FORM PROCESSING
        //

        var variableDataTypes = {
            // Download_Variable-Data_BCCAQv2 ...
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
            'slr': 'Sea-Level_Change',
            'all': 'All',
        };

        var pointsInfo = "";
        var dataLayerEventName = "";

        function getGA4EventNameForVariableDataBCCAQv2() {
            var gA4EventNameForVariableDataBCCAQv2 = "";

            try {
                var eventType = $('#download-variable').val();

                if (variableDataTypes[eventType]) {
                    gA4EventNameForVariableDataBCCAQv2 = "Download_Variable-Data_BCCAQv2_" + variableDataTypes[eventType] + "_Frequency_Location_Format";
                } else {
                    throw ('Invalid GA4 event name (Download_Variable-Data_BCCAQv2): ' + eventType);
                }
            } catch (err) {
                console.error(err);
            }

            return gA4EventNameForVariableDataBCCAQv2;
        }

        var format = null;
        $('.download_variable_data_bccaqv2').click(function (e) {
            let selectedDataset = $('input[name="download-dataset"]:checked').val();
            dataLayer.push({
                'event': dataLayerEventName,
                'variable_data_event_type': dataLayerEventName,
                'variable_data_location': pointsInfo,
                'variable_data_format': format,
                'variable_data_dataset': selectedDataset
            });
        });

        function download_var(request_args, callback) {

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    // zip.file($('#download-filename').val() + '-' + varToProcess[i] + '.' + format_extension, xhttp.response);
                    return callback(null, {var_name: request_args.var, data: xhttp.response});
                }
            };
            xhttp.open("POST", data_url + '/download');
            xhttp.setRequestHeader("Content-Type", "application/json");
            xhttp.responseType = 'blob';
            xhttp.send(JSON.stringify(request_args));
        }

        function process_download() {

            var selectedVar = $('#download-variable').val();
            let pointsData;
            dataLayerEventName = getGA4EventNameForVariableDataBCCAQv2();

            month = $("#download-frequency").val();
            if (month === 'annual') {
                month = 'ann'
            }

            switch ($('input[name="download-select"]:checked').val()) {
                case 'gridded':
                    pointsData = {'points': []};
                    pointsInfo = '';
                    for (var i = 0; i < selectedGrids.length; i++) {
                        point = selectedPoints[selectedGrids[i]];
                        pointsInfo += "GridID: " + selectedGrids[i] + ", Lat: " + point.lat + ", Lng: " + point.lng + " ; ";
                        pointsData.points.push([point.lat, point.lng]);
                    }

                    // Remove the extra " ; " at the end left by the previous loop
                    if (selectedGrids.length > 0) {
                        pointsInfo = pointsInfo.substring(0, pointsInfo.length - 3);
                    }
                    break;
                case 'bbox':
                    let split_coords = $('#download-coords').val().split('|');
                    pointsInfo = "BBox: " + split_coords.join(',');
                    pointsData  = {'bbox': [parseFloat(split_coords[0]),
                        parseFloat(split_coords[1]),
                        parseFloat(split_coords[2]),
                        parseFloat(split_coords[3])]};
                    break;

            }
            format = $('input[name="download-format"]:checked').val();
            let dataset_name = $('input[name="download-dataset"]:checked').val();
            let selectedDatasetType = $('input[name="download-dataset-type"]:checked').val();
            let format_extension = format;

            if (format == 'netcdf') {
                format_extension = 'nc';
            }

            if (selectedVar !== 'all') {
                format_extension = 'zip';
                $('body').addClass('spinner-on');
                request_args = {
                    var: selectedVar,
                    month: month,
                    dataset_name: dataset_name,
                    dataset_type: selectedDatasetType,
                    zipped: true,
                    format: format
                };
                Object.assign(request_args, pointsData);


                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState === XML_HTTP_REQUEST_DONE_STATE && xhttp.status === 200) {
                        $('#download-result a').attr('href', window.URL.createObjectURL(xhttp.response));
                        $('#download-result a').attr('download', $('#download-filename').val() + '.' + format_extension);


                        $('#download-result').slideDown(250);
                        $('body').removeClass('spinner-on');
                    }
                };
                xhttp.open("POST", data_url + '/download');
                xhttp.setRequestHeader("Content-Type", "application/json");
                xhttp.responseType = 'blob';
                xhttp.send(JSON.stringify(request_args));
            } else {
                // call download for all matching variables and build a zip file
                selectedTimeStepCategory = $('#download-frequency').find(':selected').data('timestep');
                varToProcess = [];

                varData.forEach(function (varDetails, k) {
                    if (k !== 'all' && varDetails.grid === 'canadagrid' && varDetails.timestep.includes(selectedTimeStepCategory)) {
                        varToProcess.push(k);
                    }
                });

                $('body').addClass('spinner-on');

                requests = varToProcess.map(function (var_name) {
                    let request_args = {
                        var: var_name,
                        month: month,
                        dataset_name: dataset_name,
                        dataset_type: selectedDatasetType,
                        zipped: format === 'netcdf' ? false : true,
                        format: format
                    };
                    Object.assign(request_args, pointsData);
                    return request_args;
                });

                async.mapLimit(requests, 4, download_var, function (err, results) {
                    $('body').removeClass('spinner-on');

                    async.reduce(results, new JSZip(), function (zip, result, callback) {
                        if (format === 'netcdf') {
                            return callback(null, zip.file(result.var_name + '.nc', result.data))
                        }
                        else {
                            zip.folder(result.var_name).loadAsync(result.data)
                              .then(zip2 => {
                                  return callback(null, zip);
                              });
                        }
                    })
                      .then(zip => {
                          zip.generateAsync({
                              type: "blob",
                              compression: "DEFLATE"
                          })
                            .then(function (content) {
                                saveAs(content, $('#download-filename').val() + ".zip");
                            })
                      })
                });
            }


        }


        function buildVarDropdown(frequency, selectedVar, dataset) {

            let currentOptGroup = '';
            let selectedTimeStepCategory = $('#download-frequency').find(':selected').data('timestep');
            let selectedDatasetType = $('input[name="download-dataset-type"]:checked').val();

            varData.forEach(function (varDetails) {
                // in which dataset this variable is available? Default to all if the ACF field is not yet present
                let dataset_availability = (varDetails.dataset_availability !== undefined ? varDetails.dataset_availability : Object.keys(DATASETS));

                // filter out variables not available for selected timestep and dataset
                if (varDetails.timestep.includes(selectedTimeStepCategory) &&
                    dataset_availability.includes(dataset) &&
                    !(selectedDatasetType == '30ygraph' && varDetails.hasdelta == false)  // all variables without delta doesn't have 30ygraph data files
                ) {
                    if (varDetails.variable_type !== 'station_data') {
                        if (currentOptGroup !== varDetails.variable_type) {
                            $('#download-variable').append("<optgroup id=optgroup_" + varDetails.variable_type + " label='" + l10n_labels[varDetails.variable_type] + "'>");
                            currentOptGroup = varDetails.variable_type;
                        }

                        varnewOption = new Option(varDetails.var_title, varDetails.var_name, false, varDetails.var_name === selectedVar);
                        $('#optgroup_' + varDetails.variable_type).append(varnewOption);

                    }

                }
            });
            if (selectedTimeStepCategory !== 'daily' && $('#download-frequency').val() != 'all') {
                $('#download-variable').append("<optgroup id=optgroup_misc label='" + l10n_labels['misc'] + "'>");
                $('#optgroup_misc').append(new Option(l10n_labels['allbccaq'], 'all', false, false));
            }

            if ($("#download-variable option[value='" + selectedVar + "']").length > 0) {
                $('#download-variable').val(selectedVar);
                $('#download-variable').trigger('change');
                $('#download-variable').val(selectedVar).trigger('select2:select');
            } else {
                $('#download-variable option:eq(0)').prop('selected', true);

                $('#download-variable').trigger('change');
                selectedVar = $('#download-variable').val();
                $('#download-variable').val(selectedVar).trigger('select2:select');
            }
        }


        $('#download-frequency').on('select2:select', function (e) {
            currentVar = $("#download-variable").val();
            let selectedDataset = $('input[name="download-dataset"]:checked').val();
            $('#download-variable').empty();

            buildVarDropdown(e.currentTarget.value, currentVar, selectedDataset);

            if (e.currentTarget.value == 'daily') {

                // refresh captcha
                $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

                // netCDF option
                $('#format-label-netcdf').show();
                $('#format-label-json').hide();

                // email field
                $('#annual-process-wrap').hide();
                $('#daily-process-wrap').show();

                $('#average-btn-group').hide();

            } else {

                // json option
                $('#format-label-netcdf').show();
                $('#format-label-json').show();

                // email field
                $('#annual-process-wrap').show();
                $('#daily-process-wrap').hide();

                $('#average-btn-group').show();
            }
        });

        $('#selection-dataset input, #average-btn-group input').on('change', function (e) {
            let currentVar = $("#download-variable").val();
            let frequency = $('#download-frequency').val();
            let selectedDataset = $('input[name="download-dataset"]:checked').val();
            $('#download-variable').empty();

            buildVarDropdown(frequency, currentVar, selectedDataset);
        });

        $('#daily-captcha_code').on('input', function (e) {
            checkform();
        });

        $('#daily-email').on('input', function (e) {
            checkform();
        });

        // location

        $('#download-variable').on('select2:select', function (e) {

            curValData = e.target.value != "all" ? varData.get(e.target.value) : {'grid': 'canadagrid'};

            if (curValData === undefined) {
                $('#download-variable').val(1).trigger('change.select2');
            }
            if (typeof pbfLayer !== 'undefined' && pbfLayer.gridType !== curValData.grid) {
                maps['variable'].removeLayer(pbfLayer);
                console.log("Adding Grid:" + curValData.grid);
                addGrid(curValData.grid);
                clear_var_selections();
            }
        });


        $('#download-location').on('select2:select', function (e) {

            if ($(this).val() != '') {
                $(this).addClass('valid');
            } else {
                $(this).removeClass('valid');
            }

            checkform();

        });

        // selection type
        $('#selection-type input').on('change', function () {
            clear_var_selections();

            switch ($('input[name="download-select"]:checked').val()) {
                case 'gridded':
                    maps['variable'].pm.disableDraw();
                    $('.labels-gridded').show();
                    $('.labels-bbox').hide();
                    break;

                case 'bbox':
                    maps['variable'].pm.enableDraw('Rectangle', {});
                    $('.labels-gridded').hide();
                    $('.labels-bbox').show();

                    break;
            }

        });

        // format

        $('#download-filetype input').on('change', function () {

            checkform();

        });

        // filename

        $('#download-filename').on('input', function () {

            if ($(this).val() != '') {
                $(this).addClass('valid');
            } else {
                $(this).removeClass('valid');
            }

            if ($('input[name="download-format"]:checked').val() !== 'json') {
                checkform();
            }

        });

        $('#download-filename').on('change', function () {

            if ($('input[name="download-format"]:checked').val() === 'json') {
                checkform();
            }

        });

        $('#download-form').submit(function (e) {
            e.preventDefault();
        });

        $('#download-clear').click(function (e) {
            e.preventDefault();
            clear_var_selections();
        });

        //
        // SUBMISSION FOR 'ANNUAL' OR 'MONTHLY' DATASETS
        //

        $('#download-process').click(function (e) {
            e.preventDefault()
            process_download()
        });

        $('#download-result a').click(function (e) {
            //
        })

        checkform()

        //
        // SUBMISSION FOR 'DAILY' DATASET
        //

        $('#daily-process').click(function (e) {
            e.preventDefault();

            let var_name = '';
            let submit_url = '';
            let dataset_name = $('input[name="download-dataset"]:checked').val();

            switch ($('#download-variable').val()) {

                case 'tn_mean':
                    var_name = 'tasmin';
                    break;

                case 'tx_mean':
                    var_name = 'tasmax';
                    break;

                case 'prcptot':
                    var_name = 'pr';
                    break;
            }

            var submit_data = {
                "captcha_code":$('#daily-captcha_code').val(),
                "signup":$('#signup').is(":checked"),
                "request_data": {
                    "inputs": [
                        {
                            "id": "variable",
                            "data": var_name,
                        },
                        {
                            "id": "data_validation",
                            "data": "warn"
                        },
                        {
                            "id": "output_format",
                            "data": $('input[name="download-format"]:checked').val()
                        },
                        {
                            "id": "dataset",
                            "data": DATASETS[dataset_name].finch_name
                        }
                    ],
                    "response": "document",
                    "notification_email": $('#daily-email').val(),
                    "mode": "auto",
                    "outputs": [{
                        "transmissionMode": "reference",
                        "id": "output"
                    }]
                }
            };
            let split_coords = $('#download-coords').val().split('|');
            switch ($('input[name="download-select"]:checked').val()) {
                case 'gridded':
                        let lat_vals = '', lon_vals = '';

                    // remove first element which is empty because the first character is always '|'
                    split_coords.shift();

                    for (i = 0; i < split_coords.length; i += 1) {

                        let this_coord = split_coords[i].split(',');

                        if (lat_vals !== '') {
                            lat_vals += ','
                        }

                        lat_vals += this_coord[0];

                        if (lon_vals !== '') {
                            lon_vals += ','
                        }

                        lon_vals += this_coord[1]

                    }
                    submit_data['request_data']['inputs'].push({
                        "id": "lat0",
                        "data": lat_vals
                    }, {
                        "id": "lon0",
                        "data": lon_vals
                    });
                    submit_data['submit_url'] = "/providers/finch/processes/subset_grid_point_dataset/jobs";
                    break;

                case 'bbox':

                    submit_data['request_data']['inputs'].push({
                        "id": "lat0",
                        "data": split_coords[0]
                    }, {
                        "id": "lon0",
                        "data": split_coords[1]
                    }, {
                        "id": "lat1",
                        "data": split_coords[2]
                    }, {
                        "id": "lon1",
                        "data": split_coords[3]
                    });

                    submit_data['submit_url'] = "/providers/finch/processes/subset_bbox_dataset/jobs";
                    break;
            }

            $.ajax({
                url: child_theme_dir + 'resources/ajax/finch-submit.php',
                method: "POST",
                data: submit_data,
                success: function (data) {
                    var response = JSON.parse(data);
                    console.log(response);
                    if (typeof response == 'object' && response.status == 'accepted') {

                        $('#daily-captcha_code').removeClass('border-secondary').tooltip('dispose');
                        $('#success-modal').modal('show');

                    } else if (typeof response == 'object' && response.status == 'captcha failed') {
                        $('#daily-captcha_code').addClass('border-secondary').tooltip('show');
                    }
                },
                complete: function () {
                    $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');
                    $('#daily-captcha_code').val('');
                }
            });
        });

        //
        // STATION
        //

        var station_status = $('#station-download-status').text();

        var station_dl_obj = {
            s: [],
            start: $('#station-start').val(),
            end: $('#station-end').val(),
            limit: $('#limit').val(),
            offset: 0,
            format: $('input[name="format"]:checked').val()
        };

        var markerMap = [];
        stationFromAPI = [];
        var pointsLayer;
        var selected_stations = {};

        function station_init() {

            create_map('station');
            $('#station-process-data').removeAttr("style").hide();

            $.getJSON('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID,LATITUDE,LONGITUDE', function (data) {

                var markers = L.markerClusterGroup();

                var geojsonMarkerOptions = {
                    // Stroke properties
                    color: '#3d68f6',
                    opacity: 1,
                    weight: 2,
                    pane: 'idf',
                    // Fill properties
                    fillColor: '#3d68f6',
                    fillOpacity: 1,
                    radius: 5
                };

                pointsLayer = L.geoJson(data, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }


                }).on('mouseover', function (e) {
                    e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME + ' ' + e.layer.feature.properties.STN_ID).openTooltip(e.latlng);
                }).on('click', function (e) {
                    // get current station select value
                    var existingData = $("#station-select").select2("val");
                    // clicked ID
                    var clicked_ID = e.layer.feature.properties.STN_ID.toString();
                    if (selected_stations[clicked_ID] !== undefined) {
                        delete selected_stations[clicked_ID];
                    } else {
                        selected_stations[clicked_ID] = e.layer.feature.properties.STATION_NAME;
                    }

                    // default colour
                    markerColor = '#F00';
                    if (existingData != null) {
                        if (existingData.includes(clicked_ID)) {
                            var $select = $('#station-select');
                            index = existingData.indexOf(clicked_ID);
                            if (index > -1) {
                                existingData.splice(index, 1);
                            }
                            $('#station-select').val(existingData).change();
                            markerColor = '#3d68f6';
                        } else {
                            existingData.push(clicked_ID);
                            $('#station-select').val(existingData).change();
                        }
                    } else {
                        existingData = [clicked_ID];
                        $('#station-select').val(existingData).change();
                    }

                    e.layer.setStyle({
                        // Stroke properties
                        color: markerColor,
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: markerColor,
                        fillOpacity: 1,
                        radius: 5
                    });
                });

                markers.addLayer(pointsLayer);

                maps['station'].addLayer(markers);
            });


            function formatGeoSelect(item) {

                var $item = $('<span><div class="station-select-title">' + item.id + ' (' + item.text + ')</div></span>');

                return $item;

            }

        }

        $('#start_date').datetimepicker({
            format: 'YYYY-MM-DD',
            viewMode: 'years'
        });

        $('#start_date').on('change.datetimepicker', function () {
            update_URL('start', $('#station-start').val());
            check_station_form();
        });

        $('#end_date').datetimepicker({
            format: 'YYYY-MM-DD',
            viewMode: 'years'
        });

        $('#end_date').on('change.datetimepicker', function () {
            update_URL('end', $('#station-end').val());
            check_station_form();
        });

        $("#station-select").select2({
            language: current_lang,
            ajax: {
                url: child_theme_dir + "resources/app/run-frontend-station-download/search.php",
                dataType: 'json',
                delay: 0,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        page: params.page
                    };
                },
                processResults: function (data, page) {
                    // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data
                    return {
                        results: data
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            width: "100%",
            //templateResult: formatGeoSelect,
            theme: "bootstrap4",
            placeholderOption: 'first',
            placeholder: $('#station-select').attr('data-placeholder')
        });

        $('#station-download-form :input').change(function () {
            $('#generated_container').hide();


            var param = $(this).attr('name');
            var new_val = $(this).val();

            switch ($(this).attr('id')) {

                case 'station-select':
                    param = 's';

                    if ($(this).val() !== null) {
                        new_val = $(this).val().join('|');
                    } else {
                        new_val = '';
                    }

                    break;

                case 'station-start':
                    param = 'start';
                    break;

                case 'station-end':
                    param = 'end';
                    break;

            }

            update_URL(param, new_val);

            check_station_form();
        });

        // trigger when a tag is removed from multiple station selector input
        $('#station-select').on('select2:unselect', function (e) {
            marker_id = parseFloat(e.params.data.id);
            pointsLayer.eachLayer(function (layer) {
                if (layer.feature.properties.STN_ID === marker_id) {
                    delete selected_stations[marker_id];
                    layer.setStyle({
                        // Stroke properties
                        color: '#3d68f6',
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: '#3d68f6',
                        fillOpacity: 1,
                        radius: 5
                    })
                }
            });
        });

        // trigger when a tag is added to multiple station selector input
        $('#station-select').on('select2:select', function (e) {
            marker_id = parseInt(e.params.data.id);
            pointsLayer.eachLayer(function (layer) {
                if (layer.feature.properties.STN_ID === marker_id) {
                    selected_stations[marker_id] = layer.feature.properties.STATION_NAME;
                    layer.setStyle({
                        // Stroke properties
                        color: '#F00',
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: '#F00',
                        fillOpacity: 1,
                        radius: 5
                    })
                }
            });
        });

        function check_station_form() {

            station_status = '';


            var form_valid = true;

            $('#station-download-form .validate').each(function () {

                if ($(this).val() == '') {
                    form_valid = false;


                    station_status += $(this).closest('div').find('label').text() + ' is invalid. ';

                }

            });

            if (station_dl_obj['s'].length == 0) {
                form_valid = false;

                station_status += T('Choose at least one weather station. ');
            }

            if (form_valid == false) {
                $('#station-process').addClass('disabled');
            } else {
                $('#station-process').removeClass('disabled');
                station_status = T('Ready to process.');

                populate_station_URL();
            }

            if (selected_stations == undefined || Object.keys(selected_stations).length == 0) {
                populate_station_URL(0); // update only #station-download-data
            }

            $('#station-download-status').text(station_status);
        }

        function update_URL(name, val) {
            station_dl_obj[name] = val;
        }


        var selected_stations_to_str = '';
        function get_selected_stations() {
            // ex: class="42 -- DUNCAN & 1593 -- RUSSELL CREEK ; 1614 -- TWO PETE CREEK ; ..."

            var ret_selected_stations = "";
            for (const key in selected_stations) {
                ret_selected_stations += key + " -- " + selected_stations[key] + " ; ";
            }

            // Remove last char: ;
            if (Object.keys(selected_stations).length > 0) {
                ret_selected_stations = ret_selected_stations.substring(0, ret_selected_stations.length - 3);
            }

            if (Object.keys(selected_stations).length == 0) {
                ret_selected_stations = " ";
            }

            return ret_selected_stations;
            // Create <a id="station-process-data" class=" station id -- station name & ..."> for Google Analytics
            // $('#station-process-data').attr('class', class_info);
            // $('#station-process-data').removeAttr("style").hide();
        }

        function set_datalayer_for_download_station_data(download_station_data_list, download_station_file_extension) {
            dataLayer.push({
                'event': 'Download_Station-Data',
                'download_station_data_event': 'Download_Station-Data',
                'download_station_data_list': download_station_data_list,
                'download_station_file_extension': download_station_file_extension
            });
        }

        $('#station-process').click(function (e) {
            var csvFormatClassName = $("#csvFormat").parent().attr("class");
            var geoFormatClassName = $("#geoFormat").parent().attr("class");
            var selected_stations_file_extension = 'CSV';
            if (geoFormatClassName.includes("active")) {
                selected_stations_file_extension = 'GeoJSON';
                try {
                    if (csvFormatClassName.includes("active")) {
                        throw ('GA4_event (Download_Station-Data) file format, both (CSV, GeoJSON) are selected');
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            // selected_stations_file_extension get text from class="csvFormat" or class="geoFomrat"
            set_datalayer_for_download_station_data(selected_stations_to_str, selected_stations_file_extension);
        });

        function populate_station_URL(ga4_event = 1) {
            if (ga4_event == 1) {
                var new_url = 'https://api.weather.gc.ca/collections/climate-daily/items?datetime=' + station_dl_obj.start + ' 00:00:00/' + station_dl_obj.end + ' 00:00:00&STN_ID=' + station_dl_obj['s'] + '&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=' + station_dl_obj.format + '&limit=' + station_dl_obj.limit + '&startindex=' + station_dl_obj.offset;
                $('#station-process').attr('href', new_url);
            }
            selected_stations_to_str = get_selected_stations();
        }
        
        //
        // STATION
        //
        
        var normals_status = $('#normals-download-status').text();
        
        var normals_dl_obj = {
            s: [],
            limit: $('#normals-limit').val(),
            offset: 0,
            format: $('input[name="format"]:checked').val()
        };
        
        var markerMap = [];
        stationFromAPI = [];
        var normals_layer;
        var selected_normals_stations = {};
        
        function normals_init() {
        
            create_map('normals');
            $('#normals-process-data').removeAttr("style").hide();
            
            $.getJSON('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=CLIMATE_IDENTIFIER,STATION_NAME,STN_ID&startindex=0&HAS_NORMALS_DATA=Y', function (data) {
                var markers = L.markerClusterGroup();
                
                normals_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {
                        
                        $('<option value="' + feature.properties.CLIMATE_IDENTIFIER + '">' + feature.properties.STATION_NAME + '</option>').appendTo('#normals-select')
                    
                    },
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, {
                            // Stroke properties
                            color: '#3d68f6',
                            opacity: 1,
                            weight: 2,
                            pane: 'idf',
                            fillColor: '#3d68f6',
                            fillOpacity: 1,
                            radius: 5
                        });
                    }
                    
                }).on('mouseover', function (e) {
                    
                    e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME).openTooltip(e.latlng);
                    
                }).on('click', function (e) {
                    
                    // get current station select value
                    var existingData = $("#normals-select").select2("val");
                    // clicked ID
                    var clicked_ID = e.layer.feature.properties.CLIMATE_IDENTIFIER.toString();
                    if (selected_normals_stations[clicked_ID] !== undefined) {
                        delete selected_normals_stations[clicked_ID];
                    } else {
                        selected_normals_stations[clicked_ID] = e.layer.feature.properties.STATION_NAME;
                    }
                    
                    // default colour
                    markerColor = '#F00';
                    if (existingData != null) {
                        if (existingData.includes(clicked_ID)) {
                            var $select = $('#normals-select');
                            index = existingData.indexOf(clicked_ID);
                            if (index > -1) {
                                existingData.splice(index, 1);
                            }
                            $('#normals-select').val(existingData).change();
                            markerColor = '#3d68f6';
                        } else {
                            existingData.push(clicked_ID);
                            $('#normals-select').val(existingData).change();
                        }
                    } else {
                        existingData = [clicked_ID];
                        $('#normals-select').val(existingData).change();
                    }
                    
                    e.layer.setStyle({
                        // Stroke properties
                        color: markerColor,
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: markerColor,
                        fillOpacity: 1,
                        radius: 5
                    });
                    
                    // $('#normals-select').val(e.layer.feature.properties.CLIMATE_IDENTIFIER).trigger('change')
                    
                });
                
                // sort options
                
                var arr = $('#normals-select option').map(function (_, o) {
                    return { t: $(o).text(), v: o.value };
                }).get()
                
                arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                })
                
                $('#normals-select option').each(function (i, o) {
                    o.value = arr[i].v
                    $(o).text(arr[i].t)
                })
                
                // add to map
                markers.addLayer(normals_layer);
                maps['normals'].addLayer(markers);
                
            }).done(function () {
                
            });
        
        }
        
        $("#normals-select").select2({
            language: current_lang,
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            width: "100%",
            //templateResult: formatGeoSelect,
            theme: "bootstrap4",
            placeholderOption: 'first',
            placeholder: $('#normals-select').attr('data-placeholder')
        });
        
        $('#normals-download-form :input').change(function () {
            $('#normals-generated_container').hide();
        
            var param = $(this).attr('name');
            var new_val = $(this).val();
        
            switch ($(this).attr('id')) {
        
                case 'normals-select':
                    param = 's';
                    
                    if ($(this).val() !== null) {
                        new_val = $(this).val().join('|');
                    } else {
                        new_val = '';
                    }
        
                    break;
        
                case 'normals-start':
                    param = 'start';
                    break;
        
                case 'normals-end':
                    param = 'end';
                    break;
        
            }
        
            update_normals_URL(param, new_val);
        
            check_normals_form();
        });
        
        // trigger when a tag is removed from multiple station selector input
        $('#normals-select').on('select2:unselect', function (e) {
            marker_id = parseFloat(e.params.data.id);
            normals_layer.eachLayer(function (layer) {
                if (layer.feature.properties.STN_ID === marker_id) {
                    delete selected_normals_stations[marker_id];
                    layer.setStyle({
                        // Stroke properties
                        color: '#3d68f6',
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: '#3d68f6',
                        fillOpacity: 1,
                        radius: 5
                    })
                }
            });
        });
        
        // trigger when a tag is added to multiple station selector input
        $('#normals-select').on('select2:select', function (e) {
            
            marker_id = parseInt(e.params.data.id);
            
            normals_layer.eachLayer(function (layer) {
                
                if (layer.feature.properties.STN_ID === marker_id) {
                    selected_normals_stations[marker_id] = layer.feature.properties.STATION_NAME;
                    
                    layer.setStyle({
                        // Stroke properties
                        color: '#F00',
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: '#F00',
                        fillOpacity: 1,
                        radius: 5
                    })
                }
                
            });
            
        });
        
        function check_normals_form() {
        
            station_status = '';
        
            var form_valid = true;
        
            $('#normals-download-form .validate').each(function () {
        
                if ($(this).val() == '') {
                    form_valid = false;
        
                    station_status += $(this).closest('div').find('label').text() + ' is invalid. ';
        
                }
        
            });
        
            if (normals_dl_obj['s'].length == 0) {
                form_valid = false;
        
                station_status += T('Choose at least one weather station. ');
            }
        
            if (form_valid == false) {
                $('#normals-process').addClass('disabled');
            } else {
                $('#normals-process').removeClass('disabled');
                station_status = T('Ready to process.');
        
                populate_normals_URL();
            }
        
            if (selected_normals_stations == undefined || Object.keys(selected_normals_stations).length == 0) {
                populate_normals_URL(0); // update only #station-download-data
            }
        
            $('#normals-download-status').text(station_status);
        }
        
        function update_normals_URL(name, val) {
            normals_dl_obj[name] = val;
        }
        
        
        var selected_normals_stations_to_str = '';
        function get_selected_normals_stations() {
            // ex: class="42 -- DUNCAN & 1593 -- RUSSELL CREEK ; 1614 -- TWO PETE CREEK ; ..."
        
            var ret_selected_normals_stations = "";
            for (const key in selected_normals_stations) {
                ret_selected_normals_stations += key + " -- " + selected_normals_stations[key] + " ; ";
            }
        
            // Remove last char: ;
            if (Object.keys(selected_normals_stations).length > 0) {
                ret_selected_normals_stations = ret_selected_normals_stations.substring(0, ret_selected_normals_stations.length - 3);
            }
        
            if (Object.keys(selected_normals_stations).length == 0) {
                ret_selected_normals_stations = " ";
            }
        
            return ret_selected_normals_stations;
            // Create <a id="station-process-data" class=" station id -- station name & ..."> for Google Analytics
            // $('#station-process-data').attr('class', class_info);
            // $('#station-process-data').removeAttr("style").hide();
        }
        
        function set_datalayer_for_download_normals(download_normals_list, download_normals_file_extension) {
            dataLayer.push({
                'event': 'Download_Normals',
                'download_station_data_event': 'Download_Normals',
                'download_station_data_list': download_normals_list,
                'download_station_file_extension': download_normals_file_extension
            });
        }
        
        $('#normals-process').click(function (e) {
            var csvFormatClassName = $("#normals-csvFormat").parent().attr("class");
            var geoFormatClassName = $("#normals-geoFormat").parent().attr("class");
            var selected_normals_stations_file_extension = 'CSV';
            
            if (geoFormatClassName.includes("active")) {
                selected_normals_stations_file_extension = 'GeoJSON';
                try {
                    if (csvFormatClassName.includes("active")) {
                        throw ('GA4_event (Download_Normals) file format, both (CSV, GeoJSON) are selected');
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            
            // selected_normals_stations_file_extension get text from class="csvFormat" or class="geoFomrat"
            set_datalayer_for_download_normals(selected_normals_stations_to_str, selected_normals_stations_file_extension);
        });
        
        function populate_normals_URL(ga4_event = 1) {
            
            if (ga4_event == 1) {
                
                let station_name = $('#normals-select [value="' + normals_dl_obj['s'] + '"]').text()
                
                var new_url = 'https://api.weather.gc.ca/collections/climate-normals/items?CLIMATE_IDENTIFIER=' + normals_dl_obj.s + '&sortby=MONTH&f=' + normals_dl_obj.format + '&limit=' + station_dl_obj.limit + '&startindex=' + normals_dl_obj.offset
                
                $('#normals-process').attr('href', new_url);
                
            }
            
            selected_normals_stations_to_str = get_selected_normals_stations();
        }

        //
        // IDF CURVES
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

        var idf_layer

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

        function idf_init() {

            create_map('idf')

            $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/assets/json/idf_curves.json', function (data) {


                idf_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {

                        $('<option value="' + feature.properties.ID + '">' + feature.properties.Name + '</option>').appendTo('#idf-select')

                    },
                    pointToLayer: function (feature, latlng) {

                        return L.circleMarker(latlng, {
                            pane: 'idf',
                            color: '#fff',
                            opacity: 1,
                            weight: 2,
                            fillColor: '#3869f6',
                            fillOpacity: 1,
                            radius: 5
                        })

                    }

                }).on('mouseover', function (e) {

                    e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng)

                }).on('click', function (e) {

                    $('#idf-select').val(e.layer.feature.properties.ID).trigger('change')

                })

                // sort options

                var arr = $('#idf-select option').map(function (_, o) {
                    return { t: $(o).text(), v: o.value };
                }).get()

                arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                })

                $('#idf-select option').each(function (i, o) {
                    o.value = arr[i].v
                    $(o).text(arr[i].t)
                })

                // add to map

                idf_layer.addTo(maps['idf'])

            })

        }

        var bdv_layer;
        function bdv_init() {
            create_map('bdv')

            $.getJSON(data_url + '/fileserver/bdv/bdv.json', function (data) {

                bdv_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {

                        $('<option value="' + feature.properties.ID + '">' + feature.properties.Location + '</option>').appendTo('#bdv-select')

                    },
                    pointToLayer: function (feature, latlng) {

                        return L.circleMarker(latlng, {
                            pane: 'idf',
                            color: '#fff',
                            opacity: 1,
                            weight: 2,
                            fillColor: '#3869f6',
                            fillOpacity: 1,
                            radius: 5
                        })

                    }

                }).on('mouseover', function (e) {

                    e.layer.bindTooltip(e.layer.feature.properties.Location).openTooltip(e.latlng)

                }).on('click', function (e) {

                    $('#bdv-select').val(e.layer.feature.properties.ID).trigger('change')

                })

                // sort options

                var arr = $('#bdv-select option').map(function (_, o) {
                    return { t: $(o).text(), v: o.value };
                }).get()

                arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                })

                $('#bdv-select option').each(function (i, o) {
                    o.value = arr[i].v
                    $(o).text(arr[i].t)
                })

                // add to map

                bdv_layer.addTo(maps['bdv'])

            })

        }

        $('#bdv-select').on('change', function (e) {
            let marker_id = $(this).val()

            $('#idf-links ul').empty()
            $('#download-bdv-station').slideDown()

            // find the feature in the IDF layer
            bdv_layer.eachLayer(function (layer) {


                if (layer.feature.properties.ID == marker_id) {


                    layer.setStyle({
                        fillColor: '#F00'
                    })

                    var current_view = maps['bdv'].getZoom()

                    if (current_view < 7) {
                        current_view = 7
                    }

                    maps['bdv'].setView([layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]], current_view);
                    $('#bdv-station-name h5').text(layer.feature.properties.Location);
                    $('#bdv-link').attr('href', data_url + '/fileserver/bdv/' + current_lang + '/' + layer.feature.properties.filename[current_lang]);
                } else {
                    layer.setStyle({
                        fillColor: '#3869f6'
                    })

                }
            })

            setTimeout(function () {

                $(document).smooth_scroll({
                    id: $('#download-bdv-station'),
                    speed: 1000,
                    ease: 'swing',
                    offset: 100
                })

            }, 500)
        })

        function set_datalayer_for_download_IDFCurves(idf_curves_datalayer_event_name, file) {
            // ex: Download_IDF-Curves_Short Duration Rainfall Intensity−Duration−Frequency Data (PDF) -->  Download_IDF-Curves_Short_Duration_Rainfall_Intensity−Duration−Frequency_Data_PDF
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll(' ', '_');
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll('(', '');
            idf_curves_datalayer_event_name = idf_curves_datalayer_event_name.replaceAll(')', '');

            dataLayer.push({
                'event': idf_curves_datalayer_event_name,
                'download-idf-curves-file': file,
            });
        }

        //Dynamically created
        $(document).on('click', '.download-idf-curves', function (e) {
            // e.preventDefault();
            var idf_curves_href = $(this).attr('href');
            var last_index_found = idf_curves_href.lastIndexOf("/");
            idf_curves_href = idf_curves_href.substring(last_index_found + 1, idf_curves_href.length);
            var idf_curves_text = $(this).text().trim();
            set_datalayer_for_download_IDFCurves("Download_IDF-Curves_" + idf_curves_text, idf_curves_href);
        });

        $('#idf-select').on('change', function (e) {
            marker_id = $(this).val()

            $('#idf-links ul').empty()
            $('#download-idf-station').slideDown()

            // find the feature in the IDF layer
            idf_layer.eachLayer(function (layer) {


                if (layer.feature.properties.ID === marker_id) {


                    layer.setStyle({
                        fillColor: '#F00'
                    })

                    var current_view = maps['idf'].getZoom()

                    if (current_view < 7) {
                        current_view = 7
                    }

                    maps['idf'].setView([layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]], current_view);
                    $('#idf-station-name h5').text(layer.feature.properties.Name);
                    $('#idf-station-elevation h5').text(layer.feature.properties.Elevation_);
                    getIDFLinks(layer.feature.properties.ID, '#idf-links ul', 'download-idf-curves');

                } else {
                    layer.setStyle({
                        fillColor: '#3869f6'
                    })

                }
            })

            setTimeout(function () {

                $(document).smooth_scroll({
                    id: $('#download-idf-station'),
                    speed: 1000,
                    ease: 'swing',
                    offset: 100
                })

            }, 500)
        })


        function ahccd_init() {

            create_map('ahccd');

            ahccd_icons = {
                P: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/triangle-blue.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Pr: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/triangle-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                T: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/square-blue.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Tr: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/square-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                B: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/circle-blue.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Br: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/circle-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                })
            };

            let ahccd_layerGroups = [];
            $.getJSON(child_theme_dir + 'resources/app/ahccd/ahccd.json', function (data) {

                let ahccd_layer_cluster = L.markerClusterGroup();

                ahccd_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {
                        $('<option value="' + feature.properties.ID + '">' + feature.properties.Name + '</option>').appendTo('#ahccd-select');
                        //does layerGroup already exist? if not create it and add to map
                        var lg = ahccd_layerGroups[feature.properties.type];

                        if (lg === undefined) {
                            lg = new L.featureGroup.subGroup(ahccd_layer_cluster);
                            //add the layer to the map
                            lg.addTo(maps['ahccd']);
                            //store layer
                            ahccd_layerGroups[feature.properties.type] = lg;
                        }

                        //add the feature to the layer
                        lg.addLayer(layer);
                    },
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: ahccd_icons[feature.properties.type]
                        });
                    }

                }).on('mouseover', function (e) {
                    e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng);
                }).on('click', function (e) {

                    // get current station select value
                    var selection = $("#ahccd-select").val() || [];

                    var clicked_ID = e.layer.feature.properties.ID;

                    // search if clicked feature is already selected
                    idx = selection.indexOf(clicked_ID);

                    if (idx != -1) {
                        selection.splice(index, 1);
                        $('#ahccd-select').val(selection).change();
                        icon = ahccd_icons[e.layer.feature.properties.type];
                    } else {
                        selection.push(clicked_ID);
                        $('#ahccd-select').val(selection).change();
                        icon = ahccd_icons[e.layer.feature.properties.type + 'r'];
                    }

                    e.layer.setIcon(icon);

                });

                // sort options

                let arr = $('#ahccd-select option').map(function (_, o) {
                    return { t: $(o).text(), v: o.value };
                }).get();

                arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                });

                $('#ahccd-select option').each(function (i, o) {
                    o.value = arr[i].v
                    $(o).text(arr[i].t)
                });

                // add to map
                ahccd_layer_cluster.addTo(maps['ahccd']);

            });

            // trigger when a tag is removed from multiple station selector input
            $('#ahccd-select').on('select2:unselect', function (e) {
                ahccd_layer.eachLayer(function (layer) {
                    if (layer.feature.properties.ID === e.params.data.id) {
                        layer.setIcon(ahccd_icons[layer.feature.properties.type]);
                    }
                });
            });

            // trigger when a tag is added to multiple station selector input
            $('#ahccd-select').on('select2:select', function (e) {
                ahccd_layer.eachLayer(function (layer) {
                    if (layer.feature.properties.ID === e.params.data.id) {
                        layer.setIcon(ahccd_icons[layer.feature.properties.type + 'r']);
                    }
                });
            });

            $('#ahccd-download-form :input').change(function () {
                // sync & activate process button
                var selection = $("#ahccd-select").val() || [];
                if (selection.length > 0) {
                    var format = $('input[name="ahccd-download-format"]:checked').val();
                    url = data_url + '/download-ahccd?format=' + format + '&zipped=true&stations=' + selection.join(',');
                    $('#ahccd-process').attr('href', url);
                    $('#ahccd-process').removeClass('disabled');
                    $('#ahccd-download-status').text(l10n_labels['readytoprocess']);
                } else {
                    $('#ahccd-process').addClass('disabled');
                    $('#ahccd-download-status').text(l10n_labels['selectstation']);
                }
            });

            $('#ahccd-download-form :checkbox').change(function () {
                if ($(this).is(':checked')) {
                    maps['ahccd'].addLayer(ahccd_layerGroups[$(this).val()]);
                } else {
                    maps['ahccd'].removeLayer(ahccd_layerGroups[$(this).val()]);
                }
            });

        }

        function create_map(map_var) {


            maps[map_var] = L.map('download-map-' + map_var, {
                maxZoom: 12,
                minZoom: 3
            }).setView([62.51231793838694, -98.5693359375], 4);

            maps[map_var].createPane('basemap');
            maps[map_var].getPane('basemap').style.zIndex = 399;
            maps[map_var].getPane('basemap').style.pointerEvents = 'none';

            maps[map_var].createPane('grid');
            maps[map_var].getPane('grid').style.zIndex = 500;
            maps[map_var].getPane('grid').style.pointerEvents = 'all';
            
            maps[map_var].createPane('labels');
            maps[map_var].getPane('labels').style.zIndex = 402;
            maps[map_var].getPane('labels').style.pointerEvents = 'none';
            
            maps[map_var].createPane('markers');
            maps[map_var].getPane('markers').style.zIndex = 405;
            maps[map_var].getPane('markers').style.pointerEvents = 'none';

            L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                pane: 'basemap',
                maxZoom: 12
            }).addTo(maps[map_var]);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(maps[map_var]);

            if (map_var == 'station' || map_var == 'normals' || map_var == 'idf' || map_var == 'ahccd' || map_var == 'bdv') {

                maps[map_var].createPane('idf');
                maps[map_var].getPane('idf').style.zIndex = 600;
                maps[map_var].getPane('idf').style.pointerEvents = 'all';

                maps[map_var].setView([52.501690, -98.567253], 4);

            }

        }

        // run default builder on load
        $('#download-frequency').val('annual').trigger('select2:select');

    });
})(jQuery);
