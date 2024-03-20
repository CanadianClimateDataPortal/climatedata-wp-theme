// constants containing required data for all variables, especially used for legend and custom color ramps
const variables_data = {
  "HXmax30": {
    "ys": {"absolute": {"low": 0.0, "high": 100.0}, "delta": {"low": -10.0, "high": 70.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 0.0, "high": 70.0}, "delta": {"low": -7.0, "high": 40.0}, "unit": "days"}
  },
  "HXmax35": {
    "ys": {"absolute": {"low": 0.0, "high": 60.0}, "delta": {"low": -5.0, "high": 50.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 10.0}, "delta": {"low": -1.0, "high": 10.0}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 0.0, "high": 40.0}, "delta": {"low": -2.0, "high": 30.0}, "unit": "days"}
  },
  "HXmax40": {
    "ys": {"absolute": {"low": 0.0, "high": 30.0}, "delta": {"low": -1.0, "high": 20.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 4.0}, "delta": {"low": 0.0, "high": 4.0}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 0.0, "high": 10.0}, "delta": {"low": 0.0, "high": 10.0}, "unit": "days"}
  },
  "cdd": {"ys": {"absolute": {"low": 10.0, "high": 100.0}, "delta": {"low": -40.0, "high": 9.0}, "unit": "days"}},
  "cddcold_18": {
    "ys": {
      "absolute": {"low": 0.0, "high": 800.0},
      "delta": {"low": -80.0, "high": 600.0},
      "unit": "degree_days"
    }
  },
  "dlyfrzthw_tx0_tn-1": {
    "ys": {
      "absolute": {"low": 8.0, "high": 100.0},
      "delta": {"low": -40.0, "high": 8.0},
      "unit": "days"
    }
  },
  "first_fall_frost": {
    "ys": {
      "absolute": {"low": 200.0, "high": 300.0},
      "delta": {"low": -10.0, "high": 60.0},
      "unit": ""
    }
  },
  "frost_days": {
    "ys": {
      "absolute": {"low": 20.0, "high": 400.0},
      "delta": {"low": -80.0, "high": 10.0},
      "unit": "days"
    }
  },
  "frost_free_season": {
    "ys": {
      "absolute": {"low": 2.0, "high": 300.0},
      "delta": {"low": -20.0, "high": 90.0},
      "unit": "days"
    }
  },
  "gddgrow_0": {
    "ys": {
      "absolute": {"low": 20.0, "high": 5000.0},
      "delta": {"low": -300.0, "high": 2000.0},
      "unit": "K days"
    }, "ms": {"absolute": {"low": 0.0, "high": 700.0}, "delta": {"low": -40.0, "high": 200.0}, "unit": "K days"}
  },
  "gddgrow_5": {
    "ys": {
      "absolute": {"low": 0.5, "high": 3000.0},
      "delta": {"low": -200.0, "high": 1000.0},
      "unit": "degree_days"
    }
  },
  "hddheat_18": {
    "ys": {
      "absolute": {"low": 3000.0, "high": 20000.0},
      "delta": {"low": -4000.0, "high": 700.0},
      "unit": "degree_days"
    }
  },
  "ice_days": {"ys": {"absolute": {"low": 1.0, "high": 300.0}, "delta": {"low": -60.0, "high": 10.0}, "unit": "days"}},
  "last_spring_frost": {
    "ys": {
      "absolute": {"low": 60.0, "high": 200.0},
      "delta": {"low": -40.0, "high": 9.0},
      "unit": ""
    }
  },
  "nr_cdd": {
    "ys": {"absolute": {"low": 5.0, "high": 20.0}, "delta": {"low": -4.0, "high": 3.0}, "unit": ""},
    "ms": {"absolute": {"low": 0.2, "high": 2.0}, "delta": {"low": -0.7, "high": 0.3}, "unit": ""}
  },
  "prcptot": {
    "ys": {"absolute": {"low": 60.0, "high": 3000.0}, "delta": {"low": -40.0, "high": 200.0}, "unit": "mm"},
    "ms": {"absolute": {"low": 6.0, "high": 300.0}, "delta": {"low": -10.0, "high": 30.0}, "unit": "mm day-1"},
    "qs-dec": {"absolute": {"low": 20.0, "high": 900.0}, "delta": {"low": -20.0, "high": 70.0}, "unit": "mm day-1"}
  },
  "r10mm": {
    "ys": {"absolute": {"low": 0.1, "high": 100.0}, "delta": {"low": -2.0, "high": 9.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 6.0}, "delta": {"low": -0.2, "high": 0.6}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -0.3, "high": 2.0}, "unit": "days"}
  },
  "r1mm": {
    "ys": {"absolute": {"low": 20.0, "high": 200.0}, "delta": {"low": -7.0, "high": 40.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.7, "high": 20.0}, "delta": {"low": -2.0, "high": 6.0}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 2.0, "high": 70.0}, "delta": {"low": -4.0, "high": 20.0}, "unit": "days"}
  },
  "r20mm": {
    "ys": {"absolute": {"low": 0.0, "high": 50.0}, "delta": {"low": -0.8, "high": 5.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 6.0}, "delta": {"low": -0.2, "high": 0.6}, "unit": "days"},
    "qs-dec": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -0.3, "high": 2.0}, "unit": "days"}
  },
  "rx1day": {
    "ys": {"absolute": {"low": 7.0, "high": 90.0}, "delta": {"low": -3.0, "high": 10.0}, "unit": "mm day-1"},
    "ms": {"absolute": {"low": 1.0, "high": 50.0}, "delta": {"low": -2.0, "high": 6.0}, "unit": "mm"},
    "qs-dec": {"absolute": {"low": 2.0, "high": 70.0}, "delta": {"low": -2.0, "high": 8.0}, "unit": "mm/day"}
  },
  "rx5day": {
    "ys": {"absolute": {"low": 10.0, "high": 200.0}, "delta": {"low": -4.0, "high": 20.0}, "unit": "mm"},
    "ms": {"absolute": {"low": 3.0, "high": 100.0}, "delta": {"low": -4.0, "high": 10.0}, "unit": "mm"}
  },
  "tg_mean": {
    "ys": {"absolute": {"low": -20.0, "high": 10.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "K"},
    "ms": {"absolute": {"low": -40.0, "high": 20.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "K"},
    "qs-dec": {"absolute": {"low": -40.0, "high": 20.0}, "delta": {"low": -3.0, "high": 10.0}, "unit": "K"}
  },
  "tn_mean": {
    "ys": {"absolute": {"low": -30.0, "high": 8.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "K"},
    "ms": {"absolute": {"low": -40.0, "high": 20.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "K"},
    "qs-dec": {"absolute": {"low": -40.0, "high": 20.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "K"}
  },
  "tn_min": {
    "ys": {"absolute": {"low": -60.0, "high": -5.0}, "delta": {"low": -2.0, "high": 20.0}, "unit": "K"},
    "ms": {"absolute": {"low": -50.0, "high": 10.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "K"}
  },
  "tnlt_-15": {
    "ys": {"absolute": {"low": 0.0, "high": 300.0}, "delta": {"low": -100.0, "high": 10.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 30.0}, "delta": {"low": -20.0, "high": 5.0}, "unit": "days"}
  },
  "tnlt_-25": {
    "ys": {"absolute": {"low": 0.0, "high": 200.0}, "delta": {"low": -100.0, "high": 20.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 30.0}, "delta": {"low": -20.0, "high": 5.0}, "unit": "days"}
  },
  "tr_18": {
    "ys": {"absolute": {"low": 0.0, "high": 60.0}, "delta": {"low": -5.0, "high": 50.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 10.0}, "delta": {"low": -0.9, "high": 10.0}, "unit": "days"}
  },
  "tr_20": {
    "ys": {"absolute": {"low": 0.0, "high": 40.0}, "delta": {"low": -2.0, "high": 30.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 8.0}, "delta": {"low": -0.3, "high": 7.0}, "unit": "days"}
  },
  "tr_22": {
    "ys": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -0.4, "high": 20.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 3.0}, "delta": {"low": -0.03, "high": 3.0}, "unit": "days"}
  },
  "tx_max": {
    "ys": {"absolute": {"low": 6.0, "high": 40.0}, "delta": {"low": -1.0, "high": 8.0}, "unit": "K"},
    "ms": {"absolute": {"low": -20.0, "high": 40.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "K"}
  },
  "tx_mean": {
    "ys": {"absolute": {"low": -20.0, "high": 20.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "K"},
    "ms": {"absolute": {"low": -40.0, "high": 30.0}, "delta": {"low": -3.0, "high": 10.0}, "unit": "K"},
    "qs-dec": {"absolute": {"low": -30.0, "high": 30.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "K"}
  },
  "txgt_25": {
    "ys": {"absolute": {"low": 0.0, "high": 100.0}, "delta": {"low": -10.0, "high": 70.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 30.0}, "delta": {"low": -3.0, "high": 10.0}, "unit": "days"}
  },
  "txgt_27": {
    "ys": {"absolute": {"low": 0.0, "high": 100.0}, "delta": {"low": -10.0, "high": 60.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -3.0, "high": 20.0}, "unit": "days"}
  },
  "txgt_29": {
    "ys": {"absolute": {"low": 0.0, "high": 80.0}, "delta": {"low": -10.0, "high": 60.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -2.0, "high": 10.0}, "unit": "days"}
  },
  "txgt_30": {
    "ys": {"absolute": {"low": 0.0, "high": 70.0}, "delta": {"low": -8.0, "high": 50.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 20.0}, "delta": {"low": -1.0, "high": 10.0}, "unit": "days"}
  },
  "txgt_32": {
    "ys": {"absolute": {"low": 0.0, "high": 50.0}, "delta": {"low": -5.0, "high": 40.0}, "unit": "days"},
    "ms": {"absolute": {"low": 0.0, "high": 10.0}, "delta": {"low": -0.7, "high": 9.0}, "unit": "days"}
  }
}

// Specific variables that use very custom color ramps
// Example, building_climate_zones is actually hddheat_18 with a special categorized legend
const special_variables = {
  building_climate_zones: {
    layers_replace: ['building_climate_zones', 'hddheat_18'],
    styles: 'CDC:building_climate_zones',
    colormap: {
      colours: ['#C90000', '#FAEE02', '#00C936', '#0083C9', '#1400C9', '#7F00C9'],
      quantities: [3000, 4000, 5000, 6000, 7000, 99999999],
      labels: ['Climate Zone 4', 'Climate Zone 5', 'Climate Zone 6', 'Climate Zone 7A', 'Climate Zone 7B', 'Climate Zone 8'],
      scheme_type: 'discrete',
      categorical: true
    }
  }
}

/**
 * Mapping to translate a variable id to a "short" name.
 * 
 * Each element is a map from an id to a name. It's an object with two keys: `id` which is either a string or a regular
 * expression matching the id; and `name` which is the variable's name to use in the filename.
 *  
 * The name can contain placeholders, between `<` and `>`. A function using this mapping will generally replace
 * the placeholders will specific values.
 * 
 * @type {{id: string|RegExp, name: string}[]}
 */
const variable_short_names = [
  { id: 'building_climate_zones', name: '' }, // Building Climate Zones
  { id: 'cdd', name: 'MaxConsDryDays-qt-<quantity>' }, // Maximum Number of Consecutive Dry Days
  { id: /cddcold_-?\d+/, name: 'DegDaysAboveThreshold-qt-<quantity>' }, // Cooling Degree Days
  { id: 'cwd', name: 'MaxConsWetDays-qt-<quantity>' }, // Maximum Consecutive Wet Days'
  { id: /dlyfrzthw_.+/, name: 'DaysFreezeThawCycle-<Tmin>-to-<Tmax>' }, // Freeze-Thaw Cycles
  { id: 'first_fall_frost', name: '' }, // First fall frost
  { id: 'frost_days', name: '' }, // Frost Days
  { id: 'frost_free_season', name: '' }, // Frost free season
  { id: /gddgrow_-?\d+/, name: 'DegDaysAboveThreshold-<Tmin>' }, // Cumulative degree-days above X/Growing Degree Days (X°C)
  { id: /hddheat_-?\d+/, name: 'DegDaysBelowThreshold-qt-<quantity>' }, // Heating degree days
  { id: /HXmax\d+/, name: '' }, // Days with Humidex > X
  { id: 'idf', name: '' }, // Short-duration Rainfall IDF
  { id: 'ice_days', name: '' }, // Ice Days
  { id: 'last_spring_frost', name: '' }, // Last spring frost
  { id: 'nr_cdd', name: '' }, // Number of Periods with more than 5 Consecutive Dry Days
  { id: 'prcptot', name: '' }, // Total Precipitation
  { id: /r\d+mm/, name: 'WetDays-qt-<thresh>' }, // Wet Days
  { id: /rx\d+day/, name: '' }, // Maximum X-Day (Total) Precipitation
  { id: 'sdii', name: 'AverageWetDayPreciIntens-qt-<quantity>' }, // Average ‘Wet Day’ Precipitation Intensity
  { id: 'slr', name: '' }, // Relative Sea-Level Change
  { id: /spei_\d+m/, name: '' }, // Standardized precipitation evapotranspiration index (X months)
  { id: 'tg_mean', name: '' }, // Mean Temperature
  { id: 'tn_mean', name: '' }, // Minimum Temperature
  { id: 'tn_min', name: '' }, // Coldest Day
  { id: /tnlt_-?\d+/, name: 'DaysBelowTmin-<Tmin>' }, // Days with Tmin < X
  { id: /tr_-?\d+/, name: 'DaysAboveTmin-<Tmin>' }, // Tropical Nights - Days with Tmin > X
  { id: 'tx_max', name: '' }, // Hottest Day
  { id: 'tx_mean', name: '' }, // Maximum Temperature
  { id: /txgt_-?\d+/, name: 'DaysAboveTmax-<Tmax>' }, // Days with Tmax > X
  { id: 'tx_tn_days_above', name: 'DaysAboveTmaxAndTmin-<Tmin>-to-<Tmax>' }, // Days above Tmax and Tmin
  { id: 'weather-stations', name: '' }, // MSC Climate Normals 1981-2010
];
