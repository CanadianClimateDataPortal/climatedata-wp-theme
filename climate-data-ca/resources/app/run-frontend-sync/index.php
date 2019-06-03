<!DOCTYPE html>
<html>
<head>

    <title>Sync Test</title>

    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./assets/css/bootstrap.css"/>
    <link rel="stylesheet" href="./assets/css/range-slider.css"/>
    <link rel="stylesheet" href="./assets/css/leaflet.css"/>
    <link rel="stylesheet" href="./assets/css/select2.min.css"/>
    <link rel="stylesheet" href="./assets/css/select2-bootstrap4.min.css"/>

    <script src="./assets/js/jquery.js"></script>
    <script src="./assets/js/select2.min.js"></script>
    <script src="./assets/js/leaflet.js"></script>
    <script src="./assets/js/vector-grid.js"></script>
    <script src="./assets/js/zoom.js"></script>
    <script src="./assets/js/range-slider.js"></script>

    <style>
        html, body {
            padding: 0;
            margin: 0;
        }

        .leaflet-popup-content {
            max-width: 400px !important;
            width: 400px !important;
            height: 220px !important;
        }



        .info {
            padding: 6px 8px;
            font: 14px/16px Arial, Helvetica, sans-serif;
            background: white;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            border-radius: 5px;
        }

        .info h4 {
            margin: 0 0 5px;
            color: #777;
        }


        .leaflet-control-zoom-display {
            background-color: #fff;
            border-bottom: 1px solid #ccc;
            width: 26px;
            height: 26px;
            line-height: 26px;
            display: block;
            text-align: center;
            text-decoration: none;
            color: black;
            padding-top: 0.3em;
            font: bold 12px/20px Tahoma, Verdana, sans-serif;
        }


        #geo-select-container {
            position: absolute;
            margin: auto;
            top: 100px;
            left: 100px;
            background-color: white;
            border-radius: 5px;
            width: 300px;
            z-index: 1000;
        }

        .geo-select-title {
            font-weight: bold;
        }

        .legendTable {
            display: table;
        }

        .legendTitle {
            line-height: 10px;
            font-size: 10px;
            font-weight: bold;
        }

        .legendRow {
            width: 50px;
            line-height: 10px;
            display: table-row;
        }


        .legendRow:hover {
            transform: scale(2);
            background: white;
            font-weight: bold;
            cursor: pointer;
        }

        .legendColor {
            width: 20px;
            display: table-cell
        }


        .legendUnit {
            font-size: 5pt;
            display: table-cell
        }

        .geo-select-location {
            font-weight: bold;
        }

        .geo-select-term {
            font-weight: bold;
        }

        .geo-select-province {
            font-weight: bold;
        }

        #range-slider-container {
            position: absolute;
            margin: auto;
            bottom: 50px;
            left: 50px;
            width: 50%;
            z-index: 1000;
        }

        .irs--round .irs-grid-text {
            color: #404040;
            font-size: 9px;
        }


        .modal-backdrop.show {
            opacity: 0;
        }

        .modal.right .modal-dialog {
            position: fixed;
            margin: auto;
            width: 65%;
            height: 100%;
            -webkit-transform: translate3d(0%, 0, 0);
            -ms-transform: translate3d(0%, 0, 0);
            -o-transform: translate3d(0%, 0, 0);
            transform: translate3d(0%, 0, 0);
        }

        .modal-dialog {
            max-width: 100% !important;
        }

        .modal.right .modal-content {
            height: 100%;
            overflow-y: auto;
        }

        .modal-body {
            margin-top: 100px;
        }

        .modal.right .modal-body {
            padding: 15px 15px 80px;
        }

        .modal.right.fade .modal-dialog {
            right: -50%;
            -webkit-transition: opacity 0.3s linear, right 0.3s ease-out;
            -moz-transition: opacity 0.3s linear, right 0.3s ease-out;
            -o-transition: opacity 0.3s linear, right 0.3s ease-out;
            transition: opacity 0.3s linear, right 0.3s ease-out;
        }

        .modal.right.fade.show .modal-dialog {
            right: 0;
        }


        /* ----- MODAL STYLE ----- */
        .modal-content {
            border-radius: 0;
            border: none;
        }


        #mapRight {
            right: 0;
            top: 0;
            position: absolute;
        }
        .select2-container--bootstrap4.select2-container--focus .select2-selection {
            border-color: #ced4da;
            -webkit-box-shadow: none;
            box-shadow: none;
        }

    </style>

</head>
<body>

<nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <a class="navbar-brand" href="#">#</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">

        <form class="form-inline my-2 my-lg-0">
            <select class="custom-select custom-select-md select2 form-control input-large" name="var" id="var">
                <option value="cddcold_18">cddcold_18</option>
                <option value="frost_days">frost_days</option>
                <option value="gddgrow_10">gddgrow_10</option>
                <option value="gddgrow_5">gddgrow_5</option>
                <option value="hddheat_17">hddheat_17</option>
                <option value="heat_wave_frequency_Tmin20_Tmax30">heat_wave_frequency_Tmin20_Tmax30</option>
                <option value="heat_wave_max_length_Tmin20_Tmax30">heat_wave_max_length_Tmin20_Tmax30</option>
                <option value="ice_days">ice_days</option>
                <option value="prcptot">prcptot</option>
                <option value="r10mm">r10mm</option>
                <option value="r1mm">r1mm</option>
                <option value="r20mm">r20mm</option>
                <option value="rx1day">rx1day</option>
                <option value="tg_mean">tg_mean</option>
                <option value="tn_max">tn_max</option>
                <option value="tn_mean">tn_mean</option>
                <option value="tn_min">tn_min</option>
                <option value="tnlt_-15">tnlt_-15</option>
                <option value="tnlt_-25">tnlt_-25</option>
                <option value="tr_18">tr_18</option>
                <option value="tr_20">tr_20</option>
                <option value="tr_22">tr_22</option>
                <option value="tx_max" selected>tx_max</option>
                <option value="tx_mean">tx_mean</option>
                <option value="tx_min">tx_min</option>
                <option value="txgt_25">txgt_25</option>
                <option value="txgt_27">txgt_27</option>
                <option value="txgt_29">txgt_29</option>
                <option value="txgt_30">txgt_30</option>
                <option value="txgt_32">txgt_32</option>
            </select>
            <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="mora" id="mora">

                <option value="ann">Annual</option>
                <option value="jan">January</option>
                <option value="feb">February</option>
                <option value="mar">March</option>
                <option value="apr">April</option>
                <option value="may">May</option>
                <option value="jun">June</option>
                <option value="jul">July</option>
                <option value="aug">August</option>
                <option value="sep">September</option>
                <option value="oct">October</option>
                <option value="nov">November</option>
                <option value="dec">December</option>
            </select>

            <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="rcp" id="rcp">
                <option value="rcp26">RCP 2.6</option>
                <option value="rcp26vs45">RCP 2.6 vs RCP 4.5</option>
                <option value="rcp26vs85">RCP 2.6 vs RCP 8.5</option>
                <option value="rcp45">RCP 4.5</option>
                <option value="rcp45vs26">RCP 4.5 vs RCP 2.6</option>
                <option value="rcp45vs85">RCP 4.5 vs RCP 8.5</option>
                <option value="rcp85">RCP 8.5</option>
                <option value="rcp85vs26">RCP 8.5 vs RCP 2.6</option>
                <option value="rcp85vs45">RCP 8.5 vs RCP 4.5</option>
            </select>

            <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="decade" id="decade">
                <option value="1950's">1950's</option>
                <option value="1960's">1960's</option>
                <option value="1970's">1970's</option>
                <option value="1980's">1980's</option>
                <option value="1990's">1990's</option>
                <option value="2000's">2000's</option>
                <option value="2010's">2010's</option>
                <option value="2020's">2020's</option>
                <option value="2030's">2030's</option>
                <option value="2040's">2040's</option>
                <option value="2050's">2050's</option>
                <option value="2060's">2060's</option>
                <option value="2070's">2070's</option>
                <option value="2080's">2080's</option>
                <option value="2090's">2090's</option>
            </select>

            <input id="opacity-slider" type="range" min="0" max="100" value="100" step="1" oninput="sliderChange(this.value)"/>
        </form>
    </div>
</nav>

<div id="map1" style="margin-top:56px;margin-bottom:-56px"></div>

<div id="geo-select-container">
    <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="geo-select" id="geo-select">
        <option value="">Search for a City/Town</option>
    </select>
</div>

<div id="range-slider-container">
    <input id="range-slider">
</div>

<div id="mapRightcontainer">
    <div id="mapRight" style="margin-top:56px;margin-bottom:-56px"></div>
</div>

<script src="assets/js/sync.js"></script>
<script src="assets/js/nearest.js"></script>

<div class="modal right fade" id="chartSidebar" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <div id="container"></div>
                <div id="loadtime"></div>
                <div id="latlondisplay"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">

    $(document).ready(function () {

        var map1 = L.map("map1", {
            maxZoom: 12,
            minZoom: 3
        });

        var hosturl;

        <?php

        $client_ip = $_SERVER['REMOTE_ADDR'];

        if ($client_ip === '72.137.170.138') { ?>
        hosturl = "http://192.168.0.52:8080";
        <?php } else { ?>
        hosturl = "http://data.habitatseven.com:8080";
        <?php } ?>


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
        map1.getPane('labels').style.zIndex = 402;
        map1.getPane('labels').style.pointerEvents = 'none';

        map1.createPane('idf');
        map1.getPane('idf').style.zIndex = 600;
        map1.getPane('idf').style.pointerEvents = 'all';

        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap',
            maxZoom: 12
        }).addTo(map1);


        var leftLegend = L.control({position: 'bottomright'});
        var rightLegend = L.control({position: 'bottomright'});

        var idfLayer;

        var highlightGridFeature;
        var highlightGridFeatureRightLayer;


        map1.setView([62.501690, -98.567253], 4);

//         $.getJSON('./assets/json/idf_curves.json', function (data) {
//
//             L.geoJson(data, {
//                 onEachFeature: function (feature, layer) {
//                     layer.bindPopup("<div class=idfTitle>Name: "+feature.properties.Name+"<Br>Elevation: "+feature.properties.Elevation_ + "<Br><br><strong>Downloads</strong> (will open in new window)</div><div class=idfBody></div>");
//                 },
//                 /*
//                  * When each feature is load{
//   maxWidth: "auto"
// }ed from the GeoJSON this
//                  * function is called. Here we create a cicle marker
//                  * for the feature and style the circle marker.
//                  */
//                 pointToLayer: function (feature, latlng) {
//
//                     return L.circleMarker(latlng, {
//                         // Stroke properties
//                         color: '#FFF',
//                         opacity: 1,
//                         weight: 2,
//
//                         pane: 'idf',
//                         // Fill properties
//                         fillColor: '#000',
//                         fillOpacity: 1,
//
//                         radius: 5
//                     });
//                 }
//             }).on('mouseover', function (e) {
//                 console.log(e);
//                 e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng);
//                 // if (highlightGridFeature) {
//                 //     gridLayer.resetFeatureStyle(highlightGridFeature);
//                 // }
//                 // highlightGridFeature = e.layer.properties.gid;
//                 // gridLayer.setFeatureStyle(highlightGridFeature, {
//                 //     weight: 0,
//                 //     color: '#FFF',
//                 //     opacity: 1,
//                 //     fillColor: '#FFF',
//                 //     fill: true,
//                 //     fillOpacity: 0.25
//                 // });
//             }).on('click', function (e) {
//                 console.log(e);
//
//                 e.layer.bindPopup(getIDFLinks(e.layer.feature.properties.ID),{
//                     maxWidth: 200,
//                     width: 200
//                 });
//                 //e.layer.bindTooltip(e.layer.feature.properties.Name).openTooltip(e.latlng);
//                 // if (highlightGridFeature) {
//                 //     gridLayer.resetFeatureStyle(highlightGridFeature);
//                 // }
//                 // highlightGridFeature = e.layer.properties.gid;
//                 // gridLayer.setFeatureStyle(highlightGridFeature, {
//                 //     weight: 0,
//                 //     color: '#FFF',
//                 //     opacity: 1,
//                 //     fillColor: '#FFF',
//                 //     fill: true,
//                 //     fillOpacity: 0.25
//                 // });
//             }).addTo(map1);
//         });

        function getIDFLinks(idf) {
            $.getJSON('search_idfs.php?idf=' + idf, function (data) {

                $('.idfBody').empty();
                $.each(data, function(k,v){
                    linktext = v;


                    if (v.includes("_A.pdf", 0) === true){
                        linktext = "Short Duration Rainfall Intensity−Duration−Frequency Data (PDF)";
                    } else if (v.includes("_A.png", 0) === true){
                        linktext = "Short Duration Rainfall Intensity−Duration−Frequency Data (PNG)";
                    } else if (v.includes(".txt", 0) === true){
                        linktext = "Short Duration Rainfall Intensity−Duration−Frequency Data (TXT)";
                    } else if (v.includes("_qq.pdf", 0) === true){
                        linktext = "Quantile (PDF)";
                    } else if (v.includes("_qq.png", 0) === true){
                        linktext = "Quantile (PNG)";
                    } else if (v.includes("_r.pdf", 0) === true){
                        linktext = "Return Level (PDF)";
                    } else if (v.includes("_r.png", 0) === true){
                        linktext = "Return Level (PNG)";
                    } else if (v.includes("_t.pdf", 0) === true){
                        linktext = "Trend (PDF)";
                    } else if (v.includes("_t.png", 0) === true){
                        linktext = "Trend (PNG)";
                    } else if (v.includes(".pdf", 0) === true){
                        linktext = "Short Duration Rainfall Intensity−Duration−Frequency Data (PDF)";
                    } else if (v.includes(".png", 0) === true){
                        linktext = "Short Duration Rainfall Intensity−Duration−Frequency Data (PNG)";
                    }

                    $('.idfBody').append('<li><a href="' + v + '" target="_BLANK">' + linktext + '</a></li>');
                });
            });
        };

    var gridLayer = L.vectorGrid.protobuf(hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf", {

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
                    color: '#FFF',
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
    }).on('click', function (e) {

        if (highlightGridFeature) {
            gridLayer.resetFeatureStyle(highlightGridFeature);
        }
        highlightGridFeature = e.layer.properties.gid;
        gridLayer.setFeatureStyle(highlightGridFeature, {
            weight: 1,
            color: '#FFF',
            opacity: 1,
            fill: true,
            radius: 4,
            fillOpacity: 0
        });

        if (highlightGridFeatureRightLayer) {
            gridLayerRight.resetFeatureStyle(highlightGridFeatureRightLayer);
        }

        highlightGridFeatureRightLayer = e.layer.properties.gid;
        gridLayerRight.setFeatureStyle(highlightGridFeatureRightLayer, {
            weight: 1,
            color: '#FFF',
            opacity: 1,
            fill: true,
            radius: 4,
            fillOpacity: 0
        });

        $("#chartSidebar").modal("show");

        var_value = $("#var").val();
        mora_value = $("#mora").val();

        genChart(e.latlng.lat, e.latlng.lng, var_value, mora_value);

        L.DomEvent.stop(e);
    }).on('mouseover', function (e) {
        e.layer.bindTooltip(e.layer.properties.gid.toString() + " acres").openTooltip(e.latlng);
        if (highlightGridFeature) {
            gridLayer.resetFeatureStyle(highlightGridFeature);
        }
        highlightGridFeature = e.layer.properties.gid;
        gridLayer.setFeatureStyle(highlightGridFeature, {
            weight: 0,
            color: '#FFF',
            opacity: 1,
            fillColor: '#FFF',
            fill: true,
            fillOpacity: 0.25
        });
    }).addTo(map1);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        pane: 'labels'
    }).addTo(map1);

    // add default raster
    leftLayer = L.tileLayer.wms(hosturl + '/geoserver/ows?', {
        format: 'image/png',
        opacity: 1,
        transparent: true,
        pane: 'raster',
        VERSION: '1.3.0',
        layers: 'CDC:tx_max-ys-rcp26-p50-ann-10year'
    }).addTo(map1);

    // the code to use the cache if necessary
    //leftLayer = L.tileLayer.wms(hosturl + '/geoserver/gwc/service/tms/1.0.0/CDC:tx_max-ys-rcp26-p50-10year@EPSG:900913@png/{z}/{x}/{-y}.png', wmsOptions).addTo(map1);

    leftLayer.setOpacity(10);

    $("#map1").height(($(window).height()) - 56).width($(window).width());
    map1.invalidateSize();

    bounds = map1.getBounds().toBBoxString();

    mapRight = L.map("mapRight", {
        maxZoom: 12,
        minZoom: 3
    }).setView([62.501690, -98.567253], 4);


    mapRight.createPane('basemap');
    mapRight.getPane('basemap').style.zIndex = 399;
    mapRight.getPane('basemap').style.pointerEvents = 'none';

    mapRight.createPane('labels');
    mapRight.getPane('labels').style.zIndex = 402;
    mapRight.getPane('labels').style.pointerEvents = 'none';

    mapRight.createPane('grid');
    mapRight.getPane('grid').style.zIndex = 403;
    mapRight.getPane('grid').style.pointerEvents = 'none';

    mapRight.createPane('raster');
    mapRight.getPane('raster').style.zIndex = 400;
    mapRight.getPane('raster').style.pointerEvents = 'none';

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        pane: 'basemap',
        maxZoom: 12,
        minZoom: 3,
    }).addTo(mapRight);


    var clearGridHighlight = function () {
        if (highlight) {
            gridLayer.resetFeatureStyle(highlight);
        }
        highlight = null;
    };

    var gridLayerRight = L.vectorGrid.protobuf(hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf", {

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
                    color: '#000',
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
    }).on('click', function (e) {

        clearGridHighlight2();
        highlight2 = e.layer.properties.gid;
        gridLayerRight.setFeatureStyle(highlight2, {
            weight: 1,
            color: '#000',
            opacity: 1,
            fill: true,
            radius: 4,
            fillOpacity: 0
        });

        clearGridHighlight();
        highlight = e.layer.properties.gid;
        gridLayer.setFeatureStyle(highlight, {
            weight: 1,
            color: '#000',
            opacity: 1,
            fill: true,
            radius: 4,
            fillOpacity: 0
        });


        $("#chartSidebar").modal("show");

        var_value = $("#var").val();
        mora_value = $("#mora").val();

        genChart(e.latlng.lat, e.latlng.lng, var_value, mora_value);

        L.DomEvent.stop(e);
    }).addTo(mapRight);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        pane: 'labels'
    }).addTo(mapRight);


    var_value = $("#var").val();
    wmsOptions = {
        format: 'image/png',
        transparent: true,
        opacity: 1,
        pane: 'raster',
        'VERSION': '1.3.0',
        layers: 'CDC:tx_max-ys-rcp26-p50-ann-10year'
    };

    <?php
    $client_ip = $_SERVER['REMOTE_ADDR'];
    if ($client_ip === '72.137.170.138') { ?>
    rightLayer = L.tileLayer.wms(hosturl + '/geoserver/CDC/ows?', wmsOptions).addTo(mapRight);
    <?php } else { ?>
    rightLayer = L.tileLayer.wms(hosturl + '/geoserver/CDC/ows?', wmsOptions).addTo(mapRight);
    <?php } ?>
    $("#mapRight").height(($(window).height()) - 56).width($(window).width());
    mapRight.invalidateSize();
    $("#mapRightcontainer").hide();


    map1.sync(mapRight);
    mapRight.sync(map1);


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


        $.getJSON("variables.json").then(function (data) {

            console.log(variable);
            console.log(data[variable]);

            varDetails = data[variable];


            $.getJSON(
                'http://data.habitatseven.com/get_values.php?lat=' + lat + '&lon=' + lon + '&var=' + variable + '&month=' + month,
                function (data) {


                    seconds = (Date.now() - timerStart) * 0.001;
                    $('#loadtime').html(" <strong style=color:blue>Loaded in " + seconds + " seconds</strong>");


                    dLen = data.length;


                    for (var i = 0; i < data.length; i++) {

                        if (varDetails['units'] === 'kelvin') {
                            subtractValue = 273.5;
                            chartUnit = "°C";
                        } else {
                            subtractValue = 0;
                            chartUnit = varDetails['units'];
                        }

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
                            rangeHistSeries.push([Date.UTC(1950 + i, 0, 1), data[i][9], data[i][11]]);
                            midHistSeries.push([Date.UTC(1950 + i, 0, 1), data[i][10]]);
                        }
                        // had to add limiter since annual values spit out a null set at the end.
                        if (i > 55 && i < 150) {

                            range26Series.push([Date.UTC(1950 + i, 0, 1), data[i][0], data[i][2]]);
                            mid26Series.push([Date.UTC(1950 + i, 0, 1), data[i][1]]);
                            range45Series.push([Date.UTC(1950 + i, 0, 1), data[i][3], data[i][5]]);
                            mid45Series.push([Date.UTC(1950 + i, 0, 1), data[i][4]]);
                            range85Series.push([Date.UTC(1950 + i, 0, 1), data[i][6], data[i][8]]);
                            mid85Series.push([Date.UTC(1950 + i, 0, 1), data[i][7]]);
                        }
                    }


                    var chart = Highcharts.stockChart('container', {
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
                            type: 'datetime'
                        },

                        yAxis: {
                            title: {
                                text: varDetails['title']
                            }
                        },
                        legend: {
                            enabled: true
                        },

                        tooltip: {
                            crosshairs: true,
                            shared: true,
                            split: false,
                            valueSuffix: chartUnit
                        },
                        series: [{
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
                        }, {
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
                        }, {
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
                        }, {
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
                        }, {
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
                        }, {
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
                        }, {
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
                        }, {
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
                        }]
                    });
                }
            );

        });


    }

    function generateLeftLegend(layer, legendTitle) {

        console.log("left legend layer");
        console.log(layer);

        $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:" + layer + "&format=application/json")
            .then(function (data) {

                labels = [];
                leftLegend.onAdd = function (map1) {
                    let div = L.DomUtil.create('div', 'info legend legendTable');
                    let colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                    let unitValue;
                    let unitColor;

                    colormap = colormap.reverse();

                    labels.push('<div class="legendRow"><div class="legendTitle">' + legendTitle + '</div></div>');

                    for (let i = 0; i < colormap.length; i++) {
                        unitValue = colormap[i].label;
                        unitColor = colormap[i].color;
                        if (unitValue !== 'NaN') {
                            labels.push('<div class="legendRow">' +
                                '<div class="legendColor" style="background:' + unitColor + '"></div>' +
                                '<div class="legendUnit">&nbsp;' + unitValue + '</div>' +
                                '</div>');
                        }
                    }


                    div.innerHTML = labels.join('');
                    return div;

                };


                leftLegend.addTo(map1);

            })
            .fail(function (err) {
                console.log(err.responseText)
            });

    }

    function generateRightLegend(layer, legendTitle) {

        $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:" + layer + "&format=application/json")
            .then(function (data) {

                labels = [];
                rightLegend.onAdd = function (mapRight) {
                    let div = L.DomUtil.create('div', 'info legend legendTable');
                    let colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                    let unitValue;
                    let unitColor;

                    colormap = colormap.reverse();

                    labels.push('<div class="legendRow"><div class="legendTitle">' + legendTitle + '</div></div>');

                    for (let i = 0; i < colormap.length; i++) {
                        unitValue = colormap[i].label;
                        unitColor = colormap[i].color;
                        labels.push('<div class="legendRow">' +
                            '<div class="legendColor" style="background:' + unitColor + '"></div>' +
                            '<div class="legendUnit">&nbsp;' + unitValue + '</div>' +
                            '</div>');
                    }


                    div.innerHTML = labels.join('');
                    return div;

                };


                rightLegend.addTo(mapRight);

            })
            .fail(function (err) {
                console.log(err.responseText)
            });

    }

    generateLeftLegend('tx_max-ys-rcp26-p50-ann-10year', 'Annual');

    var $rs = $("#range-slider");

    $rs.ionRangeSlider({
        grid: true,
        skin: "round",
        from: 0,
        hide_min_max: true,
        prettify_enabled: false,
        values: [
            "1950's",
            "1960's",
            "1970's",
            "1980's",
            "1990's",
            "2000's",
            "2010's",
            "2020's",
            "2030's",
            "2040's",
            "2050's",
            "2060's",
            "2070's",
            "2080's",
            "2090's"
        ],

        onChange: function (data) {
            $('#decade').val(data.from_value).triggerHandler('change');
        },
    });

    var rs_instance = $("#range-slider").data("ionRangeSlider");


    $rs.on("finish", function (e) {
        e.stopPropagation();
        var $inp = $(this);
        var from = $inp.prop("value"); // reading input value
        //var from2 = $inp.data("from"); // reading input data-from attribute

    });

    $("#decade").change(function (e) {
        decade_value = $("#decade").val();
        if (e.isTrigger === 3) {
            rs_instance.update({
                from: e.target.selectedIndex //your new value
            });
        }
    });

    $(".select2").change(function (e) {
        var_value = $("#var").val();
        mora_value = $("#mora").val();
        mora_text_value = $("#mora option:selected").text();
        rcp_value = $("#rcp").val();
        decade_value = parseInt($("#decade").val());


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


        console.log("Single Layer: " + singleLayerName);
        console.log("Left Layer: " + leftLayerName);
        console.log("Right Layer: " + rightLayerName);
        console.log("Year: " + decade_value);

        if (rcp_value.indexOf("vs") !== -1) {

            $("#mapRightcontainer").show();
            $("#map1").height(($(window).height()) - 56).width($(window).width() / 2);
            $("#mapRight").height(($(window).height()) - 56).width($(window).width() / 2);

            leftLayer.setParams({
                format: 'image/png',
                transparent: true,
                opacity: 1,
                pane: 'raster',
                'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
                'VERSION': '1.3.0',
                layers: 'CDC:' + leftLayerName
            });


            generateLeftLegend(leftLayerName, mora_text_value);

            rightLayer.setParams({
                format: 'image/png',
                transparent: true,
                opacity: 1,
                pane: 'raster',
                'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
                'VERSION': '1.3.0',
                layers: 'CDC:' + rightLayerName
            });


            generateRightLegend(rightLayerName, mora_text_value);

        } else {
            $("#map1").height(($(window).height()) - 56).width($(window).width());
            $("#mapRight").height(($(window).height()) - 56).width(0);

            leftLayer.setParams({
                format: 'image/png',
                transparent: true,
                opacity: 1,
                'TIME': decade_value + '-01-00T00:00:00Z/' + (decade_value + 10) + '-01-01T00:00:00Z',
                'VERSION': '1.3.0',
                layers: 'CDC:' + singleLayerName
            });

            generateLeftLegend(leftLayerName, mora_text_value);
        }
    });

    $('.select2').select2({
        theme: "bootstrap4",
        minimumResultsForSearch: -1
    });

    function formatGeoSelect(item) {

        if (!item.id) {
            return item.text;
        }
        var $item = $(
            '<span><div class="geo-select-title">' + item.text + ' (' + item.term + ')</div>' + item.location + ', ' + item.province + '</sup></span>'
        );
        return $item;
    }

    $("#geo-select").select2({
        ajax: {
            url: "select-place.php",
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
        escapeMarkup: function (markup) {
            return markup;
        }, // let our custom formatter work
        minimumInputLength: 1,
        width: "300px",
        templateResult: formatGeoSelect,
        theme: "bootstrap4"
        //templateResult: formatRepo, // omitted for brevity, see the source of this page
        //templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
    });

    $('#geo-select').on('select2:select', function (e) {

        thislat = e.params.data.lat;
        thislon = e.params.data.lon;

        map1.setView([thislat, thislon], 11)
    });


    var slider = document.getElementById('opacity-slider');

    //        slider.addEventListener('input', sliderChange(this.value));


    })
    ;

    function sliderChange(value) {
        leftLayer.setOpacity(value / 100);
        rightLayer.setOpacity(value / 100);
    }

</script>

<script src="https://code.highcharts.com/stock/highstock.js"></script>
<script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
<script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
<script src="https://code.highcharts.com/stock/modules/export-data.js"></script>

<script src="//cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>

</body>
</html>
