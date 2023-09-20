//
// CONSTANTS
//

const k_to_c = 273.15;
const data_url = DATA_URL;
const geoserver_url = DATA_URL;
const XML_HTTP_REQUEST_DONE_STATE = 4;

//
// GLOBAL VARS
//

var chart_labels, legend_labels, l10n_labels;

var l10n_table = {
    "fr": {
        'All models': 'Tous les modèles',
        '{0} Median': '{0} médiane',
        '{0} Range': '{0} portée',
        "No data available for selected location": "Pas de données disponibles pour l'emplacement sélectionné",
        "No data available for this area.": "Pas de données disponibles pour cette zone.",

        'Search communities': 'Recherche par ville',
        'Begin typing city name': 'Commencer à saisir le nom d\'une ville',
        'Search coordinates': 'Recherche par coordonnées',
        'Enter latitude & longitude e.g.': 'Saisir la latitude et la longitude, par ex.',
        'Coordinates detected': 'Coordonnées détectées',
        'Set map view': 'Définir l\'affichage de la carte',
        'Ready to process.': 'Prêt à traiter.',
        'Choose at least one weather station. ': 'Sélectionner au moins une station.',

        // share widget
        "Copied to clipboard": "Copié dans le presse-papier",
        "Error" : "Erreur",
        "Copy link": "Copier le lien",
        
        //  feedback form
        'Thanks! We’ve received your inquiry.' : 'Merci! Nous avons reçu votre demande.',
        'We are currently experiencing a higher than normal number of inquiries to our Support Desk. We will do our best to reply to you as soon as possible, but please be advised that there may be delays.' : 'Le nombre de demandes adressées à notre Centre d’aide est actuellement supérieur à la normale. Nous ferons de notre mieux pour vous répondre dès que possible, mais sachez qu’il peut y avoir des délais.',
        'Thank you for your patience,' : 'Nous vous remercions de votre patience,',
        'The Support Desk' : 'Le Centre d’aide',
        'Sorry, an error occurred while sending your feedback. Please try again later.' : 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        
        "With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}":
            "Avec les paramètres actuels de fréquence et de format de donnée, le nombre maximal de points de grille par requête est de {0}",
        "Around {0} grid boxes selected" : "Environ {0} points de grille sélectionnés",
        
        // news
        
        "All topics" : "Tous les sujets",
        "Close": "Fermer"
    }
};

const grid_resolution = {
    "canadagrid": 1.0/12.0,
    "canadagrid1deg": 1.0,
    "slrgrid": 1.0/10.0,
    "era5landgrid": 1.0/10.0,
};

const DATASETS = {
    "cmip5": {
        'scenarios': [
            {
                'name': 'rcp26', 'label': 'RCP 2.6', 'chart_color': '#00F',
                'correlations': {
                    'cmip6': 'ssp126'
                }
            },
            {
                'name': 'rcp45', 'label': 'RCP 4.5', 'chart_color': '#00640c',
                'correlations': {
                    'cmip6': 'ssp245'
                }
            },
            {
                'name': 'rcp85', 'label': 'RCP 8.5', 'chart_color': '#F00',
                'correlations': {
                    'cmip6': 'ssp585'
                }
            },
        ],
        'grid': 'canadagrid',
        'finch_name' : 'candcs-u5',
        'model_lists': [
            {'name': 'pcic12', 'label': 'PCIC12 (Ensemble)'},
            {'name': '24models', 'label': 'All models'}]
    },
    "cmip6": {
        'scenarios': [
            {
                'name': 'ssp126', 'label': 'SSP1-2.6', 'chart_color': '#00F',
                'correlations': {
                    'cmip5': 'rcp26'
                }
            },
            {
                'name': 'ssp245', 'label': 'SSP2-4.5', 'chart_color': '#00640c',
                'correlations': {
                    'cmip5': 'rcp45'
                }
            },
            {
                'name': 'ssp585', 'label': 'SSP5-8.5', 'chart_color': '#F00',
                'correlations': {
                    'cmip5': 'rcp85'
                }
            },
        ],
        'grid': 'canadagrid',
        'finch_name' : 'candcs-u6',
        'model_lists': [
            {'name': '26models', 'label': 'All models'}]
    },
    "humidex": {
        'scenarios': [
            {
                'name': 'ssp126', 'label': 'SSP1-2.6', 'chart_color': '#00F'
            },
            {
                'name': 'ssp245', 'label': 'SSP2-4.5', 'chart_color': '#00640c'
            },
            {
                'name': 'ssp585', 'label': 'SSP5-8.5', 'chart_color': '#F00'
            },
        ],
        'grid': 'era5landgrid',
        'finch_name': 'humidex-daily',
        'model_lists': [
            {'name': 'humidex_models', 'label': 'All models'}]
    }
}

const variableDownloadDataTypes = {
    // Variable_Download-Data_*
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

const frMonthDict = {
    'jan': 'Janvier',
    'feb': 'Février',
    'mar': 'Mars',
    'apr': 'Avril',
    'may': 'Mai',
    'jun': 'Juin',
    'jul': 'Juillet',
    'aug': 'Août',
    'sep': 'Septembre',
    'oct': 'Octobre',
    'nov': 'Novembre',
    'dec': 'Décembre',
    'ann': 'Annuel'
};

const engMonthDict = {
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

function getRealMonthName(keySelected) {
    keySelected = keySelected.toLowerCase();
    var tempDict = engMonthDict;
    if ($('body').hasClass('lang-fr')) {
        tempDict = frMonthDict;
    }

    var realMonthName = "undefined";
    if (keySelected in tempDict) {
        realMonthName = tempDict[keySelected]
    }
    return realMonthName;
}


//
// GLOBAL Functions
//

/**
 * Format the n-th day value to localized text on a non-leap year (ex: 156 -> June 9)
 * @param value Day of the Year (starting with 0 for Jan 1st)
 * @returns {string} The formatted value
 */
function doy_formatter(value) {
    const firstDayOfYear = Date.UTC(2019, 0, 1);
    return new Date(firstDayOfYear + 1000 * 60 * 60 * 24 * value).toLocaleDateString(current_lang, {
        month: 'long',
        day: 'numeric'
    })
}

/**
 * Format numerical value according to supplied parameters
 * @param value Number to format
 * @param varDetails Variable details object provided by Wordpress
 * @param delta If true, the value is formatted as a delta
 * @returns {string} The formatted value
 */
function value_formatter(value, varDetails, delta) {
    let unit = varDetails.units.value === 'kelvin' ? "°C" : varDetails.units.label;
    if (unit === undefined) {
        unit ="";
    }
    let str = "";
    if (delta && value > 0) {
        str += "+"
    }

    switch( varDetails.units.value) {
        case "doy":
            if (delta) {
                str += value.toFixed(varDetails.decimals);
                str += " " + l10n_labels['days'];
            } else {
                str += doy_formatter(value);
            }

            break;
        default:
            str += value.toFixed(varDetails.decimals);
            str += " " + unit;
            break;
    }
    return unit_localize(str);
}

/**
 * Localize variable units to French if necessary
 * @param str String to localize
 */
function unit_localize(str) {
    if ($('body').hasClass('lang-fr')) {
        str = str.replace('Degree Days', 'Degrés-jours');
        str = str.replace('degree days', 'degrés-jours');
        str = str.replace('Days', 'Jours');
        str = str.replace('days', 'jours');
        str = str.replace(' to ', ' à ');
        str = str.replace('Climate Zone', 'Zone climatique');
    }

    return str;
}

/**
 * Allow usage of string formatting  e.g. "Hello {0}!".format("world") => "Hello world!"
 * @returns {string}
 */
String.prototype.format = function () {
    // store arguments in an array
    var args = arguments;
    // use replace to iterate over the string
    // select the match and check if related argument is present
    // if yes, replace the match with the argument
    return this.replace(/{([0-9]+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == 'undefined' ? match : args[index];
    });
};

/**
 * Perform a string lookup in l10n_table in current language, returns it if found, otherwise return the original string
 * @param str String to lookup for
 * @returns {string} The localized string
 */
function T(str) {
    if (typeof  l10n_table[current_lang] == 'undefined'){
        return str;
    }
    if (typeof l10n_table[current_lang][str] == 'undefined') {
        console.warn("Missing translation in language " + current_lang + ": " + str);
        return str;
    } else {
        return l10n_table[current_lang][str];
    }
}


function hashCode(s) {
    return s.split("").reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function encodeURL(url, salt) {
    let hash = hashCode(url + salt );
    let encoded = encodeURIComponent(btoa(url + '|' + hash));
    return {
        'encoded': encoded,
        'hash': hash
    };
}


function getGA4EventNameForVariableDownloadData(chartDataFormat, keySelected) {
    let gA4EventNameForVariableDownloadData = "";
    keySelected = keySelected.toLowerCase();
    try {
        if (variableDownloadDataTypes[keySelected]) {
            let eventType = '';
            if (chartDataFormat.includes('csv')) {
                eventType = "Variable_Download-Data_";
            } else if (chartDataFormat.includes('pdf') || chartDataFormat.includes('png')) {
                eventType = "Variable_Download-Image_";
            } else {
                throw ('Invalid GA4 event file format (csv, pdf, png): ' + chartDataFormat);
            }
            gA4EventNameForVariableDownloadData = eventType + variableDownloadDataTypes[keySelected];
        } else {
            throw ('Invalid GA4 event name (Variable_Download-Data_*): ' + keySelected);
        }
    } catch (err) {
        console.error(err);
    }

    return gA4EventNameForVariableDownloadData;
}

function setDataLayerForChartData(chartDataFormat, chartData, query) {
    if (!chartDataFormat.length) {
        return;
    }
    let eventName = getGA4EventNameForVariableDownloadData(chartDataFormat, query['var']);
    let overlayTitle = $('.overlay-title').text();

    let addStr = "";
    for (let index = 0; index < chartData.series.length; index++) {
        if (chartData.series[index].visible && chartData.series[index].type != 'areaspline') {
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
        'chart_data_dataset': query.dataset,
        'chart_data_format': chartDataFormat,
        'chart_data_view_by': variableDownloadDataVewBy
    });
}

function formatDecade(timestampMilliseconds, period){
    let year = new Date(timestampMilliseconds).getFullYear();
    let decade = year - year % 10 + 1;
    if (decade > 2071) {
        decade = 2071;
    }
    if (decade < 1951) {
        decade = 1951;
    }
    return [decade, Date.UTC(decade, month_number_lut[period] - 1, 1)];

}

function displayChartData(data, varDetails, download_url, query, container) {
    let chartUnit = varDetails.units.value === 'kelvin' ? "°C" : varDetails.units.label;
    let chartDecimals = varDetails['decimals'];
    let scenarios = DATASETS[query['dataset']].scenarios;
    let pointFormatter, labelFormatter;
    let parentPlaceholder = $(container).parents('.var-chart-container, .overlay-content');

    switch (varDetails.units.value) {
        case 'doy':
            labelFormatter = function () { return doy_formatter(this.value) };
            pointFormatter = function (format) {
                if (this.series.type == 'line') {
                    return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
                        + doy_formatter(this.y)
                        + '</b><br/>';
                } else {
                    return '<span style="color:' + this.series.color + '">●</span>' + this.series.name + ': <b>'
                        + doy_formatter(this.low)
                        + '</b> - <b>'
                        + doy_formatter(this.high)
                        + '</b><br/>';
                }
            };
            break;
        default:
            labelFormatter = function () { return this.axis.defaultLabelFormatter.call(this) + ' ' + chartUnit; };
            pointFormatter = undefined;
    }



    let chartSeries = [];
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
    scenarios.forEach(function (scenario) {
        if (data['{0}_median'.format(scenario.name)].length > 0)
            chartSeries.push({
                name: T('{0} Median').format(scenario.label),
                data: data['{0}_median'.format(scenario.name)],
                zIndex: 1,
                showInNavigator: true,
                color: scenario.chart_color,
                marker: {
                    fillColor: scenario.chart_color,
                    lineWidth: 0,
                    radius: 0,
                    lineColor: scenario.chart_color
                }
            });
        if (data['{0}_range'.format(scenario.name)].length > 0)
            chartSeries.push({
                name: T('{0} Range').format(scenario.label),
                data: data['{0}_range'.format(scenario.name)],
                type: 'arearange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: scenario.chart_color,
                fillOpacity: 0.2,
                zIndex: 0,
                marker: {
                    radius: 0,
                    enabled: false
                }
            });
    });
    if (chartSeries.length == 0) {
        container.innerHTML = '<span class="text-primary text-center"><h1>' +
            T('No data available for selected location') + '</h1></span>';
    } else {
        let chart = Highcharts.stockChart(container, {
            chart: {
                numberFormatter: function (num) {
                    return Highcharts.numberFormat(num, chartDecimals);
                }
            },

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
                    formatter: labelFormatter
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

        chart.query = $.extend(true, {}, query);  // creates a deep copy of the object to avoid side-effects

        if (query.building_climate_zones) {
            const colorTransparency = 0.30;
            
            chart.update({
                yAxis: {
                    gridLineWidth: 0
                }
            });
            chart.yAxis[0].addPlotBand({from:2000, to:2999, color:'rgba(201, 0, 0, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 4")}});
            chart.yAxis[0].addPlotBand({from:3000, to:3999, color:'rgba(250, 238, 2, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 5")}});
            chart.yAxis[0].addPlotBand({from:4000, to:4999, color:'rgba(0, 201, 54, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 6")}});
            chart.yAxis[0].addPlotBand({from:5000, to:5999, color:'rgba(0, 131, 201, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 7A")}});
            chart.yAxis[0].addPlotBand({from:6000, to:6999, color:'rgba(20, 0, 201, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 7B")}});
            chart.yAxis[0].addPlotBand({from:7000, to:99999, color:'rgba(127, 0, 201, ' + colorTransparency.toString() + ')', label:{text: unit_localize("Climate Zone 8")}});
        }

        chart.download_url = download_url;
        chart.varDetails = varDetails;

        parentPlaceholder.find('.chart-option').on('change', function() {
            if ($(this).prop('checked') == true) {

                let chart = $(this).parents('.var-chart-container, .overlay-content').find('.var-chart').highcharts();

                switch ($(this).attr('value')) {
                    case 'annual':
                        chart.update({
                            tooltip: {
                                formatter: function (tooltip) {
                                    let r = tooltip.defaultFormatter.call(this, tooltip);
                                    return r;
                                }

                            },
                            plotOptions: {
                                series: {
                                    states: {
                                        hover: {
                                            enabled: true
                                        },
                                        inactive: {
                                            enabled: true
                                        }
                                    }
                                }
                            },
                        });
                        chart.xAxis[0].removePlotBand('30y-plot-band');
                        chart.xAxis[0].removePlotBand('delta-plot-band');

                        break;
                    case '30y':
                        chart.xAxis[0].removePlotBand('30y-plot-band');
                        chart.xAxis[0].removePlotBand('delta-plot-band');
                        chart.update({
                            xAxis: {
                                crosshair: false
                            },
                            plotOptions: {
                                series: {
                                    states: {
                                        hover: {
                                            enabled: false
                                        },
                                        inactive: {
                                            enabled: false
                                        }
                                    }
                                }
                            },
                            tooltip: {

                                formatter: function (tooltip) {

                                    let [decade, decade_ms] = formatDecade(this.x, query['mora']);
                                    chart.xAxis[0].removePlotBand('30y-plot-band');
                                    chart.xAxis[0].addPlotBand({
                                        from: Date.UTC(decade, 0, 1),
                                        to: Date.UTC(decade + 29, 11, 31),
                                        id: '30y-plot-band'
                                    });

                                    this.chart = tooltip.chart;
                                    this.axis = tooltip.chart.yAxis[0];
                                    let val1, val2;

                                    let tip = ["<span style=\"font-size: 10px\">" + decade + "-" + (decade + 29) + "</span><br/>"];

                                    if (decade_ms in data['30y_observations']) {
                                        this.value = data['30y_observations'][decade_ms][0];
                                        val1 = tooltip.chart.yAxis[0].labelFormatter.call(this);
                                        tip.push("<span style=\"color:#F47D23\">●</span> " + chart_labels.observation + " <b>"
                                            + val1 + "</b><br/>");
                                    }

                                    scenarios.forEach(function (scenario) {
                                        this.value = data['30y_{0}_median'.format(scenario.name)][decade_ms][0];
                                        val1 = tooltip.chart.yAxis[0].labelFormatter.call(this);
                                        tip.push("<span style=\"color:{0}\">●</span> ".format(scenario.chart_color) + T('{0} Median').format(scenario.label) + " <b>"
                                            + val1 + "</b><br/>");

                                        this.value = data['30y_{0}_range'.format(scenario.name)][decade_ms][0];
                                        val1 = tooltip.chart.yAxis[0].labelFormatter.call(this);
                                        this.value = data['30y_{0}_range'.format(scenario.name)][decade_ms][1];
                                        val2 = tooltip.chart.yAxis[0].labelFormatter.call(this);
                                        tip.push("<span style=\"color:{0}\">●</span> ".format(scenario.chart_color) + T('{0} Range').format(scenario.label) + " <b>"
                                            + val1 + "</b>-<b>" + val2 + "</b><br/>");
                                    }, this);

                                    return tip;
                                }
                            }
                        });
                        break;
                    case 'delta':
                        chart.xAxis[0].removePlotBand('30y-plot-band');
                        chart.xAxis[0].removePlotBand('delta-plot-band');
                        chart.xAxis[0].addPlotBand({
                            from: Date.UTC(1971, 0, 1),
                            to: Date.UTC(2000, 11, 31),
                            color: 'rgba(51,63,80,0.05)',
                            id: 'delta-plot-band'
                        });

                        chart.update({
                            xAxis: {
                                crosshair: false
                            },
                            plotOptions: {
                                series: {
                                    states: {
                                        hover: {
                                            enabled: false
                                        },
                                        inactive: {
                                            enabled: false
                                        }
                                    }
                                }
                            },
                            tooltip: {

                                formatter: function (tooltip) {

                                    let [decade, decade_ms] = formatDecade(this.x, query['mora']);
                                    chart.xAxis[0].removePlotBand('30y-plot-band');
                                    chart.xAxis[0].addPlotBand({
                                        from: Date.UTC(decade, 0, 1),
                                        to: Date.UTC(decade + 29, 11, 31),
                                        id: '30y-plot-band'
                                    });

                                    function numformat(num) {
                                        let str = "";
                                        if (num > 0) {
                                            str += "+"
                                        }
                                        str += Highcharts.numberFormat(num, chartDecimals);
                                        switch (chartUnit) {
                                            case "day of the year":
                                                str += " " + l10n_labels['days'];
                                                break;
                                            default:
                                                str += " " + chartUnit;
                                                break;
                                        }
                                        return str;
                                    }


                                    this.chart = tooltip.chart;
                                    this.axis = tooltip.chart.yAxis[0];
                                    let val1, val2;

                                    let tip = ["<span style=\"font-size: 10px\">" + decade + "-" + (decade + 29) + " " + chart_labels.change_from_1971_2000 + "</span><br/>"];

                                    scenarios.forEach(function (scenario) {
                                        val1 = numformat(data['delta7100_{0}_median'.format(scenario.name)][decade_ms][0]);
                                        tip.push("<span style=\"color:{0}\">●</span> ".format(scenario.chart_color) + T('{0} Median').format(scenario.label) + " <b>"
                                            + val1 + "</b><br/>");

                                        val1 = numformat(data['delta7100_{0}_range'.format(scenario.name)][decade_ms][0]);
                                        val2 = numformat(data['delta7100_{0}_range'.format(scenario.name)][decade_ms][1]);
                                        tip.push("<span style=\"color:{0}\">●</span> ".format(scenario.chart_color) + T('{0} Range').format(scenario.label) + " <b>"
                                            + val1 + "</b>-<b>" + val2 + "</b><br/>");
                                    }, this);

                                    return tip;
                                }
                            }
                        });
                        break;
                }

            } // if checked

        });

        if (query['delta'] == 'true') {
            // if delta: find the '30 year changes' radio and trigger click
            parentPlaceholder.find('.chart-option[value="delta"]').prop('checked', true).trigger('change');
        } else {
            // 30y averages is by default, so trigger the change event on load
            parentPlaceholder.find('.chart-option[value="30y"]').trigger('change');

        }
    }
}

/**
 * get IDF links for station_id and output HTML content to target
 * @param station_id ID of the IDF station
 * @param target jquery selector to output the resulting content
 * @param css_class CSS class to use for links
 */
function getIDFLinks(station_id, target, css_class) {
    $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/search_idfs.php?idf=' + station_id, function (data) {
        $(target).empty();
        $.each(data, function (k, v) {
            $(target).append('<li><a class="' + css_class + '" href="' + v.filename + '" target="_blank">' + v.label + '</a></li>');
        });
    });
};

(function ($) {

    $(function () {
        $.fn.validate_email = function (email_val) {
            var is_valid = false
            if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {
                if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {
                    if (email_val.indexOf('@') !== 0) {
                        var after_at = email_val.substring(email_val.indexOf('@'));

                        if (after_at.indexOf('.') !== -1) {
                            var after_dot = after_at.substring(after_at.indexOf('.'));

                            if (after_dot.length > 1) {
                                is_valid = true;
                            }
                        }
                    }
                }
            }

            return is_valid;
        }

        // form validation

        function check_email(email_val) {
            var is_valid = false;
            if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {
                if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {
                    if (email_val.indexOf('@') !== 0) {
                        var after_at = email_val.substring(email_val.indexOf('@'));
                        if (after_at.indexOf('.') !== -1) {
                            var after_dot = after_at.substring(after_at.indexOf('.'));
                            if (after_dot.length > 1) {
                                is_valid = true;
                            } else {
                                //console.log('no chars after .');
                            }
                        } else {
                            //console.log('no . after @');
                        }
                    } else {
                        //console.log('no chars before @');
                    }
                } else {
                    //console.log('doesn\'t contains @ and .');
                }
            } else {
                //console.log('blank');
            }
            return is_valid;
        }

        function check_training_dl_form(dl_form) {
            is_valid = true
            // checkboxes
            dl_form.find('input[type="checkbox"]').each(function () {
                if ($(this).prop('checked') != true) {
                    //           console.log($(this).attr('name') + ' not checked')
                    is_valid = false
                }
            })

            if (dl_form.find('#name').val() != '' || dl_form.find('#email').val() != '') {
                // name
                if (dl_form.find('#name').val() == '') {
                    is_valid = false
                }

                // email
                if (check_email(dl_form.find('#email').val()) != true) {
                    is_valid = false
                }

                // captcha
                if (dl_form.find('#terms-captcha_code').val() == '') {
                    is_valid = false
                }

            }

            //console.log('valid', is_valid)
            return is_valid
        }

        // overlay events

        $(document).on('overlay_hide', function () {

            console.log('overlay hide')
            $('#supermenu').supermenu('enable')

        });

        $(document).on('overlay_show', function () {

            $('#supermenu').supermenu('disable')

            if ($('.overlay').find('#download-terms-form').length) {

                var dl_form = $('.overlay').find('#download-terms-form'),
                    submit_btn = dl_form.find('#download-terms-submit'),
                    captcha = dl_form.find('#terms-captcha'),
                    form_response = dl_form.find('#download-terms-response')

                submit_btn.prop('disabled', true)

                dl_form.find(':input').on('input', function () {

                    if (check_training_dl_form(dl_form) == true) {
                        submit_btn.prop('disabled', false).removeClass('disabled')
                    } else {
                        submit_btn.prop('disabled', true).addClass('disabled')
                    }

                })

                submit_btn.click(function (e) {
                    e.preventDefault()

                    form_response.slideUp(125, function () {
                        $(this).empty()

                        var form_data = dl_form.serialize()

                        $.ajax({
                            url: child_theme_dir + 'resources/ajax/training-submit.php',
                            data: form_data,
                            success: function (data) {
                                console.log(data)

                                dl_form.find('#terms-captcha_code').val('')

                                captcha_url = dl_form.find('#terms-captcha').attr('src')

                                //           dl_form.find('#terms-captcha').attr('src', '')
                                dl_form.find('#terms-captcha').attr('src', captcha_url)

                                var response = JSON.parse(data)

                                if (response.message == 'success') {

                                    captcha.removeClass('border-secondary')

                                    dataLayer.push({
                                        'event': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                                        'event_name': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                                        'url': response.url
                                    });

                                    form_response.html('<div class="alert alert-primary col-6 offset-4 p-5" role="alert"><h5>' + response.message1 + '</h5><p class="mb-0"><a href="' + response.url + '" target="_blank">' + response.message2 + '</a>.</p></div>').slideDown(250);
                                } else if (response.message == 'captcha failed') {

                                    form_response.html('<div class="alert alert-danger col-6 offset-4" role="alert"><p class="mb-0">' + response.message1 + '</p></div>').slideDown(250);

                                    captcha.addClass('border border-secondary')

                                }
                            }
                        })

                    })

                })

            }

        })

        //
        // TRANSLATIONS
        //

        chart_labels = {
            change_from_1971_2000: 'Change from 1971-2000',
            observation: 'Gridded Historical Data',
            historical: 'Modeled Historical',
            historical_range: 'Historical Range',
            rcp_26_median: 'RCP 2.6 Median',
            rcp_26_range: 'RCP 2.6 Range',
            rcp_45_median: 'RCP 4.5 Median',
            rcp_45_range: 'RCP 4.5 Range',
            rcp_85_median: 'RCP 8.5 Median',
            rcp_85_range: 'RCP 8.5 Range',
            rcp_85_enhanced: 'RCP 8.5 Enhanced Scenario',
            temperature: 'Temperature',
            precipitation: 'Precipitation',
            daily_avg_temp: 'Daily Average Temperature',
            daily_max_temp: 'Daily Maximum Temperature',
            daily_min_temp: 'Daily Minimum Temperature',
            click_to_zoom: 'Click and drag in the plot area to zoom in'
        };

        l10n_labels = {
            to: 'to',
            to_doy: 'to',
            days: 'days',
            median: 'Median',
            range: 'Range',
            search_city: 'Search for a City/Town to zoom to',
            selected: 'selected',
            label_field: 'label_en',
            temperature: 'temperature',
            precipitation: 'precipitation',
            other_variables: 'other variables',
            station_data: 'station data',
            selectstation: 'Select at least one station to download data.',
            readytoprocess: 'Ready to process.',
            misc: 'Miscellaneous',
            allbccaq: 'All BCCAQv2 variables',
            gridded_data: 'Gridded data',
            census: 'Census subdivisions',
            health: 'Health regions',
            watershed: 'Watersheds',
            ahccdLegend: 'Legend',
            ahccdLegendSquare: 'Temperature',
            ahccdLegendTriangle: 'Precipitation',
            ahccdLegendCircle: 'Both'
        };

        if ($('body').hasClass('lang-fr')) {

            chart_labels = {
                change_from_1971_2000: 'Changement par rapport à 1971-2000',
                observation: 'Données observées interpolées',
                historical: 'Historique modélisé',
                historical_range: 'Répartition historique',
                rcp_26_median: 'RCP 2.6 médiane',
                rcp_26_range: 'RCP 2.6 portée',
                rcp_45_median: 'RCP 4.5 médiane',
                rcp_45_range: 'RCP 4.5 portée',
                rcp_85_median: 'RCP 8.5 médiane',
                rcp_85_range: 'RCP 8.5 portée',
                rcp_85_enhanced: 'RCP 8.5 scénario renforcé',
                temperature: 'Température',
                precipitation: 'Précipitation',
                daily_avg_temp: 'Température quotidienne moyenne',
                daily_max_temp: 'Température quotidienne maximale',
                daily_min_temp: 'Température quotidienne minimale',
                click_to_zoom: 'Cliquer et faire glisser dans la zone du tracé pour agrandir'
            };

            l10n_labels = {
                to: 'à',
                to_doy: 'au',
                days: 'jours',
                median: 'Médiane',
                range: 'Portée',
                search_city: 'Cherchez une ville ou un village pour effectuer un zoom',
                selected: 'sélectionés',
                label_field: 'label_fr',
                temperature: 'température',
                precipitation: 'précipitation',
                other_variables: 'autres',
                station_data: 'données des stations',
                selectstation: 'Sélectionner au moins une station pour télécharger les données.',
                readytoprocess: 'Prêt à traiter.',
                misc: 'Divers',
                allbccaq: 'Toutes les variables BCCAQv2',
                gridded_data: 'Données maillées',
                census: 'Subdivisions de recensement',
                health: 'Régions socio-sanitaires',
                watershed: 'Bassins versants',
                ahccdLegend: 'Légende',
                ahccdLegendSquare: 'Température',
                ahccdLegendTriangle: 'Précipitation',
                ahccdLegendCircle: 'Tous les deux'
            };

            if (typeof Highcharts !== 'undefined') {

                Highcharts.setOptions({
                    lang: {
                        downloadJPEG: 'Télécharger en image JPEG',
                        downloadPDF: 'Télécharger en document PDF',
                        downloadPNG: 'Télécharger en image PNG',
                        downloadSVG: 'Télécharger en image vectorielle SVG',
                        downloadXLS: 'Télécharger en document XLS',
                        downloadCSV: 'Télécharger en document CSV',
                        loading: 'Chargement',
                        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                        printChart: 'Imprimer le graphique',
                        viewData: 'Voir le tableau de données',
                        viewFullscreen: 'Voir en mode plein écran',
                        openInCloud: 'Ouvrir dans le nuage <em>Highcharts</em>'
                    }
                });

            }

        }

        // Constants
        month_number_lut = {
            'jan': 1,
            'feb': 2,
            'mar': 3,
            'apr': 4,
            'may': 5,
            'jun': 6,
            'jul': 7,
            'aug': 8,
            'sep': 9,
            'oct': 10,
            'nov': 11,
            'dec': 12,
            'ann': 1,
            '2qsapr': 4,
            'winter': 12,
            'spring': 3,
            'summer': 6,
            'fall': 9
        };


        //
        // FEEDBACK
        //

        $('input.other').hide();

        $('.has-other').change(function () {
            if ($(this).find(':selected').attr('value') == 'Other') {
                $(this).next('.other').show()
            } else {
                $(this).next('.other').val('').hide()
            }
        });

        $('.feedback-form').submit(function (e) {
            e.preventDefault();

            var the_form = $(this);

            var form_data = the_form.serialize();

            //console.log(form_data);

            $.ajax({
                url: child_theme_dir + 'resources/ajax/form-submit.php',
                data: form_data,
                success: function (data) {
                    //console.log(data);

                    if (data == 'success') {

                        $('#captcha_code').removeClass('border-secondary').tooltip('hide');
                        
                        let success_message = '<div class="row" style="display: none;"><div class="alert alert-success col-6 offset-3" role="alert">'
                        
                        success_message += '<p>' + T('Thanks! We’ve received your inquiry.') + '</p>'
                        
                        success_message += '<p>' + T('We are currently experiencing a higher than normal number of inquiries to our Support Desk. We will do our best to reply to you as soon as possible, but please be advised that there may be delays.') + '</p>'
                        
                        success_message += '<p>' + T('Thank you for your patience,') + '</p>'
                        
                        success_message += '<p>' + T('The Support Desk') + '</p>'
                        
                        success_message += '</div></div>'
                        
                        $(success_message).insertBefore(the_form).slideDown(250)

                        the_form.slideUp(250)

                    } else if (data == 'failed') {
                        
                        $('<div class="row" style="display: none;"><div class="alert alert-danger col-6 offset-3" role="alert">' + T('Sorry, an error occurred while sending your feedback. Please try again later.')+ '</div></div>').insertBefore(the_form).slideDown(250)
                        
                        the_form.slideUp(250)
                        
                    } else if (data == 'captcha failed') {

                        $('#captcha_code').addClass('border-secondary').tooltip('show');

                    }
                }
            });
        });

        //
        // UX BEHAVIOURS
        //

        // add body class on show/hide of main header

        $('#header-primary-collapse').on('show.bs.collapse', function () {

            $('body').addClass('header-open');

        });

        $('#header-primary-collapse').on('hide.bs.collapse', function () {

            $('body').removeClass('header-open');

        });

        // click outside the menu to close

        $(document).mouseup(function (e) {

            if ($('body').hasClass('supermenu-open')) {

                var close_menu = true;

                /*
                 console.log(e.target);
                 console.log('has class supermenu-toggle', $(e.target).hasClass('supermenu-toggle'));
                 console.log('has class overlay-toggle', $(e.target).hasClass('overlay-toggle'));
                 console.log('is supermenu', $('#supermenu').is(e.target));
                 console.log('child of supermenu', $('#supermenu').has(e.target).length);
                 */

                if ($(e.target).hasClass('supermenu-toggle') || $(e.target).hasClass('overlay-toggle')) {

                    // clicked element is a menu/overlay toggle, let the plugin deal with it

                    close_menu = false;

                } else {

                    if ($('body').hasClass('supermenu-disabled')) {

                        // supermenu currently disabled, leave it alone

                        close_menu = false;

                    } else {

                        // supermenu is open and active

                        if (!$('#supermenu').is(e.target) && !$('#supermenu').has(e.target).length) {

                            // clicked element is not a child of the supermenu, or the supermenu itself

                            close_menu = true;

                        } else {

                            close_menu = false;

                        }

                    }

                    if ($('.select2-container').has(e.target).length) {

                        // clicked element is inside the appended select2 container

                        close_menu = false;

                    }

                }

                //console.log('close', close_menu);

                if (close_menu == true) {
                    //console.log('close supermenu');
                    $('#supermenu').supermenu('hide');
                }

            }

        });

        // close supermenu if a smooth-scroll link is clicked inside it

        $('#supermenu .smooth-scroll').click(function () {
            $('#supermenu').supermenu('hide')
        })

        //
        // VENDOR
        //

        // SELECT2

        $('.select2').select2({
            language: current_lang,
            width: '100%',
            minimumResultsForSearch: -1
        });

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
        
        $('#location-search, #location-hero-search').select2({
            language: current_lang,
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
            templateResult: formatLocationSearch
        });
        
        $('#location-search, #location-hero-search').on('select2:select', function (e) {

            var redirect_url = '/explore/location/';

            if (current_lang == 'fr') {
                redirect_url = '/explorer/emplacement/';
            }

            window.location.href = redirect_url + '?loc=' + e.params.data.id;

        });

        // STICKY KIT

        if ($('body').hasClass('has-alert')) {

            $('#header-primary .logo a').stick_in_parent({
                parent: 'body',
                offset_top: sticky_offset
            });

        }

        // JQUERY UI TABS

        if ($('.tabs').length) {

            $('.tabs').tabs({
                hide: {effect: 'fadeOut', duration: 250},
                show: {effect: 'fadeIn', duration: 250},
            });

        }

        // LISTNAV

        if ($('#glossary').length) {

            var listnav_alltext = 'All';

            if ($('body').hasClass('lang-fr')) {
                listnav_alltext = 'Liste complète';
            }

            $('#glossary-listnav').listnav({
                showCounts: false,
                includeNums: false,
                allText: listnav_alltext,
                list_class: 'navbar-nav tabs-nav justify-content-center col-10 offset-1',
                item_class: 'nav-item',
                link_class: 'px-3 py-3 all-caps'
            });

            //console.log('listnav');
        }

        // SHARE
        
        if ($('#share').length) {
        
            window.fbAsyncInit = function() {
                FB.init({
                    appId            : '387199319682000',
                    autoLogAppEvents : true,
                    xfbml            : true,
                    version          : 'v13.0'
                });
            };
            
            $('#share').share_widget({
                site_url: '//' + window.location.hostname,
                theme_dir: child_theme_dir,
                share_url: window.location.href,
                title: document.title,
                elements: {
                    facebook: {
                        display: true,
                        icon: 'fab fa-facebook mr-3'
                    },
                    twitter: {
                        display: true,
                        icon: 'fab fa-twitter mr-3',
                        text: null,
                        via: null
                    },
                    linkedin: {
                        display: true,
                        icon: 'fab fa-linkedin mr-3'
                    },
                    permalink: {
                        display: true,
                        icon: 'fas fa-share-alt mr-3'
                    }
                },
                callback: null // callback function
            })
        
        }

        if (typeof $.fn.renderer !== 'undefined' && $('.renderable').length) {
            $(document).renderer();
        }

        // global handler for chart export CSV
        $('body').on('click', '.chart-export-data', function (e) {
            e.preventDefault();
            let parentPlaceholder = $(this).parents('.var-chart-container, .overlay-content');
            let chart = parentPlaceholder.find('.var-chart').highcharts();

            switch ($(this).attr('data-type')) {
                case 'csv':
                    setDataLayerForChartData('csv', chart, chart.query);
                    switch(parentPlaceholder.find('.chart-option:checked').val()) {
                        case '30y':
                        case 'delta':
                            window.location.href = chart.download_url;
                            break;
                        case 'annual':
                        default:
                            chart.downloadCSV();
                            break;
                    }
                    break;
            }
        });

        $('body').on('click', '.chart-export-img', function (e) {
            e.preventDefault();
            let chart = $(this).parents('.var-chart-container, .overlay-content').find('.var-chart').highcharts()
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

            setDataLayerForChartData(fileFormat, chart, chart.query);

            chart.exportChart({
                type: dl_type
            });
        });



        $('body').on('change', 'input:radio.chart-dataset', function (e) {
            let parentPlaceholder = $(this).parents('.var-chart-container, .overlay-content');
            let container = parentPlaceholder.find('.var-chart');
            let oldchart = container.highcharts();
            let query = oldchart.query;
            let varDetails = oldchart.varDetails;
            let dataset_name = e.target.value;

            query.dataset = dataset_name;
            let download_url, chart_url;

            if (query.var == "building_climate_zones") {
                query.var = "hddheat_18";
            }

            if (typeof query.sector === 'undefined') {
                download_url = data_url + '/download-30y/' + query.lat + '/' + query.lon + '/' + query.var + '/' + query.mora + '?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;
                chart_url = data_url + '/generate-charts/' + query.lat + '/' + query.lon + '/' + query.var + '/' + query.mora + '?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;
            } else {
                download_url = data_url + '/download-regional-30y/' + query.sector + '/' + query.id + '/' + query.var
                    + '/' + query.mora + '?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;

                chart_url = data_url + '/generate-regional-charts/' + query.sector + '/' + query.id
                    + '/' + query.var + '/' + query.mora + '?decimals=' + varDetails.decimals + '&dataset_name=' + dataset_name;
            }
            oldchart.destroy();

            $.getJSON(chart_url,
                function (data) {
                    displayChartData(data, varDetails, download_url, query, container[0]);
                    parentPlaceholder.find('.chart-option:checked').trigger('change');
                });


        });


    });
})(jQuery);
