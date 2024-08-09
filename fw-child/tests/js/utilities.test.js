/*
 * Tests for some functions in fw-child/resources/js/utilities.js.
 *
 * We don't yet have a testing framework in place, so, to run those tests, you need to include this script in the page.
 * When a testing framework will be setup, the tests here will simply need to be adapted.
 */

function run_tests() {
  function test(name, test_fn) {
    console.debug(`TEST: ${name}`);
    test_fn();
  }

  function test_filter_query_for_variable_type() {
    test('single: filters non-applicable keys', () => {
      const query = {
        sector: 'test2',
        dataset: 'test1',
        other: 'to remove',
        format: 'csv',
        var: 'test3',
        frequency: true,
        selections: ["123", "bbb"],
        bbox: [1, 2, 3, 4],
        inputs: {a: '2'},
      }

      const expected_keys = ['dataset', 'sector', 'var', 'frequency', 'format', 'selections', 'bbox'].sort();

      const result = filter_query_for_variable_type(query, 'single');
      const result_keys = Object.keys(result).sort();

      const keys_are_same = JSON.stringify(result_keys) === JSON.stringify(expected_keys);
      console.assert(keys_are_same, `${result_keys} !== ${expected_keys}`);

      for (const key of Object.keys(result)) {
        console.assert(result[key] === query[key], `${result[key]} !== ${query[key]}`);
      }
    });

    test('single: does not add other elements to query', () => {
      const query = {
        other: 'do not keep',
      }
      const result = filter_query_for_variable_type(query, 'single');
      console.assert(Object.keys(result).length === 0, `Expected an empty object`);
    });

    test('custom: filters non-applicable keys', () => {
      const query = {
        sector: 'test2',
        dataset: 'test1',
        other: 'to remove',
        format: 'csv',
        var: 'test3',
        frequency: true,
        selections: ["123", "bbb"],
        bbox: [1, 2, 3, 4],
        start_year: '1952',
        end_year: '2026',
        scenarios: ['medium'],
        percentiles: ['5'],
        decimals: 3,
        inputs: {a: '2'},
        models: 'all',
      }

      const expected_keys = [
        'dataset', 'sector', 'var', 'frequency', 'format', 'selections', 'bbox', 'start_year', 'end_year', 'scenarios', 'percentiles', 'decimals', 'models', 'inputs'
      ].sort();

      const result = filter_query_for_variable_type(query, 'custom');
      const result_keys = Object.keys(result).sort();

      const keys_are_same = JSON.stringify(result_keys) === JSON.stringify(expected_keys);
      console.assert(keys_are_same, `${result_keys} !== ${expected_keys}`);

      for (const key of Object.keys(result)) {
        console.assert(result[key] === query[key], `${result[key]} !== ${query[key]}`);
      }
    });

    test('custom: does not add other elements to query', () => {
      const query = {
        other: 'do not keep',
      }
      const result = filter_query_for_variable_type(query, 'custom');
      console.assert(Object.keys(result).length === 0, `Expected an empty object`);
    });

    test('custom: decimals removed if format is not csv', () => {
      const query = {
        format: 'other',
        decimals: 3,
      }
      const result = filter_query_for_variable_type(query, 'custom');
      const actual_keys = Object.keys(result);
      console.assert(actual_keys.length === 1 && actual_keys[0] === 'format', `Expected decimals to be removed`);
    });

    test('ahccd: filters non-applicable keys', () => {
      const query = {
        dataset: 'ahccd',
        other: 'to remove',
        format: 'csv',
        var: 'test3',
        frequency: true,
        station: ["123", "bbb"],
        decimals: 3,
        inputs: {a: '2'},
        check_missing: '0.1',
      }

      const expected_keys = [
        'dataset', 'format', 'var', 'frequency', 'station', 'decimals', 'inputs', 'check_missing',
      ].sort();

      const result = filter_query_for_variable_type(query, 'ahccd');
      const result_keys = Object.keys(result).sort();

      const keys_are_same = JSON.stringify(result_keys) === JSON.stringify(expected_keys);
      console.assert(keys_are_same, `${result_keys} !== ${expected_keys}`);

      for (const key of Object.keys(result)) {
        console.assert(result[key] === query[key], `${result[key]} !== ${query[key]}`);
      }
    });

    test('ahccd: decimals removed if format is not csv', () => {
      const query = {
        format: 'other',
        decimals: 3,
      }
      const result = filter_query_for_variable_type(query, 'ahccd');
      const actual_keys = Object.keys(result);
      console.assert(actual_keys.length === 1 && actual_keys[0] === 'format', `Expected decimals to be removed`);
    });

    test('no filter for unknown type', () => {
      const query = {
        sector: 'test2',
        other: 'to remove',
      }
      const expected_keys = Object.keys(query).sort();

      const result = filter_query_for_variable_type(query, 'unknown-type');
      const result_keys = Object.keys(result).sort();

      const keys_are_same = JSON.stringify(result_keys) === JSON.stringify(expected_keys);
      console.assert(keys_are_same, `${result_keys} !== ${expected_keys}`);

      for (const key of Object.keys(result)) {
        console.assert(result[key] === query[key], `${result[key]} !== ${query[key]}`);
      }
    });
  }

  function test_generate_data_query_filename() {

    // -----
    // dataset
    // -----

    test('dataset: has expected name', () => {
      const dataset_map = {
        // name_in_the_form: name_for_the_file
        cmip6: 'CanDCS-u6',
        cmip5: 'CanDCS-u5',
        humidex: 'HUMIDEX',
        ahccd: 'AHCCD',
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
      console.assert(file_name.startsWith('Unknown'), `Expected: Unknown; Actual is: ${file_name}`);
    });

    // -----
    // location
    // -----

    test('location: has expected name', () => {
      const location_map = {
        // name_in_the_form: name_for_the_file
        gridded_data: 'Grid',
        census: 'Census',
        health: 'Health',
        watershed: 'Watershed',
        upload: 'CustomShape',
      };

      for (const [name_in_form, expected_name] of Object.entries(location_map)) {
        const query = {
          sector: name_in_form,
        };
        const name_test = new RegExp(`${expected_name}\\..+`);
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

    test('location: has region ids', () => {
      const query = {
        sector: 'gridded_data',
        selections: ['123', 'bbb'],
      };
      const name_test = new RegExp(`Grid-123-bbb.+`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('location: limits to a maximum of three region ids', () => {
      const query = {
        sector: 'gridded_data',
        selections: ['111', '222', '333', '444'],
      };
      const name_test = new RegExp(`Grid-111-222-333(?!-444).+`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('location: has bbox if a bounding box was drawn', () => {
      const query = {
        sector: 'test',
        bbox: [1, 2, 3, 4],
      };
      const name_test = new RegExp(`Test-bbox.+`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    // -----
    // Stations
    // -----

    test('stations: supports single station id', () => {
      const query = {
        station: ['123'],
      };
      const name_test = new RegExp(`Stations-123[^-]`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('stations: supports multiple station ids', () => {
      const query = {
        station: ['123', 'bbb'],
      };
      const name_test = new RegExp(`Stations-123-bbb[^-]`);
      const file_name = generate_data_query_filename(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('stations: limits to a maximum of three stations', () => {
      const query = {
        station: ['111', '222', '333', '444'],
      };
      const name_test = new RegExp(`Stations-111-222-333(?!-444).+`);
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
        {id: 'sample', name: 'SampleVar'},
        {id: 'other', name: 'OTHER'},
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
        {id: /gddgrow_-?\d+/, name: 'SampleVar'},
      ];

      const query = {
        var: 'gddgrow_-15',
      };

      const name_test = new RegExp(`.*SampleVar.+`);
      const file_name = generate_data_query_filename(query, variables_filename);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('variable: can specify placeholders in variable id', () => {
      const variables_filename = [
        {id: /myvar_(?<p1>\d+)_-?(?<p2>\w\w)/, name: 'MyVar-<p1>-<p2>-end'},
      ];

      const query = {
        var: 'myvar_35_-hello',
      };

      const name_test = new RegExp(`.*MyVar-35-he-end.+`);
      const file_name = generate_data_query_filename(query, variables_filename);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('variable: defaults to variable id if no name', () => {
      const variables_filename = [
        {id: 'sample', name: 'SampleVar'},
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
        {id: 'sample', name: 'SampleVar-<p1>-<p2>-end'},
      ];

      const query = {
        var: 'sample',
        inputs: {
          p2: '2',
          p1: 'aaa',
        },
      };

      const name_test = new RegExp(`.*SampleVar-aaa-2-end.+`);
      const file_name = generate_data_query_filename(query, variables_filename);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    test('variable: negative value has neg in front', () => {
      const variables_filename = [
        {id: /^sample_(?<p1>-?\d)_(?<p2>\d-\d)/, name: 'SampleVar-<p1>-<p2>-<p3>-<p4>'},
      ];

      const query = {
        var: 'sample_-3_4-5', // The first -3 must be replaced with neg3, but 4-5 must stay as is
        inputs: {
          p3: '-122', // Must be replaced by neg122
          p4: '1950-2025', // Must not be transformed
        },
      };

      const name_test = new RegExp(`.*SampleVar-neg3-4-5-neg122-1950-2025.+`);
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

    // -----
    // models
    // -----

    test('percentile: single percentile', () => {
      const models_map = {
        pcic12: 'PCIC12',
        '24models': 'All',
        '26models': 'All',
        anything: 'Anything',
      };

      for (const [model, expected_name] of Object.entries(models_map)) {
        const query = {
          models: model,
        };
        const name_test = new RegExp(`.*${expected_name}.+`);
        const file_name = generate_data_query_filename(query);
        console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
      }
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

    // -----
    // missing tolerance
    // -----

    test('missing: correctly added', () => {
      const query = {
        check_missing: 'any',
      };
      const name_test = new RegExp(`.*tol-any.+`);
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

    test('temporal frequency: inserts expected value', () => {
      const frequency_map = {
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
        YS: 'Annual',
        'QS-DEC': 'Seasonal',
        MS: 'Monthly',
        'AS-JUL': 'July2June',
        all: 'AllMonths',
        anything: 'Anything', // any other value must have first letter upper case
      }
      for (const [frequency_value, expected_name] of Object.entries(frequency_map)) {
        const query = {
          frequency: frequency_value,
        };
        const name_test = new RegExp(`.*${expected_name}.+`);
        const file_name = generate_data_query_filename(query);
        console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
      }
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
      const name_test = new RegExp(`^Test$`);
      const file_name = generate_data_query_filename(query, [], {with_extension: false});
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    });

    // -----
    // End to end tests
    // -----

    const end2end_tests = [
      {
        query: {unknown_attr: 'any_value'},
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
          models: '24models',
          var: 'my_var',
          inputs: {
            tmin: '-6',
            tmax: 15,
          },
        },
        expected_filename: 'CanDCS-u5_Health_from-1973-to-2016_MyVar-neg6-15_All_RCP26-RCP45_p8-p23_May_4.csv',
      },
      {
        query: {
          sector: 'upload',
          format: 'netcdf',
          scenarios: ['high'],
        },
        expected_filename: 'CustomShape_high',
        options: {with_extension: false},
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

  test_filter_query_for_variable_type();
  test_generate_data_query_filename();
}

window.addEventListener('load', run_tests);
