(function($) {
  
  $(function() {
        
    console.log('start variable-functions');
    
    // get initial page title to manipulate for history pushes
    
    var init_title = $('title').text().split(' — ');
    var title_pre = init_title[0],
        title_post = init_title[2];
    
    //
    //
    // GLOBAL OPTIONS
    //
    //
    
    var idf_layer, station_layer, highlight, highlight2;
    
    var has_mapRight = false,
        grid_initialized = false;
    
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
      query['decade'] = $('#decade').val();
    } else {
      query['decade'] = '1980s';
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
        default: parseInt($('#range-slider-container').attr('data-default')),
        from: 0,
        values: []
      };
      
      z = 0;
      
      for (i = decade_slider_options.min; i <= decade_slider_options.max; i += 10) {
        
        if (i == decade_slider_options.default) {
          decade_slider_options.from = z;
        }
        
        decade_slider_options['values'].push(i + 's');
        
        z += 1;
        
      }
      
      var $rs = $("#range-slider");
      
      $rs.ionRangeSlider({
        grid: false,
        skin: "round",
        from: decade_slider_options.from,
        hide_min_max: true,
        prettify_enabled: false,
        values: decade_slider_options.values,

        onChange: function (data) {
          
          $('#decade').val(data.from_value).trigger('change');
          
          update_param('decade', data.from_value);
          
          console.log('done updating decade, update query string now');
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
    
    function formatGeoSelect (item) {

        if (!item.id) {
            return item.text;
        }
        var $item = $(
            '<span><div class="geo-select-title">' + item.text + ' (' + item.term + ')</div>' + item.location + ', ' + item.province + '</sup></span>'
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
        escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
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
    
    var hosturl = geoserver_url;
    var canadaBounds = L.latLngBounds(L.latLng(41,-141),L.latLng(83.50,-52.1));
    
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
    map1.getPane('labels').style.zIndex = 450;
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

    $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/assets/json/idf_curves.json', function (data) {
        
        //console.log(data);
        
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
            //console.log(e);
            e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng);
        }).on('click', function (e) {
            //console.log(e);
            
            e.layer.bindPopup(popup_markup(e.layer.feature.properties));
            
            e.layer.bindPopup(getIDFLinks(e.layer.feature.properties.ID), {
                maxWidth: 300
            });
            
        });
        
        if (query['var'] == 'idf') {
          idf_layer.addTo(map1);
        }

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
            $.each(data, function(k,v){
                linktext = v;


                if (v.includes("_A.pdf", 0) === true){
                    linktext = popup_labels[0] + " (PDF)";
                } else if (v.includes("_A.png", 0) === true){
                    linktext = popup_labels[0] + " (PNG)";
                } else if (v.includes(".txt", 0) === true){
                    linktext = popup_labels[0] + " (TXT)";
                } else if (v.includes("_qq.pdf", 0) === true){
                    linktext = popup_labels[1] + " (PDF)";
                } else if (v.includes("_qq.png", 0) === true){
                    linktext = popup_labels[1] + " (PNG)";
                } else if (v.includes("_r.pdf", 0) === true){
                    linktext = popup_labels[2] + " (PDF)";
                } else if (v.includes("_r.png", 0) === true){
                    linktext = popup_labels[2] + " (PNG)";
                } else if (v.includes("_t.pdf", 0) === true){
                    linktext = popup_labels[3] + " (PDF)";
                } else if (v.includes("_t.png", 0) === true){
                    linktext = popup_labels[3] + " (PNG)";
                } else if (v.includes(".pdf", 0) === true){
                    linktext = popup_labels[0] + " (PDF)";
                } else if (v.includes(".png", 0) === true){
                    linktext = popup_labels[0] + " (PNG)";
                }

                $('.idfBody').append('<li><a href="' + v + '" target="_blank">' + linktext + '</a></li>');
            });
        });
    };
    
    //
    // WEATHER STATIONS LAYER
    //
    
    map1.createPane('stations');
    map1.getPane('stations').style.zIndex = 600;
    map1.getPane('stations').style.pointerEvents = 'all';
    
    $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-stations/items?f=json&limit=10000', function (data) {

        station_layer = L.geoJson(data, {
            pointToLayer: function (feature, latlng) {

                if (feature.properties.HAS_NORMALS_DATA === 'Y') {
                    markerColor = '#e50e40';

                    return L.circleMarker(latlng, {
                        // Stroke properties
                        color: '#fff',
                        opacity: 1,
                        weight: 2,

                        pane: 'stations',
                        // Fill properties
                        fillColor: markerColor,
                        fillOpacity: 1,

                        radius: 5
                    });

                } else {
                    markerColor = '#555';
                }

            }
        }).on('mouseover', function (e) {
          
            e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME).openTooltip(e.latlng);
            
        }).on('click', function (e) {
          
            genStationChart(e.layer.feature.properties.STN_ID, e.layer.feature.properties.STATION_NAME, e.layer.feature.properties.LATITUDE, e.layer.feature.properties.LONGITUDE);


        });
        
        if (query['var'] == 'weather-stations') {
          station_layer.addTo(map1);
        }
    });
    
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
          }
      },
      bounds: canadaBounds,
      maxZoom: 12,
      minZoom: 7,
      pane: 'grid'
    };
    
    // create
    
    var gridLayer = L.vectorGrid.protobuf(
      hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
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

    function getColor(d, colormap) {

        for (let i = 0; i < colormap.length; i++) {
            unitValue = parseInt(colormap[i].quantity);
            unitColor = colormap[i].color;
            if (d > unitValue) {
                return unitColor
            }
        }
    }
    
    function genChoro(year, variable, rcp, frequency, colormap) {
      
        console.log('creating sector layer');

        choroPath = site_url + 'data/run-frontend-health/';

        if (frequency === 'ann') {
            choroPath += "annual_choro_values.php?var=" + variable + "&rcp=" + rcp
        } else {
            choroPath += "monthly_choro_values.php?month=" + frequency + "&var=" + variable + "&rcp=" + rcp
        }
        
        console.log(choroPath);
        
        $.getJSON(choroPath).then(function (data) {
          
          //console.log(data);
            
            if (map1.hasLayer(choroLayer)) {
              console.log('remove existing choroLayer');
              map1.removeLayer(choroLayer);
            }
        
            choroValues = data;

            //console.log("choroValues");
            //console.log(choroValues);
            
            var tooltipValue;

            choroLayer = L.geoJSON(healthSectorsGeoJson, {
                smoothFactor: 0,
                name: 'geojson',
                pane: 'sector',
                onEachFeature: function (feature, layer) {
                  
                  if (typeof feature !== 'undefined') {
                  
                    layer.setStyle({
                        fillColor: getColor(choroValues[year][parseInt(feature.properties.PR_HRUID)], colormap),
                        weight: 0.5,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 1
                    });
                    layer.on('mouseover', function () {

                        tooltipValue = choroValues[year][parseInt(this.feature.properties.PR_HRUID)];
                        //fixedTooltipValue = (tooltipValue - subtractValue).toFixed(varDetails['decimals']) + "" + chartUnit;
                        this.setStyle({
                            fillColor: getColor(choroValues[year][parseInt(this.feature.properties.PR_HRUID)], colormap),
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 1
                        });
                        layer.bindTooltip(layer.feature.properties.ENG_LABEL, {sticky: true}).openTooltip(layer.latlng);
                    });
                    layer.on('mouseout', function () {
                        this.setStyle({
                            fillColor: getColor(choroValues[year][parseInt(feature.properties.PR_HRUID)], colormap),
                            weight: 0.5,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 1
                        });
                    });
                    layer.on('click', function (e) {
                      
                      console.log('click');
                      
                        current_sector['hruid'] = parseInt(feature.properties.PR_HRUID);
                        current_sector['label'] = layer.feature.properties.ENG_LABEL;

                        var_value = $("#var").val();
                        mora_value = $("#mora").val();

                        genSectorChart(current_sector['hruid'], var_value, mora_value, current_sector['label']);


                    });
                    
                  }
                  
                }
            }).addTo(map1);
            
        });
       
    }
    
    
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
        layers: 'CDC:' + query['var'] + '-ys-rcp26-p50-ann-10year'
    }).addTo(map1);
    
    leftLayer.setOpacity(10);
    
    invalidate_maps();
    
    // get map bounds
    
    bounds = map1.getBounds().toBBoxString();
    
    //
    // RIGHT MAP
    //
    
    var mapRight, gridLayerRight, rightLayer;
    
    if ($('#mapRight').length) {
      
      has_mapRight = true;
    
      mapRight = L.map("mapRight", {
          zoomControl: false,
          maxZoom: 12,
          minZoom: 3,
          center: [query['coords'].split(',')[0], query['coords'].split(',')[1]],
          zoom: query['coords'].split(',')[2]
      });
      
      
      mapRight.createPane('basemap');
      mapRight.getPane('basemap').style.zIndex = 399;
      mapRight.getPane('basemap').style.pointerEvents = 'none';
      
      mapRight.createPane('labels');
      mapRight.getPane('labels').style.zIndex = 402;
      mapRight.getPane('labels').style.pointerEvents = 'none';
      
      mapRight.createPane('grid');
      mapRight.getPane('grid').style.zIndex = 403;
      mapRight.getPane('grid').style.pointerEvents = 'none';
      
      console.log('create raster pane');
      
      mapRight.createPane('raster');
      mapRight.getPane('raster').style.zIndex = 400;
      mapRight.getPane('raster').style.pointerEvents = 'none';
      
      L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          pane: 'basemap',
          maxZoom: 12,
          minZoom: 3,
      }).addTo(mapRight);
      
      
      var gridLayerRight = L.vectorGrid.protobuf(
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
      
      console.log('create right layer');
      
      wmsOptions = {
          format: 'image/png',
          transparent: true,
          tiled: true,
          opacity: 1,
          pane: 'raster',
          'VERSION': '1.3.0',
          bounds: canadaBounds,
          layers: 'CDC:' + query['var'] + '-ys-rcp26-p50-ann-10year'
      };
  
      rightLayer = L.tileLayer.wms(hosturl + '/geoserver/ows?', wmsOptions).addTo(mapRight);
      
      invalidate_maps();
  
      map1.sync(mapRight);
      mapRight.sync(map1);
    
    }
    
    //
    //
    // CHART STUFF
    //
    //

    // LAYER CHART
    
    function genChart(lat, lon, variable, month) {
        timerStart = Date.now();

        midHistSeries = [];
        rangeHistSeries = [];

        mid26Series = [];
        range26Series = [];

        mid45Series = [];
        range45Series = [];

        mid85Series = [];
        range85Series = [];
        
        //console.log(lat, lon, variable, month);
        //console.log(base_href + 'variable/' + $('#var').val());
        //console.log('get_values.php?lat=' + lat + '&lon=' + lon + '&var=' + variable + '&month=' + month);
        
        $(document).overlay('show', {
          href: base_href + 'variable/' + $('#var').val() + '/',
          data: {
            lat: lat,
            lon: lon
          },
          content: 'location',
          position: 'right',
          callback: function(varDetails) {
          
            $('#rcp').prop('disabled', true);
            
            $.getJSON(
                data_url + '/get_values.php?lat=' + lat + '&lon=' + lon + '&var=' + variable + '&month=' + month,
                function (data) {
                  
                    //console.log(varDetails);

                    if (varDetails.units.value === 'kelvin') {
                        subtractValue = k_to_c;
                        chartUnit = "°C";
                    } else {
                        subtractValue = 0;
                        chartUnit = varDetails.units.label;
                    }
                    
                    if (month === 'jan'){
                        monthNum = 0;
                    } else if (month === 'feb'){
                        monthNum = 1;
                    } else if (month === 'mar'){
                        monthNum = 2;
                    } else if (month === 'apr'){
                        monthNum = 3;
                    } else if (month === 'may'){
                        monthNum = 4;
                    } else if (month === 'jun'){
                        monthNum = 5;
                    } else if (month === 'jul'){
                        monthNum = 6;
                    } else if (month === 'aug'){
                        monthNum = 7;
                    } else if (month === 'sep'){
                        monthNum = 8;
                    } else if (month === 'oct'){
                        monthNum = 9;
                    } else if (month === 'nov'){
                        monthNum = 10;
                    } else if (month === 'dec'){
                        monthNum = 11;
                    } else {
                        monthNum = 0
                    }
    
                    for (var i = 0; i < data.length; i++) {
                      
                        chartDecimals = varDetails['decimals'];
    
                        data[i][0] = parseFloat((data[i][0] - subtractValue).toFixed(2));
                        data[i][1] = parseFloat((data[i][1] - subtractValue).toFixed(2));
                        data[i][2] = parseFloat((data[i][2] - subtractValue).toFixed(2));
    
                        data[i][3] = parseFloat((data[i][3] - subtractValue).toFixed(2));
                        data[i][4] = parseFloat((data[i][4] - subtractValue).toFixed(2));
                        data[i][5] = parseFloat((data[i][5] - subtractValue).toFixed(2));
    
                        data[i][6] = parseFloat((data[i][6] - subtractValue).toFixed(2));
                        data[i][7] = parseFloat((data[i][7] - subtractValue).toFixed(2));
                        data[i][8] = parseFloat((data[i][8] - subtractValue).toFixed(2));
    
                        data[i][9] = parseFloat((data[i][0]).toFixed(2));
                        data[i][10] = parseFloat((data[i][1]).toFixed(2));
                        data[i][11] = parseFloat((data[i][2]).toFixed(2));
    
                        if (i < 56) {
                            rangeHistSeries.push([Date.UTC(1950 + i, monthNum, 1), data[i][9], data[i][11]]);
                            midHistSeries.push([Date.UTC(1950 + i, monthNum, 1), data[i][10]]);
                        }
                        // had to add limiter since annual values spit out a null set at the end.
                        if (i > 54 && i < 150) {
    
                            range26Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][0], data[i][2]]);
                            mid26Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][1]]);
                            range45Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][3], data[i][5]]);
                            mid45Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][4]]);
                            range85Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][6], data[i][8]]);
                            mid85Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][7]]);
                            
                            
                        }
                    }
    
    
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
                                formatter: function () {
                                    return this.axis.defaultLabelFormatter.call(this) + chartUnit;
                                }
                            }
                        },
                        
                        legend: {
                          enabled: true
                        },
    
                        tooltip: {
                          valueDecimals: chartDecimals,
                          valueSuffix: ' ' + chartUnit
                        },
                        
                        navigation: {
                          buttonOptions: {
                            enabled: false
                          }
                        },
                        
                        series: [{
                            name: chart_labels.historical,
                            data: midHistSeries,
                            zIndex: 1,
                            showInNavigator: true,
                            color: '#000000',
                            marker: {
                                fillColor: '#000000',
                                lineWidth: 0,
                                radius: 0,
                                lineColor: '#000000'
                            }
                        }, {
                            name: chart_labels.historical_range,
                            data: rangeHistSeries,
                            type: 'arearange',
                            lineWidth: 0,
                            linkedTo: ':previous',
                            color: '#000000',
                            fillOpacity: 0.2,
                            zIndex: 0,
                            marker: {
                                radius: 0,
                                enabled: false
                            },
                        }, {
                            name: chart_labels.rcp_26_median,
                            data: mid26Series,
                            zIndex: 1,
                            showInNavigator: true,
                            color: '#00F',
                            marker: {
                                fillColor: '#00F',
                                lineWidth: 0,
                                radius: 0,
                                lineColor: '#00F'
                            }
                        }, {
                            name: chart_labels.rcp_26_range,
                            data: range26Series,
                            type: 'arearange',
                            lineWidth: 0,
                            linkedTo: ':previous',
                            color: '#00F',
                            fillOpacity: 0.2,
                            zIndex: 0,
                            marker: {
                                radius: 0,
                                enabled: false
                            },
                        }, {
                            name: chart_labels.rcp_45_median,
                            data: mid45Series,
                            zIndex: 1,
                            showInNavigator: true,
                            color: '#00640c',
                            marker: {
                                fillColor: '#00640c',
                                lineWidth: 0,
                                radius: 0,
                                lineColor: '#00640c'
                            }
                        }, {
                            name: chart_labels.rcp_45_range,
                            data: range45Series,
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
                        }, {
                            name: chart_labels.rcp_85_median,
                            data: mid85Series,
                            zIndex: 1,
                            showInNavigator: true,
                            color: '#F00',
                            marker: {
                                fillColor: '#F00',
                                lineWidth: 0,
                                radius: 0,
                                lineColor: '#F00'
                            }
                        }, {
                            name: chart_labels.rcp_85_range,
                            data: range85Series,
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
                        }]
                    });
                    
                    //console.log(chart);
                    
                    $('.chart-export-data').click(function (e) {
                      e.preventDefault();
                      
                      var dl_type = '';
                      
                      switch ($(this).attr('data-type')) {
                        case 'csv' : 
                          //chart.downloadCSV();
                          
                          //window.open("data:text/csv;charset=utf-8," + escape(chart.getCSV()));
                          
                          window.location.href = "data:text/csv;charset=utf-8," + escape(chart.getCSV());
                          
                          break;
                      }
                      
                    });
                    
                    $('.chart-export-img').click(function (e) {
                      e.preventDefault();
                      
                      var dl_type = '';
                      
                      switch ($(this).attr('data-type')) {
                        case 'png' : 
                          dl_type = 'image/png';
                          break;
                        case 'pdf' :
                          dl_type = 'application/pdf';
                          break;
                      }
                      
                      chart.exportChart({
                        type: dl_type
                      });
                    });            
        
                  
                }
            );
            
          }
        });

        
    }
    
    // STATION CHART
    
    function genStationChart(STN_ID, station_name, lat, lon) {
      
      $(document).overlay('show', {
        href: base_href + 'variable/' + $('#var').val() + '/',
        data: {
          lat: lat,
          lon: lon,
          station_name: station_name
        },
        content: 'location',
        position: 'right',
        callback: function(varDetails) {
          
          $.getJSON(
            'https://geo.weather.gc.ca/geomet/features/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=1&sortby=MONTH', 
            function (data) {
  
              console.log(data);
  
              var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
              timeSeries = [];
  
              $.each(data.features, function (k, v) {
                  if (k < 12) {
                      timeSeries.push([months[k], v.properties.VALUE]);
                  }
              });
  
              var chartUnit = " °C",
                  chart_title = 'Climate normals 1981–2010';
                  
              if ($('body').hasClass('lang-fr')) {
                chart_title = 'Normales et moyennes climatiques de 1981–2010';
              }
  
              var chart = Highcharts.chart('chart-placeholder', {
                  chart: {
                      height: '360px',
                  },
                  title: {
                      text: chart_title
                  },
  
                  xAxis: {
                      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  },
  
                  yAxis: [{
                      lineWidth: 1,
                      title: {
                          text: 'Temperature (°C)'
                      }
                  }, {
                      lineWidth: 1,
                      opposite: true,
                      title: {
                          text: 'Precipitation (mm)'
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
                    enabled: false
                  }
              });
              
              $('.chart-export-data').click(function (e) {
                e.preventDefault();
                
                var dl_type = '';
                
                switch ($(this).attr('data-type')) {
                  case 'csv' : 
                    //chart.downloadCSV();
                    
                    window.open("data:text/csv;charset=utf-8," + escape(chart.getCSV()));
                    
                    break;
                }
                
              });
              
              $('.chart-export-img').click(function (e) {
                e.preventDefault();
                
                var dl_type = '';
                
                switch ($(this).attr('data-type')) {
                  case 'png' : 
                    dl_type = 'image/png';
                    break;
                  case 'pdf' :
                    dl_type = 'application/pdf';
                    break;
                }
                
                chart.exportChart({
                  type: dl_type
                });
              }); 
  
              // 1 Daily Average (degree C)
              // 5 Daily Maximum (degree C)
              // 56 Precipitation (mm)
              // 8 Daily Minimum (degree C)
  
              $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=1&sortby=MONTH', function(data) {
                  timeSeries = [];
                  $.each(data.features, function (k, v) {
                      if (k < 12) {
                          timeSeries.push([months[k], v.properties.VALUE]);
                      }
                  });
                  chart.addSeries({
                      name: 'Daily Average Temperature (°C)',
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
  
                  $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=5&sortby=MONTH', function(data) {
                      timeSeries = [];
                      $.each(data.features, function (k, v) {
                          if (k < 12) {
                              timeSeries.push([months[k], v.properties.VALUE]);
                          }
                      });
                      chart.addSeries({
                          name: 'Daily Maximum Temperature (°C)',
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
                      
                      $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=8&sortby=MONTH', function(data) {
                          timeSeries = [];
                          $.each(data.features, function (k, v) {
                              if (k < 12) {
                                  timeSeries.push([months[k], v.properties.VALUE]);
                              }
                          });
                          chart.addSeries({
                              name: 'Daily Minimum Temperature (°C)',
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
                          
                          $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-normals/items?f=json&STN_ID=' + STN_ID + '&NORMAL_ID=56&sortby=MONTH', function(data) {
                              timeSeries = [];
                              $.each(data.features, function (k, v) {
                                  if (k < 12) {
                                      timeSeries.push([months[k], v.properties.VALUE]);
                                  }
                              });
                              chart.addSeries({
                                  name: 'Precipitation (mm)',
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
    
    // SECTOR
    
    function genSectorChart(hruid, variable, month, region_label) {
        timerStart = Date.now();

        midHistSeries = [];
        rangeHistSeries = [];

        mid26Series = [];
        range26Series = [];

        mid45Series = [];
        range45Series = [];

        mid85Series = [];
        range85Series = [];

        chartData = [];
        chartData['rcp26'] = [];
        chartData['rcp45'] = [];
        chartData['rcp85'] = [];
        
        console.log('sector chart');
        
        $(document).overlay('show', {
          href: base_href + 'variable/' + query['var'] + '/',
          data: {
            sector: query['sector'],
            region: region_label
          },
          content: 'sector',
          position: 'right',
          callback: function(varDetails) {
            
            var valuePath = site_url + 'data/run-frontend-health/';
            
            if (month === 'ann') {
                valuePath += "generateAnnualChartDatawHistAllYears.php?hruid=" + hruid + "&var=" + variable
            } else {
                valuePath += "generateMonthlyChartDatawHistAllYears.php?hruid=" + hruid + "&var=" + variable + "&month=" + month
            }

            $.getJSON(valuePath + "&rcp=rcp26").then(function (data) {
                console.log('rcp 2.6 data');

                // if the unit = kelvin in variables.json - convert to celcius
                if (varDetails['units']['value'] === 'kelvin') {
                    subtractValue = k_to_c;
                    chartUnit = "°C";
                } else {
                    subtractValue = 0;
                    chartUnit = varDetails['units']['label'];
                }

                for (var key in data) {
                    year = parseInt(key);
                    dateObj = Date.UTC(year, 0, 1);
                    chartData['rcp26'][year] = data[year][hruid];

                    if (key >= 2010) {
                        range26Series.push([dateObj, parseFloat(chartData['rcp26'][year]['p10'] - subtractValue), parseFloat(chartData['rcp26'][year]['p90'] - subtractValue)]);
                        mid26Series.push([dateObj, parseFloat(chartData['rcp26'][year]['p50'] - subtractValue)]);
                    }


                    if (key <= 2010) {
                        rangeHistSeries.push([dateObj, parseFloat(chartData['rcp26'][year]['p10'] - subtractValue), parseFloat(chartData['rcp26'][year]['p90'] - subtractValue)]);
                        midHistSeries.push([dateObj, parseFloat(chartData['rcp26'][year]['p50'] - subtractValue)]);
                    }
                }

                chartDecimals = varDetails['decimals'];

                var chart = Highcharts.stockChart('chart-placeholder', {
                    chart: {
                        height: '700px',
                        zoomType: 'x',
                        animation: false
                    },
                    title: {
                        text: varDetails['title']
                    },
                    subtitle: {
                        text: document.ontouchstart === undefined ?
                            'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                    },

                    xAxis: {
                        categories: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090]
                    },

                    yAxis: {
                        title: {
                            text: varDetails['title']
                        },


                        labels: {
                            formatter: function () {
                                return this.axis.defaultLabelFormatter.call(this) + chartUnit;
                            }
                        }

                    },
                    legend: {
                        enabled: true
                    },

                    tooltip: {
                        valueDecimals: chartDecimals,
                        crosshairs: true,
                        shared: true,
                        split: false,
                        valueSuffix: chartUnit
                    },
                    series: [],
                    exporting: {
                      enabled: false
                    }
                });


                chart.addSeries({
                    name: 'Historical',
                    data: midHistSeries,
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

                chart.addSeries({
                    name: 'Historical Range',
                    data: rangeHistSeries,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#000000',
                    fillOpacity: 0.2,
                    zIndex: 0,
                    marker: {
                        radius: 0,
                        enabled: false
                    },
                });


                chart.addSeries({
                    name: 'RCP 2.6',
                    data: mid26Series,
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
                chart.addSeries({
                    name: 'RCP 2.6 Range',
                    data: range26Series,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: '#00F',
                    fillOpacity: 0.2,
                    zIndex: 0,
                    marker: {
                        radius: 0,
                        enabled: false
                    },
                });

                $.getJSON(valuePath + "&rcp=rcp45").then(function (data) {
                    console.log('rcp 4.5 data');


                    for (var key in data) {
                        year = parseInt(key);

                        dateObj = Date.UTC(year, 0, 1);
                        chartData['rcp45'][year] = data[year][hruid];

                        if (key >= 2010) {
                            range45Series.push([dateObj, parseFloat(chartData['rcp45'][year]['p10'] - subtractValue), parseFloat(chartData['rcp45'][year]['p90'] - subtractValue)]);
                            mid45Series.push([dateObj, parseFloat(chartData['rcp45'][year]['p50'] - subtractValue)]);
                        }
                    }


                    chart.addSeries({
                        name: 'RCP 4.5',
                        data: mid45Series,
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

                    chart.addSeries({
                        name: 'RCP 4.5 Range',
                        data: range45Series,
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

                    $.getJSON(valuePath + "&rcp=rcp85").then(function (data) {
                        console.log('rcp 8.5 data');
                        for (var key in data) {
                            year = parseInt(key);

                            dateObj = Date.UTC(year, 0, 1);
                            chartData['rcp85'][year] = data[year][hruid];
                            if (key >= 2010) {
                                range85Series.push([dateObj, parseFloat(chartData['rcp85'][year]['p10'] - subtractValue), parseFloat(chartData['rcp85'][year]['p90'] - subtractValue)]);
                                mid85Series.push([dateObj, parseFloat(chartData['rcp85'][year]['p50'] - subtractValue)]);
                            }
                        }


                        chart.addSeries(
                            {
                                name: 'RCP 8.5',
                                data: mid85Series,
                                zIndex: 1,
                                showInNavigator: true,
                                color: '#F00',
                                marker: {
                                    fillColor: '#F00',
                                    lineWidth: 0,
                                    radius: 0,
                                    lineColor: '#F00'
                                }
                            }
                        );

                        chart.addSeries(
                            {
                                name: 'RCP 8.5 Range',
                                data: range85Series,
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
                            }
                        );


                        seconds = (Date.now() - timerStart) * 0.001;
                        $('#loadtime').html(" <strong style=color:blue>Loaded in " + seconds + " seconds</strong>");


                    });

                });
                
                $('.chart-export-data').click(function (e) {
                  e.preventDefault();
                  
                  var dl_type = '';
                  
                  switch ($(this).attr('data-type')) {
                    case 'csv' : 
                      //chart.downloadCSV();
                      
                      window.open("data:text/csv;charset=utf-8," + escape(chart.getCSV()));
                      
                      break;
                  }
                  
                });
                
                $('.chart-export-img').click(function (e) {
                  e.preventDefault();
                  
                  var dl_type = '';
                  
                  switch ($(this).attr('data-type')) {
                    case 'png' : 
                      dl_type = 'image/png';
                      break;
                    case 'pdf' :
                      dl_type = 'application/pdf';
                      break;
                  }
                  
                  chart.exportChart({
                    type: dl_type
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
      
      labels.push('<h6 class="legendTitle">' + legendTitle +'</h6>');
      
      var first_label = colormap[0].label;
      
      if (current_lang == 'fr') {
        first_label = first_label.replace('Degree Days', 'Degrés-jours');
        first_label = first_label.replace('Days', 'Jours');
      }
      
      labels.push('<span class="legendLabel max">' + first_label + '</span>');
      
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
          
          labels.push(
            '<div class="legendRow">' +
              '<div class="legendColor" style="background:' + unitColor + '"></div>' +
              '<div class="legendUnit">' + unitValue + '</div>' +
            '</div>'
          );
          
          min_label = unitValue;
        }
      }

      labels.push('</div><!-- .legendRows -->');
      
      labels.push('<span class="legendLabel min">' + min_label + '</span>');
      
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

      singleLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-10year';
      leftLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-10year';
      rightLayerName = var_value + '-' + msorys + '-' + right_rcp_value + '-p50' + msorysmonth + '-10year';
      
      var layer = leftLayerName;
      var legendTitle = mora_text_value;
  
      console.log("left legend layer", layer);
        
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
            console.log(err.responseText)
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
      
      console.log(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:health_sectors&style=" + layer + "&format=application/json");
  
        $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:health_sectors&style=" + layer + "&format=application/json")
            .then(function (data) {
  
                labels = [];
                leftLegend.onAdd = function (map) {
                    let div = L.DomUtil.create('div', 'info legend legendTable');
                    let colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                    let unitValue;
                    let unitColor;
  
                    colormap = colormap.reverse();
 
                    labels = legend_markup(legendTitle, colormap);
  
                    div.innerHTML = labels.join('');
                    return div;
  
                };
  
                leftLegend.addTo(map1);
  
                colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
  
                var_value = $("#var").val();
                mora_value = $("#mora").val();
                mora_text_value = $("#mora option:selected").text();
                rcp_value = $("#rcp").val();
                decade_value = parseInt($("#decade").val());
  
                genChoro(decade_value, var_value, rcp_value, mora_value, colormap);
  
  
            })
            .fail(function (err) {
                console.log(err.responseText)
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
    
    function layer_swap(fn_options) {
      
      var defaults = {
        layer: null,
        action: 'on'
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      //console.log(settings.layer, settings.action);
      
      if (settings.action == 'on') {
        $('body').addClass(settings.layer + '-on');
      } else {
        $('body').removeClass(settings.layer + '-on');
      }
      
      switch (settings.layer) {
        
        case 'variable' : 
        
          if (settings.action == 'on') {
            
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
            
            console.log('turning var off now');
            
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
          
        case 'stations' :
          
          if (settings.action == 'on') {
            
            console.log('stations on');
            
            // set global var & body class
            
            station_on = true;
            
            // add station layer
            
            if (settings.station == 'idf') {
            
              if (typeof idf_layer !== 'undefined') {
                map1.addLayer(idf_layer);
              }
              
              if (typeof station_layer !== 'undefined') {
                map1.removeLayer(station_layer).closePopup();
              }
            
            } else if (settings.station == 'weather-stations') {
            
              if (typeof station_layer !== 'undefined') {
                map1.addLayer(station_layer);
              }
              
              if (typeof idf_layer !== 'undefined') {
                map1.removeLayer(idf_layer).closePopup();
              }
              
            }
            
            // disable filters
            
            $('#sector').prop('disabled', true);
            
            $('#mora').prop('disabled', true);
            $('#rcp').prop('disabled', true);
            
            // turn off variable & sector
            
            console.log('sector and var off');
            
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
          
        case 'sector' :
          
          if (settings.action == 'on') {
            
            // set global var & body class
            
            sector_on = true;
            
            // disable station data options
            
            $('#var').find('optgroup[data-slug="station-data"] option').each(function() {
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
            
            $('#var').find('optgroup[data-slug="station-data"] option').each(function() {
              $(this).prop('disabled', false);
            });
            
            if (typeof choroLayer !== 'undefined' && choroLayer !== null) {
              console.log('remove choroLayer now');
              map1.removeLayer(choroLayer);
            }
            
            //toggle_variable('on');
            
          }
          
          // re-initialize select2 with new disabled/enabled options  
//           $('#var').select2();
          
          break;
          
        default : 
          
          console.log('no layer given');
      }
      
    }1
    
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
      
      if (window.location.search != '') {
              
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
            
            //console.log('check key', key, query[key]);
            
            if ($('#' + key).val() != query[key]) {
              console.log(key + ' is different, change filter value to ' + query[key]);
              $('#' + key).val(query[key]).trigger('change');
            }
            
            // extra conditionals
            
            if (key == 'var') {
              
              query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');
              
              if (query['var-group'] == 'station-data') {
                
                // station data
                
                layer_swap({
                  layer: 'stations',
                  station: query['var']
                });
                
                layer_swap({
                  layer: 'variable',
                  action: 'off'
                });
                
              } else if (query['sector'] != '' ) {
                
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
              
            } else if (key == 'decade') {
              
              //console.log('change decade to ' + query[key], $("#decade").prop('selectedIndex'));
              
              //$('#' + key).val(query[key]).trigger('change');
              
              rs_instance.update({
                from: $("#decade").prop('selectedIndex')
              });
              
            } else if (key == 'coords') {
              
              // if the current center is different from the query['coords'] value
              
              var current_center = map1.getCenter();
              var current_zoom = map1.getZoom();
              
              var query_center = [query[key].split(',')[0], query[key].split(',')[1]];
              var query_zoom = query[key].split(',')[2];
              
              if (current_zoom != query_zoom || current_center.lat != query_center[0] || current_center.lng != query_center[1]) {
                
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
              
                console.log('set view', query[key].split(',')[0], query[key].split(',')[1], query[key].split(',')[2]);
                map1.setView([query[key].split(',')[0], query[key].split(',')[1]], query[key].split(',')[2], { animate: false });
                
              }
              
            } else if (key == 'geo-select') {
              
              //$('#geo-select').trigger('change');  
              
            }
                        
          }
          
        }
        
      }
      
      console.log('done evaluating the query, updating URL string', history_action);
      update_query_string();
      
    }
    
    // update parameter
    
    var update_param = function(key, val) {
      
      console.log('update param', key, val, history_action);
      
      // update the query key
      
      query[key] = val;
      
      // input values that are not changed by mouse interactions
      // i.e. they are not select menus
      
      if (key == 'coords') {
        $('#coords').val(val);
      }
      
    };
    
    // push/replace state
    
    function update_query_string() {
    
      //console.log('update string');
      
      //console.log('old', window.location.search);
    
      // convert the current object back to a string
      var new_query_string = query_obj_to_str();
      
      //console.log('new', new_query_string);
      
      var new_url = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + new_query_string;
      
      // if the string has changed
      
      if (window.location.href != new_url) {
        
        //console.log(history_action);
        
        var new_title = title_pre + ' — ' + $('#var :selected').text() + ' — ' + title_post;
        
        $('title').text(new_title);
        
        if (history_action == 'push') {
          
          console.log('----- push -----');
          window.history.pushState('', new_title, new_url);
          
        } else if (history_action == 'replace' || history_action == 'init') {
          
          console.log('----- replace -----');
          window.history.replaceState('', new_title, new_url);
          
        } else {
          
          console.log('----- ' + history_action + ' -----');
        }
        
      }

      history_action = 'push';
      
    }
    
    //
    //
    // EVENTS
    //
    //
    
    // SELECT2
    
    $('#geo-select').on('select2:select', function(e) {
      
      console.log('geo-select');
    
      thislat = e.params.data.lat;
      thislon = e.params.data.lon;
      
      geoselecting = true;
      
      //update_param('coords', thislat + ',' + thislon + ',11');
      map1.setView([thislat, thislon], 10);
      
    });
    
    $('#var-filter .select2').change(function(e) {
      
      console.log('filter menu has changed', $(this).attr('id'), $(this).val());
      console.log('history action', history_action);
      
      var_value = $("#var").val();
      mora_value = $("#mora").val();
      mora_text_value = $("#mora option:selected").text();
      rcp_value = $("#rcp").val();
      decade_value = parseInt($("#decade").val());
      
      query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');
      
      // IF THE CHART OVERLAY IS OPEN
      
      if ($('body').hasClass('overlay-position-right')) {
        
        console.log('the chart overlay is open');
        
        console.log(var_value);
        console.log($('#var').val());
        
        if (query['sector'] != '') {
          
          genSectorChart(current_sector['hruid'], var_value, mora_value, current_sector['label']);
          
        } else if (query['var-group'] != 'station-data') {
          
          console.log('the selected variable is not station data');
          
          genChart(query['coords'].split(',')[0], query['coords'].split(',')[1], var_value, mora_value);
          
        } else {
          
          $(document).overlay('hide');
          
        }
        
      }
      
      // ADJUST FOR SPECIFIC FILTERS
      
      // if geo-select 
      
      if ($(this).attr('id') != 'geo-select') {
        
        // UPDATE THE QUERY PARAMETER
        
        update_param($(this).attr('id'), $(this).val());
        
      }
      
      if (var_value.indexOf('heat_wave') !== -1) {
        
        if ($('#mora').val() != 'ann') {
          $('#mora').val('ann').trigger('change');
          mora_value = 'ann';
        }
        
        $('#mora').prop('disabled', true);
          
      } else {
        
        $('#mora').prop('disabled', false);
        
      }
      
      // LAYER VISIBILITY
      
      if (query['var-group'] == 'station-data') {
        
        // activate station data
        
        layer_swap({
          layer: 'stations',
          station: query['var']
        });
        
      } else {
        
        // not station data so make sure it's turned off
        
        if (station_on == true) {
          layer_swap({
            layer: 'stations',
            action: 'off'
          });
        }
        
        if (query['sector'] != '') {
          
          console.log('sector is set');
          
          // activate sector
          
          if (sector_on == false) {
            
            console.log('sector is not turned on');
            
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
          
          if (sector_on == true) {
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
        
        if (query['sector'] != '') {
          
          if (mora_value === 'ann') {
              msorys = 'ys';
              msorysmonth = '-ann';
              legendmsorys = 'ann';
          } else {
              msorys = 'ms';
              msorysmonth = '-' + mora_value;
              legendmsorys = "mon";
          }
          
          legendLayer = var_value + "_health_" + legendmsorys;
          
          console.log('generate sector legend');
          generateSectorLegend(var_value + "_health_" + legendmsorys, '');
          
        } else {
          
          console.log('generate left legend');
          generateLeftLegend();
          
        }
        
        singleLayerName = var_value + '-' + msorys + '-' + rcp_value + '-p50' + msorysmonth + '-10year';

        // if a compare scenario was selected
        
        if (rcp_value.indexOf("vs") !== -1) {
            
          $('body').addClass('map-compare');
          
          invalidate_maps();
          
          console.log('set left layer');

          leftLayer.setParams({
              format: 'image/png',
              transparent: true,
              opacity: 1,
              pane: 'raster',
              'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
              'VERSION': '1.3.0',
              layers: 'CDC:' + leftLayerName
          });
          
          console.log('set right layer');
          
          if (has_mapRight == true) {
            rightLayer.setParams({
                format: 'image/png',
                transparent: true,
                opacity: 1,
                pane: 'raster',
                'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
                'VERSION': '1.3.0',
                layers: 'CDC:' + rightLayerName
            });
          }
          
          // also generate the right legend
          
          console.log('generate right legend');
          //generateRightLegend(rightLayerName, mora_text_value);
            
        } else {
        
          $('body').removeClass('map-compare');
          
          invalidate_maps();

          leftLayer.setParams({
              format: 'image/png',
              transparent: true,
              opacity: 1,
              'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
              'VERSION': '1.3.0',
              layers: 'CDC:' + singleLayerName
          });
            
        }
        
      }
      
      if (history_action == 'push') {
        //console.log('action = push so update the URL string');
        update_query_string();
      }
    });
    
    // MAP EVENTS
    
    $('#map-controls span').click(function() {
      //console.log('zoom click');
      
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
      //console.log('move end');
      
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
      setTimeout(function () { map1.on('moveend', mapMoveEnd); }, 300);
      
    }

    map1.on('moveend', mapMoveEnd);
    
    // OVERLAY
    
    $('#page-variable .overlay-close').click(function() {
      clearGridHighlight();
    });
    
    // set the href of the (i) icon in the filter
    // when the variable changes
    
    $('#var').change(function() {
      var new_href = base_href + 'variable/' + $(this).val();
      $('#var-filter-variable .icon').attr('href', new_href);
    });
    
    // HISTORY
    
    // on initial load
    
    // convert the current URL string to an object
    query_str_to_obj();
    
    // initial layer opacity
    
    sliderChange(parseInt($('#opacity-slider-container1').attr('data-default')));
    
    // evaluate query
    
    eval_query_obj();
    
    // generate initial legends
    
    mora_value = $("#mora").val();
    var_value = $("#var").val();
    
    if (query['sector'] != '') {
      
      if (mora_value === 'ann') {
          legendmsorys = 'ann';
      } else {
          legendmsorys = "mon";
      }
      
      legendLayer = var_value + "_health_" + legendmsorys;
      
      console.log('generate sector legend');
      generateSectorLegend(legendLayer, '');
      
    } else {
      
      console.log('generate left legend');
      generateLeftLegend();
      
    }
    
    // hide spinner
    
    $('body').removeClass('spinner-on');
    
    // POP STATE
    
    window.onpopstate = function() {
      
      console.log('----- pop -----');
      
      // convert the current query string to an object
      query_str_to_obj();
      
      // set the history action to 'pop' while the updates happen
      console.log('set history action to pop');
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
    
    $(document).on('overlay_hide', function() {
      console.log('the overlay was closed');
      
      if (!$('body').hasClass('idf-selected')) {
        $('#rcp').prop('disabled', false);
      }
    });
    
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
	  
	  $('.page-tour').page_tour(tour_options);
    
    //console.log('end of variable-functions');
    //console.log('- - - - -');
    
  });
})(jQuery);

