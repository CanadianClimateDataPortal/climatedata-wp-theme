//
// GLOBAL CONSTANTS
//

// const geoserver_url = 'https://data.climatedata.ca';
const geoserver_url = 'https://dataclimatedata.crim.ca';

const svgNS = "http://www.w3.org/2000/svg";


const canadaCenter = [62.51231793838694, -98.48144531250001];
const scenario_names = {
  cmip5: {
    low: 'RCP 2.6',
    medium: 'RCP 4.5',
    high: 'RCP 8.5',
  },
  cmip6: {
    low: 'SSP 1–2.6',
    medium: 'SSP 2–4.5',
    high: 'SSP 5–8.5',
  },
};

var units = null;
if (unit_strings) units = unit_strings;
const UNITS = units;
console.log('UNITS', UNITS);

const DATASETS = {
  cmip5: {
    scenarios: [
      {
        name: 'rcp26',
        label: 'RCP 2.6',
        chart_color: '#00F',
        correlations: {
          cmip6: 'ssp126',
        },
      },
      {
        name: 'rcp45',
        label: 'RCP 4.5',
        chart_color: '#00640c',
        correlations: {
          cmip6: 'ssp245',
        },
      },
      {
        name: 'rcp85',
        label: 'RCP 8.5',
        chart_color: '#F00',
        correlations: {
          cmip6: 'ssp585',
        },
      },
    ],
    grid: 'canadagrid',
    finch_name: 'candcs-u5',
    model_lists: [
      { name: 'pcic12', label: 'PCIC12 (Ensemble)' },
      { name: '24models', label: 'All models' },
    ],
  },
  cmip6: {
    scenarios: [
      {
        name: 'ssp126',
        label: 'SSP1-2.6',
        chart_color: '#00F',
        correlations: {
          cmip5: 'rcp26',
        },
      },
      {
        name: 'ssp245',
        label: 'SSP2-4.5',
        chart_color: '#00640c',
        correlations: {
          cmip5: 'rcp45',
        },
      },
      {
        name: 'ssp585',
        label: 'SSP5-8.5',
        chart_color: '#F00',
        correlations: {
          cmip5: 'rcp85',
        },
      },
    ],
    grid: 'canadagrid',
    finch_name: 'candcs-u6',
    model_lists: [{ name: '26models', label: 'All models' }],
  },
  humidex: {
    scenarios: [
      {
        name: 'ssp126',
        label: 'SSP1-2.6',
        chart_color: '#00F',
      },
      {
        name: 'ssp245',
        label: 'SSP2-4.5',
        chart_color: '#00640c',
      },
      {
        name: 'ssp585',
        label: 'SSP5-8.5',
        chart_color: '#F00',
      },
    ],
    grid: 'era5landgrid',
    finch_name: 'humidex-daily',
    model_lists: [{ name: 'humidex_models', label: 'All models' }],
  },
};

// throttling for history state pushes
var pushes_since_input = 0;

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

function unit_localize(str, lang) {
  if (lang == 'fr') {
    str = str.replace('Degree Days', 'Degrés-jours');
    str = str.replace('degree days', 'degrés-jours');
    str = str.replace('Days', 'Jours');
    str = str.replace('days', 'jours');
    str = str.replace(' to ', ' à ');
    str = str.replace('Climate Zone', 'Zone climatique');
  }

  return str;
}

function formatDecade(timestampMilliseconds, period) {
  let year = new Date(timestampMilliseconds).getFullYear();
  let decade = year - (year % 10) + 1;
  if (decade > 2071) {
    decade = 2071;
  }
  if (decade < 1951) {
    decade = 1951;
  }
  return [decade, Date.UTC(decade, month_number_lut[period] - 1, 1)];
}

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
  click_to_zoom: 'Click and drag in the plot area to zoom in',
};

// Constants
month_number_lut = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  ann: 1,
  '2qsapr': 4,
  winter: 12,
  spring: 3,
  summer: 6,
  fall: 9,
};

const period_frequency_lut = {
  'ann': 'ys',
  'jan': 'ms',
  'feb': 'ms',
  'mar': 'ms',
  'apr': 'ms',
  'may': 'ms',
  'jun': 'ms',
  'jul': 'ms',
  'aug': 'ms',
  'sep': 'ms',
  'oct': 'ms',
  'nov': 'ms',
  'dec': 'ms',
  'spring': 'qsdec',
  'summer': 'qsdec',
  'fall': 'qsdec',
  'winter': 'qsdec'
}