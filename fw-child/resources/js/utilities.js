//
// GLOBAL CONSTANTS
//

const geoserver_url = DATA_URL;
const XML_HTTP_REQUEST_DONE_STATE = 4;

const svgNS = 'http://www.w3.org/2000/svg';

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
  humidex: {
    low: 'SSP 1–2.6',
    medium: 'SSP 2–4.5',
    high: 'SSP 5–8.5',
  },
};

const grid_resolution = {
  canadagrid: 1.0 / 12.0,
  canadagrid1deg: 1.0,
  slrgrid: 1.0 / 10.0,
  era5landgrid: 1.0 / 10.0,
};

let units = null;
if (unit_strings) units = unit_strings;
const UNITS = units;

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
    layer_prefix: '',
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
    layer_prefix: 'cmip6-',
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
  ahccdLegendCircle: 'Both',
};

if (ajax_data.globals.current_lang_code == 'fr') {
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
}

var l10n_table = {
  fr: {
    'All models': 'Tous les modèles',
    '{0} Median': '{0} médiane',
    '{0} Range': '{0} portée',
    'No data available for selected location':
      "Pas de données disponibles pour l'emplacement sélectionné",
    'No data available for this area.':
      'Pas de données disponibles pour cette zone.',
    'The CAPTCHA verification failed. Please try again.': 'La vérification CAPTCHA a échoué. Veuillez réessayer.',
    'Click below to download your data': 'Cliquez ci-dessous pour télécharger les données',
    'Success': 'Succès',

    'Search communities': 'Recherche par ville',
    'Begin typing city name': "Commencer à saisir le nom d'une ville",
    'Search coordinates': 'Recherche par coordonnées',
    'Enter latitude & longitude e.g.':
      'Saisir la latitude et la longitude, par ex.',
    'Coordinates detected': 'Coordonnées détectées',
    'Set map view': "Définir l'affichage de la carte",
    'Ready to process.': 'Prêt à traiter.',
    'Choose at least one weather station. ':
      'Sélectionner au moins une station.',
    'View location': 'Afficher',
    'Remove pin': 'Retirer',
    'View': 'Afficher',

    'Station\'s data': 'Données de la station',
    'Precipitation only': 'Précipitations seulement',
    'Temperature only': 'Températures seulement',
    'Precipitation and temperature': 'Précipitations et températures',

    'Climate normals 1981–2010':
      'Normales et moyennes climatiques de 1981–2010',

    // Location search
    'Searching…': 'Recherche…',
    'No results found': 'Aucun résultat trouvé',
    'The results could not be loaded.': 'Les résultats ne peuvent pas être chargés.',
    'Remove item': 'Retirer l\'élément',

    // share widget
    'Copied to clipboard': 'Copié dans le presse-papier',
    Error: 'Erreur',
    'Copy link': 'Copier le lien',

    //  feedback form
    'Thanks! We’ve received your inquiry.':
      'Merci! Nous avons reçu votre demande.',
    'We are currently experiencing a higher than normal number of inquiries to our Support Desk. We will do our best to reply to you as soon as possible, but please be advised that there may be delays.':
      'Le nombre de demandes adressées à notre Centre d’aide est actuellement supérieur à la normale. Nous ferons de notre mieux pour vous répondre dès que possible, mais sachez qu’il peut y avoir des délais.',
    'Thank you for your patience,': 'Nous vous remercions de votre patience,',
    'The Support Desk': 'Le Centre d’aide',
    'Sorry, an error occurred while sending your feedback. Please try again later.':
      'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',

    'With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}.':
      'Avec les paramètres actuels de fréquence et de format de donnée, le nombre maximal de points de grille par requête est de {0}.',
    'Around {0} grid boxes selected':
      'Environ {0} points de grille sélectionnés',
    'Make sure a value is entered for each variable threshold.': 'Assurez-vous d\'entrer une valeur pour chaque seuil.',
    'Draw an area on the map.': 'Dessinez une région sur la carte.',

    // news

    'All topics': 'Tous les sujets',
    Close: 'Fermer',

    // Custom shapefile
    'You selected “Custom shapefile” but have not uploaded a file.':
      "Vous avez choisi d'utiliser un shapefile, mais n'en avez téléchargé aucun",
    'You must select one region of your shapefile.':
      'Vous devez sélectionner une des régions de votre shapefile',
    'The selected region is too large, please select a smaller region.':
      'La région sélectionnée est trop grosse, veuillez choisir une région plus petite',
    'Processing your file...': 'Traitement de votre fichier...',
    'Please select only one region.': 'Veuillez sélectionner une région',
    'An error occurred.': "Une erreur s'est produite",
    'Your shapefile could not be processed.':
      'Votre fichier shapefile ne peut pas être correctement traité',
    'Your shapefile must be a ZIP file containing at least the .shp and .prj files.':
      'Votre fichier shapefile doit être un ZIP qui contient au moins un fichier .shp et un fichier .prj',
    'This file is not a valid ZIP file.':
      "Ce fichier n'est pas un fichier ZIP valide",
    'Your ZIP file does not contain a valid shapefile.':
      "Aucun fichier shapefile n'a été trouvé dans votre fichier ZIP",
    'An error occurred while processing your file.':
      "Une erreur s'est produite lors du traitement de votre fichier",
    'Only polygon layers are allowed.':
      'Seuls les polygones sont permis dans votre fichier',

    // Sectors
    'Census Subdivision': 'Subdivision de recensement',
    'Health Region': 'Région socio-sanitaire',
    'Watershed': 'Bassin versant',
    'Grid Point': 'Point de grille',

    // Page tour
    'Start Over': 'Recommencer',
    'Next': 'Suivant',
    'Don’t show again': 'Ne plus montrer',
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

if (ajax_data.globals.current_lang_code == 'fr') {
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
    click_to_zoom: 'Cliquer et faire glisser dans la zone du tracé pour agrandir',
  };
}

var month_names = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

if (ajax_data.globals.current_lang_code == 'fr') {
  month_names = [
    'Janv.',
    'Févr.',
    'Mars',
    'Avr.',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ];
}

// Constants

const month_number_lut = {
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
  ann: 'ys',
  jan: 'ms',
  feb: 'ms',
  mar: 'ms',
  apr: 'ms',
  may: 'ms',
  jun: 'ms',
  jul: 'ms',
  aug: 'ms',
  sep: 'ms',
  oct: 'ms',
  nov: 'ms',
  dec: 'ms',
  spring: 'qsdec',
  summer: 'qsdec',
  fall: 'qsdec',
  winter: 'qsdec',
};

/**
 * Perform a string lookup in l10n_table in current language, returns it if found, otherwise return the original string
 * @param str String to lookup for
 * @returns {string} The localized string
 */
function T(str) {
  let lang = 'en';

  if (ajax_data.globals.current_lang_code != undefined) {
    lang = ajax_data.globals.current_lang_code;
  }

  if (typeof l10n_table[lang] == 'undefined') {
    return str;
  }

  if (typeof l10n_table[lang][str] == 'undefined') {
    console.warn('Missing translation in language ' + lang + ': ' + str);
    return str;
  } else {
    return l10n_table[lang][str];
  }
}

/**
 * Format the n-th day value to localized text on a non-leap year (ex: 156 -> June 9)
 * @param value Day of the Year (starting with 0 for Jan 1st)
 * @returns {string} The formatted value
 */
function doy_formatter(value, language) {
  const firstDayOfYear = Date.UTC(2019, 0, 1);

  return new Date(
    firstDayOfYear + 1000 * 60 * 60 * 24 * value,
  ).toLocaleDateString(language, {
    month: 'long',
    day: 'numeric',
  });
}

// source: https://stackoverflow.com/a/76126221
function interpolate(color1, color2, percent) {
  // Convert the hex colors to RGB values
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  // Interpolate the RGB values
  const r = Math.round(r1 + (r2 - r1) * percent);
  const g = Math.round(g1 + (g2 - g1) * percent);
  const b = Math.round(b1 + (b2 - b1) * percent);

  // Convert the interpolated RGB values back to a hex color
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// source https://www.geeksforgeeks.org/first-strictly-greater-element-in-a-sorted-array-in-java/
// Returns the index of the first element that is strictly greater than given target
function indexOfGT(arr, target) {
  let start = 0,
    end = arr.length - 1;
  let ans = -1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    // Move to right side if target is
    // greater.
    if (arr[mid] <= target) {
      start = mid + 1;
    }

    // Move left side.
    else {
      ans = mid;
      end = mid - 1;
    }
  }
  return ans;
}
/**
 * Hash a string.
 *
 * @param {string} s - String to hash.
 * @returns {number}
 */
function hashCode(s) {
  return s.split('').reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * Encode a URL using a salt.
 *
 * @param {string} url - URL to encode.
 * @param {string} salt - Salt to for the encoding.
 * @returns {{encoded: string, hash: number}} - Object containing the encoded string and its calculated hash.
 */
function encodeURL(url, salt) {
  const hash = hashCode(url + salt);
  const encoded = encodeURIComponent(btoa(url + '|' + hash));
  return {
    encoded: encoded,
    hash: hash,
  };
}

/**
 * Format numerical value according to supplied parameters
 * @param value Number to format
 * @param varDetails Variable details object provided by Wordpress
 * @param delta If true, the value is formatted as a delta
 * @returns {string} The formatted value
 */
/*
function value_formatter(value, varDetails, delta) {
  let unit =
    varDetails.units.value === 'kelvin' ? '°C' : varDetails.units.label;
  if (unit === undefined) {
    unit = '';
  }
  let str = '';
  if (delta && value > 0) {
    str += '+';
  }

  switch (varDetails.units.value) {
    case 'doy':
      if (delta) {
        str += value.toFixed(varDetails.decimals);
        str += ' ' + l10n_labels['days'];
      } else {
        str += doy_formatter(value);
      }

      break;
    default:
      str += value.toFixed(varDetails.decimals);
      str += ' ' + unit;
      break;
  }
  return unit_localize(str);
}
*/

/**
 * Format numerical value according to supplied parameters
 * @param value Number to format
 * @param var_acf Variable details object provided by Wordpress
 * @param delta If true, the value is formatted as a delta
 * @returns {string} The formatted value
 */
function value_formatter(value, units, decimals, delta, lang) {
  value = parseFloat(value);
  let unit = units;
  if (unit === 'kelvin') {
    unit = '°C';
    value = delta ? value : value - 273.15;
  }

  if (unit === undefined) {
    unit = '';
  }
  let str = '';
  if (delta && value > 0) {
    str += '+';
  }

  switch (units) {
    case 'doy':
      if (delta == true) {
        str += value.toFixed(decimals);
        str += ' ' + l10n_labels['days'];
      } else {
        str += doy_formatter(value, lang);
      }

      break;
    default:
      str += value.toFixed(decimals);
      str += ' ' + unit;
      break;
  }
  return unit_localize(str, lang);
}

//
// DOWNLOAD
//

const ahccd_icons = {
  P: L.icon({
    iconUrl:
      theme_data.child_theme_dir + '/resources/app/ahccd/triangle-blue.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
  Pr: L.icon({
    iconUrl:
      theme_data.child_theme_dir + '/resources/app/ahccd/triangle-red.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
  T: L.icon({
    iconUrl:
      theme_data.child_theme_dir + '/resources/app/ahccd/square-blue.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
  Tr: L.icon({
    iconUrl: theme_data.child_theme_dir + '/resources/app/ahccd/square-red.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
  B: L.icon({
    iconUrl:
      theme_data.child_theme_dir + '/resources/app/ahccd/circle-blue.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
  Br: L.icon({
    iconUrl: theme_data.child_theme_dir + '/resources/app/ahccd/circle-red.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  }),
};

var variableDataTypes = {
  // Download_Variable-Data_BCCAQv2 ...
  tx_max: 'Hottest-Day',
  tg_mean: 'Mean-Temperature',
  tn_mean: 'Minimum-Temperature',
  'tnlt_-15': 'Days-with-Tmin_LesserThan_-15C',
  'tnlt_-25': 'Days-with-Tmin_LesserThan_-25C',
  txgt_25: 'Days-with-Tmax_GreaterThan_25C',
  txgt_27: 'Days-with-Tmax_GreaterThan_27C',
  txgt_29: 'Days-with-Tmax_GreaterThan_29C',
  txgt_30: 'Days-with-Tmax_GreaterThan_30C',
  txgt_32: 'Days-with-Tmax_GreaterThan_32C',
  tx_mean: 'Maximum-Temperature',
  tn_min: 'Coldest-Day',
  rx1day: 'Maximum-1-Day-Total-Precipitation',
  r1mm: 'Wet-Days_GreaterThan_1mm',
  r10mm: 'Wet-Days_GreaterThan_10mm',
  r20mm: 'Wet-Days_GreaterThan_20mm',
  prcptot: 'Total-Precipitation',
  frost_days: 'Frost-Days',
  cddcold_18: 'Cooling-Degree-Days',
  gddgrow_10: 'Growing-Degree-Days-10C',
  gddgrow_5: 'Growing-Degree-Days-5C',
  gddgrow_0: 'Cumulative-degree-days-above-0C',
  hddheat_18: 'Heating-degree-days',
  ice_days: 'Ice-Days',
  tr_18: 'Tropical-Nights-Days-with-Tmin_GreaterThan_18C',
  tr_20: 'Tropical-Nights-Days-with-Tmin_GreaterThan_20C',
  tr_22: 'Tropical-Nights-Days-with-Tmin_GreaterThan_22C',
  slr: 'Sea-Level_Change',
  all: 'All',
};

function getGA4EventNameForVariableDataBCCAQv2() {
  var gA4EventNameForVariableDataBCCAQv2 = '';

  try {
    var eventType = $('[data-query-key="var"]').val();

    if (variableDataTypes[eventType]) {
      gA4EventNameForVariableDataBCCAQv2 =
        'Download_Variable-Data_BCCAQv2_' +
        variableDataTypes[eventType] +
        '_Frequency_Location_Format';
    } else {
      throw (
        'Invalid GA4 event name (Download_Variable-Data_BCCAQv2): ' + eventType
      );
    }
  } catch (err) {
    console.error(err);
  }

  return gA4EventNameForVariableDataBCCAQv2;
}

function CreateAnalyzeProcessRequestData(
  data_sectorCoord,
  data_form_inputs,
  data_form_obj,
) {
  let isBySector = data_form_inputs['shape'] != '';

  for (var key in data_form_inputs) {
    switch (key) {
      case 'shape':
        break;

      case 'average':
        data_form_obj['inputs'].push({
          id: key,
          data: data_form_inputs[key],
        });
        break;

      case 'dataset':
        data_form_obj['inputs'].push({
          id: 'dataset',
          data: DATASETS[data_form_inputs[key]].finch_name,
        });
        break;

      case 'scenario':
        data_form_inputs[key].split(',').forEach(function (component) {
          data_form_obj['inputs'].push({
            id: key,
            data: component,
          });
        });
        break;

      default:
        let addData = data_form_inputs[key];
        if (isBySector && (key == 'lat' || key == 'lon')) {
          addData = data_sectorCoord['s_lat'];
          if (key == 'lon') {
            addData = data_sectorCoord['s_lon'];
          }
        }

        console.log(key, addData);

        data_form_obj['inputs'].push({
          id: key,
          data: addData,
        });
        break;
    }
  }

  console.log(data_form_obj);

  return data_form_obj;
}

var analyze_bccaqv2_dict = {
  hxmax_days_above: 'HXMax Days Above a Threshold',
  wetdays: 'Wet Days',
  sdii: 'Average Wet Day Precipitation Intensity',
  cwd: 'Maximum Consecutive Wet Days',
  cdd: 'Maximum Consecutive Dry Days',
  tx_tn_days_above: 'Days above Tmax and Tmin',
  tx_days_above: 'Days above Tmax',
  tropical_nights: 'Days above Tmin',
  tn_days_below: 'Days below Tmin',
  cooling_degree_days: 'Degree Days Above a Threshold',
  heating_degree_days: 'Degree Days Below a Threshold',
  heat_wave_index: 'Heat Wave',
  heat_wave_total_length: 'Heat Wave Total Duration',
  heat_wave_frequency: 'Heat Wave Frequency',
  dlyfrzthw: 'Days with a Freeze-Thaw Cycle',
  cold_spell_days: 'Cold Spell Days',
};

var datalayer_parameters = {
  // For all events
  lat: 'latitude',
  lon: 'longitude',
  shape: 'shape',
  average: 'average',
  start_date: 'start date',
  end_date: 'end date',
  ensemble_percentiles: 'ensemble percentiles',
  dataset: 'dataset name',
  models: 'models',
  freq: 'frequence',
  scenario: 'scenario',
  data_validation: 'data validation',
  output_format: 'output format',
  // For some events
  window: 'window',
  thresh: 'thresh',
  thresh_tasmin: 'threshold tasmin',
  thresh_tasmax: 'threshold tasmin',
};
var dataLayer = [];
function set_datalayer_for_analyze_bccaqv2(
  form_obj_inputs,
  customize_variables,
) {
  var analyze_bccaqv2_parameters = '';
  customize_variables = customize_variables.toLowerCase();
  try {
    $.each(form_obj_inputs, function (index, value) {
      var value_id = value.id.toLowerCase();

      if (datalayer_parameters[value_id]) {
        analyze_bccaqv2_parameters +=
          datalayer_parameters[value_id] + ': ' + value.data + ';  ';
      }
    });

    if (!analyze_bccaqv2_dict[customize_variables]) {
      throw (
        'Can not get Analyze_BCCAQv2_* dataLayer event name: ' +
        customize_variables
      );
    }

    analyze_bccaqv2_dict[customize_variables] = analyze_bccaqv2_dict[
      customize_variables
    ].replaceAll(' ', '-');
    event_type = 'Analyze_BCCAQv2_' + analyze_bccaqv2_dict[customize_variables];

    dataLayer.push({
      event: event_type,
      analyze_bccaqv2_event_type: event_type,
      analyze_bccaqv2_parameters: analyze_bccaqv2_parameters,
    });
  } catch (err) {
    console.error(err);
  }
}

function validate_email(email_val) {
  let is_valid = false;

  if (
    typeof email_val !== 'undefined' &&
    email_val != 'undefined' &&
    email_val != ''
  ) {
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

/**
 * Returns a filtered query object with only the keys relevant for the type of variable.
 *
 * @param {object} query - The query object.
 * @param {string} variable_type - Type of variable, used to determine the relevant keys.
 * @returns {object} - The filtered query object.
 */
function filter_query_for_variable_type(query, variable_type) {
  const filtered_query = {};
  const keys_to_keep = {
    'single': [
      'bbox',
      'dataset',
      'extension',
      'format',
      'frequency',
      'sector',
      'selections',
      'var',
    ],
    'custom': [
      'bbox',
      'dataset',
      'decimals',
      'end_year',
      'format',
      'frequency',
      'inputs',
      'models',
      'percentiles',
      'scenarios',
      'sector',
      'selections',
      'start_year',
      'var',
    ],
    'ahccd': [
      'dataset',
      'check_missing',
      'decimals',
      'format',
      'frequency',
      'inputs',
      'station',
      'var',
    ]
  }

  if (!(variable_type in keys_to_keep)) {
    return query;
  }

  for (const key of keys_to_keep[variable_type]) {
    if (!(key in query)) {
      continue;
    }

    // For some variable types, include the "decimals" key only if the format is "csv".
    if (key === 'decimals' && query.format !== 'csv' && ['custom', 'ahccd'].includes(variable_type)) {
      continue;
    }

    filtered_query[key] = query[key];
  }

  return filtered_query;
}


/**
 * Generate a filename based on a data query.
 *
 * The data query is an object describing a specific query for climate data. For example, it can contain the name of
 * the variable for which we want data, the dataset to use, a specific date range, etc. This function generates a
 * custom filename for the query.
 *
 * @param {object} query - Query object for which to create a filename.
 * @param {object[]} variables_filename
 *   Mapping to transform a variable id (the `var` element of the query) to a name to use in the file name. See the
 *   documentation of the `variable_short_names` global variable.
 * @param {object} options
 *   Options configuring the generated filename.
 *   - `with_extension` (default: true) If true, the file extension will be appended to the filename.
 * @returns {string|null} - The generated filename, or null if the query object doesn't contain any information.
 */
function generate_data_query_filename(query, variables_filename = [], options = {}) {
  const filename_parts = [];
  options = jQuery.extend({
    with_extension: true,
  }, options);

  function rename_or_upper_first(value, name_mapping) {
    if (value in name_mapping) {
      return name_mapping[value];
    } else {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }

  // Dataset name

  if (query.dataset) {

    const location_mapping = {
      cmip5: 'CanDCS-u5',
      cmip6: 'CanDCS-u6',
      humidex: 'HUMIDEX',
      ahccd: 'AHCCD',
    }
    const dataset = rename_or_upper_first(query.dataset, location_mapping);

    filename_parts.push(dataset);
  }

  // Location

  if (query.sector) {
    const location_mapping = {
      upload: 'CustomShape',
      gridded_data: 'Grid',
    }
    const location = rename_or_upper_first(query.sector, location_mapping);

    let location_parts = [location];

    if (query.bbox) {
      location_parts.push('bbox');
    }

    if (jQuery.isArray(query.selections)) {
      location_parts = location_parts.concat(query.selections.slice(0, 3));
    }

    filename_parts.push(location_parts.join('-'));
  }

  if (query.station) {
    filename_parts.push('Stations-' + query.station.slice(0, 3).join('-'));
  }

  // Date range

  const date_range = [];

  if (query.start_year) {
    date_range.push('from-' + query.start_year);
  }

  if (query.end_year) {
    date_range.push('to-' + query.end_year);
  }

  if (date_range.length) {
    filename_parts.push(date_range.join('-'));
  }

  // Selected variable (and custom inputs/thresholds, if applicable)

  if (query.var) {
    let variable = query.var;
    const custom_inputs = jQuery.extend({}, query.inputs);

    for (const variable_map of variables_filename) {
      if (typeof variable_map.id === 'string') {
        if (variable_map.id === query.var) {
          variable = variable_map.name;
          break;
        }
      } else {
        const match = variable_map.id.exec(query.var);
        if (match) {
          variable = variable_map.name;
          if (match.groups) {
            jQuery.extend(custom_inputs, match.groups);
          }
        }
      }
    }

    // Replace thresholds
    for (let [placeholder, value] of Object.entries(custom_inputs)) {
      // Negative numbers have their "-" replaced with "neg"
      if (/^-\d+/.test(value)) {
        value = 'neg' + value.slice(1);
      }

      variable = variable.replace('<'+placeholder+'>', value);
    }

    filename_parts.push(variable);
  }

  // Models

  if (query.models) {
    const models_name_mapping = {
      pcic12: 'PCIC12',
      '24models': 'All',
      '26models': 'All',
    };
    const model_name = rename_or_upper_first(query.models, models_name_mapping);

    filename_parts.push(model_name);
  }

  // Scenario

  if (query.scenarios) {
    const scenario_name_mapping = {
      low: { 'cmip6': 'SSP126', 'cmip5': 'RCP26' },
      medium: { 'cmip6': 'SSP245', 'cmip5': 'RCP45' },
      high: { 'cmip6': 'SSP585', 'cmip5': 'RCP85' },
    };

    const dataset = query.dataset;
    const scenarios = query.scenarios.map(function (name) {
      if (dataset && scenario_name_mapping[name] && scenario_name_mapping[name][dataset]) {
        return scenario_name_mapping[name][dataset];
      }
      return name;
    });

    filename_parts.push(scenarios.join('-'));
  }

  // Percentile

  if (query.percentiles) {
    const percentiles = query.percentiles.map(value => 'p' + value);
    filename_parts.push(percentiles.join('-'));
  }

  // Missing tolerance

  if (query.check_missing) {
    filename_parts.push('tol-' + query.check_missing);
  }

  // Frequency

  if (query.frequency) {
    const frequency_name_map = {
      jan: 'January',
      feb: 'February',
      mar: 'March',
      apr: 'April',
      may: 'May',
      jun: 'June',
      jul: 'July',
      aug: 'August',
      sep: 'September',
      oct: 'October',
      nov: 'November',
      dec: 'December',
      ann: 'Annual',
      all: 'AllMonths',
      YS: 'Annual',
      'QS-DEC': 'Seasonal',
      MS: 'Monthly',
      'AS-JUL': 'July2June',
    }
    const frequency_name = rename_or_upper_first(query.frequency, frequency_name_map);

    filename_parts.push(frequency_name);
  }

  // Generated file decimals

  if (query.decimals != null) {
    filename_parts.push(query.decimals);
  }

  if (!filename_parts.length) {
    return null;
  }

  // File extension

  let file_name = filename_parts.join('_');

  if (options.with_extension) {
    const extension = query.format === 'csv' ? '.csv' : '.nc';
    file_name = file_name + extension;
  }

  return file_name;
}
