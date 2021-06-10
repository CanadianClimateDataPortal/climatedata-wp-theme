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
                        $('.select2-results__options').append('<li style="padding:10px"><strong>Custom Lat/Lon Detected:</strong><br>Map has panned to validated coordinates.</li>');
                        var term_segs = term.split(',');
                        var term_lat = term_segs[0];
                        var term_lon = term_segs[1];
                        maps['variable'].panTo([term_lat, term_lon]);
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

        $('.download-location').on('select2:select', function (e) {

            location_map = $(this).attr('data-map');

            thislat = e.params.data.lat;
            thislon = e.params.data.lon;

            //$('#download-lat').val(thislat);
            //$('#download-lon').val(thislon);

            maps[location_map].setView([thislat, thislon], 11);

        });

        //
        // TABS
        //

        $('#download-content').tabs({
            hide: {effect: 'fadeOut', duration: 250},
            show: {effect: 'fadeIn', duration: 250},
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

                } else if (ui.panel.attr('id') === 'idf-download') {

                    if (typeof maps['idf'] == 'undefined') {
                        idf_init()
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

                } else if (ui.newPanel.attr('id') === 'idf-download') {

                    if (typeof maps['idf'] == 'undefined') {
                        idf_init()
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
            console.log('adding canadagrid default');
            addGrid('canadagrid');


            $('#var-download .select2').on('select2:select', function (e) {
                checkform()
            })

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
            } else if (gridName === 'canadagrid') {
                var vectorTileOptions = {
                    rendererFactory: L.canvas.tile,
                    attribution: '',
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
                    vectorTileLayerStyles: {
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
                    maxZoom: 12,
                    minZoom: 7,
                    pane: 'grid',
                };
            }

            var pbfURL = hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:" + gridName + "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf";


            pbfLayer = L.vectorGrid.protobuf(pbfURL, vectorTileOptions).on('click', function (e) {

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

                // checkform()

            }).addTo(maps['variable']);

            pbfLayer.myTag = 'gridlayer';
            pbfLayer.gridType = gridName;

        }

        //
        // FORM VALIDATION
        //

        function checkform() {

            $('#download-result').slideUp(125)

            var form_valid = false;

            if ($('#download-dataset').val() === 'daily') {

                // DAILY DATA

                if (
                    $('body').validate_email($('#daily-email').val()) === true &&
                    $('#daily-captcha_code').val() !== '' &&
                    $('#download-coords').val() !== ''
                ) {

                    $('#daily-process').removeClass('disabled');

                } else {

                    $('#daily-process').addClass('disabled');

                }

            } else {


                // MONTHLY OR ANNUAL

                // if a filename is entered and the hidden lat/lon inputs have values

                if (
                    $('#download-filename').hasClass('valid') &&
                    $('#download-coords').val() !== ''
                ) {
                    form_valid = true;
                }

                if (form_valid === true) {
                    $('#download-process').removeClass('disabled');
                } else {
                    $('#download-process').addClass('disabled');
                }

            }

        }

        //
        // FORM PROCESSING
        //


        function process_download() {

            var selected_var = $('#download-variable').val()

            month = $("#download-dataset").val();

            if (month === 'annual') {
                month = 'ann'
            }

            points = []
            for (var i = 0; i < selectedGrids.length; i++) {
                point = selectedPoints[selectedGrids[i]];
                points.push([point.lat, point.lng]);
            }

            format = $('input[name="download-format"]:checked').val();

            if (selected_var !== 'all') {
                $('body').addClass('spinner-on');
                request_args = {
                    var: selected_var,
                    month: month,
                    format: format,
                    points: points
                };

                $.ajax({
                    method: 'POST',
                    url: data_url + '/download',
                    contentType: 'application/json',
                    data: JSON.stringify(request_args),
                    success: function (result) {
                        if (format == 'csv') {
                            $('#download-result a').attr('href', 'data:text/csv;charset=utf-8,' + escape(result));
                        }
                        if (format == 'json') {
                            $('#download-result a').attr('href', "data:application/json," + encodeURIComponent(JSON.stringify(result)));
                        }
                        $('#download-result a').attr('download', $('#download-filename').val() + '.' + format);
                        $('#download-result').slideDown(250);
                        $('body').removeClass('spinner-on');

                    }
                });
            } else {
                // call download for all matching variables and build a zip file
                selectedTimeStepCategory = $('#download-dataset').find(':selected').data('timestep');
                varToProcess = [];


                for (k in varData) {
                    if (k !== 'all' && varData[k].grid === 'canadagrid' && $.inArray(selectedTimeStepCategory, varData[k].timestep) !== -1) {
                        varToProcess.push(k);
                    }
                }

                $('body').addClass('spinner-on');
                var dl_status = 0;
                var dl_fraction = $('<p id="dl-fraction" style="position: absolute; left: 30%; bottom: 30%; width: 40%; padding-bottom: 1em; text-align: center;"><span>' + dl_status + '</span> / ' + varToProcess.length + '</p>').appendTo($('.spinner'));
                var dl_progress = $('<div class="dl-progress" style="position: absolute; left: 0; bottom: 0; width: 0; height: 4px; background: red;">').appendTo(dl_fraction);
                var i = 0;
                var zip = new JSZip();

                function download_all() {
                    if (i < varToProcess.length) {
                        request_args = {
                            var: varToProcess[i],
                            month: month,
                            format: format,
                            points: points
                        };
                        $.ajax({
                            method: 'POST',
                            url: data_url + '/download',
                            contentType: 'application/json',
                            data: JSON.stringify(request_args),
                            success: function (result) {
                                if (format == 'csv') {
                                    zip.file($('#download-filename').val() + '-' + varToProcess[i] + '.csv', result);
                                }
                                if (format == 'json') {
                                    zip.file($('#download-filename').val() + '-' + varToProcess[i] + '.json', JSON.stringify(result));
                                }


                                dl_fraction.find('span').html(i);
                                dl_progress.css('width', (i / varToProcess.length * 100) + '%');
                                if (i == varToProcess.length - 1) { // last one
                                    $('body').removeClass('spinner-on');
                                    dl_fraction.remove();
                                    dl_progress.remove();
                                    zip.generateAsync({type: "blob"})
                                        .then(function (content) {
                                            saveAs(content, $('#download-filename').val() + ".zip");

                                        });
                                }
                            },
                            complete: function () {
                                i++;
                                download_all();
                            }
                        });
                    }

                }

                download_all();


            }


        }


        function buildVarDropdown(frequency, currentVar) {
            $.ajax({
                url: '/wp-json/acf/v3/variable/?per_page=10000&orderby=menu_order&order=asc',
                dataType: 'json',
                success: function (data) {

                    varData = [];

                    currentOptGroup = '';
                    $.each(data, function (k, v) {
                        $.each(v, function (sk, sv) {
                            selectedVar = sv.var_name === currentVar;

                            varData[sv.var_name] = sv;

                            selectedTimeStepCategory = $('#download-dataset').find(':selected').data('timestep');


                            if ($.inArray(selectedTimeStepCategory, sv.timestep) !== -1) {

                                if (sv.variable_type !== 'station_data') {

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

                                            $('#download-variable').append("<optgroup id=optgroup_" + sv.variable_type + " label='" + l10n_labels[sv.variable_type] + "' data-slug='" + optgroupSlug + "'>");
                                            currentOptGroup = sv.variable_type;
                                        }


                                        varnewOption = new Option(sv.var_title, sv.var_name, false, selectedVar);
                                        $('#optgroup_' + sv.variable_type).append(varnewOption);
                                    }
                                }

                            }


                        });
                    });
                    if (selectedTimeStepCategory !== 'daily' && $('#download-dataset').val() != 'all') {
                        $('#download-variable').append("<optgroup id=optgroup_misc label='" + l10n_labels['misc'] + "'>");
                        $('#optgroup_misc').append(new Option(l10n_labels['allbccaq'], 'all', false, false));
                        varData['all'] = {'grid': 'canadagrid'};
                    }
                },
                error: function () {

                },
                complete: function () {
                    if ($("#download-variable option[value='" + currentVar + "']").length > 0) {
                        $('#download-variable').val(currentVar);
                        $('#download-variable').trigger('change');
                        $('#download-variable').val(currentVar).trigger('select2:select');
                    } else {
                        $('#download-variable option:eq(0)').prop('selected', true);

                        $('#download-variable').trigger('change');
                        currentVar = $('#download-variable').val();
                        $('#download-variable').val(currentVar).trigger('select2:select');
                    }

                }
            })
        }


        $('#download-dataset').on('select2:select', function (e) {

            console.log('frequency changed');
            currentVar = $("#download-variable").val();
            $('#download-variable').empty();

            buildVarDropdown(e.currentTarget.value, currentVar);

            if (e.currentTarget.value == 'daily') {

                // refresh captcha
                $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

                // netCDF option
                $('#format-label-netcdf').show();
                $('#format-label-json').hide();

                // email field
                $('#annual-process-wrap').hide();
                $('#daily-process-wrap').show();

            } else {

                // json option
                $('#format-label-netcdf').hide();
                $('#format-label-json').show();

                // email field
                $('#annual-process-wrap').show();
                $('#daily-process-wrap').hide();
            }
        });

        $('#daily-captcha_code').on('input', function (e) {
            checkform();
        });

        $('#daily-email').on('input', function (e) {
            checkform();
        });

        // location

        $('#download-variable').on('select2:select', function (e) {

            console.log('download variable chosen');

            curValData = varData[e.target.value];

            if (curValData === undefined) {
                $('#download-variable').val(1).trigger('change.select2');
            }

            // maps['variable'].eachLayer( function(layer) {
            //     if ( layer.myTag  &&  layer.myTag === 'gridlayer') {
            if (pbfLayer.gridType !== curValData.grid) {
                maps['variable'].removeLayer(pbfLayer);
                console.log("Adding Grid:" + curValData.grid);
                addGrid(curValData.grid);

                selectedGrids = [];
                $('#download-coords').val('');
                $('#download-location').val('');
                $('#download-location').parent().find('.select2-selection__rendered').text(l10n_labels.search_city)


            }
            //     }
            // });


        });


        $('#download-location').on('select2:select', function (e) {

            if ($(this).val() != '') {
                $(this).addClass('valid');
            } else {
                $(this).removeClass('valid');
            }

            checkform();

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

            var var_name = '';

            switch ($('#download-variable').val()) {

                case 'tn_mean' :
                    var_name = 'tasmin';
                    break;

                case 'tx_mean' :
                    var_name = 'tasmax';
                    break;

                case 'prcptot' :
                    var_name = 'pr';
                    break;

            }

            var form_data = $('#download-form').serialize();

            $.ajax({
                url: child_theme_dir + 'resources/ajax/download-form.php',
                data: form_data,
                success: function (data) {

                    if (data === 'success') {

                        $('#daily-captcha_code').removeClass('border-secondary').tooltip('dispose')

                        var split_coords = $('#download-coords').val().split('|'),
                            lat_vals = '',
                            lon_vals = ''

                        // remove first element which is empty because the first character is always '|'
                        split_coords.shift()

                        for (i = 0; i < split_coords.length; i += 1) {

                            var this_coord = split_coords[i].split(',')

                            if (lat_vals !== '') {
                                lat_vals += ','
                            }

                            lat_vals += this_coord[0]

                            if (lon_vals !== '') {
                                lon_vals += ','
                            }

                            lon_vals += this_coord[1]

                        }

                        var request = $.ajax({
                            url: 'https://pavics.climatedata.ca/providers/finch/processes/subset_ensemble_BCCAQv2/jobs',
                            method: 'POST',
                            crossDomain: true,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: JSON.stringify({
                                "inputs": [
                                    {
                                        "id": "variable",
                                        "data": var_name,
                                    },
                                    {
                                        "id": "lat0",
                                        "data": lat_vals
                                    },
                                    {
                                        "id": "lon0",
                                        "data": lon_vals
                                    },
                                    {
                                        "id": "data_validation",
                                        "data": "warn"
                                    },
                                    {
                                        "id": "output_format",
                                        "data": $('input[name="download-format"]:checked').val()
                                    },
                                ],
                                "response": "document",
                                "notification_email": $('#daily-email').val(),
                                "mode": "auto",
                                "outputs": [{
                                    "transmissionMode": "reference",
                                    "id": "output"
                                }]
                            }),
                            success: function (data) {

                                if (data.status === 'accepted') {

                                    $('#success-modal').modal('show');

                                }

                            },
                            complete: function () {

                                $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php')
                                $('#daily-captcha_code').val('')

                            }
                        });

                        request.fail(function (a, b) {
                            //
                        });

                    } else if (data === 'captcha failed') {

                        $('#daily-captcha_code').addClass('border-secondary').tooltip('show');

                    }
                }
            });

        })

        //
        // STATION
        //

        var station_status = $('#station-download-status').text();

        var dl_URL = {
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

        function station_init() {

            create_map('station');

            // $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-stations/items?f=json&limit=10000', function (data) {
            $.getJSON('https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID,LATITUDE,LONGITUDE', function (data) {


                // var len = data.features.length;

                // for (var i = 0; i< len; i++) {
                //
                //     stationOption = data.features[i].properties;
                //
                //     // console.log(stationOption);
                //
                //     // console.log(data.features[i]);
                //     stationFromAPI += '<option value="' + stationOption.STN_ID + '">' + stationOption.STATION_NAME + '</option>';
                //
                //
                // }
                // $('#station-select').append(stationFromAPI);
                // $('#station-select').select2();

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
                    // onEachFeature: function (feature, layer) {
                    //     layer.bindPopup(feature.properties.address);
                    // }
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
                // maps['station'].fitBounds(markers.getBounds());

                // pointsLayer = L.geoJson(data, {
                //     pointToLayer: function (feature, latlng) {
                //
                //         var markerColor = '#BBB';
                //         var existingData = $("#station-select").select2("val");
                //
                //         // console.log(feature.properties);
                //
                //         if (existingData != null && existingData.includes(feature.properties.STN_ID.toString())) {
                //             markerColor = '#F00';
                //         }
                //
                //         // var marker = L.circleMarker(latlng, {
                //         //     // Stroke properties
                //         //     color: markerColor,
                //         //     opacity: 1,
                //         //     weight: 2,
                //         //     pane: 'idf',
                //         //     // Fill properties
                //         //     fillColor: markerColor,
                //         //     fillOpacity: 1,
                //         //     radius: 5
                //         // });
                //
                //          var title = feature.properties.STATION_NAME.toString();
                //         var marker = L.marker(latlng, { title: title });
                //         marker.bindPopup(title);
                //         markers.addLayer(marker);
                //
                //         // markerMap[feature.id] = marker;
                //
                //         return marker;
                //
                //     }
                // }).on('mouseover', function (e) {
                //     e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME + ' ' + e.layer.feature.properties.STN_ID).openTooltip(e.latlng);
                // }).on('click', function (e) {
                //
                //     // get current station select value
                //     var existingData = $("#station-select").select2("val");
                //
                //     // clicked ID
                //     var clicked_ID = e.layer.feature.properties.STN_ID.toString();
                //
                //     // default colour
                //     markerColor = '#F00';
                //
                //     if (existingData != null) {
                //
                //
                //         if (existingData.includes(clicked_ID)) {
                //
                //
                //             var $select = $('#station-select');
                //
                //             index = existingData.indexOf(clicked_ID);
                //
                //             if (index > -1) {
                //                 existingData.splice(index, 1);
                //             }
                //
                //
                //             $('#station-select').val(existingData).change();
                //
                //             markerColor = '#BBB';
                //
                //         } else {
                //
                //
                //             existingData.push(clicked_ID);
                //
                //             $('#station-select').val(existingData).change();
                //
                //         }
                //
                //     } else {
                //
                //
                //         existingData = [clicked_ID];
                //
                //         $('#station-select').val(existingData).change();
                //
                //     }
                //
                //     e.layer.setStyle({
                //         // Stroke properties
                //         color: markerColor,
                //         opacity: 1,
                //         weight: 2,
                //         pane: 'idf',
                //         // Fill properties
                //         fillColor: markerColor,
                //         fillOpacity: 1,
                //         radius: 5
                //     });
                //
                // }).addTo(maps['station']);


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

                case 'station-select' :
                    param = 's';

                    if ($(this).val() !== null) {
                        new_val = $(this).val().join('|');
                    } else {
                        new_val = '';
                    }

                    break;

                case 'station-start' :
                    param = 'start';
                    break;

                case 'station-end' :
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

        /*
         $('#station-download-form').submit(function(e) {
         e.preventDefault();

         var process_url = $('#result').text();


         $.ajax({
         url: process_url,
         success: function(data) {
         },
         complete: function() {
         }
         });

         });
         */

        function check_station_form() {

            station_status = '';


            var form_valid = true;

            $('#station-download-form .validate').each(function () {

                if ($(this).val() == '') {
                    form_valid = false;


                    station_status += $(this).closest('div').find('label').text() + ' is invalid. ';

                }

            });

            if (dl_URL['s'].length == 0) {
                form_valid = false;

                station_status += 'Choose at least one weather station. ';
            }

            if (form_valid == false) {
                $('#station-process').addClass('disabled');
            } else {
                $('#station-process').removeClass('disabled');
                station_status = 'Ready to process.';

                populate_URL();
            }

            $('#station-download-status').text(station_status);

        }

        function update_URL(name, val) {
            dl_URL[name] = val;
        }

        function populate_URL() {


            var new_url = 'https://api.weather.gc.ca/collections/climate-daily/items?datetime=' + dl_URL.start + ' 00:00:00/' + dl_URL.end + ' 00:00:00&STN_ID=' + dl_URL['s'] + '&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=' + dl_URL.format + '&limit=' + dl_URL.limit + '&startindex=' + dl_URL.offset;

            $('#station-process').attr('href', new_url);

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
                    return {t: $(o).text(), v: o.value};
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

        $('#idf-select').on('change', function (e) {

            //marker_id = e.params.data.id
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

                    maps['idf'].setView([layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]], current_view)

                    $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/search_idfs.php?idf=' + layer.feature.properties.ID, function (data) {

                        $('#idf-station-name h5').text(layer.feature.properties.Name)
                        $('#idf-station-elevation h5').text(layer.feature.properties.Elevation_)

                        /*$('#idf-links').html('<div class="idf-popup-row">' +
                         '<h6>' + popup_headings[0] + '</h6>' +
                         '<h5 class="idfTitle">' + layer.feature.properties.Name + '</h5>' +
                         '</div>' +
                         '<div class="idf-popup-row">' +
                         '<h6>' + popup_headings[1] + '</h6>' +
                         '<h5 class="idfElev">' + layer.feature.properties.Elevation_ + '</h5>' +
                         '</div>' +
                         '<h6>' + popup_headings[2] + '</h6>' +
                         '<ul class="idfBody list-unstyled"></ul>');*/

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

                            $('#idf-links ul').append('<li><a href="' + v + '" target="_blank">' + linktext + '</a></li>');

                        })

                    })

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
                    iconUrl: child_theme_dir + 'resources/app/ahccd/triangle-grey.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Pr: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/triangle-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                T: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/square-grey.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Tr: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/square-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                B: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/circle-grey.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                }),
                Br: L.icon({
                    iconUrl: child_theme_dir + 'resources/app/ahccd/circle-red.png',
                    iconSize: [15, 15],
                    iconAnchor: [7, 7]
                })
            }


            $.getJSON(child_theme_dir + 'resources/app/ahccd/ahccd.json', function (data) {


                ahccd_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {

                        $('<option value="' + feature.properties.ID + '">' + feature.properties.Name + '</option>').appendTo('#ahccd-select')

                    },
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: ahccd_icons[feature.properties.type]
                        })

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

                })

                // sort options

                var arr = $('#ahccd-select option').map(function (_, o) {
                    return {t: $(o).text(), v: o.value};
                }).get()

                arr.sort(function (o1, o2) {
                    return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
                })

                $('#ahccd-select option').each(function (i, o) {
                    o.value = arr[i].v
                    $(o).text(arr[i].t)
                })

                // add to map

                ahccd_layer.addTo(maps['ahccd'])

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
                    url = data_url + '/download-ahccd?format=' + format + '&stations=' + selection.join(',');
                    $('#ahccd-process').attr('href', url);
                    $('#ahccd-process').removeClass('disabled');
                    $('#ahccd-download-status').text(l10n_labels['readytoprocess']);
                } else {
                    $('#ahccd-process').addClass('disabled');
                    $('#ahccd-download-status').text(l10n_labels['selectstation']);
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

            L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                pane: 'basemap',
                maxZoom: 12
            }).addTo(maps[map_var]);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(maps[map_var]);

            if (map_var == 'station' || map_var == 'idf') {

                maps[map_var].createPane('idf');
                maps[map_var].getPane('idf').style.zIndex = 600;
                maps[map_var].getPane('idf').style.pointerEvents = 'all';

                maps[map_var].setView([52.501690, -98.567253], 4);

            }

        }

        // run default builder on load
        $('#download-dataset').val('annual').trigger('select2:select');

    });
})(jQuery);
