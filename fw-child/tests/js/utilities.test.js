function run_tests() {
  function test(name, test_fn) {
    console.debug(`TEST: ${name}`);
    test_fn();
  }

  // -----
  // dataset
  // -----

  test('dataset: has expected name', () => {
    const dataset_map = {
      // name_in_the_form: name_for_the_file
      cmip6: 'CanDCS-u6',
      cmip5: 'CanDCS-u5',
      humidex: 'HUMIDEX',
    };

    for (const [name_in_form, expected_name] of Object.entries(dataset_map)) {
      const query = {
        dataset: name_in_form,
      };
      const file_name = generate_data_query_filename(query);
      console.assert(file_name.startsWith(`${expected_name}`), `Expected: ${expected_name}; Actual is: ${file_name}`);
    }
  });

  test('dataset: default name is dataset id', () => {
    const query = {
      dataset: 'unknown'
    };
    const file_name = generate_data_query_filename(query);
    console.assert(file_name.startsWith('unknown'), `Expected: unknown; Actual is: ${file_name}`);
  });

  // -----
  // location
  // -----

  test('location: has expected name', () => {
    const location_map = {
      // name_in_the_form: name_for_the_file
      canadagrid: 'Canadagrid',
      census: 'Census',
      health: 'Health',
      watershed: 'Watershed',
    };

    for (const [name_in_form, expected_name] of Object.entries(location_map)) {
      const query = {
        sector: name_in_form,
      };
      const name_test = new RegExp(`${expected_name}.+`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    }
  });

  test('location: default is location id', () => {
    const query = {
      sector: 'unknown'
    };
    const name_test = new RegExp(`Unknown.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('location: has region id', () => {
    const query = {
      // TODO: determine what is the actual
      sector_id: 12345,
    };
    const name_test = new RegExp(`Canadagrid_12345.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('location: CustomShape used when location is custom', () => {
    const query = {
      sector: 'custom',
      sector_id: 12345,  // Must be ignored
    };
    const name_test = new RegExp(`CustomShape(?!_12345).+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // time
  // -----

  test('time: uses correct start and end time', () => {
    const query = {
      start_year: 1983,
      end_year: 2008,
    };
    const name_test = new RegExp(`.*from-1983-to-2008.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // variables
  // -----

  test('variable: changes variable id to name (string)', () => {
    const variables_filename = [
      { id: 'sample', name: 'SampleVar' },
      { id: 'other', name: 'OTHER' },
    ];
    
    const query = {
      var: 'sample',
    };
    
    const name_test = new RegExp(`.*SampleVar.+`);
    const file_name = generate_data_query_filename(query, variables_filename);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('variable: changes variable id to name (regex)', () => {
    const variables_filename = [
      { id: /gddgrow_-?\d+/, name: 'SampleVar' },
    ];
    
    const query = {
      var: 'gddgrow_-15',
    };
    
    const name_test = new RegExp(`.*SampleVar.+`);
    const file_name = generate_data_query_filename(query, variables_filename);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('variable: defaults to variable id if no name', () => {
    const variables_filename = [
      { id: 'sample', name: 'SampleVar' },
    ];

    const query = {
      var: 'other',
    };

    const name_test = new RegExp(`.*other.+`);
    const file_name = generate_data_query_filename(query, variables_filename);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('variable: placeholders are replaced with inputs', () => {
    const variables_filename = [
      { id: 'sample', name: 'SampleVar-<p1>-<p2>-end' },
    ];

    const query = {
      var: 'sample',
      inputs: [
        {'name': 'p2', 'value': '2'},
        {'name': 'p1', 'value': 'aaa'},
      ]
    };

    const name_test = new RegExp(`.*SampleVar-aaa-2-end.+`);
    const file_name = generate_data_query_filename(query, variables_filename);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('variable: negative value has neg in front', () => {
    const variables_filename = [
      { id: 'sample', name: 'SampleVar-<p1>-<p2>-<p3>' },
    ];

    const query = {
      var: 'sample',
      inputs: [
        {'name': 'p1', 'value': '-2'},
        {'name': 'p2', 'value': '-122'},
        {'name': 'p3', 'value': '1950-2025'}, // Must not be transformed
      ]
    };

    const name_test = new RegExp(`.*SampleVar-neg2-neg122-1950-2025.+`);
    const file_name = generate_data_query_filename(query, variables_filename);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // scenario
  // -----
  test('scenario: single scenario', () => {
    const scenario_map = {
      'low': {'cmip6': 'SSP126', 'cmip5': 'RCP26'},
      'medium': {'cmip6': 'SSP245', 'cmip5': 'RCP45'},
      'high': {'cmip6': 'SSP585', 'cmip5': 'RCP85'},
    }
    for (const [name_in_form, expected_names] of Object.entries(scenario_map)) {
      for (const [dataset, expected_name] of Object.entries(expected_names)) {
        const query = {
          dataset: dataset,
          scenarios: [name_in_form],
        };
        const name_test = new RegExp(`.*${expected_name}.+`);
        const file_name = generate_data_query_filename(query);
        console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
      }
    }
  });

  test('scenario: multiple scenarios', () => {
    const query = {
      dataset: 'cmip6',
      scenarios: ['low', 'medium'],
    };
    const name_test = new RegExp(`.*SSP126-SSP245.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('scenario: defaults to scenario name if invalid dataset', () => {
    const query = {
      dataset: 'invalid',
      scenarios: ['low'],
    };
    const name_test = new RegExp(`.*low.+`)
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('scenario: defaults to scenario name if invalid scenario', () => {
    const query = {
      dataset: 'cmip5',
      scenarios: ['invalid'],
    };
    const name_test = new RegExp(`.*invalid.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('scenario: no scenario added if include_scenarios=false', () => {
    const query = {
      dataset: 'cmip6',
      scenarios: ['low', 'medium'],
    };
    const name_test = new RegExp(`.*SSP126-SSP245.+`);
    const file_name = generate_data_query_filename(query, [], {include_scenarios: false});
    console.assert(!name_test.test(file_name), `Expected: NOT(${name_test}); Actual is: ${file_name}`);
  });

  // -----
  // percentiles
  // -----

  test('percentile: single percentile', () => {
    const query = {
      percentiles: ['13'],
    };
    const name_test = new RegExp(`.*p13.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('percentile: multiple percentiles', () => {
    const query = {
      percentiles: ['7', '39', '81'],
    };
    const name_test = new RegExp(`.*p7-p39-p81.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Temporal frequency
  // -----

  test('temporal frequency: inserts value as is', () => {
    const query = {
      frequency: 'apr',
    };
    const name_test = new RegExp(`.*apr.+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Decimal places
  // -----

  test('decimals: added if specified', () => {
    const query = {
      decimals: '7',
    };
    const name_test = new RegExp(`.*7\..+`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Filename extension
  // -----

  test('format: CSV', () => {
    const query = {
      dataset: 'test',
      format: 'csv',
    };
    const name_test = new RegExp(`.*\.csv$`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('format: NetCDF', () => {
    const query = {
      dataset: 'test',
      format: 'netcdf',
    };
    const name_test = new RegExp(`.*\.nc$`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('format: any other format defaults to .nc', () => {
    const query = {
      dataset: 'test',
      format: 'other',
    };
    const name_test = new RegExp(`.*\.nc$`);
    const file_name = generate_data_query_filename(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  test('format: no extension if with_extension=false', () => {
    const query = {
      dataset: 'test',
      format: 'csv',
    };
    const name_test = new RegExp(`^test$`);
    const file_name = generate_data_query_filename(query, [], { with_extension: false });
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
  
  // -----
  // End to end tests
  // -----
  
  const end2end_tests = [
    {
      query: { unknown_attr: 'any_value' },
      expected_filename: null,
    },
    {
      query: {
        dataset: 'cmip5',
        sector: 'health',
        start_year: '1973',
        end_year: 2016,
        format: 'csv',
        percentiles: ['8', 23],
        frequency: 'may',
        decimals: '4',
        scenarios: ['low', 'medium'],
        var: 'my_var',
        inputs: [
          {name: 'tmin', value: '-6'},
          {name: 'tmax', value: 15},
        ],
      },
      expected_filename: 'CanDCS-u5_Health_from-1973-to-2016_MyVar-neg6-15_RCP26-RCP45_p8-p23_may_4.csv',
    },
    {
      query: {
        sector: 'custom',
        format: 'netcdf',
        scenarios: ['high'],
      },
      expected_filename: 'CustomShape_high',
      options: { with_extension: false },
    },
  ];
  
  const variable_filenames = [
    {id: 'my_var', name: 'MyVar-<tmin>-<tmax>'}
  ];
  
  for (const {query, expected_filename, options} of end2end_tests) {
    test(`end2end: ${expected_filename}`, () => {
      const file_name = generate_data_query_filename(query, variable_filenames, options || {});
      console.assert(file_name === expected_filename, `Expected: ${expected_filename}; Actual is: ${file_name}`);
    });
  }
}

window.addEventListener('load', run_tests);