<!DOCTYPE html>
<html>
<head>

    <?php

    $get_start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $get_end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';
    $get_selected_stations = isset($_GET['s']) ? $_GET['s'] : '';
    $get_format = isset($_GET['format']) ? $_GET['format'] : 'csv';
    $get_limit = isset($_GET['limit']) ? $_GET['limit'] : 150000;
    $get_offset = isset($_GET['offset']) ? $_GET['offset'] : 0;
    $get_generated = isset($_GET['generated']) ? $_GET['generated'] : '';

    if ($get_generated == 1 && !$get_selected_stations) {
        $station_error = '<span class="badge badge-danger">Please choose at least one station</span>';
    } else {
        $station_error = null;
    }

    $station_choice = implode(',', $get_selected_stations);
    $station_count = count($get_selected_stations);
    $station_choice_pipes = implode('|', $get_selected_stations);

    ?>

    <title>Sync Test</title>

    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./assets/css/bootstrap.css"/>
    <link rel="stylesheet" href="./assets/css/leaflet.css"/>
    <link rel="stylesheet" href="./assets/css/select2.min.css"/>
    <link rel="stylesheet" href="./assets/css/select2-bootstrap4.min.css"/>

    <script src="./assets/js/jquery.js"></script>
    <script src="./assets/js/select2.min.js"></script>
    <script src="./assets/js/leaflet.js"></script>

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/js/tempusdominus-bootstrap-4.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/css/tempusdominus-bootstrap-4.min.css"/>

    <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">

    <style>

        #map {
            width: 100%;
            height: 400px;
        }

        #station-select-container {
            position: absolute;
            margin: auto;
            top: 20px;
            left: 60px;
            background-color: white;
            border-radius: 5px;
            width: 100%;
            z-index: 1000;
        }

        .station-select-title {
            font-weight: bold;
        }

        .station-select-location {
            font-weight: bold;
        }

        .station-select-term {
            font-weight: bold;
        }

        .station-select-province {
            font-weight: bold;
        }

        .select2-container--bootstrap4.select2-container--focus .select2-selection {
            border-color: #ced4da;
            -webkit-box-shadow: none;
            box-shadow: none;
        }

    </style>

</head>
<body>
<?php
?>

<main role="main" class="container">

    <div id="map"></div>
    <br><br>
    <form action="./" method="get" name="download">
        <div class="form-group row">
            <label for="inputEmail3" class="col-sm-2 col-form-label">Stations</label>
            <div class="col-sm-10">
                <select class="custom-select custom-select-lg select2 form-control input-xlarge" name="s[]" multiple="multiple" id="station-select">
                    <option value="0" selected>Select a Station</option>

                    <?php
                    include 'db.php';
                    $query = "SELECT stn_id,station_name FROM stations";
                    $result = mysqli_query($con, $query) or die(mysqli_error($con) . "[" . $query . "]");
                    ?>

                    <?php
                    while ($row = mysqli_fetch_array($result)) {
                        echo '<option value="' . $row['stn_id'] . '">' . $row['station_name'] . '</option>';
                    }
                    ?>

                </select>
                <?= $station_error ?>
            </div>
        </div>
        <div class="form-group row">
            <label for="start_date" class="col-sm-2 col-form-label">Start Date</label>
            <div class="col-sm-2">

                <div class="form-group mb-0">
                    <div class="input-group date" id="start_date" data-target-input="nearest">
                        <input type="text" class="form-control datetimepicker-input" data-target="#start_date" name="start_date" data-toggle="datetimepicker" value="1840-03-01"/>
                        <div class="input-group-append" data-target="#start_date" data-toggle="datetimepicker">
                            <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="form-group row">
            <label for="end_date" class="col-sm-2 col-form-label">End Date</label>
            <div class="col-sm-2">

                <div class="form-group mb-0">
                    <div class="input-group date" id="end_date" data-target-input="nearest">
                        <input type="text" class="form-control datetimepicker-input" data-target="#end_date" name="end_date" data-toggle="datetimepicker" value="<? echo date("Y-m-d"); ?>"/>
                        <div class="input-group-append" data-target="#end_date" data-toggle="datetimepicker">
                            <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <? if ($get_generated == 1 && $station_error == null) { ?>
            <div class="form-group row">
                <label for="limit" class="col-sm-2 col-form-label">Record Limit</label>
                <div class="col-sm-2">
                    <input type="text" class="form-control" name="limit" id="limit" value="<?= $get_limit ?>" data-lpignore="true">
                </div>
            </div>

            <div class="form-group row">
                <label for="offset" class="col-sm-2 col-form-label">Offset</label>
                <div class="col-sm-2">
                    <input type="text" class="form-control" name="offset" id="offset" value="<?= $get_offset ?>" data-lpignore="true">
                </div>
            </div>
        <? } ?>
        <fieldset class="form-group">
            <div class="row">
                <legend class="col-form-label col-sm-2 pt-0">Download Format</legend>
                <div class="col-sm-10">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="format" id="csvFormat" value="csv"<? if ($get_format == 'csv') {
                            echo " checked";
                        } ?>> <label class="form-check-label" for="csvFormat"> CSV </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="format" id="geoFormat" value="geojson"<? if ($get_format == 'geojson') {
                            echo " checked";
                        } ?>> <label class="form-check-label" for="geoFormat"> GeoJSON </label>
                    </div>
                </div>
            </div>
        </fieldset>
        <div class="form-group row">
            <div class="col-sm-10 offset-2">
                <button type="submit" name="generated" value="1" class="btn btn-primary">Generate Links</button>
                <? if ($get_generated == 1 && $station_error == null) { ?>

                    <a href="./" class="btn btn-info">Restart</a>
                <? } ?>
            </div>
        </div>

        <? if ($get_generated == 1 && $station_error == null) { ?>
            <div class="form-group row" id="generated_container">
                <div class="col-sm-10 offset-2">
                    <h3>Generated Link</h3>
                    <div class="card card-body bg-light">

                        <a href="https://geo.weather.gc.ca/geomet/features/collections/climate-daily/items?time=<?= $get_start_date ?> 00:00:00/<?= $get_end_date ?> 00:00:00&STN_ID=<?= $station_choice_pipes ?>&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE<? if ($get_format == 'csv')
                            echo "&f=csv"; ?>&limit=<?= $get_limit ?>&offset=<?= $get_offset ?>" target="_blank">Click here to <? if ($get_format == 'csv') {
                                echo "download";
                            } else {
                                echo "view";
                            } ?> a <?= $get_format ?> of <?= $station_count ?> selected station<? if ($station_count > 1)
                                echo "s"; ?></a>
                        <hr>
                        <strong>Actual Link:</strong> <a href="https://geo.weather.gc.ca/geomet/features/collections/climate-daily/items?time=<?= $get_start_date ?> 00:00:00/<?= $get_end_date ?> 00:00:00&STN_ID=<?= $station_choice_pipes ?>&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE<? if ($get_format == 'csv')
                            echo "&f=csv"; ?>&limit=<?= $get_limit ?>&offset=<?= $get_offset ?>" target="_blank">https://geo.weather.gc.ca/geomet/features/collections/climate-daily/items?time=<?= $get_start_date ?> 00:00:00/<?= $get_end_date ?> 00:00:00&STN_ID=<?= $station_choice_pipes ?>&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE<? if ($get_format == 'csv')
                                echo "&f=csv"; ?>&limit=<?= $get_limit ?>&offset=<?= $get_offset ?></a>

                    </div>
                </div>
            </div>
        <? } ?>
    </form>

</main><!-- /.container -->

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

        map.createPane('labels');
        map.getPane('labels').style.zIndex = 402;
        map.getPane('labels').style.pointerEvents = 'none';

        map.createPane('idf');
        map.getPane('idf').style.zIndex = 600;
        map.getPane('idf').style.pointerEvents = 'all';

        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap',
            maxZoom: 12
        }).addTo(map);

        map.setView([52.501690, -98.567253], 4);


        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
            pane: 'labels'
        }).addTo(map);


        $(function () {
            $('#start_date').datetimepicker({
                format: 'Y-MM-DD'
            });


            $('#end_date').datetimepicker({
                format: 'Y-MM-DD'
            });
        });

        $('.select2').select2({
            theme: "bootstrap4",
            minimumResultsForSearch: -1
        });

        function formatGeoSelect(item) {


            var $item = $(
                '<span><div class="station-select-title">' + item.id + ' (' + item.text + ')</div></span>'
            );
            return $item;
        }

        $("#station-select").select2({
            ajax: {
                url: "search.php",
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
            placeholder: 'select station(s)'
        });


        $('#station-select').val([<?=$station_choice?>]).trigger('change');


        var markerMap = [];
        var pointsLayer;

        $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-stations/items?limit=10000', function (data) {


            pointsLayer = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {


                    var existingData = $("#station-select").select2("val");


                    if (existingData.includes(feature.ID.toString())) {
                        markerColor = '#F00'
                    } else {
                        markerColor = '#BBB';
                    }
                    var marker = L.circleMarker(latlng, {
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
                    markerMap[feature.id] = marker;
                    return marker;


                }
            }).on('mouseover', function (e) {
                e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME + ' ' + e.layer.feature.properties.STN_ID).openTooltip(e.latlng);
            }).on('click', function (e) {

                var existingData = $("#station-select").select2("val");

                console.log(existingData);


                if (existingData.includes(e.layer.feature.ID.toString())) {
                    console.log('exists');

                    var $select = $('#station-select');
                    var idToRemove = e.layer.feature.ID.toString();

                    index = existingData.indexOf(idToRemove);
                    if (index > -1) {
                        existingData.splice(index, 1);
                        console.log('spliced!');
                    }

                    console.log(existingData);

                    //$("#station-select").select2("val", existingData);

                    $('#station-select').val(existingData).change();

                    markerColor = '#BBB'
                } else {
                    console.log('NOT EXISTS');


                    var existingData = $("#station-select").select2("val");
                    existingData.push(e.layer.feature.properties.STN_ID.toString());
                    $('#station-select').val(existingData).change();

                    markerColor = '#F00';
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



            }).addTo(map);
        });

        // trigger when a tag is removed from multiple station selector input
        $('#station-select').on('select2:unselect', function (e) {
            marker_id = parseFloat(e.params.data.id);
            pointsLayer.eachLayer(function (layer) {
                console.log(layer);
                if (layer.feature.ID === marker_id) {
                    layer.setStyle({
                        // Stroke properties
                        color: '#BBB',
                        opacity: 1,
                        weight: 2,
                        pane: 'idf',
                        // Fill properties
                        fillColor: '#BBB',
                        fillOpacity: 1,
                        radius: 5
                    })
                }
            });
        });

        $("form :input").change(function() {
            $('#generated_container').hide();
        });


        // trigger when a tag is added to multiple station selector input
        $('#station-select').on('select2:select', function (e) {
            marker_id = parseInt(e.params.data.id);
            pointsLayer.eachLayer(function (layer) {
                console.log(layer);
                if (layer.feature.ID === marker_id) {
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

    });

</script>

<script src="//cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>

</body>
</html>
