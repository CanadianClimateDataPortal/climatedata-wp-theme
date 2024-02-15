(function ($) {
  /**
   * `shapefile_upload()` jQuery plugin.
   *
   * Call this plugin on the "shapefile" file input.
   *
   * When initialising, the first parameter must be an options object (see keys below). Once initialised, can be called
   * with an action name (see actions below).
   *
   * Initialisation object keys.
   *  - message_container: (any valid jQuery selector) the element where to display error and information messages.
   *  - maps: (object) maps object, like the one in the `options.maps` in the `download_app`.
   *
   * Action names (only once initialised)
   *  - 'show': show on the map the regions of the last selected shapefile. Return the element.
   *  - 'hide': hide the regions on the map. Return the element.
   *  - 'validate': validate the shapefile and the user selected regions. Output errors in the message container and
   *        return a boolean indicating if the validation passed.
   *  - 'selected_shapes_json': return a JSON string of the user selected regions.
   *
   * @param {string|object} actionOrOptions
   * @returns {jQuery|boolean|string}
   */
  $.fn.shapefile_upload = function(actionOrOptions) {
    if (typeof actionOrOptions === 'string') {
      const current_shapefile_upload = this.data('custom_shapefile');

      if (!current_shapefile_upload) {
        return this;
      }

      if (actionOrOptions === 'show') {
        current_shapefile_upload.show_shapes();
      }

      if (actionOrOptions === 'hide') {
        current_shapefile_upload.hide_shapes();
      }

      if (actionOrOptions === 'validate') {
        return current_shapefile_upload.validate();
      }

      if (actionOrOptions === 'selected_shapes_json') {
        return current_shapefile_upload.get_selected_shapes_json();
      }

      return this;
    }

    const options = $.extend({
      message_container: null,
      maps: null,
    }, actionOrOptions);

    ['message_container', 'maps'].forEach((option_key) => {
      if (options[option_key] == null) {
        throw new Error('Missing the required ' + option_key + ' option');
      }
    });

    const shapefile_upload = new CustomShapeFile(this, $(options.message_container), options.maps);
    this.data('custom_shapefile', shapefile_upload);

    return this;
  }


  /**
   * Class implementing the "custom shapefile" feature in the "Download" section.
   *
   * The "custom shapefile" feature allows the user to select a local shapefile (using a file input). All the shapes of
   * the file are then displayed on the map and the user can select the shapes for which they want data.
   *
   * This class provides all the functionalities required for the feature. It validates the selected shapefile when the
   * user selects one. It then shows its shapes on the map and allows the user to select shapes. It provides a method to
   * validate the user selection and to retrieve the selected shapes.
   *
   * Supported shapefiles: see the description of `load_shape_file` for the supported format of shapefiles.
   *
   * Example usage:
   *
   * <code>
   *   const maps = {
   *     low: {
   *       container: ..., // Map container element
   *       object: null, // Leaflet map object
   *       layers: {},
   *     },
   *     medium: {
   *       ... // Like `low`
   *     },
   *     high: {
   *       ... // Like `low`
   *     },
   *   }
   *
   *   const custom_shape_file = new CustomShapeFile(
   *     $('#my-file-input').first(),
   *     $('#message-container').first(),
   *     maps,
   *   );
   *
   *   $('#my-form').submit(() => {
   *     if (custom_shape_file.validate()) {
   *       const json_data = custom_shape_file.get_selected_shapes_json();
   *       // ... Make request to Finch ...
   *     }
   *   });
   * </code>
   *
   * @param {jQuery} file_input - The file input where the user selects their custom shapefile.
   * @param {jQuery} message_container - The HTML element where to show information and error messages.
   *    Generally an element displayed just below the file input element.
   * @param {object} maps - Object listing all the maps in the "download" section. The same object as the `maps` key in
   *    the `options` of the `download_app` (see download.js).
   * @constructor
   */
  function CustomShapeFile(file_input, message_container, maps) {
    this.file_input = file_input;
    this.message_container = new MessageContainer(message_container);
    this.map_shapes_layer = new MapShapesLayer(maps);
    this.max_allowed_selected_area = 800000000000;
    this.init();
  }

  CustomShapeFile.prototype = {
    /**
     * Initialise the custom shapefile feature by reinitialising the UI and setting up listeners.
     */
    init: function() {
      this.message_container.clear();
      this.file_input.val('');
      this.file_input.on('change', () => { this.handle_file_selected() });
    },

    /**
     * Hide, on the map, the shapes from the last custom shapefile selected.
     */
    hide_shapes: function() {
      this.map_shapes_layer.hide();
    },

    /**
     * Show, on the map, the shapes from the last custom shapefile selected.
     */
    show_shapes: function() {
      this.map_shapes_layer.show();
    },

    /**
     * Validate that the user selected valid shapes on the map. Return a boolean indicating if valid.
     *
     * The user's shape selection is valid if it contains at least one shape, and that the total area of the
     * selected shapes do not exceed a certain threshold (`this.max_allowed_selected_area`).
     *
     * Validation errors are also shown in the message container element.
     *
     * @returns {boolean}
     */
    validate: function() {
      this.message_container.clear();

      if (!this.file_input[0].files.length) {
        this.message_container.show_error(T('Please specify a shapefile'));
        return false;
      }

      if (!this.map_shapes_layer.visible) {
        return false;
      }

      if (this.map_shapes_layer.selected_regions.length === 0) {
        this.message_container.show_error(T('You must select at least one region on the map'));
        return false;
      }

      const total_selected_area = this.map_shapes_layer.calculate_selected_total_area();
      if (total_selected_area > this.max_allowed_selected_area) {
        this.message_container.show_error(T('The total selected area is too large, please reduce your selection'));
        return false;
      }

      return true;
    },

    /**
     * Return, as a JSON string, the user's selected shapes. The JSON can be used in a request to Finch.
     *
     * Example:
     * <code>
     *   if (my_custom_shape_file.validate()) {
     *     const finch_request = {
     *       'inputs': [
     *         {
     *           'id': 'shape',
     *           'data': my_custom_shape_file.get_selected_shapes_json(),
     *         },
     *         {
     *           'id': 'models',
     *           'data': 'pcic12',
     *         },
     *         // ...
     *       ],
     *       'response': 'document',
     *       // ...
     *     }
     *   }
     * </code>
     *
     * @returns {string}
     */
    get_selected_shapes_json: function() {
      const features = this.map_shapes_layer.get_selected_features();
      const feature_collection = {
        'type': 'FeatureCollection',
        'features': features,
      };
      return JSON.stringify(feature_collection, function (key, value) {
        if (typeof value === 'number') {
          return parseFloat(value.toFixed(2));
        }
        return value;
      });
    },

    /**
     * Load, validate and show on the map the user's selected shapefile (from the file input).
     *
     * Validation checks that the file contains closed shapes. To prevent too complex shapes that would be too
     * heavy to show and process, the polygons are simplified before being shown.
     *
     * Validation errors are shown in the message container element.
     */
    handle_file_selected: function() {
      const files = this.file_input[0].files;

      if (!files.length) {
        return;
      }

      const file = files[0];

      this.map_shapes_layer.clear();
      this.message_container.show_processing(T('Processing your file...'));

      load_shape_file(file)
        .then(shape_file_data => validate_shape_file(shape_file_data))
        .then(shape_file_data => simplify_polygons(shape_file_data))
        .then(topo_json => {
          this.map_shapes_layer.add_topo_json(topo_json);
          this.message_container.show_info(T('Please select at least one region'));
        })
        .catch((message_or_error) => {
          this.file_input.val('');
          if (typeof message_or_error === 'string') {
            this.message_container.show_error(message_or_error);
          } else {
            this.message_container.show_error(T('An error occurred'));
            throw message_or_error;
          }
        });
    },
  };

  /**
   * Class to show a message in the message container with various styles.
   *
   * Only one message can be shown at a time.
   *
   * Example:
   * <code>
   *   const message_container = new MessageContainer($('#my-element'));
   *   message_container.show_processing('Working, please wait...');
   *   message_container.show_info('Processing done!');
   *   message_container.show_error('An error occurred...');
   * </code>
   *
   * @param {jQuery} container - The HTML element where to show messages.
   * @constructor
   */
  function MessageContainer(container) {
    this.container = jQuery(container);
  }

  MessageContainer.prototype = {
    /**
     * Clear the currently displaying message.
     */
    clear: function() {
      this.container.empty();
    },

    /**
     * Show a message in a "processing" style.
     *
     * @param message
     */
    show_processing: function(message) {
      this.clear();
      this.container.append('<span class="text-muted">' + message + '</span>');
    },

    /**
     * Show a message in an "information" style.
     *
     * @param message
     */
    show_info: function(message) {
      this.clear();
      this.container.append('<span class="text-secondary">🛈 ' + message + '</span>');
    },

    /**
     * Show a message in an "error" style.
     *
     * @param message
     */
    show_error: function(message) {
      this.clear();
      this.container.append('<span class="text-danger">⚠ ' + message + '</span>');
    },
  }

  /**
   * Class controlling the "custom shapes" map layer.
   *
   * Allow to add custom shapes to a map, and allow the user to select shapes. Contain methods to retrieve information
   * about the selected shapes.
   *
   * @param {object} maps - Maps where to show the shapes. As defined in `CustomShapeFile`.
   * @constructor
   */
  function MapShapesLayer(maps) {
    this.map = maps.medium.object;
    this.selected_regions = [];
    this.geo_json = this.init_geo_json();
    this.geo_json_output = null;
    this.visible = false;
  }

  /**
   * Styles for shapes added to the map.
   *
   * @type {object}
   */
  MapShapesLayer.SHAPE_STYLES = {
    normal: {
      color: '#000',
      opacity: 1,
      weight: 1,
      fillColor: '#35495d',
      fillOpacity: 0.8,
    },
    selected: {
      opacity: 1,
      weight: 5,
      color: 'blue',
    },
  }

  MapShapesLayer.prototype = {
    /**
     * Remove all shapes from the map.
     */
    clear: function() {
      this.selected_regions = [];
      this.geo_json.clearLayers();
    },

    /**
     * Hide the custom shapes added to the map.
     */
    hide: function() {
      this.visible = false;
      this.geo_json.removeFrom(this.map);
    },

    /**
     * Show the custom shapes added to the map.
     */
    show: function() {
      this.visible = true;
      this.geo_json.addTo(this.map);
    },

    /**
     * Calculate and return the total area of all the selected shapes.
     *
     * @returns {number}
     */
    calculate_selected_total_area: function() {
      let total_area = 0;
      const selected_features = this.get_selected_features();

      selected_features.forEach(feature => {
        total_area += turf.area(feature);
      });

      return total_area;
    },

    /**
     * Return the features for all the shapes selected by the user.
     *
     * @returns {*[]}
     */
    get_selected_features: function() {
      const selected_features = [];

      for (let i in this.selected_regions) {
        const region_index = this.selected_regions[i];
        const geo_json_feature = this.geo_json_output['features'][region_index];
        selected_features.push(geo_json_feature);
      }

      return selected_features
    },

    /**
     * Add to the map the shapes described in a TopoJSON object.
     *
     * @param {object} topo_json_data
     */
    add_topo_json: function (topo_json_data) {
      this.clear();
      this.geo_json.addData(topo_json_data);
      const bounds = this.geo_json.getBounds();
      this.map.fitBounds(bounds);

      if (topo_json_data.type === 'Topology') {
        for (let key in topo_json_data.objects) {
          if (topo_json_data.objects.hasOwnProperty(key)) {
            this.geo_json_output = topojson.feature(topo_json_data, topo_json_data.objects['file']);
          }
        }
      }
    },

    /**
     * Create and return the GeoJSON layer that will contain the custom shapes.
     *
     * @returns {*}
     */
    init_geo_json: function() {
      const geo_json = new L.TopoJSON(null, {
        style: function () {
          return MapShapesLayer.SHAPE_STYLES.normal;
        }
      });

      geo_json.on('click', (e) => {
        const feature = e.layer;

        const region_index = feature['feature']['properties']['regionIndex'];

        if (this.selected_regions.includes(region_index)) {
          feature.setStyle(MapShapesLayer.SHAPE_STYLES.normal);
          this.selected_regions = this.selected_regions.filter(e => e !== region_index);
        } else {
          feature.setStyle(MapShapesLayer.SHAPE_STYLES.selected);
          this.selected_regions.push(region_index);
        }
      });

      return geo_json;
    },
  }

  /**
   * Load the shapes from a shapefile.
   *
   * A shapefile must be a ZIP file containing at least a .shp and a .prj file.
   *
   * @param {File} file - The shapefile object.
   * @returns {Promise} - A Promise that resolves with the shapefile's extracted data.
   */
  function load_shape_file(file) {
    const file_ext = file.name.toLowerCase().split('.').pop();

    return new Promise((resolve, reject) => {
      if (file_ext !== 'zip') {
        reject(T('Your shapefile must be a ZIP containing at least a .shp file and a .prj file'));
        return;
      }
      const file_reader = new FileReader();

      file_reader.onload = function () {
        const zip = new JSZip();

        zip.loadAsync(file_reader.result)
          .catch(() => {
            reject(T('This file is not a valid ZIP file'));
          })
          .then(function (zip) {
            const inputs = {};
            const promises = [];

            try {
              for (let filename in zip.files) {
                const current_extension = filename.toLowerCase().split('.').pop();

                // Only shp and prj are kept as only them are needed, while also minimizing user data
                // exposure
                if (current_extension === 'shp') {
                  promises.push(zip.files[filename].async('ArrayBuffer').then(function (data) {
                    inputs['file.shp'] = data;
                  }));
                }
                // else if (current_extension === 'dbf') {
                //   promises.push(zip.files[filename].async('ArrayBuffer').then(function(data) {
                //     inputs['file.dbf'] = data
                //   }));
                // }
                else if (current_extension === 'prj') {
                  promises.push(zip.files[filename].async('string').then(function (data) {
                    inputs['file.prj'] = data;
                  }));
                }
                // else if (current_extension === 'cpg') {
                //   promises.push(zip.files[filename].async('string').then(function(data) {
                //     inputs['file.cpg'] = data
                //   }));
                // }
              }

              if (promises.length === 0) {
                reject(T('No valid shapefile was found in your ZIP file'));
                return;
              }

              Promise.all(promises).then(function () {
                resolve(inputs);
              });

            } catch (err) {
              console.error('Error while processing ZIP file: ', err);
              reject(T('An error occurred while processing your file'));
            }
          });
      };

      file_reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate that a shapefile's data is valid for display on the map and selection by the user.
   *
   * @param {object} shape_file_data - Shapefile extracted data, as returned by the promise of `load_shape_file`.
   * @returns {Promise} - A Promise that resolves with the same data if the validation is successful, else rejects
   *    with the reason as a string.
   */
  function validate_shape_file(shape_file_data) {
    const info_cmd = 'file.shp -info save-to=info';

    // Return a promise from mapshaper.applyCommands
    return new Promise((resolve, reject) => {
      mapshaper.applyCommands(info_cmd, shape_file_data, (err, output) => {
        if (err) {
          console.error('mapshaper error', err);
          reject(T('Could not process your shapefile'));
          return;
        }

        const shape_file_info = JSON.parse(output['info.json']);

        if (shape_file_info[0]['geometry_type'] !== 'polygon') {
          reject(T('Only polygon layers are allowed'));
          return;
        }

        // Resolve the promise if everything is successful
        resolve(shape_file_data);
      });
    });
  }

  /**
   * Simplify the shapes ina shapefile's extracted data.
   *
   * @param shape_file_data
   * @returns {Promise} - A Promise that resolves with the simplified shape data. If an error occurs, rejects with
   *    the reason as a string.
   */
  function simplify_polygons(shape_file_data) {
    // See: https://github.com/mbloch/mapshaper/wiki/Command-Reference#-simplify
    const cmd = '-i file.shp encoding=utf-8 -clean -snap precision=0.001 fix-geometry -proj wgs84 -o output.topojson';

    return new Promise((resolve, reject) => {
      mapshaper.applyCommands(cmd, shape_file_data, (err, output) => {
        if (err) {
          console.error('mapshaper error', err);
          reject(T('Could not process your shapefile'));
          return;
        }

        const topo_json_simplified = JSON.parse(output['output.topojson']);
        resolve(topo_json_simplified);
      });
    });
  }


  /**
   * Custom TopoJSON map layer based on GeoJSON.
   */
  // https://gist.github.com/hpfast/2fb8de57c356d8c45ce511189eec5d6a
  L.TopoJSON = L.GeoJSON.extend({
    addData: function (data) {
      let geo_json;

      if (data.type === 'Topology') {
        for (let key in data.objects) {
          if (data.objects.hasOwnProperty(key)) {
            geo_json = topojson.feature(data, data.objects[key]);

            // custom logic, to match simplified polygon with original polygon
            for (let [i, v] of geo_json['features'].entries()) {
              geo_json['features'][i]['properties']['regionIndex'] = i
            }

            L.GeoJSON.prototype.addData.call(this, geo_json);
          }
        }
        return this;
      }

      L.GeoJSON.prototype.addData.call(this, data);

      return this;
    }
  });

})(jQuery);
