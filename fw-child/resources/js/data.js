// constants containing required data for all variables, especially used for legend and custom color ramps
const variables_data = {
  HXmax30: {
    ys: {
      absolute: { low: 0.0, high: 100.0 },
      delta: { low: -10.0, high: 70.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 0.0, high: 70.0 },
      delta: { low: -7.0, high: 40.0 },
      unit: 'days',
    },
  },
  HXmax35: {
    ys: {
      absolute: { low: 0.0, high: 60.0 },
      delta: { low: -5.0, high: 50.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 10.0 },
      delta: { low: -1.0, high: 10.0 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 0.0, high: 40.0 },
      delta: { low: -2.0, high: 30.0 },
      unit: 'days',
    },
  },
  HXmax40: {
    ys: {
      absolute: { low: 0.0, high: 30.0 },
      delta: { low: -1.0, high: 20.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 4.0 },
      delta: { low: 0.0, high: 4.0 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 0.0, high: 10.0 },
      delta: { low: 0.0, high: 10.0 },
      unit: 'days',
    },
  },
  cdd: {
    ys: {
      absolute: { low: 10.0, high: 100.0 },
      delta: { low: -40.0, high: 9.0 },
      unit: 'days',
    },
  },
  cddcold_18: {
    ys: {
      absolute: { low: 0.0, high: 800.0 },
      delta: { low: -80.0, high: 600.0 },
      unit: 'degree_days',
    },
  },
  'dlyfrzthw_tx0_tn-1': {
    ys: {
      absolute: { low: 8.0, high: 100.0 },
      delta: { low: -40.0, high: 8.0 },
      unit: 'days',
    },
  },
  first_fall_frost: {
    ys: {
      absolute: { low: 200.0, high: 300.0 },
      delta: { low: -10.0, high: 60.0 },
      unit: '',
    },
  },
  frost_days: {
    ys: {
      absolute: { low: 20.0, high: 400.0 },
      delta: { low: -80.0, high: 10.0 },
      unit: 'days',
    },
  },
  frost_free_season: {
    ys: {
      absolute: { low: 2.0, high: 300.0 },
      delta: { low: -20.0, high: 90.0 },
      unit: 'days',
    },
  },
  gddgrow_0: {
    ys: {
      absolute: { low: 20.0, high: 5000.0 },
      delta: { low: -300.0, high: 2000.0 },
      unit: 'K days',
    },
    ms: {
      absolute: { low: 0.0, high: 700.0 },
      delta: { low: -40.0, high: 200.0 },
      unit: 'K days',
    },
  },
  gddgrow_5: {
    ys: {
      absolute: { low: 0.5, high: 3000.0 },
      delta: { low: -200.0, high: 1000.0 },
      unit: 'degree_days',
    },
  },
  hddheat_18: {
    ys: {
      absolute: { low: 3000.0, high: 20000.0 },
      delta: { low: -4000.0, high: 700.0 },
      unit: 'degree_days',
    },
  },
  ice_days: {
    ys: {
      absolute: { low: 1.0, high: 300.0 },
      delta: { low: -60.0, high: 10.0 },
      unit: 'days',
    },
  },
  last_spring_frost: {
    ys: {
      absolute: { low: 60.0, high: 200.0 },
      delta: { low: -40.0, high: 9.0 },
      unit: '',
    },
  },
  nr_cdd: {
    ys: {
      absolute: { low: 5.0, high: 20.0 },
      delta: { low: -4.0, high: 3.0 },
      unit: '',
    },
    ms: {
      absolute: { low: 0.2, high: 2.0 },
      delta: { low: -0.7, high: 0.3 },
      unit: '',
    },
  },
  prcptot: {
    ys: {
      absolute: { low: 60.0, high: 3000.0 },
      delta: { low: -40.0, high: 200.0 },
      unit: 'mm',
    },
    ms: {
      absolute: { low: 6.0, high: 300.0 },
      delta: { low: -10.0, high: 30.0 },
      unit: 'mm day-1',
    },
    'qs-dec': {
      absolute: { low: 20.0, high: 900.0 },
      delta: { low: -20.0, high: 70.0 },
      unit: 'mm day-1',
    },
  },
  r10mm: {
    ys: {
      absolute: { low: 0.1, high: 100.0 },
      delta: { low: -2.0, high: 9.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 6.0 },
      delta: { low: -0.2, high: 0.6 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -0.3, high: 2.0 },
      unit: 'days',
    },
  },
  r1mm: {
    ys: {
      absolute: { low: 20.0, high: 200.0 },
      delta: { low: -7.0, high: 40.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.7, high: 20.0 },
      delta: { low: -2.0, high: 6.0 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 2.0, high: 70.0 },
      delta: { low: -4.0, high: 20.0 },
      unit: 'days',
    },
  },
  r20mm: {
    ys: {
      absolute: { low: 0.0, high: 50.0 },
      delta: { low: -0.8, high: 5.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 6.0 },
      delta: { low: -0.2, high: 0.6 },
      unit: 'days',
    },
    'qs-dec': {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -0.3, high: 2.0 },
      unit: 'days',
    },
  },
  rx1day: {
    ys: {
      absolute: { low: 7.0, high: 90.0 },
      delta: { low: -3.0, high: 10.0 },
      unit: 'mm day-1',
    },
    ms: {
      absolute: { low: 1.0, high: 50.0 },
      delta: { low: -2.0, high: 6.0 },
      unit: 'mm',
    },
    'qs-dec': {
      absolute: { low: 2.0, high: 70.0 },
      delta: { low: -2.0, high: 8.0 },
      unit: 'mm/day',
    },
  },
  rx5day: {
    ys: {
      absolute: { low: 10.0, high: 200.0 },
      delta: { low: -4.0, high: 20.0 },
      unit: 'mm',
    },
    ms: {
      absolute: { low: 3.0, high: 100.0 },
      delta: { low: -4.0, high: 10.0 },
      unit: 'mm',
    },
  },
  tg_mean: {
    ys: {
      absolute: { low: -20.0, high: 10.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'K',
    },
    ms: {
      absolute: { low: -40.0, high: 20.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'K',
    },
    'qs-dec': {
      absolute: { low: -40.0, high: 20.0 },
      delta: { low: -3.0, high: 10.0 },
      unit: 'K',
    },
  },
  tn_mean: {
    ys: {
      absolute: { low: -30.0, high: 8.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'K',
    },
    ms: {
      absolute: { low: -40.0, high: 20.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'K',
    },
    'qs-dec': {
      absolute: { low: -40.0, high: 20.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'K',
    },
  },
  tn_min: {
    ys: {
      absolute: { low: -60.0, high: -5.0 },
      delta: { low: -2.0, high: 20.0 },
      unit: 'K',
    },
    ms: {
      absolute: { low: -50.0, high: 10.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'K',
    },
  },
  'tnlt_-15': {
    ys: {
      absolute: { low: 0.0, high: 300.0 },
      delta: { low: -100.0, high: 10.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 30.0 },
      delta: { low: -20.0, high: 5.0 },
      unit: 'days',
    },
  },
  'tnlt_-25': {
    ys: {
      absolute: { low: 0.0, high: 200.0 },
      delta: { low: -100.0, high: 20.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 30.0 },
      delta: { low: -20.0, high: 5.0 },
      unit: 'days',
    },
  },
  tr_18: {
    ys: {
      absolute: { low: 0.0, high: 60.0 },
      delta: { low: -5.0, high: 50.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 10.0 },
      delta: { low: -0.9, high: 10.0 },
      unit: 'days',
    },
  },
  tr_20: {
    ys: {
      absolute: { low: 0.0, high: 40.0 },
      delta: { low: -2.0, high: 30.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 8.0 },
      delta: { low: -0.3, high: 7.0 },
      unit: 'days',
    },
  },
  tr_22: {
    ys: {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -0.4, high: 20.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 3.0 },
      delta: { low: -0.03, high: 3.0 },
      unit: 'days',
    },
  },
  tx_max: {
    ys: {
      absolute: { low: 6.0, high: 40.0 },
      delta: { low: -1.0, high: 8.0 },
      unit: 'K',
    },
    ms: {
      absolute: { low: -20.0, high: 40.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'K',
    },
  },
  tx_mean: {
    ys: {
      absolute: { low: -20.0, high: 20.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'K',
    },
    ms: {
      absolute: { low: -40.0, high: 30.0 },
      delta: { low: -3.0, high: 10.0 },
      unit: 'K',
    },
    'qs-dec': {
      absolute: { low: -30.0, high: 30.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'K',
    },
  },
  txgt_25: {
    ys: {
      absolute: { low: 0.0, high: 100.0 },
      delta: { low: -10.0, high: 70.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 30.0 },
      delta: { low: -3.0, high: 10.0 },
      unit: 'days',
    },
  },
  txgt_27: {
    ys: {
      absolute: { low: 0.0, high: 100.0 },
      delta: { low: -10.0, high: 60.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -3.0, high: 20.0 },
      unit: 'days',
    },
  },
  txgt_29: {
    ys: {
      absolute: { low: 0.0, high: 80.0 },
      delta: { low: -10.0, high: 60.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -2.0, high: 10.0 },
      unit: 'days',
    },
  },
  txgt_30: {
    ys: {
      absolute: { low: 0.0, high: 70.0 },
      delta: { low: -8.0, high: 50.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 20.0 },
      delta: { low: -1.0, high: 10.0 },
      unit: 'days',
    },
  },
  txgt_32: {
    ys: {
      absolute: { low: 0.0, high: 50.0 },
      delta: { low: -5.0, high: 40.0 },
      unit: 'days',
    },
    ms: {
      absolute: { low: 0.0, high: 10.0 },
      delta: { low: -0.7, high: 9.0 },
      unit: 'days',
    },
  },
};

// Specific variables that use very custom color ramps
// Example, building_climate_zones is actually hddheat_18 with a special categorized legend
const special_variables = {
  building_climate_zones: {
    layers_replace: ['building_climate_zones', 'hddheat_18'],
    styles: 'CDC:building_climate_zones',
    colormap: {
      colours: [
        '#C90000',
        '#FAEE02',
        '#00C936',
        '#0083C9',
        '#1400C9',
        '#7F00C9',
      ],
      quantities: [3000, 4000, 5000, 6000, 7000, 99999999],
      labels: [
        'Climate Zone 4',
        'Climate Zone 5',
        'Climate Zone 6',
        'Climate Zone 7A',
        'Climate Zone 7B',
        'Climate Zone 8',
      ],
      scheme_type: 'discrete',
      categorical: true,
    },
  },
  idf: {
    colormap: {
      colours: [],
      quantities: [],
      labels: [],
    },
  },
  'climate-normals': {
    colormap: {
      colours: [],
      quantities: [],
      labels: [],
    },
  },
  'station-data': {
    colormap: {
      colours: [],
      quantities: [],
      labels: [],
    },
  },
  ahccd: {
    colormap: {
      colours: [],
      quantities: [],
      labels: [],
    },
  },
};

/**
 * Mapping to translate a variable id to a "short" name, grouped by variable type.
 *
 * For each variable type we have a list of "variable id to name" mappings. Each mapping is an object with two keys:
 * `id` which is either a string or a regular expression matching the id; and `name` which is the variable's name to use
 * in the filename.
 *
 * The name can contain placeholders, between `<` and `>`. A function using this mapping will generally replace
 * the placeholders will specific values. For regular expressions, named groups can be used to specify the placeholder
 * value in the variable name.
 *
 * @type {Object.<string, {id: string|RegExp, name: string}[]>}
 */
const variable_short_names = {
  // Pre-calculated variables (i.e. 'single')
  'single': [
    {id: 'tn_min', name: 'MinTmin'}, // Coldest Day
    {id: /HXmax(?<qt>\d+)/, name: 'DaysHumidexAboveThreshold-<qt>'}, // Days with Humidex > X
    {id: /txgt_(?<qt>-?\d+)/, name: 'DaysAboveTmax-<qt>'}, // Days with Tmax > X
    {id: /tnlt_(?<qt>-?\d+)/, name: 'DaysBelowTmin-<qt>'}, // Days with Tmin < X
    {id: 'first_fall_frost', name: 'FirstFallFrost'}, // First fall frost
    {id: 'frost_free_season', name: 'FrostFreeSeason'}, // Frost free season
    {id: 'tx_max', name: 'MaxTmax'}, // Hottest Day
    {id: 'last_spring_frost', name: 'LastSpringFrost'}, // Last spring frost
    {id: 'tx_mean', name: 'MeanTmax'}, // Maximum Temperature
    {id: 'tg_mean', name: 'MeanTemperature'}, // Mean Temperature
    {id: 'tn_mean', name: 'MeanTmin'}, // Minimum Temperature
    {id: /rx1day/, name: 'MaxDaysTotalPreci-qt-1'}, // Maximum 1-Day (Total) Precipitation
    {id: /rx5day/, name: 'MaxDaysTotalPreci-qt-5'}, // Maximum 5-Days (Total) Precipitation
    {id: 'cdd', name: 'MaxConsDryDays-qt-1'}, // Maximum Number of Consecutive Dry Days
    {id: 'nr_cdd', name: 'NbConsDryDays-qt-5'}, // Number of Periods with more than 5 Consecutive Dry Days
    {id: /spei_(?<m>\d+)m/, name: 'SPEI-<m>Months'}, // Standardized precipitation evapotranspiration index (X months)
    {id: 'prcptot', name: 'TotalPreci'}, // Total Precipitation
    {id: /r(?<t>\d+)mm/, name: 'WetDays-qt-<t>'}, // Wet Days
    {id: /cddcold_(?<t>-?\d+)/, name: 'DegDaysAboveThreshold-qt-<t>'}, // Cooling Degree Days
    {id: /dlyfrzthw_.+/, name: 'DaysFreezeThawCycle-neg1-to-0'}, // Freeze-Thaw Cycles
    {id: 'frost_days', name: 'FrostDays'}, // Frost Days
    {id: /gddgrow_(?<t>-?\d+)/, name: 'GrowingDegreeDays-qt-<t>'}, // Cumulative degree-days above X/Growing Degree Days (X°C)
    {id: /hddheat_(?<t>-?\d+)/, name: 'DegDaysBelowThreshold-qt-<t>'}, // Heating degree days
    {id: 'ice_days', name: 'IceDays'}, // Ice Days
    {id: 'slr', name: 'RelSeaLvlChange'}, // Relative Sea-Level Change
    {id: /tr_(?<t>-?\d+)/, name: 'DaysAboveTmin-<t>'}, // Tropical Nights - Days with Tmin > X
  ],

  // Analysis variables (i.e. 'custom')
  'custom': [
    {id: 'sdii', name: 'AverageWetDayPreciIntens-qt-<thresh>'}, // Average ‘Wet Day’ Precipitation Intensity
    {id: 'cold_spell_days', name: 'ColdSpellDays-<window>-days-at-<thresh>'}, // Cold Spell Days
    {id: 'hxmax_days_above', name: 'DaysAboveHXmax-<thresh>'}, // Days above HXMax
    {id: 'tx_days_above', name: 'DaysAboveTmax-<thresh>'}, // Days above Tmax
    {id: 'tx_tn_days_above', name: 'DaysAboveTmaxAndTmin-<thresh_tasmin>-to-<thresh_tasmax>'}, // Days above Tmax and Tmin
    {id: 'tropical_nights', name: 'DaysAboveTmin-<thresh>'}, // Days above Tmin
    {id: 'tn_days_below', name: 'DaysBelowTmin-<thresh>'}, // Days below Tmin
    {id: 'dlyfrzthw', name: 'DaysFreezeThawCycle-<thresh_tasmin>-to-<thresh_tasmax>'}, // Days with a Freeze-Thaw Cycle
    {id: 'cooling_degree_days', name: 'DegDaysAboveThreshold-<thresh>'}, // Degree Days Above a Threshold
    {id: 'heating_degree_days', name: 'DegDaysBelowThreshold-<thresh>'}, // Degree Days Below a Threshold
    {id: 'degree_days_exceedance_date', name: 'DegDaysExceedDate-<sum_thresh>-days-<thresh>-from-<after_date>'}, // Degree days exceedance date
    {id: 'heat_wave_index', name: 'HeatWave-<window>-days-at-<thresh>'}, // Heat Wave (index)
    {id: 'heat_wave_frequency', name: 'HeatWaveFreq-<window>-days-at-<thresh_tasmin>-to-<thresh_tasmax>'}, // Heat Wave Frequency
    {id: 'heat_wave_total_length', name: 'HeatWaveTotDuration-<window>-days-at-<thresh_tasmin>-to-<thresh_tasmax>'}, // Heat Wave Total Duration
    {id: 'cdd', name: 'MaxConsDryDays-qt-<thresh>'}, // Maximum Consecutive Dry Days
    {id: 'cwd', name: 'MaxConsWetDays-qt-<thresh>'}, // Maximum Consecutive Wet Days'
    {id: 'wetdays', name: 'WetDays-qt-<thresh>'}, // Wet Days
  ],
};
