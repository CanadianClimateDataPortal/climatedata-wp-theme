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

    <script src="health-sectors.js"></script>

    <style>
        html, body {
            padding: 0;
            margin: 0;
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
            <select class="custom-select custom-select-md select2 form-control input-large vartimercp" name="var" id="var">
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
            <select class="custom-select custom-select-lg select2 form-control input-xlarge vartimercp" name="mora" id="mora">

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

            <select class="custom-select custom-select-lg select2 form-control input-xlarge vartimercp" name="rcp" id="rcp">
                <option value="rcp26">RCP 2.6</option>
                <option value="rcp45">RCP 4.5</option>
                <option value="rcp85">RCP 8.5</option>
            </select>

            <select class="custom-select custom-select-lg select2 form-control input-xlarge hidden" name="decade" id="decade" style="display: none!important">
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

        </form>
    </div>
</nav>

<div id="map" style="margin-top:56px;margin-bottom:-56px"></div>

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

            var map = L.map("map", {
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


            map.createPane('basemap');
            map.getPane('basemap').style.zIndex = 399;
            map.getPane('basemap').style.pointerEvents = 'none';

            map.createPane('raster');
            map.getPane('raster').style.zIndex = 400;
            map.getPane('raster').style.pointerEvents = 'none';

            map.createPane('grid');
            map.getPane('grid').style.zIndex = 500;
            map.getPane('grid').style.pointerEvents = 'all';

            map.createPane('labels');
            map.getPane('labels').style.zIndex = 402;
            map.getPane('labels').style.pointerEvents = 'none';


            L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                pane: 'basemap',
                maxZoom: 12
            }).addTo(map);


            var legend = L.control({position: 'bottomright'});

            var highlightGridFeature;
            var highlightGridFeatureRightLayer;


            map.setView([62.501690, -98.567253], 2);


            var choroValues = [];

            function getColor(d, colormap) {

                for (let i = 0; i < colormap.length; i++) {
                    unitValue = parseInt(colormap[i].quantity);
                    unitColor = colormap[i].color;
                    if (d > unitValue) {
                        return unitColor
                    }
                }
            }


            generateLegend('tx_max-ys-rcp26-p50-ann-10year', 'Annual');

            function genChoro(year, variable, rcp, frequency, colormap) {

                if (frequency === 'ann') {
                    choroPath = "annual_choro_values.php?var=" + variable + "&rcp=" + rcp
                } else {
                    choroPath = "monthly_choro_values.php?month=" + frequency + "&var=" + variable + "&rcp=" + rcp
                }


                $.getJSON("variables.json").then(function (data) {
                    varDetails = data[variable];

                    // if the unit = kelvin in variables.json - convert to celcius
                    if (varDetails['units'] === 'kelvin') {
                        subtractValue = 273.15;
                        chartUnit = "°C";
                    } else {
                        subtractValue = 0;
                        chartUnit = varDetails['units'];
                    }


                    $.getJSON(choroPath).then(function (data) {
                        choroValues = data;

                        console.log("choroValues");
                        console.log(choroValues);


                        choroLayer = L.geoJSON(healthSectorsGeoJson, {
                            smoothFactor: 0,
                            name: 'geojson',
                            onEachFeature: function (feature, layer) {

                                layer.setStyle({
                                    fillColor: getColor(choroValues[year][parseInt(feature.properties.PR_HRUID)], colormap),
                                    weight: 0.5,
                                    opacity: 1,
                                    color: 'white',
                                    dashArray: '3',
                                    fillOpacity: 1
                                });
                                layer.on('mouseover', function () {

                                    tooltipValue = choroValues[year][parseInt(this.feature.properties.PR_HRUID)];
                                    fixedTooltipValue = (tooltipValue - subtractValue).toFixed(varDetails['decimals']) + "" + chartUnit;
                                    this.setStyle({
                                        fillColor: getColor(choroValues[year][parseInt(this.feature.properties.PR_HRUID)], colormap),
                                        weight: 2,
                                        opacity: 1,
                                        color: 'white',
                                        dashArray: '1',
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
                                        dashArray: '3',
                                        fillOpacity: 1
                                    });
                                });
                                layer.on('click', function (e) {

                                    hruid = parseInt(feature.properties.PR_HRUID);

                                    $("#chartSidebar").modal("show");

                                    var_value = $("#var").val();
                                    mora_value = $("#mora").val();

                                    genChart(hruid, var_value, mora_value);


                                });
                            }
                        }).addTo(map);
                    });
                });
            }

            function genChartData(variable, rcp) {
                $.getJSON("annual_choro_values.php?var=" + variable + "&rcp=" + rcp).then(function (data) {
                    return data;
                });
            }

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
                pane: 'labels'
            }).addTo(map);

            $("#map").height(($(window).height()) - 56).width($(window).width());
            map.invalidateSize();

            bounds = map.getBounds().toBBoxString();


            var_value = $("#var").val();


            function genChart(hruid, variable, month) {
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


                $.getJSON("variables.json").then(function (data) {


                    varDetails = data[variable];

                    if (month === 'ann') {
                        valuePath = "generateAnnualChartData.php?hruid=" + hruid + "&" + variable
                    } else {
                        valuePath = "generateMonthlyChartData.php?hruid=" + hruid + "&var=" + variable + "&month=" + month
                    }


                    $.getJSON(valuePath + "&rcp=rcp26").then(function (data) {
                        console.log('rcp 2.6 data');

                        // if the unit = kelvin in variables.json - convert to celcius
                        if (varDetails['units'] === 'kelvin') {
                            subtractValue = 273.15;
                            chartUnit = "°C";
                        } else {
                            subtractValue = 0;
                            chartUnit = varDetails['units'];
                        }

                        console.log(data);

                        for (var key in data) {
                            year = parseInt(key);
                            dateObj = Date.UTC(year, 0, 1);
                            chartData['rcp26'][year] = data[year][hruid];

                            if (key > 2000) {
                                range26Series.push([dateObj, parseFloat(chartData['rcp26'][year]['p10'] - subtractValue), parseFloat(chartData['rcp26'][year]['p90'] - subtractValue)]);
                                mid26Series.push([dateObj, parseFloat(chartData['rcp26'][year]['p50'] - subtractValue)]);
                            }


                            if (key <= 2010) {
                                rangeHistSeries.push([dateObj, parseFloat(chartData['rcp26'][year]['p10'] - subtractValue), parseFloat(chartData['rcp26'][year]['p90'] - subtractValue)]);
                                midHistSeries.push([dateObj, parseFloat(chartData['rcp26'][year]['p50'] - subtractValue)]);
                            }
                        }

                        chartDecimals = varDetails['decimals'];

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
                            series: []
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
                                    if (key > 2000) {
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
                    });
                });
            };


            function generateLegend(layer, legendTitle) {

                <?php if ($client_ip === '72.137.170.138') { ?>
                hosturl = "http://192.168.0.52:8080";
                <?php } else { ?>
                hosturl = "http://geoserver.habitatseven.com:8080";
                <?php } ?>


                $.getJSON(hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:" + layer + "&format=application/json")
                    .then(function (data) {

                        labels = [];
                        legend.onAdd = function (map) {
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


                        legend.addTo(map);

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

                    choroLayer.eachLayer(function (layer) {
                        decade_value = parseInt($("#decade").val());
                        hruid = parseInt(layer.feature.properties.PR_HRUID);
                        thisValue = choroValues[decade_value][hruid];

                        layer.setStyle({
                            fillColor: getColor(thisValue, colormap),
                            weight: 0.5,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 1
                        });


                        layer.on('mouseover', function () {
                            hruid = parseInt(this.feature.properties.PR_HRUID);
                            tooltipValue = choroValues[decade_value][hruid];

                            fixedTooltipValue = (tooltipValue - subtractValue).toFixed(varDetails['decimals']) + "" + chartUnit;




                            layer.setStyle({
                                fillColor: getColor(tooltipValue, colormap),
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                dashArray: '1',
                                fillOpacity: 1
                            });

                            layer.setTooltipContent(layer.feature.properties.ENG_LABEL, {sticky: true}).openTooltip(layer.latlng);

                        });
                        layer.on('mouseout', function () {

                            hruid = parseInt(this.feature.properties.PR_HRUID);
                            layer.setStyle({
                                fillColor: getColor(choroValues[decade_value][hruid], colormap),
                                weight: 0.5,
                                opacity: 1,
                                color: 'white',
                                dashArray: '3',
                                fillOpacity: 1
                            });
                        });


                    });


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


                if (var_value === 'heat_wave_max_length_Tmin20_Tmax30') {
                    if ($("#mora").val() !== 'ann') {
                        $("#mora").val('ann').trigger('change.select2');
                        mora_value = 'ann';
                    }
                }

                if (var_value === 'heat_wave_frequency_Tmin20_Tmax30') {
                    if ($("#mora").val() !== 'ann') {
                        $("#mora").val('ann').trigger('change.select2');
                        mora_value = 'ann';
                    }
                }


                if (mora_value === 'ann') {
                    msorys = 'ys';
                    msorysmonth = '-ann';
                } else {
                    msorys = 'ms';
                    msorysmonth = '-' + mora_value;
                }

                singleLayerName = var_value + '-' + msorys + '-' + rcp_value + '-p50' + msorysmonth + '-10year';

                $("#map").height(($(window).height()) - 56).width($(window).width());


            });

            $(".vartimercp").change(function (e) {
                var_value = $("#var").val();
                mora_value = $("#mora").val();
                mora_text_value = $("#mora option:selected").text();
                rcp_value = $("#rcp").val();
                decade_value = parseInt($("#decade").val());


                if (var_value === 'heat_wave_max_length_Tmin20_Tmax30') {
                    if ($("#mora").val() !== 'ann') {
                        $("#mora").val('ann').trigger('change.select2');
                        mora_value = 'ann';
                    }
                }

                if (var_value === 'heat_wave_frequency_Tmin20_Tmax30') {
                    if ($("#mora").val() !== 'ann') {
                        $("#mora").val('ann').trigger('change.select2');
                        mora_value = 'ann';
                    }
                }


                if (mora_value === 'ann') {
                    msorys = 'ys';
                    msorysmonth = '-ann';
                } else {
                    msorys = 'ms';
                    msorysmonth = '-' + mora_value;
                }

                singleLayerName = var_value + '-' + msorys + '-' + rcp_value + '-p50' + msorysmonth + '-10year';

                $("#map").height(($(window).height()) - 56).width($(window).width());


                generateLegend(singleLayerName, '')

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
            });

            $('#geo-select').on('select2:select', function (e) {

                thislat = e.params.data.lat;
                thislon = e.params.data.lon;

                map.setView([thislat, thislon], 11)
            });


        }
    )
    ;

</script>

<script src="https://code.highcharts.com/stock/highstock.js"></script>
<script src="https://code.highcharts.com/stock/highcharts-more.js"></script>
<script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
<script src="https://code.highcharts.com/stock/modules/export-data.js"></script>

<script src="//cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>

</body>
</html>
