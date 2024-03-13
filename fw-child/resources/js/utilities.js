//
// GLOBAL CONSTANTS
//

// const geoserver_url = 'https://data.climatedata.ca';
const geoserver_url = 'https://dataclimatedata.crim.ca';

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

var l10n_table = {
  fr: {
    'All models': 'Tous les modèles',
    '{0} Median': '{0} médiane',
    '{0} Range': '{0} portée',
    'No data available for selected location':
      "Pas de données disponibles pour l'emplacement sélectionné",
    'No data available for this area.':
      'Pas de données disponibles pour cette zone.',

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

    'With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}':
      'Avec les paramètres actuels de fréquence et de format de donnée, le nombre maximal de points de grille par requête est de {0}',
    'Around {0} grid boxes selected':
      'Environ {0} points de grille sélectionnés',

    // news

    'All topics': 'Tous les sujets',
    Close: 'Fermer',

    // Custom shapefile
    'You selected "Custom shapefile" but didn\'t upload any file': 'Vous avez choisi d\'utiliser un shapefile, mais n\'en avez téléchargé aucun',
    'You must select one region of your shapefile': 'Vous devez sélectionner une des régions de votre shapefile',
    'The selected region is too large, please select a smaller region': 'La région sélectionnée est trop grosse, veuillez choisir une région plus petite',
    'Processing your file...': 'Traitement de votre fichier...',
    'Please select one region': 'Veuillez sélectionner une région',
    'An error occurred': 'Une erreur s\'est produite',
    'Could not process your shapefile': 'Votre fichier shapefile ne peut pas être correctement traité',
    'Your shapefile must be a ZIP containing at least a .shp file and a .prj file': 'Votre fichier shapefile doit être un ZIP qui contient au moins un fichier .shp et un fichier .prj',
    'This file is not a valid ZIP file': 'Ce fichier n\'est pas un fichier ZIP valide',
    'No valid shapefile was found in your ZIP file': 'Aucun fichier shapefile n\' été trouvé dans votre fichier ZIP',
    'An error occurred while processing your file': 'Une erreur s\'est produite lors du traitement de votre fichier',
    'Only polygon layers are allowed': 'Seuls les polygones sont permis dans votre fichier',
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
  return new Date(firstDayOfYear + 1000 * 60 * 60 * 24 * value).toLocaleDateString(language, {
    month: 'long',
    day: 'numeric'
  })
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
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// source https://www.geeksforgeeks.org/first-strictly-greater-element-in-a-sorted-array-in-java/
// Returns the index of the first element that is strictly greater than given target
function indexOfGT(arr, target)
{
  let start = 0, end = arr.length - 1;
  let ans = -1;

  while (start <= end)
  {
    let mid = Math.floor((start + end) / 2);

    // Move to right side if target is
    // greater.
    if (arr[mid] <= target)
    {
      start = mid + 1;
    }

    // Move left side.
    else
    {
      ans = mid;
      end = mid - 1;
    }
  }
  return ans;
}