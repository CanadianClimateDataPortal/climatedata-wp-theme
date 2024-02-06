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
