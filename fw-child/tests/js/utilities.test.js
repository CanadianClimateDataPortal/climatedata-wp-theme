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
      const file_name = create_file_name(query);
      console.assert(file_name.startsWith(`${expected_name}_`), `Expected: ${expected_name}; Actual is: ${file_name}`);
    }
  });

  test('dataset: default name is CanDCS-u5', () => {
    const query = {};
    const file_name = create_file_name(query);
    console.assert(file_name.startsWith('CanDCS-u5'), `Expected: CanDCS-u5; Actual is: ${file_name}`);
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
      const name_test = new RegExp(`[^_]+_${expected_name}.+`);
      const file_name = create_file_name(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    }
  });

  test('location: default is Canadagrid', () => {
    const query = {};
    const name_test = new RegExp(`[^_]+_Canadagrid.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('location: has region id', () => {
    const query = {
      // TODO: determine what is the actual
      sector_id: 12345,
    };
    const name_test = new RegExp(`[^_]+_Canadagrid_12345.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // time
  // -----

  test('time: uses correct start and end time', () => {
    const query = {
      // TODO: determine what is the actual
      start_date: 1983,
      end_date: 2008,
    };
    const name_test = new RegExp(`.+_from_1983_to_2008.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // variables
  // -----

  test('variable: expected name for variable', () => {
    console.assert(false, 'To implement');
  });

  // -----
  // scenario
  // -----
  test('scenario: single scenario', () => {
    const scenario_map = {
      'low': 'ssp126',
      'medium': 'ssp245',
      'high': 'ssp585',
    }
    for (const [name_in_form, expected_name] of Object.entries(scenario_map)) {
      const query = {
        scenarios: [name_in_form],
      };
      const name_test = new RegExp(`.+_${expected_name}.+`);
      const file_name = create_file_name(query);
      console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
    }
  });

  test('scenario: multiple scenarios', () => {
    const query = {
      scenarios: ['low', 'medium'],
    };
    const name_test = new RegExp(`.+_ssp126-ssp245.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // percentiles
  // -----

  test('percentile: single percentile', () => {
    const query = {
      percentiles: ['13'],
    };
    const name_test = new RegExp(`.+_p13.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('percentile: multiple percentiles', () => {
    const query = {
      percentiles: ['7', '39', '81'],
    };
    const name_test = new RegExp(`.+_p7-p39-p81.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Temporal frequency
  // -----

  test('temporal frequency: inserts value as is', () => {
    const query = {
      frequency: 'apr',
    };
    const name_test = new RegExp(`.+_apr.+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Decimal places
  // -----

  test('decimals: added if specified', () => {
    const query = {
      decimals: '7',
    };
    const name_test = new RegExp(`.+_7\..+`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  // -----
  // Extension
  // -----

  test('format: CSV', () => {
    const query = {
      format: 'csv',
    };
    const name_test = new RegExp(`.+\.csv$`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('format: NetCDF', () => {
    const query = {
      format: 'netcdf',
    };
    const name_test = new RegExp(`.+\.nc$`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });

  test('format: any other format defaults to .nc', () => {
    const query = {
      format: 'other',
    };
    const name_test = new RegExp(`.+\.nc$`);
    const file_name = create_file_name(query);
    console.assert(name_test.test(file_name), `Expected: ${name_test}; Actual is: ${file_name}`);
  });
}

window.addEventListener("load", run_tests);