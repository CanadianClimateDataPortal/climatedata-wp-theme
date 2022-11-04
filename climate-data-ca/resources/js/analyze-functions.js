(function ($) {

    $(function () {

        //
        // GLOBAL VARS
        //

        var gridline_color = '#657092';

        const sector_feature_style_color = {
            'default':{
                'color': gridline_color,
                'fillColor': '#ababab'
            },
            'mouseover':{
                'color': '#e3e3e3',
                'fillColor': '#e3e3e3'
            },
            'mouseclick':{
                'color': '#F00',
                'fillColor': '#F00'
            }
        };

        let locations_type = undefined;
        let sector_select_by_id = undefined;
        let is_sector_on = false;

        let analyzeLayer = undefined;
        var current_tab;

        // overlay text
        var overlay_text = JSON.parse($('#analyze-map-overlay-content').attr('data-steps'));
        let canadaBounds = L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.60, -49.9));

        // form stuff

        var default_inputs = {
            'lat': '',
            'lon': '',
            'shape': '',
            'average': '',
            'start_date': '',
            'end_date': '',
            'ensemble_percentiles': '',
            'dataset': '',
            'scenario': '',
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
        var selected_feature_label = '';

        var submit_url_var = '';
        var required_variables=[];

        // STATIONS

        // overlay text

        var stations_overlay_text = JSON.parse($('#analyze-stations-map-overlay-content').attr('data-steps'))

        // form stuff

        var stations_default_inputs = {
            'freq': '',
            'check_missing': '',
            'output_format': ''
        }

        var stations_form_inputs = $.extend(true, {}, stations_default_inputs)

        var stations_form_thresholds = $.extend(true, {}, default_thresholds)

        var stations_form_obj = $.extend(true, {}, default_obj)

        let pathToAnalyzeForm = child_theme_dir + 'resources/ajax/finch-submit.php';

        var markerMap = [],
            stationFromAPI = [],
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
            },
            ahccd_layer,
            ahccd_layerGroups = [],
            stations_list = [];

        // MAPS

        var maps = {};
        var pbfLayer;

        selectedGrids = [];
        selectedPoints = [];
        latlons = [];

        var map_grids = {};

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
        };

        var hosturl = geoserver_url,
            zoom_on = false,
            highlightGridFeature


        //
        // TABS
        //

        $('#analyze-content').tabs({
            hide: {effect: 'fadeOut', duration: 250},
            show: {effect: 'fadeIn', duration: 250},
            create: function (e, ui) {

                $('body').removeClass('spinner-on');

                current_tab = ui.panel.attr('id');

                if (ui.panel.attr('id') === 'analyze-projections') {

                    if (typeof maps['analyze'] == 'undefined') {

                        analyze_init()

                    }

                } else if (ui.panel.attr('id') === 'analyze-stations') {

                    if (typeof maps['stations'] == 'undefined') {

                        station_init()

                    }

                }

            },
            activate: function (e, ui) {
                history.replaceState(null, null, '#' + ui.newPanel.attr('id'));

                current_tab = ui.newPanel.attr('id');

                if (ui.newPanel.attr('id') === 'analyze-projections') {

                    if (typeof maps['analyze'] == 'undefined') {

                        analyze_init();


                    }

                } else if (ui.newPanel.attr('id') === 'analyze-stations') {

                    if (typeof maps['stations'] == 'undefined') {

                        station_init();


                    }

                }

            }
        });


        //
        // TOOLTIPS
        //

        $('.analyze-breadcrumb [data-toggle="tooltip"]').tooltip();
        $('.analyze-form-inputs [data-toggle="tooltip"]').tooltip();

        //
        // ANALYZE
        //

        function analyze_init() {

            create_map('analyze');

            $('#analyze-steps').accordion({
                heightStyle: 'content',
                activate: function (e, ui) {

                    if (ui.newPanel.attr('data-step') == '1') {

                        if ($.isEmptyObject(map_grids)) {
                            $('#analyze-map-overlay').fadeIn(250)
                        }

                    } else if (ui.newPanel.attr('data-step') == '2') {

                        // swap text

                        $('#analyze-map-overlay-content h4').html(overlay_text[2]['head']);
                        $('#analyze-map-overlay-content p').html(overlay_text[2]['text']);

                        // show 'dismiss' btn

                        $('#analyze-map-overlay .btn').removeClass('hidden')

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

            });

            pbfLayer = L.vectorGrid.protobuf(hosturl + '/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf', vectorTileOptions).on('click', function (e) {

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
                    DeselectedGridCell(highlightGridFeature);
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
                $('#shape').val('')

                validate_inputs()

                L.DomEvent.stop(e)

            }).addTo(maps['analyze']);


            validate_steps();
            validate_inputs();

        } // analyze_init

        //
        // OVERLAY
        //

        $('#analyze-projections .accordion-content[data-step="1"] .input-item').on('click', function (e) {
            $('#analyze-map-overlay-content h4').html(overlay_text[1]['head'])
            $('#analyze-map-overlay-content p').html(overlay_text[1]['text'])
        });

        $('#analyze-map-overlay .btn').click(function (e) {
            $('#analyze-map-overlay').fadeOut(250, function () {

                if (zoom_on == false) {

                    // enable map zoom

                    new L.Control.Zoom({
                        position: 'bottomleft'
                    }).addTo(maps['analyze']);

                    zoom_on = true

                }

                // show geo-select

                $('#analyze-geo-select-container').fadeIn();

						})
        });

        $('#analyze-stations .accordion-content[data-step="1"] .input-item').on('click', function (e) {
            $('#analyze-stations-map-overlay-content h4').html(stations_overlay_text[1]['head'])
            $('#analyze-stations-map-overlay-content p').html(stations_overlay_text[1]['text'])
        });

        $('#analyze-stations .accordion-content[data-step="2"] .input-item').on('click', function (e) {

            // update map overlay

            $('#analyze-stations-map-overlay-content h4').html(stations_overlay_text[2]['head'])
            $('#analyze-stations-map-overlay-content p').html(stations_overlay_text[2]['text'])

            // filter stations

            required_variables = $(this).closest('.input-variable').attr('data-required-variables').split('|');

            if (required_variables.includes("tas") ||
                required_variables.includes("tasmin") ||
                required_variables.includes("tasmax")) {
                maps['stations'].removeLayer(ahccd_layerGroups['P']);
                maps['stations'].addLayer(ahccd_layerGroups['T']);
                // temperature stations
                fill_station_select('T');

            } else {
                // precipitation stations
                maps['stations'].removeLayer(ahccd_layerGroups['T']);
                maps['stations'].addLayer(ahccd_layerGroups['P']);
                fill_station_select('P');
            }

            // clear station select

            $('#station-select').val(null).trigger('change');

            // reset icons

            ahccd_layer.eachLayer(function (layer) {

                layer.setIcon(ahccd_icons[layer.feature.properties.type])

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

        // prepend icons to custom controls within page
        function prepend_icons(items, all = true) {
            items.each(function (i) {
                if ($(this).hasClass('type-radio')) {
                    $(this).find('.input-row label').before('<i class="' + radio_icon_off + '"></i>');
                } else if ($(this).hasClass('type-checkbox')) {
                    $(this).find('.input-row').each(function () {
                        if ($(this).hasClass('select-all')) {
                            if (all) {
                                $(this).find('label').before('<i class="' + selectall_icon_off + '"></i>');
                            }
                        } else {
                            $(this).find('label').before('<i class="' + checkbox_icon_off + '"></i>');
                        }
                    })
                }
            })
        }

        prepend_icons($('.field'));

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

        $('input[name="analyze-location"]').on('change', function (e) {
            let itemInput = e.target.value;

            ChangeLayers(itemInput);

            if(itemInput != 'grid'){
                $('#average').val('True');
                InitSectorProtobuf(itemInput);

                locations_type = itemInput;

                if (maps['analyze'].hasLayer(analyzeLayer)) {
                    maps['analyze'].removeLayer(analyzeLayer);
                }
            } else {
                $('#average').val('False');
            }

            validate_steps();
            validate_inputs();
        });


        // radio/check click event

        $('body').on('click', '.type-radio .input-item, .type-checkbox .input-item', function (e) {
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
                    this_item.find(':input').trigger('change');
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



        function ChangeLayers(sector_value) {
            $('#lat').val("");
            $('#lon').val("");
            $('#shape').val('');

            if (sector_value !== 'grid') {
                if (is_sector_on === false) {
                    // When we switch from Grid data to sector
                    SwapLayerBetweenGridAndSector({
                        layer: 'sector'
                    });

                    SwapLayerBetweenGridAndSector({
                        layer: 'grid',
                        action: 'off'
                    });
                }

            } else {
                // Grid data

                // is_sector_on === false, when we refresh the page
                if (is_sector_on === true) {
                    SwapLayerBetweenGridAndSector({
                        layer: 'sector',
                        action: 'off'
                    });
                }

                SwapLayerBetweenGridAndSector({
                    layer: 'grid'
                });
            }
        }

        //
        function SwapLayerBetweenGridAndSector(map_settings) {
            var defaults = {
                layer: null,
                action: 'on'
            };

            var settings = $.extend(true, defaults, map_settings);

            if (settings.action === 'on') {
                $('body').addClass(settings.layer + '-on');
            } else {
                $('body').removeClass(settings.layer + '-on');
            }

            switch (settings.layer) {
                case 'grid':
                    LayerSwapGrid(settings);
                    break;

                case 'sector':
                    LayerSwapSector(settings);
                    break;
                default:
            }
        }

        function LayerSwapSector(settings) {
            if (settings.action == 'on') {
                is_sector_on = true;

                SwapLayerBetweenGridAndSector({
                    layer: 'grid',
                    action: 'off'
                });
            } else {
                is_sector_on = false;

                if (typeof analyzeLayer !== 'undefined' && analyzeLayer !== null) {
                    maps['analyze'].removeLayer(analyzeLayer);
                }
            }
        }

        function LayerSwapGrid(settings) {
            if (settings.action === 'on') {
                maps['analyze'].addLayer(pbfLayer);
                SwapLayerBetweenGridAndSector({
                    layer: 'sector',
                    action: 'off'
                });
            }
            else {
                // hide grid
                maps['analyze'].removeLayer(pbfLayer);
            }
        }

        function InitSectorProtobuf(sector) {
            sector_select_by_id  = undefined;
            DeselectAllGridCell();
            selectedGrids = [];

            (new Promise((resolve, reject) => {
                try {

                    setTimeout( function() {
                        var layerStyles = {};
                        layerStyles[locations_type] = function (properties, zoom) {
                            return {
                                weight: 0.1,
                                color: sector_feature_style_color['default']['color'],
                                opacity: 1,
                                fill: true,
                                radius: 4,
                                fillOpacity: 0
                            }
                        };


                        analyzeLayer = L.vectorGrid.protobuf(
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
                            let event_id = e.layer.properties.id;
                            if(sector_select_by_id  === undefined || sector_select_by_id  !== event_id){
                                analyzeLayer.setFeatureStyle(
                                    event_id,
                                    {
                                        color: sector_feature_style_color['mouseover']['color'],
                                        fillColor: sector_feature_style_color['mouseover']['fillColor'],
                                        weight: 1.5,
                                        fill: true,
                                        radius: 4,
                                        opacity: 1,
                                        fillOpacity: 0.5
                                    });
                            }

                            analyzeLayer.unbindTooltip();
                            analyzeLayer.bindTooltip(e.layer.properties[l10n_labels.label_field], { sticky: true }).openTooltip(e.latlng);
                        }
                        ).on('mouseout', function (e) {
                            let event_id = e.layer.properties.id;
                            if(sector_select_by_id  === undefined || sector_select_by_id  !== event_id){
                                analyzeLayer.resetFeatureStyle(event_id);
                            }
                        }
                        ).on('click', function (e) {
                            HighlightSectorById(e.layer.properties.id, e, analyzeLayer, e.layer.properties[l10n_labels.label_field]);

                            validate_inputs();

                        }).addTo(maps['analyze']);
                        resolve("Sector protobuf initialzed!")
                    }, 200)
                } catch(err) {
                    reject(`Error promise: ${err}`);
                }
            }))
            .catch((reason) => {
                console.error(`Promise error from function InitSectorProtobuf: ${reason}`);
            })
            .finally(() => {
                maps['analyze'].on('zoom', function (e) {
                    if (typeof analyzeLayer !== 'undefined' && analyzeLayer !== null) {
                        analyzeLayer.unbindTooltip();
                    }
                });
            });
        };


        function HighlightSectorById(highlightSectorId, protobufEvent, analyzeLayer, label) {
            $('#lat').val("");
            $('#lon').val("");
            $('#shape').val(highlightSectorId);
            selected_feature_label = label;
            let selectedExists = sector_select_by_id  === highlightSectorId;

            if (selectedExists === true) {
                sector_select_by_id  = undefined;
                analyzeLayer.resetFeatureStyle(highlightSectorId);
                $('#shape').val('');
            } else {

                // Deselect old sector
                if(sector_select_by_id !== undefined){
                    analyzeLayer.resetFeatureStyle(sector_select_by_id);
                }

                sector_select_by_id  = highlightSectorId;

                // Highlight new sector
                 analyzeLayer.setFeatureStyle(highlightSectorId, {
                    color: sector_feature_style_color['mouseclick']['color'],
                    weight: 1,
                    fill: true,
                    radius: 4,
                    opacity: 1,
                    fillOpacity: 0.1
                });
            }

            // Display count top menu (map)
            $('#analyze-breadcrumb').find('.grid-count').text(sector_select_by_id  !== undefined ? 1 : 0);

            L.DomEvent.stop(protobufEvent);
        }

        $('.timeframe-select').on('change', function () {

            var this_val = $(this).val();

            if ($(this).hasClass('start')) {

                $(this).closest('.accordion-content').find('.timeframe-select.end option').each(function () {

                    if (parseInt($(this).val()) <= parseInt(this_val)) {
                        $(this).prop('disabled', true)
                    } else {
                        $(this).prop('disabled', false)
                    }

                })

            } else if ($(this).hasClass('end')) {

                $(this).closest('.accordion-content').find('.timeframe-select.start option').each(function () {

                    if (parseInt($(this).val()) >= parseInt(this_val)) {
                        $(this).prop('disabled', true)
                    } else {
                        $(this).prop('disabled', false)
                    }

                })


            }

            validate_steps()
            validate_inputs()

        });

        $('input[name=dataset]').change(function (e) {
            // fill model and scenarios input since they depend on dataset selection
            let dataset_info = DATASETS[e.target.value];
            let new_html="";
            // add models to form
            dataset_info.model_lists.forEach(function(model) {
                let to_add = '<div class="input-row form-check">' +
                    '   <div class="input-item">\n' +
                    '       <input class="form-check-input add-to-object" type="radio" name="models" id="analyze-model-{0}" value="{0}">\n' +
                    '       <label class="form-check-label" for="analyze-model-{0}">{1}</label>\n' +
                    '   </div>\n' +
                    '</div>';
                new_html += to_add.format(model.name, T(model.label));
            });
            $('#models-placeholder').html(new_html);
            prepend_icons($('#models-placeholder').closest('.field'), false);
            $('#models-placeholder').find('.input-item:first').trigger('click');

            // add scenarios to form
            new_html="";
            dataset_info.scenarios.forEach(function(scenario) {
                let to_add = '<div  class="input-row form-check w-25">' +
                    '   <div class="input-item">\n' +
                    '       <input class="form-check-input add-to-object" type="checkbox" name="scenario" id="analyze-scenarios-{0}" value="{0}" checked>\n' +
                    '       <label class="form-check-label" for="analyze-scenarios-{0}">{1}</label>\n' +
                    '   </div>\n' +
                    '</div>';
                new_html += to_add.format(scenario.name, T(scenario.label));
                $('#scenarios-placeholder').html(new_html);
                prepend_icons($('#scenarios-placeholder').closest('.field'), false);
                $('#scenarios-placeholder').find('.input-item:first').trigger('click');
            });


        });

        //
        // TOOLTIPS
        //

        $('.input-variable .input-item').click(function (e) {

            if (!$(this).hasClass('selected')) {

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

                $('#' + current_tab).find('.analyze-detail .placeholder').html(new_html);
                $('#' + current_tab).find('.analyze-detail').slideDown();

                submit_url_var = $(this).find('input').val()

            }

            validate_inputs()

        });

        $('body').on('input', '.analyze-detail :input', function () {
            validate_inputs();
        });

        $('body').on('input', '#analyze-captcha_code, #analyze-email, #analyze-stations-captcha_code, #analyze-stations-email', function () {
            validate_submit();
        });


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
            "lon": "longitude",
            "shape": "shape",
            'average': 'average',
            "start_date": "start date",
            "end_date": "end date",
            "ensemble_percentiles": "ensemble percentiles",
            "dataset": "dataset name",
            "models": "models",
            "freq": "frequence",
            "scenario": "scenario",
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
                let isBySector = form_inputs["shape"] != '';
                let isByGrid = form_inputs["lat"] != '' && form_inputs["lon"] != '';

                if((isBySector && isByGrid) || (!isBySector && !isByGrid) ){
                    console.error(" Can not build the final input object to send to the API. Please make to select only a sector ("+isBySector+") or grid ("+isByGrid+")");
                    return;
                }

                let sectorCoord = {
                    "s_lat": '',
                    "s_lon": ''
                };

                if(!isBySector){
                    form_obj = CreateAnalyzeProcessRequestData(sectorCoord, form_inputs, form_obj);
                    SubmitAnalyzeProcess(pathToAnalyzeForm);
                }else{
                    // ex: https://data.climatedata.ca/partition-to-points/health/2.json
                    let getUrl = hosturl + "/partition-to-points/"+ locations_type +"/"+ form_inputs["shape"] +".json";

                    $.getJSON(getUrl).then(function(lutBySectorId){
                        sectorCoord["s_lat"]= lutBySectorId.map(x => x[0]).join(',');
                        sectorCoord["s_lon"]= lutBySectorId.map(x => x[1]).join(',');

                        form_obj = CreateAnalyzeProcessRequestData(sectorCoord, form_inputs, form_obj);
                        form_obj['inputs'].push({
                            'id': 'output_name',
                            'data': submit_url_var + '_' + locations_type + '_' + selected_feature_label
                        });
                        SubmitAnalyzeProcess(pathToAnalyzeForm);
                    }).fail(function() { console.error("Can not get file " + getUrl); })
                }
            }
        });


        function SubmitAnalyzeProcess(pathToAnalyzeForm) {
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
                'captcha_code': $('#analyze-captcha_code').val(),
                'namespace': 'analyze',
                'signup':$('#analyze-signup').is(":checked"),
                'request_data': form_obj,
                'submit_url':  '/providers/finch/processes/ensemble_grid_point_' + submit_url_var + '/jobs' // ex: wetdays/jobs
            };

            // check captcha
            $.ajax({
                url: pathToAnalyzeForm,
                method: "POST",
                data: submit_data,
                success: function (data) {

                    var response = JSON.parse(data)

                    console.log(response)

                    if (typeof response == 'object' && response.status == 'accepted') {

                        $('#analyze-success-modal').modal('show');

                    } else {

                        console.log('captcha failed')

                    }
                },
                complete: function () {
                    $('#analyze-captcha_code').val('')
                    $('#analyze-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php?namespace=analyze')
                }
            });
        }


        function CreateAnalyzeProcessRequestData(data_sectorCoord, data_form_inputs, data_form_obj){
            let isBySector = data_form_inputs["shape"] != '';

            for (var key in data_form_inputs) {
                switch (key) {
                    case 'shape':
                        break;

                    case 'average':
                        data_form_obj['inputs'].push({
                            'id': key,
                            'data': data_form_inputs[key]
                        });
                        break;

                    case 'dataset':
                        data_form_obj['inputs'].push({
                            'id': 'dataset',
                            'data': DATASETS[data_form_inputs[key]].finch_name
                        })
                        break;

                    case 'scenario':
                        data_form_inputs[key].split(',').forEach(function(component) {
                            data_form_obj['inputs'].push({
                                'id': key,
                                'data': component
                            })
                        });
                        break;

                    default:
                        let addData = data_form_inputs[key];
                        if(isBySector && (key == "lat" || key == "lon")){
                            addData = data_sectorCoord["s_lat"];
                            if(key == "lon"){
                                addData = data_sectorCoord["s_lon"];
                            }
                        }

                        data_form_obj['inputs'].push({
                            'id': key,
                            'data': addData
                        });
                        break;
                }
            }
            return data_form_obj;
        }

        //
        // STATIONS
        //

        function fill_station_select(type = 'T') {
            $('#station-select').html('');  // using .empty() is very slow

            stations_list.forEach(function (station) {
                if (station.type == type || station.type == 'B') {
                    $('<option value="' + station.ID + '">' + station.Name + '</option>').appendTo('#station-select');
                }
            });
        }

        function station_init() {

            create_map('stations');

            $('#analyze-stations-steps').accordion({
                heightStyle: 'content',
                beforeActivate: function (e, ui) {

                    if (
                        ui.newPanel.attr('data-step') == '2' &&
                        ui.newPanel.find('.checked').length
                    ) {

                        $('#analyze-stations-detail').slideDown()

                    } else {

                        $('#analyze-stations-detail').slideUp()

                    }

                    if (ui.newPanel.attr('data-step') == '3') {

                        $('#analyze-stations-map-overlay').fadeOut(250)

                    }

                }

            });

            $.getJSON(child_theme_dir + 'resources/app/ahccd/ahccd.json', function (data) {
                let ahccd_layer_cluster = L.markerClusterGroup();

                ahccd_layer = L.geoJson(data, {
                    onEachFeature: function (feature, layer) {
                        stations_list.push({
                            ID: feature.properties.ID,
                            type: feature.properties.type,
                            Name: feature.properties.Name
                        });
                        //does layerGroup already exist? if not create it and add to map
                        var lg = ahccd_layerGroups[feature.properties.type];

                        if (lg === undefined) {
                            lg = new L.featureGroup.subGroup(ahccd_layer_cluster);
                            //add the layer to the map
                            lg.addTo(maps['stations']);
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

                    var this_type = e.layer.feature.properties.type;

                    // get current station select value
                    var selection = $("#station-select").val() || [];

                    var clicked_ID = e.layer.feature.properties.ID;

                    // search if clicked feature is already selected
                    idx = selection.indexOf(clicked_ID);

                    if (idx != -1) {
                        selection.splice(idx, 1);
                        $('#station-select').val(selection).change();
                        icon = ahccd_icons[this_type];
                    } else {
                        selection.push(clicked_ID);
                        $('#station-select').val(selection).change();
                        icon = ahccd_icons[this_type + 'r'];
                    }

                    e.layer.setIcon(icon);

                    validate_steps();
                    validate_inputs();

                });

                stations_list.sort(function (o1, o2) {
                    return o1.Name > o2.Name ? 1 : o1.Name < o2.Name ? -1 : 0;
                });

                fill_station_select();

                // add to map
                ahccd_layer_cluster.addTo(maps['stations']);

            });

            validate_steps();
            validate_inputs();

        }

        // trigger when a tag is removed from multiple station selector input
        $('#station-select').on('select2:unselect', function (e) {
            ahccd_layer.eachLayer(function (layer) {
                if (layer.feature.properties.ID === e.params.data.id) {
                    layer.setIcon(ahccd_icons[layer.feature.properties.type])
                }
            });
            validate_steps();
            validate_inputs()
        });

        // trigger when a tag is added to multiple station selector input
        $('#station-select').on('select2:select', function (e) {
            ahccd_layer.eachLayer(function (layer) {
                if (layer.feature.properties.ID === e.params.data.id) {
                    layer.setIcon(ahccd_icons[layer.feature.properties.type + 'r'])
                }
            });
            validate_steps();
            validate_inputs();
        });

        //
        // MISC
        //

        $('.detail-close').click(function () {
            $(this).closest('.analyze-detail').slideUp()
        });





        function DeselectAllGridCell() {
            const list = Object.entries(map_grids);
            list.forEach((key) => {
                DeselectedGridCell(key[0]);
             } );
        }

        function DeselectedGridCell(gridSelected) {
            delete map_grids[gridSelected];

            // To reset selection
            for (var i = selectedGrids.length - 1; i >= 0; i--) {
                if (selectedGrids[i] === gridSelected) {
                    selectedGrids.splice(i, 1);
                }
            }

            for (var i = selectedPoints.length - 1; i >= 0; i--) {
                if (selectedPoints[gridSelected]) {
                    selectedPoints.splice(i, 1);
                }
            }

            pbfLayer.resetFeatureStyle(gridSelected);
        }

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

        $("#analyze-geo-select").select2({
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
                        maps['analyze'].panTo([term_lat, term_lon]);
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

        $('#analyze-geo-select').on('select2:select', function (e) {

            console.log('geo-select');

            thislat = e.params.data.lat;
            thislon = e.params.data.lon;

            geoselecting = true;

            //update_param('coords', thislat + ',' + thislon + ',11');
            maps['analyze'].setView([thislat, thislon], 10);

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
            $('#shape').val('')

            validate_steps();
            validate_inputs();

        })

        //
        // VALIDATION
        //

        // ACCORDION STEPS

        function validate_steps() {

            // console.log('validate steps', current_tab)

            if (current_tab == 'analyze-projections') {

                // PROJECTIONS

            var valid_steps = [false, false, false, false]

            $('#analyze-steps .validate-input').each(function (i) {

                var current_accordion = $(this).closest('.accordion-content'),
                    current_step = parseInt(current_accordion.attr('data-step')),
                    is_valid = false,
                    breadcrumb_val = '';

                if ($(this).hasClass('type-radio') || $(this).hasClass('type-checkbox')) {

                    if ($(this).find('.checked').length) {

                        is_valid = true

                        // set breadcrumb

                        if (current_accordion.find('.checked').length > 1) {
                            breadcrumb_val = current_accordion.find('.checked').length + ' selected';
                        } else {
                            breadcrumb_val = current_accordion.find('.checked').find('.form-check-label').text();
                        }
                        let selected_count;

                        if (current_step == 2) {
                            if ($('input[name="analyze-location"]:checked').val() == 'grid') {
                                selected_count = selectedGrids.length;
                            } else {
                                selected_count = sector_select_by_id  !== undefined ? 1 : 0;
                            }
                            breadcrumb_val = '<span class="grid-count">' + selected_count + '</span> ' + breadcrumb_val
                        }

                    }

                } else if ($(this).hasClass('type-select')) {

                    is_valid = true

                    // set breadcrumb

                    current_accordion.find('select').each(function (i) {
                        if (i != 0) {
                            breadcrumb_val += ' – ';
                        }
                        breadcrumb_val += $(this).val()
                    });

                    $(this).find('select').each(function () {
                        if ($(this).val() == '') {
                            is_valid = false;
                            breadcrumb_val = ''
                        }
                    })
                }

                if (is_valid == true) {

                    // activate next tab

                    current_accordion.prev('.accordion-head').attr('data-valid', true)
                    current_accordion.next('.accordion-head').removeClass('ui-state-disabled')

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

            });

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

            } else if (current_tab == 'analyze-stations') {

                // STATIONS

                var valid_steps = [false, false, false, false];

                $('#analyze-stations-steps .validate-input').each(function (i) {

                    // console.log('checking', $(this))

                    var current_accordion = $(this).closest('.accordion-content'),
                        current_step = parseInt(current_accordion.attr('data-step')),
                        is_valid = false,
                        breadcrumb_val = ''

                    if ($(this).hasClass('type-radio') || $(this).hasClass('type-checkbox')) {

                        if ($(this).find('.checked').length) {

                            is_valid = true;

                            // set breadcrumb

                            if (current_accordion.find('.checked').length > 1) {
                                breadcrumb_val = current_accordion.find('.checked').length + ' selected'
                            } else {
                                breadcrumb_val = current_accordion.find('.checked').find('.form-check-label').text()
                            }

                        }

                    } else if ($(this).hasClass('type-select')) {
                        if ($(this).find('.timeframe-select').length) {
                            is_valid = true;

                            // set breadcrumb
                            current_accordion.find('select').each(function (i) {
                                if (i != 0) {
                                    breadcrumb_val += ' – ';
                                }
                                breadcrumb_val += $(this).val()
                            });

                            $(this).find('select').each(function () {
                                if ($(this).val() == '') {
                                    is_valid = false;
                                    breadcrumb_val = ''
                                }
                            });

                            if (
                                current_tab == 'analyze-stations' &&
                                current_step == 1 &&
                                is_valid == true
                            ) {

                                $('#analyze-stations-map-overlay-content h4').html(stations_overlay_text[1]['head'])
                                $('#analyze-stations-map-overlay-content p').html(stations_overlay_text[1]['text'])

                            }

                        } else if ($(this).find('#station-select').length) {

                            is_valid = true;

                            // console.log($(this).find('select').val())

                            if ($('#station-select').val() == null) {
                                is_valid = false;
                                breadcrumb_val = ''
                            } else {
                                breadcrumb_val = $('#station-select').val().length + ' selected'
                            }

                        }

                    }

                    if (is_valid == true) {

                        // activate next tab

                        current_accordion.prev('.accordion-head').attr('data-valid', true);
                        current_accordion.next('.accordion-head').removeClass('ui-state-disabled');

                        // set text & show step
                        $('#analyze-stations-breadcrumb [data-step="' + current_step + '"]').addClass('on').find('.value').html(breadcrumb_val);

                        // show the header
                        $('#analyze-stations-header').addClass('on');

                        valid_steps[i] = true

                    } else {

                        $(this).closest('.accordion-content').prev('.accordion-head').attr('data-valid', false);
                        $(this).closest('.accordion-content').nextAll('.accordion-head').addClass('ui-state-disabled');

                        // hide the breadcrumb

                        $('#analyze-stations-breadcrumb [data-step="' + current_step + '"]').removeClass('on');

                        // hide breadcrumbs after this

                        $('#analyze-stations-breadcrumb .step[data-step="' + current_step + '"]').nextAll('.step').removeClass('on');

                        // if there are no visible breadcrumbs

                        if (!$('#analyze-stations-header').find('.on').length) {

                            // hide the header
                            $('#analyze-stations-header').removeClass('on');

                            // show the first overlay instruction

                            $('#analyze-stations-map-overlay-content h4').html(stations_overlay_text[0]['head']);
                            $('#analyze-stations-map-overlay-content p').html(stations_overlay_text[0]['text']);

                        }

                        if (i != valid_steps.length) {
                            for (z = i; z >= valid_steps.length; z += 1) {
                                valid_steps[z] = false
                            }
                        }

                        return false;

                    }

                })

            }
        }

        // INPUTS

        function validate_inputs() {

            if (current_tab == 'analyze-projections') {
                let sectorSelect = $('input[name="analyze-location"]:checked').val();
                // PROJECTIONS
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
                let isBySector = form_inputs["shape"] != '' && ( key == "lat" || key == "lon");
                let isByGrid = key == "shape" && form_inputs["lat"] != '' && form_inputs["lon"] != '';

                if (isBySector || isByGrid){
                    continue;
                }

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

            switch($('input[name="analyze-location"]:checked').val()) {
                case 'grid':
                    // make sure lat/lon has a value
                    if ($('#lat').val() == '' || $('#lon').val() == '') {
                        $('#analyze-breadcrumb .step[data-step="2"] .validation-tooltip').show();
                        $('#clear-grids').hide();
                    } else {
                        $('#analyze-breadcrumb .step[data-step="2"] .validation-tooltip').hide();
                        $('#clear-grids').show();
                    }
                    break;
                case undefined:
                    $('#analyze-breadcrumb .step[data-step="2"] .validation-tooltip').hide();
                    $('#clear-grids').hide();
                    break;
                default:
             }

            // if everything is valid,
            // show the captcha/email/submit button

            if (is_valid == true) {
                $('#analyze-submit').slideDown()
            } else {
                $('#analyze-submit').slideUp()
            }

            return is_valid;

            } else if (current_tab == 'analyze-stations') {

                // STATIONS

                var is_valid = true;

                stations_form_inputs = $.extend(true, {}, stations_default_inputs);

                // CHECK INPUTS THAT NEED TO BE ADDED
                // TO THE REQUEST OBJECT

                // build the form_inputs object

                $('#analyze-stations-form-inputs .add-to-object').each(function () {

                    var this_name = $(this).attr('name'),
                        this_type = $(this).attr('type'),
                        this_has_val = false,
                        this_val = $(this).val();

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

                            if (stations_form_inputs[this_name] != '') {
                                stations_form_inputs[this_name] += ',' + this_val
                            } else {
                                stations_form_inputs[this_name] = this_val
                            }

                        } else {

                            stations_form_inputs[this_name] = this_val

                        }

                    }

                })

                // cycle through the object and check for empty values

                // console.log('checking', stations_form_inputs)

                for (var key in stations_form_inputs) {
                    if (stations_form_inputs[key] == '') {
                        is_valid = false;
                        console.log(key)
                    }
                }

                // CHECK FOR EMPTY VALUES
                // IN THE VAR DETAIL OVERLAY FORM

                stations_form_thresholds = $.extend(true, {}, default_thresholds);

                var stations_thresholds_have_val = true;

                // build the form_thresholds object

                $('#analyze-stations-detail').find(':input').each(function () {

                    var this_name = $(this).attr('name');
                    if ($(this).attr('data-optional') == undefined ||
                        $(this).attr('data-optional') == true || $(this).val() != '') {

                        stations_form_thresholds[this_name] = $(this).val();

                        if ($(this).val() != '' && $(this).attr('data-units') !== undefined && $(this).attr('data-units') != '') {
                            stations_form_thresholds[this_name] += ' ' + $(this).attr('data-units');
                        }
                    }
                });

                // cycle through the object and check for empty values

                // console.log('checking thresholds', stations_form_thresholds)

                for (var key in stations_form_thresholds) {
                    if (stations_form_thresholds[key] == '') {
                        is_valid = false;
                        stations_thresholds_have_val = false;
                    }
                }

                if (stations_thresholds_have_val == true) {
                    $('#analyze-stations-breadcrumb .step[data-step="2"] .validation-tooltip').hide();
                } else {
                    $('#analyze-stations-breadcrumb .step[data-step="2"] .validation-tooltip').show();
                }

                // make sure at least one station is selected

                // console.log('selected stations', selected_stations)
                let selected_stations = $("#station-select").val() || [];

                if (selected_stations.length <= 0) {
                    is_valid = false;
                }

                // if everything is valid,
                // show the captcha/email/submit button

                if (is_valid == true) {
                    $('#analyze-stations-submit').slideDown();
                } else {
                    $('#analyze-stations-submit').slideUp();
                }

                return is_valid;

            }
        }

        //

        function validate_submit() {

            // projections

            if (
                $('#analyze-captcha_code').val() == '' ||
                $('body').validate_email($('#analyze-email').val()) != true
            ) {
                $('#analyze-process').addClass('disabled')
            } else {
                $('#analyze-process').removeClass('disabled')
            }

            // stations

            if (
                $('#analyze-stations-captcha_code').val() == '' ||
                $('body').validate_email($('#analyze-stations-email').val()) != true
            ) {
                $('#analyze-stations-process').addClass('disabled')
            } else {
                $('#analyze-stations-process').removeClass('disabled')
            }

        }

        $('#analyze-stations-process').click(function (e) {
            if (!$(this).hasClass('disabled')) {

                stations_form_obj = $.extend(true, {}, default_obj)

                // build the final input object to send to the API

                for (var key in stations_form_inputs) {

                    let data = stations_form_inputs[key];

                    if (key == 'check_missing' && data != 'wmo') {
                        stations_form_obj['inputs'].push({
                            'id': 'missing_options',
                            'data': JSON.stringify({
                                'pct': {
                                    'tolerance': parseFloat(data)
                                }
                            })});

                        data = 'pct';
                    }

                    stations_form_obj['inputs'].push({
                        'id': key,
                        'data': data
                    });

                }

                // form_thresholds
                for (var key in stations_form_thresholds) {
                    stations_form_obj['inputs'].push({
                        'id': key,
                        'data': stations_form_thresholds[key]
                    })
                }

                // stations
                let selected_stations = $("#station-select").val() || [];
                let output_name_suffix='';
                if (selected_stations.length == 1) {
                    stations_list.forEach(function (station) {
                        if (station.ID == selected_stations[0]) {
                            output_name_suffix = '_' + station.Name;
                        }
                    });
                }
                // not implemented yet in Finch
                //stations_form_obj['inputs'].push({
                //    'id': 'output_name',
                //    'data': submit_url_var + output_name_suffix
                //});


                // email
                stations_form_obj['notification_email'] = $('#analyze-stations-email').val();

                var submit_data = {
                    'captcha_code': $('#analyze-stations-captcha_code').val(),
                    'namespace': 'analyze-stations',
                    'signup':$('#analyze-stations-signup').is(":checked"),
                    'request_data': stations_form_obj,
                    'required_variables': required_variables,
                    'stations': selected_stations.join(','),
                    'submit_url': '/providers/finch/processes/' + submit_url_var + '/jobs'
                };

                // check captcha
                $.ajax({
                    url: pathToAnalyzeForm,
                    method: "POST",
                    data: submit_data,
                    success: function (data) {
                        var response = JSON.parse(data);
                        console.log(response);
                        if (typeof response == 'object' && response.status == 'accepted') {
                            $('#analyze-stations-success-modal').modal('show');
                        } else {
                            console.log('captcha failed')
                        }
                    },
                    complete: function () {
                        $('#analyze-stations-captcha_code').val('')
                        $('#analyze-stations-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php?namespace=analyze-stations')
                    }
                })

            }
        });


        // init

        validate_steps();
        validate_inputs();

        function create_map(map_var) {

            maps[map_var] = L.map(map_var + '-map', {
                maxZoom: 12,
                minZoom: 3,
                zoomControl: false
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
            maps[map_var].createPane('sector');
            maps[map_var].getPane('sector').style.zIndex = 410;

            L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                pane: 'basemap',
                maxZoom: 12
            }).addTo(maps[map_var]);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(maps[map_var]);

            if (map_var == 'stations') {

                maps[map_var].createPane('idf');
                maps[map_var].getPane('idf').style.zIndex = 600;
                maps[map_var].getPane('idf').style.pointerEvents = 'all';

                maps[map_var].setView([52.501690, -98.567253], 4);

            }

        }

        console.log('end of analyze-functions')
        console.log('- - - - -')

    });
})(jQuery);
