(function ($) {

    $(function () {

        //
        // GLOBAL VARS
        //

        // overlay text

        var overlay_text = JSON.parse($('#map-overlay-content').attr('data-steps'))

        // form stuff

        var default_inputs = {
            'lat': '',
            'lon': '',
            'start_date': '',
            'end_date': '',
            'ensemble_percentiles': '',
            'dataset_name': '',
            'rcp': '',
            'models': '',
            'freq': '',
            'data_validation': 'warn',
            'output_format': ''
        }

        var form_inputs = $.extend(true, {}, default_inputs)

        var default_thresholds = {}

        var form_thresholds = $.extend(true, {}, default_thresholds)

        var default_obj = {
            "inputs": [],
            "response": "document",
            "mode": "auto",
            "outputs": [
                {
                    "transmissionMode": "reference",
                    "id": "output"
                }
            ],
            "notification_email": ""
        }

        var form_obj = $.extend(true, {}, default_obj)

        var submit_url_var = '',
            submit_url_post = '/jobs'

        // map stuff

        var hosturl = geoserver_url,
            zoom_on = false,
            highlightGridFeature

        // grid line/fill options

        var gridline_color = '#657092';
        var gridline_color_hover = '#060d12';
        var gridline_color_active = '#e50e40';
        var gridline_width = '0.2';
        var gridline_width_active = '1';

        var gridfill_color_hover = '#000';

        //
        // TOOLTIPS
        //

        $('#analyze-breadcrumb [data-toggle="tooltip"]').tooltip()

        //
        // ACCORDION
        //

        $('#analyze-steps').accordion({
            heightStyle: 'content',
            activate: function (e, ui) {

                if (ui.newPanel.attr('data-step') == '1') {

                    if ($.isEmptyObject(map_grids)) {
                        $('#map-overlay').fadeIn(250)
                    }

                } else if (ui.newPanel.attr('data-step') == '2') {

                    // swap text

                    $('#map-overlay-content h4').html(overlay_text[2]['head'])
                    $('#map-overlay-content p').html(overlay_text[2]['text'])

                    // show 'dismiss' btn

                    $('#map-overlay .btn').removeClass('hidden')

                } else if (ui.newPanel.attr('data-step') == '3') {


                }
            },
            beforeActivate: function (e, ui) {

                if (
                    ui.newPanel.attr('data-step') == '3' &&
                    ui.newPanel.find('.checked').length
                ) {

                    $('#analyze-detail').slideDown()

                } else {

                    $('#analyze-detail').slideUp()

                }

            }

        })

        //
        // OVERLAY
        //


        $('.accordion-content[data-step="1"] .input-item').on('click', function (e) {
            $('#map-overlay-content h4').html(overlay_text[1]['head'])
            $('#map-overlay-content p').html(overlay_text[1]['text'])
        })

        $('#map-overlay .btn').click(function (e) {
            $('#map-overlay').fadeOut(250, function () {

                if (zoom_on == false) {

                    // enable map zoom

                    new L.Control.Zoom({
                        position: 'bottomleft'
                    }).addTo(analyze_map)

                    zoom_on = true

                }

                // show geo-select

                $('#geo-select-container').fadeIn()

            })
        })

        //
        // INPUTS
        //

        var radio_icon_off = 'form-icon fas fa-circle',
            radio_icon_on = 'form-icon far fa-dot-circle',
            checkbox_icon_off = 'form-icon fas fa-circle',
            checkbox_icon_on = 'form-icon far fa-check-circle',
            selectall_icon_off = 'form-icon fas fa-square',
            selectall_icon_partial = 'form-icon fas fa-minus-square',
            selectall_icon_on = 'form-icon fas fa-check-square'

        // prepend icons

        $('.field').each(function (i) {

            if ($(this).hasClass('type-radio')) {

                $(this).find('.input-row label').before('<i class="' + radio_icon_off + '"></i>')

            } else if ($(this).hasClass('type-checkbox')) {

                $(this).find('.input-row').each(function () {

                    if ($(this).hasClass('select-all')) {
                        $(this).find('label').before('<i class="' + selectall_icon_off + '"></i>')
                    } else {
                        $(this).find('label').before('<i class="' + checkbox_icon_off + '"></i>')
                    }

                })

            }

        })

        // set disabled input classes

        $('input[disabled]').closest('.input-row').addClass('disabled')

        // trigger click inputs that are checked by default

        setTimeout(function () {

            $('.field :input').each(function (e) {

                if ($(this).prop('checked') == true) {
                    $(this).closest('.input-item').trigger('click')
                }

            })

        }, 100)

        // disable default behaviour

        $('.input-row label').on('click', function (e) {
            e.preventDefault()
        })

        // radio/check click event

        $('.type-radio .input-item, .type-checkbox .input-item').on('click', function (e) {
            e.preventDefault()

            var this_item = $(this).closest('.input-row'),
                input_parent = this_item.closest('.field')

            if (
                !this_item.find(':input').hasClass('disabled') &&
                (this_item.find(':input').attr('disabled') == '' || typeof this_item.find(':input').attr('disabled') == 'undefined')
            ) {

                if (input_parent.hasClass('type-radio')) {

                    // radio

                    input_parent.find('.input-row').removeClass('checked')
                    input_parent.find('.input-row').find(':input').prop('checked', false)
                    input_parent.find('.input-row').find('.form-icon').removeClass().addClass(radio_icon_off)

                    this_item.addClass('checked')
                    this_item.find(':input').prop('checked', true)
                    this_item.find('.form-icon').removeClass().addClass(radio_icon_on)

                } else if (input_parent.hasClass('type-checkbox')) {

                    // checkbox

                    if (this_item.hasClass('select-all')) {

                        // select all

                        var this_tree = this_item.next('.tree')

                        if (this_item.hasClass('checked')) {

                            // remove 'checked' class
                            this_item.removeClass('checked')

                            // uncheck input
                            this_item.find(':input').prop('checked', false)

                            // uncheck icon
                            this_item.find('.form-icon').removeClass().addClass(selectall_icon_off)

                            // uncheck tree inputs
                            this_tree.find(':input').prop('checked', false)

                            // uncheck tree icons
                            this_tree.find('.form-icon').removeClass().addClass(checkbox_icon_off)

                            // uncheck tree labels
                            this_tree.find('.input-row').removeClass('checked')

                        } else {

                            // add 'checked' class
                            this_item.removeClass('partial').addClass('checked')

                            // check input
                            this_item.find(':input').prop('checked', true)

                            // check icon
                            this_item.find('.form-icon').removeClass().addClass(selectall_icon_on)

                            // check tree inputs
                            this_tree.find(':input').prop('checked', true)

                            // check tree icons
                            this_tree.find('.form-icon').removeClass().addClass(checkbox_icon_on)

                            // check tree labels
                            this_tree.find('.input-row').addClass('checked')

                        }

                    } else {

                        if (this_item.hasClass('checked')) {

                            this_item.removeClass('checked')
                            this_item.find(':input').prop('checked', false)
                            this_item.find('.form-icon').removeClass().addClass(checkbox_icon_off)

                        } else {

                            this_item.addClass('checked')
                            this_item.find(':input').prop('checked', true)
                            this_item.find('.form-icon').removeClass().addClass(checkbox_icon_on)

                        }

                        // tree item

                        if (this_item.parents('.tree').length) {

                            var this_tree = this_item.closest('.tree')
                            var this_toggle = this_tree.prev('.select-all')

                            var tree_items = this_tree.find('.input-row').length

                            if (this_tree.find('.checked').length == tree_items) {

                                // all are checked
                                this_toggle.find('input').prop('checked', true)
                                this_toggle.removeClass('partial').addClass('checked')
                                this_toggle.find('.form-icon').removeClass().addClass(selectall_icon_on)

                            } else {

                                // not all are checked
                                this_toggle.find('input').prop('checked', false)
                                this_toggle.removeClass('checked').addClass('partial')
                                this_toggle.find('.form-icon').removeClass().addClass(selectall_icon_partial)

                                if (this_tree.find('.checked').length == 0) {

                                    // NONE are checked
                                    this_toggle.removeClass('checked').removeClass('partial')
                                    this_toggle.find('.form-icon').removeClass().addClass(selectall_icon_off)

                                }

                            }

                        }

                    }

                }

                validate_steps()
                validate_inputs()

            }

        })

        // select

        var start_val = 1950
        var end_val = 1950

        $('#analyze-timeframe-start').on('change', function () {

            start_val = $(this).val()

            $('#analyze-timeframe-end option').each(function () {

                if (parseInt($(this).val()) <= parseInt(start_val)) {
                    $(this).prop('disabled', true)
                } else {
                    $(this).prop('disabled', false)
                }

            })

            validate_steps()
            validate_inputs()

        })

        $('#analyze-timeframe-end').on('change', function () {

            end_val = $(this).val()

            $('#analyze-timeframe-start option').each(function () {

                if (parseInt($(this).val()) >= parseInt(end_val)) {
                    $(this).prop('disabled', true)
                } else {
                    $(this).prop('disabled', false)
                }

            })

            validate_steps()
            validate_inputs()

        })

        //
        // TOOLTIPS
        //

        $('.input-variable .input-item').click(function (e) {

            if (!$(this).hasClass('selected')) {

//         input_id = $(this).find('input').

                let var_content = JSON.parse($(this).closest('.input-variable').attr('data-content'));
                let var_frequencies = $(this).closest('.input-variable').attr('data-frequencies');

                if (var_frequencies != '') {
                    let frequencies = var_frequencies.split('|');
                    $('input[name=freq]').each(function(i) {
                       if (frequencies.includes($(this).val())) {
                           $(this).attr('disabled', false);
                        } else {
                           let input_row = $(this).closest('.input-row');
                           input_row.removeClass('checked');
                           $(this).prop('checked', false);
                           input_row.find('.form-icon').removeClass().addClass(radio_icon_off);
                           $(this).attr('disabled', true);
                       }
                    });
                } else {
                    $('input[name=freq]').each(function(i) {
                        $(this).attr('disabled', false);
                    });
                }


                var new_html = ''
                new_html += '<h4>' + $(this).find('label').text() + '</h4>'
                new_html += '<div class="form-inline">'

                for (var key in var_content) {
                    var this_input = var_content[key]

                    if (this_input['type'] == 'text') {
                        new_html += '<span>' + this_input['text'] + '</span>'

                    } else if (this_input['type'] == 'input') {
                        new_html += '<input '
                        new_html += 'type="number" '
                        new_html += 'class="form-control bg-transparent border-white mx-2 text-white" '
                        new_html += 'size="4" '
                        new_html += 'autocomplete="off" '
                        new_html += 'data-units="' + this_input['units'] + '" '

                        new_html += 'name="' + this_input['id'] + '" '

                        if (this_input['min'] != '') {
                            new_html += 'min="' + this_input['min'] + '" '
                        }

                        if (this_input['max'] != '') {
                            new_html += 'max="' + this_input['max'] + '" '
                        }

                        if (
                            this_input['decimals'] != '' &&
                            this_input['decimals'] != '0'
                        ) {

                            new_html += 'step="0.'

                            decimal_places = parseInt(this_input['decimals'])

                            for (i = 1; i < decimal_places; i++) {
                                new_html += '0'
                            }

                            new_html += '1"'


                        }

                        new_html += '>'

                    } else if (this_input['type'] == 'select') {
                        new_html += '<select ';
                        new_html += 'class="form-control border-white mx-2 text-white" ';
                        new_html += 'style="background-color: rgba(56, 105, 246, 0.5);" ';
                        new_html += 'name="' + this_input['id'] + '" ';
                        new_html += '>';

                        labels = this_input['labels'].split('|');
                        $.each(this_input['values'].split('|'), function (idx, v) {
                            new_html += '<option ';
                            new_html += 'value="' + v + '">';
                            new_html += labels[idx];
                            new_html += '</option>';
                        });

                        new_html += '</select>';
                    } else if (this_input['type'] == 'mm_dd') {

                        new_html += '<input ';
                        new_html += 'type="text" ';
                        new_html += 'placeholder="MM-DD" ';
                        new_html += 'class="form-control bg-transparent border-white mx-2 text-white" ';
                        new_html += 'size="5" ';
                        new_html += 'autocomplete="off" ';
                        new_html += 'data-units="' + this_input['units'] + '" ';
                        new_html += 'data-optional="' + this_input['optional'] + '" ';
                        new_html += 'name="' + this_input['id'] + '" ';
                        new_html += '>'

                    }

                }

                new_html += '</div>'

                $('#placeholder').html(new_html)
                $('#analyze-detail').slideDown()

                submit_url_var = $(this).find('input').val()

            }

            validate_inputs()

        })

        $('body').on('input', '#analyze-detail :input', function () {
            validate_inputs()
        })

        $('body').on('input', '#analyze-captcha_code, #analyze-email', function () {
            validate_submit()
        })


        // TODO: All those strings are available within the HTML generated by wordpress, and will be localized properly. Loop over everything in class .input-variable
        var analyze_bccaqv2_dict = {
            "wetdays": "Wet Days",
            "sdii": "Average Wet Day Precipitation Intensity",
            "cwd": "Maximum Consecutive Wet Days",
            "cdd": "Maximum Consecutive Dry Days",
            "tx_tn_days_above": "Days above Tmax and Tmin",
            "tx_days_above": "Days above Tmax",
            "tropical_nights": "Days above Tmin",
            "tn_days_below": "Days below Tmin",
            "cooling_degree_days": "Degree Days Above a Threshold",
            "heating_degree_days": "Degree Days Below a Threshold",
            "heat_wave_index": "Heat Wave",
            "heat_wave_total_length": "Heat Wave Total Duration",
            "heat_wave_frequency": "Heat Wave Frequency",
            "dlyfrzthw": "Days with a Freeze-Thaw Cycle",
            "cold_spell_days": "Cold Spell Days"
        }

        var datalayer_parameters = {
            // For all events
            "lat": "latitude",
            "lon": "longitute",
            "start_date": "start date",
            "end_date": "end date",
            "ensemble_percentiles": "ensemble percentiles",
            "dataset_name": "dataset name",
            "models": "models",
            "freq": "frequence",
            "rcp": "rcp",
            "data_validation": "data validation",
            "output_format": "output format",
            // For some events
            "window": "window",
            "thresh": "thresh",
            "thresh_tasmin": "threshold tasmin",
            "thresh_tasmax": "threshold tasmin"
        }

        function set_datalayer_for_analyze_bccaqv2(form_obj_inputs, customize_variables) {
            var analyze_bccaqv2_parameters = "";
            customize_variables = customize_variables.toLowerCase();
            try {
                $.each(form_obj_inputs, function (index, value) {
                    var value_id = value.id.toLowerCase();

                    if (datalayer_parameters[value_id]) {
                        analyze_bccaqv2_parameters += datalayer_parameters[value_id] + ": " + value.data + ";  ";
                    } else {
                        throw ('Can not get Analyze_BCCAQv2_* dataLayer parameters key: ' + value_id);
                    }
                });

                if (!analyze_bccaqv2_dict[customize_variables]) {
                    throw ('Can not get Analyze_BCCAQv2_* dataLayer event name: ' + customize_variables);
                }

                analyze_bccaqv2_dict[customize_variables] = analyze_bccaqv2_dict[customize_variables].replaceAll(' ', '-');
                event_type = "Analyze_BCCAQv2_" + analyze_bccaqv2_dict[customize_variables];

                dataLayer.push({
                    'event': event_type,
                    'analyze_bccaqv2_event_type': event_type,
                    'analyze_bccaqv2_parameters': analyze_bccaqv2_parameters,
                });
            } catch (err) {
                console.error(err);
            }
        }

        $('#analyze-process').click(function (e) {
            if (!$(this).hasClass('disabled')) {

                form_obj = $.extend(true, {}, default_obj)

                // build the final input object to send to the API
                // form_inputs

                for (var key in form_inputs) {
                    if (key == 'rcp') {
                        form_inputs[key].split(',').forEach(function(component) {
                            form_obj['inputs'].push({
                                'id': key,
                                'data': component
                            })
                            });
                    }
                    else {
                        form_obj['inputs'].push({
                            'id': key,
                            'data': form_inputs[key]
                        })
                    }
                }

                // form_thresholds
                for (var key in form_thresholds) {
                    form_obj['inputs'].push({
                        'id': key,
                        'data': form_thresholds[key]
                    })
                }

                // email
                form_obj['notification_email'] = $('#analyze-email').val()

                set_datalayer_for_analyze_bccaqv2(form_obj['inputs'], submit_url_var);

                var submit_data = {
                    'analyze-captcha_code': $('#analyze-captcha_code').val(),
                    "signup":$('#signup').is(":checked"),
                    'request_data': form_obj,
                    'submit_url': submit_url_var + submit_url_post
                }

                // check captcha
                $.ajax({
                    url: child_theme_dir + 'resources/ajax/analyze-form.php',
                    method: "POST",
                    data: submit_data,
                    success: function (data) {

                        var response = JSON.parse(data)

                        console.log(response)

                        if (typeof response == 'object' && response.status == 'accepted') {

                            $('#success-modal').modal('show');

                        } else {

                            console.log('captcha failed')

                        }
                    },
                    complete: function () {
                        $('#analyze-captcha_code').val('')
                        $('#analyze-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php')
                    }
                })

            }
        })


        $('#detail-close').click(function () {
            $('#analyze-detail').slideUp()
        })

        //
        // MAP
        //

        analyze_map = L.map('analyze-map', {
            maxZoom: 12,
            minZoom: 3,
            zoomControl: false
        }).setView([62.51231793838694, -98.5693359375], 4)

        // layers

        analyze_map.createPane('basemap')
        analyze_map.getPane('basemap').style.zIndex = 399
        analyze_map.getPane('basemap').style.pointerEvents = 'none'

        analyze_map.createPane('grid')
        analyze_map.getPane('grid').style.zIndex = 500
        analyze_map.getPane('grid').style.pointerEvents = 'all'

        analyze_map.createPane('labels')
        analyze_map.getPane('labels').style.zIndex = 402
        analyze_map.getPane('labels').style.pointerEvents = 'none'

        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap',
            maxZoom: 12
        }).addTo(analyze_map)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
            pane: 'labels'
        }).addTo(analyze_map)

        selectedGrids = [];
        selectedPoints = [];
        latlons = [];

        map_grids = {}

        var highlight;

        var clearHighlight = function () {
            if (highlight) {
                pbfLayer.resetFeatureStyle(highlight);
            }
            highlight = null;
        };

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
            pane: 'grid'
        }

        var pbfLayer = L.vectorGrid.protobuf(hosturl + '/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf', vectorTileOptions).on('click', function (e) {

            highlightGridFeature = e.layer.properties.gid;

            selectedPoints[highlightGridFeature] = e.latlng;

            var selectedExists = selectedGrids.includes(highlightGridFeature);

            if (selectedExists === false) {

                map_grids[highlightGridFeature] = e.latlng

                selectedGrids.push(highlightGridFeature);

                pbfLayer.setFeatureStyle(highlightGridFeature, {
                    weight: 1,
                    color: '#F00',
                    opacity: 1,
                    fill: true,
                    radius: 4,
                    fillOpacity: 0.1
                })

            } else {

                delete map_grids[highlightGridFeature]

                for (var i = selectedGrids.length - 1; i >= 0; i--) {
                    if (selectedGrids[i] === highlightGridFeature) {
                        selectedGrids.splice(i, 1);
                    }
                }

                for (var i = selectedPoints.length - 1; i >= 0; i--) {
                    if (selectedPoints[highlightGridFeature]) {
                        selectedPoints.splice(i, 1);
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

            $('#analyze-breadcrumb').find('.grid-count').text(selectedGrids.length)

            var i = 0,
                lat_val = '',
                lon_val = ''

            for (var key in map_grids) {

                if (i != 0) {
                    lat_val += ','
                    lon_val += ','
                }

                lat_val += map_grids[key]['lat']
                lon_val += map_grids[key]['lng']

                i++

            }

            $('#lat').val(lat_val)
            $('#lon').val(lon_val)

            validate_inputs()

            L.DomEvent.stop(e)

        }).addTo(analyze_map)

        // GEO-SELECT

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
                        analyze_map.panTo([term_lat, term_lon]);
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

        $('#geo-select').on('select2:select', function (e) {

            console.log('geo-select');

            thislat = e.params.data.lat;
            thislon = e.params.data.lon;

            geoselecting = true;

            //update_param('coords', thislat + ',' + thislon + ',11');
            analyze_map.setView([thislat, thislon], 10);

        });

        $('#clear-grids').click(function () {

            map_grids = {}

            selectedGrids.forEach(function (i) {

                pbfLayer.setFeatureStyle(i, {
                    weight: 0.1,
                    color: gridline_color,
                    opacity: 1,
                    fill: true,
                    radius: 4,
                    fillOpacity: 0
                });

            })

            selectedGrids = []
            selectedPoints = []

            $('#lat').val('')
            $('#lon').val('')

            validate_inputs()
            validate_steps()

        })

        //
        // VALIDATION
        //

        // ACCORDION STEPS

        function validate_steps() {

            var valid_steps = [false, false, false, false]

            $('#analyze-steps .validate-input').each(function (i) {

                var current_tab = $(this).closest('.accordion-content'),
                    current_step = parseInt(current_tab.attr('data-step')),
                    is_valid = false,
                    breadcrumb_val = ''

                if ($(this).hasClass('type-radio') || $(this).hasClass('type-checkbox')) {

                    if ($(this).find('.checked').length) {

                        is_valid = true

                        // set breadcrumb

                        if (current_tab.find('.checked').length > 1) {
                            breadcrumb_val = current_tab.find('.checked').length + ' selected'
                        } else {
                            breadcrumb_val = current_tab.find('.checked').find('.form-check-label').text()
                        }

                        if (current_step == 2) {
                            breadcrumb_val = '<span class="grid-count">' + selectedGrids.length + '</span> ' + breadcrumb_val
                        }

                    }

                } else if ($(this).hasClass('type-select')) {

                    is_valid = true

                    // set breadcrumb

                    current_tab.find('select').each(function (i) {

                        if (i != 0) breadcrumb_val += ' – '

                        breadcrumb_val += $(this).val()

                    })

                    $(this).find('select').each(function () {

                        if ($(this).val() == '') {

                            is_valid = false
                            breadcrumb_val = ''

                        }

                    })

                }

                if (is_valid == true) {

                    // activate next tab

                    current_tab.prev('.accordion-head').attr('data-valid', true)
                    current_tab.next('.accordion-head').removeClass('ui-state-disabled')

                    // set text & show step
                    $('#analyze-breadcrumb [data-step="' + current_step + '"]').addClass('on').find('.value').html(breadcrumb_val)

                    // if step 3 is valid, also enable step 5

                    // show the header
                    $('#analyze-header').addClass('on')

                    valid_steps[i] = true

                } else {

                    $(this).closest('.accordion-content').prev('.accordion-head').attr('data-valid', false)
                    $(this).closest('.accordion-content').nextAll('.accordion-head').addClass('ui-state-disabled')

                    //
                    $('#analyze-breadcrumb [data-step="' + current_step + '"]').removeClass('on')


                    $('#analyze-breadcrumb .step[data-step="' + current_step + '"]').nextAll('.step').removeClass('on')

                    //           console.log(i, $(this))

                    if (i != valid_steps.length) {
                        for (z = i; z >= valid_steps.length; z += 1) {
                            valid_steps[z] = false
                        }
                    }

                    return false

                }

            })

            // console.log(valid_steps)

            // step 2 - location

            // step 4 - time


            // step 5 - advanced

            if (
                valid_steps[0] == true &&
                valid_steps[1] == true &&
                valid_steps[2] == true &&
                valid_steps[3] == true
            ) {

                options_val = ''

                $('.accordion-content[data-step="5"] .tree').each(function (i) {

                    if ($(this).find('.checked').length > 0) {

                        var this_label = $(this).prev('.select-all').find('.form-check-label').text()

                        if (this_label == 'Representative Concentration Pathways (RCPs)') {
                            this_label = 'RCPs'
                        }

                        if ($(this).find('.checked').length == 1) {
                            this_label = this_label.slice(0, -1)
                        }

                        if (i != 0) {
                            options_val += ' | '
                        }

                        options_val += $(this).find('.checked').length + ' ' + this_label

                    }

                })

                if (options_val != '') {
                    $('#analyze-breadcrumb [data-step="5"]').addClass('on').find('.value').text(options_val)
                } else {
                    $('#analyze-breadcrumb [data-step="5"]').removeClass('on')
                }

            }


        }

        // INPUTS

        function validate_inputs() {

            var is_valid = true

            form_inputs = $.extend(true, {}, default_inputs)

            // CHECK INPUTS THAT NEED TO BE ADDED
            // TO THE REQUEST OBJECT

            // build the form_inputs object

            $('#analyze-form-inputs .add-to-object').each(function () {

                var this_name = $(this).attr('name'),
                    this_type = $(this).attr('type'),
                    this_has_val = false,
                    this_val = $(this).val()

                if ($(this).is('select')) {
                    this_type = 'select'
                }

                //console.log('checking ' + this_name, this_type, this_val)

                switch (this_type) {
                    case 'radio':
                        if ($(this).prop('checked') == true) {
                            this_has_val = true
                        }
                        break

                    case 'checkbox':
                        if ($(this).prop('checked') == true) {
                            this_has_val = true
                        }
                        break

                    default:
                        if ($(this).val() != '') {
                            this_has_val = true
                        }
                        break

                }

                if (this_has_val == true) {

                    if (this_type == 'checkbox') {

                        if (form_inputs[this_name] != '') {
                            form_inputs[this_name] += ',' + this_val
                        } else {
                            form_inputs[this_name] = this_val
                        }

                    } else {

                        form_inputs[this_name] = this_val

                    }

                }

            })

            // cycle through the object and check for empty values

            for (var key in form_inputs) {
                if (form_inputs[key] == '') {
                    is_valid = false
                    //console.log(key)
                }
            }

            // CHECK FOR EMPTY VALUES
            // IN THE VAR DETAIL OVERLAY FORM


            form_thresholds = $.extend(true, {}, default_thresholds)

            var thresholds_have_val = true

            // build the form_thresholds object

            $('#analyze-detail').find(':input').each(function () {

                var this_name = $(this).attr('name');
                if ($(this).attr('data-optional') == undefined ||
                    $(this).attr('data-optional') == true || $(this).val() != '') {

                    form_thresholds[this_name] = $(this).val();

                    if ($(this).val() != '' && $(this).attr('data-units') !== undefined && $(this).attr('data-units') != '') {
                        form_thresholds[this_name] += ' ' + $(this).attr('data-units');
                    }
                }
            });

            // cycle through the object and check for empty values

            for (var key in form_thresholds) {
                if (form_thresholds[key] == '') {
                    is_valid = false
                    thresholds_have_val = false
                }
            }

            if (thresholds_have_val == true) {
                $('#analyze-breadcrumb .step[data-step="3"] .validation-tooltip').hide()
            } else {
                $('#analyze-breadcrumb .step[data-step="3"] .validation-tooltip').show()
            }

            // make sure lat/lon has a value

            if ($('#lat').val() == '' || $('#lon').val() == '') {
                $('#analyze-breadcrumb .step[data-step="2"] .validation-tooltip').show()
                $('#clear-grids').hide()
            } else {
                $('#analyze-breadcrumb .step[data-step="2"] .validation-tooltip').hide()
                $('#clear-grids').show()
            }

            // if everything is valid,
            // show the captcha/email/submit button

            if (is_valid == true) {
                $('#analyze-submit').slideDown()
            } else {
                $('#analyze-submit').slideUp()
            }

            return is_valid


        }

        //

        function validate_submit() {

            if (
                $('#analyze-captcha_code').val() == '' ||
                $('body').validate_email($('#analyze-email').val()) != true
            ) {
                $('#analyze-process').addClass('disabled')
            } else {
                $('#analyze-process').removeClass('disabled')
            }

        }


        // init

        validate_steps()
        validate_inputs()

        console.log('end of analyze-functions')
        console.log('- - - - -')

    });
})(jQuery);
