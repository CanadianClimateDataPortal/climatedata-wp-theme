//
// CONSTANTS
//

const k_to_c = 273.15;
const data_url = DATA_URL;
const geoserver_url = DATA_URL;
const XML_HTTP_REQUEST_DONE_STATE = 4;

//
// GLOBAL VARS
//

var chart_labels, legend_labels, l10n_labels;

var l10n_table = {
    "fr": {
        "With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}":
            "Avec les paramètres actuels de fréquence et de format de donnée, le nombre maximal de points de grille par requête est de {0}",
        "Around {0} grid boxes selected" : "Environ {0} points de grille sélectionnés"
    }
};

const grid_resolution = {
    "canadagrid": 1.0/12.0,
    "canadagrid1deg": 1.0,
    "slrgrid": 1.0/10.0
};


//
// GLOBAL Functions
//

/**
 * Format the n-th day value to localized text on a non-leap year (ex: 156 -> June 9)
 * @param value Day of the Year (starting with 0 for Jan 1st)
 * @returns {string} The formatted value
 */
function doy_formatter(value) {
    const firstDayOfYear = Date.UTC(2019, 0, 1);
    return new Date(firstDayOfYear + 1000 * 60 * 60 * 24 * value).toLocaleDateString(current_lang, {
        month: 'long',
        day: 'numeric'
    })
}

/**
 * Format numerical value according to supplied parameters
 * @param value Number to format
 * @param varDetails Variable details object provided by Wordpress
 * @param delta If true, the value is formatted as a delta
 * @returns {string} The formatted value
 */
function value_formatter(value, varDetails, delta) {
    let unit = varDetails.units.value === 'kelvin' ? "°C" : varDetails.units.label;
    let str = "";
    if (delta && value > 0) {
        str += "+"
    }

    switch( varDetails.units.value) {
        case "doy":
            if (delta) {
                str += value.toFixed(varDetails.decimals);
                str += " " + l10n_labels['days'];
            } else {
                str += doy_formatter(value);
            }

            break;
        default:
            str += value.toFixed(varDetails.decimals);
            str += " " + unit;
            break;
    }
    return unit_localize(str);
}

/**
 * Localize variable units to French if necessary
 * @param str String to localize
 */
function unit_localize(str) {
    if ($('body').hasClass('lang-fr')) {
        str = str.replace('Degree Days', 'Degrés-jours');
        str = str.replace('degree days', 'degrés-jours');
        str = str.replace('Days', 'Jours');
        str = str.replace('days', 'jours');
        str = str.replace(' to ', ' à ');
    }

    return str;
}

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

/**
 * Perform a string lookup in l10n_table in current language, returns it if found, otherwise return the original string
 * @param str String to lookup for
 * @returns {string} The localized string
 */
function T(str) {
    if (typeof  l10n_table[current_lang] == 'undefined'){
        return str;
    }
    if (typeof l10n_table[current_lang][str] == 'undefined') {
        console.warn("Missing translation in language " + current_lang + ": " + str);
        return str;
    } else {
        return l10n_table[current_lang][str];
    }
}


/**
 * get IDF links for station_id and output HTML content to target
 * @param station_id ID of the IDF station
 * @param target jquery selector to output the resulting content
 * @param css_class CSS class to use for links
 */
function getIDFLinks(station_id, target, css_class) {
    $.getJSON(child_theme_dir + 'resources/app/run-frontend-sync/search_idfs.php?idf=' + station_id, function (data) {
        $(target).empty();
        $.each(data, function (k, v) {
            $(target).append('<li><a class="' + css_class + '" href="' + v.filename + '" target="_blank">' + v.label + '</a></li>');
        });
    });
};

(function ($) {

    $(function () {
        $.fn.validate_email = function (email_val) {
            var is_valid = false
            if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {
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

        // form validation

        function check_email(email_val) {
            var is_valid = false;
            if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {
                if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {
                    if (email_val.indexOf('@') !== 0) {
                        var after_at = email_val.substring(email_val.indexOf('@'));
                        if (after_at.indexOf('.') !== -1) {
                            var after_dot = after_at.substring(after_at.indexOf('.'));
                            if (after_dot.length > 1) {
                                is_valid = true;
                            } else {
                                //console.log('no chars after .');
                            }
                        } else {
                            //console.log('no . after @');
                        }
                    } else {
                        //console.log('no chars before @');
                    }
                } else {
                    //console.log('doesn\'t contains @ and .');
                }
            } else {
                //console.log('blank');
            }
            return is_valid;
        }

        function check_training_dl_form(dl_form) {
            is_valid = true
            // checkboxes
            dl_form.find('input[type="checkbox"]').each(function () {
                if ($(this).prop('checked') != true) {
                    //           console.log($(this).attr('name') + ' not checked')
                    is_valid = false
                }
            })

            if (dl_form.find('#name').val() != '' || dl_form.find('#email').val() != '') {
                // name
                if (dl_form.find('#name').val() == '') {
                    is_valid = false
                }

                // email
                if (check_email(dl_form.find('#email').val()) != true) {
                    is_valid = false
                }

                // captcha
                if (dl_form.find('#terms-captcha_code').val() == '') {
                    is_valid = false
                }

            }

            //console.log('valid', is_valid)
            return is_valid
        }

        // overlay events

        $(document).on('overlay_hide', function () {

            console.log('overlay hide')
            $('#supermenu').supermenu('enable')

        });

        $(document).on('overlay_show', function () {

            $('#supermenu').supermenu('disable')

            if ($('.overlay').find('#download-terms-form').length) {

                var dl_form = $('.overlay').find('#download-terms-form'),
                    submit_btn = dl_form.find('#download-terms-submit'),
                    captcha = dl_form.find('#terms-captcha'),
                    form_response = dl_form.find('#download-terms-response')

                submit_btn.prop('disabled', true)

                dl_form.find(':input').on('input', function () {

                    if (check_training_dl_form(dl_form) == true) {
                        submit_btn.prop('disabled', false).removeClass('disabled')
                    } else {
                        submit_btn.prop('disabled', true).addClass('disabled')
                    }

                })

                submit_btn.click(function (e) {
                    e.preventDefault()

                    form_response.slideUp(125, function () {
                        $(this).empty()

                        var form_data = dl_form.serialize()

                        $.ajax({
                            url: child_theme_dir + 'resources/ajax/training-submit.php',
                            data: form_data,
                            success: function (data) {
                                console.log(data)

                                dl_form.find('#terms-captcha_code').val('')

                                captcha_url = dl_form.find('#terms-captcha').attr('src')

                                //           dl_form.find('#terms-captcha').attr('src', '')
                                dl_form.find('#terms-captcha').attr('src', captcha_url)

                                var response = JSON.parse(data)

                                if (response.message == 'success') {

                                    captcha.removeClass('border-secondary')

                                    dataLayer.push({
                                        'event': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                                        'event_name': 'Download_Introducing-climate-information-for-decision-making_v1.1',
                                        'url': response.url
                                    });

                                    form_response.html('<div class="alert alert-primary col-6 offset-4 p-5" role="alert"><h5>' + response.message1 + '</h5><p class="mb-0"><a href="' + response.url + '" target="_blank">' + response.message2 + '</a>.</p></div>').slideDown(250);
                                } else if (response.message == 'captcha failed') {

                                    form_response.html('<div class="alert alert-danger col-6 offset-4" role="alert"><p class="mb-0">' + response.message1 + '</p></div>').slideDown(250);

                                    captcha.addClass('border border-secondary')

                                }
                            }
                        })

                    })

                })

            }

        })

        //
        // TRANSLATIONS
        //

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
            click_to_zoom: 'Click and drag in the plot area to zoom in'
        };

        l10n_labels = {
            to: 'to',
            to_doy: 'to',
            days: 'days',
            median: 'Median',
            range: 'Range',
            search_city: 'Search for a City/Town',
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
            ahccdLegendCircle: 'Both'
        };

        if ($('body').hasClass('lang-fr')) {

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
                click_to_zoom: 'Cliquer et faire glisser dans la zone du tracé pour agrandir'
            };

            l10n_labels = {
                to: 'à',
                to_doy: 'au',
                days: 'jours',
                median: 'Médiane',
                range: 'Portée',
                search_city: 'Cherchez une ville ou un village',
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

            if (typeof Highcharts !== 'undefined') {

                Highcharts.setOptions({
                    lang: {
                        downloadJPEG: 'Télécharger en image JPEG',
                        downloadPDF: 'Télécharger en document PDF',
                        downloadPNG: 'Télécharger en image PNG',
                        downloadSVG: 'Télécharger en image vectorielle SVG',
                        downloadXLS: 'Télécharger en document XLS',
                        downloadCSV: 'Télécharger en document CSV',
                        loading: 'Chargement',
                        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                        printChart: 'Imprimer le graphique',
                        viewData: 'Voir le tableau de données',
                        viewFullscreen: 'Voir en mode plein écran',
                        openInCloud: 'Ouvrir dans le nuage <em>Highcharts</em>'
                    }
                });

            }

        }

        // Constants
        month_number_lut = {
            'jan': 1,
            'feb': 2,
            'mar': 3,
            'apr': 4,
            'may': 5,
            'jun': 6,
            'jul': 7,
            'aug': 8,
            'sep': 9,
            'oct': 10,
            'nov': 11,
            'dec': 12,
            'ann': 1,
            '2qsapr': 4,
            'winter': 12,
            'spring': 3,
            'summer': 6,
            'fall': 9
        };


        //
        // FEEDBACK
        //

        $('input.other').hide();

        $('.has-other').change(function () {
            if ($(this).find(':selected').attr('value') == 'Other') {
                $(this).next('.other').show()
            } else {
                $(this).next('.other').val('').hide()
            }
        });

        $('.feedback-form').submit(function (e) {
            e.preventDefault();

            var the_form = $(this);

            var form_data = the_form.serialize();

            //console.log(form_data);

            $.ajax({
                url: child_theme_dir + 'resources/ajax/form-submit.php',
                data: form_data,
                success: function (data) {
                    //console.log(data);

                    if (data == 'success') {

                        $('#captcha_code').removeClass('border-secondary').tooltip('hide');

                        $('<div class="row" style="display: none;"><div class="alert alert-success col-6 offset-3" role="alert">Thanks! We’ve received your feedback.</div></div>').insertBefore(the_form).slideDown(250);

                        the_form.slideUp(250);

                    } else if (data == 'captcha failed') {

                        $('#captcha_code').addClass('border-secondary').tooltip('show');

                    }
                }
            });
        });

        //
        // UX BEHAVIOURS
        //

        // add body class on show/hide of main header

        $('#header-primary-collapse').on('show.bs.collapse', function () {

            $('body').addClass('header-open');

        });

        $('#header-primary-collapse').on('hide.bs.collapse', function () {

            $('body').removeClass('header-open');

        });

        // click outside the menu to close

        $(document).mouseup(function (e) {

            if ($('body').hasClass('supermenu-open')) {

                var close_menu = true;

                /*
                 console.log(e.target);
                 console.log('has class supermenu-toggle', $(e.target).hasClass('supermenu-toggle'));
                 console.log('has class overlay-toggle', $(e.target).hasClass('overlay-toggle'));
                 console.log('is supermenu', $('#supermenu').is(e.target));
                 console.log('child of supermenu', $('#supermenu').has(e.target).length);
                 */

                if ($(e.target).hasClass('supermenu-toggle') || $(e.target).hasClass('overlay-toggle')) {

                    // clicked element is a menu/overlay toggle, let the plugin deal with it

                    close_menu = false;

                } else {

                    if ($('body').hasClass('supermenu-disabled')) {

                        // supermenu currently disabled, leave it alone

                        close_menu = false;

                    } else {

                        // supermenu is open and active

                        if (!$('#supermenu').is(e.target) && !$('#supermenu').has(e.target).length) {

                            // clicked element is not a child of the supermenu, or the supermenu itself

                            close_menu = true;

                        } else {

                            close_menu = false;

                        }

                    }

                    if ($('.select2-container').has(e.target).length) {

                        // clicked element is inside the appended select2 container

                        close_menu = false;

                    }

                }

                //console.log('close', close_menu);

                if (close_menu == true) {
                    //console.log('close supermenu');
                    $('#supermenu').supermenu('hide');
                }

            }

        });

        // close supermenu if a smooth-scroll link is clicked inside it

        $('#supermenu .smooth-scroll').click(function () {
            $('#supermenu').supermenu('hide')
        })

        //
        // VENDOR
        //

        // SELECT2

        $('.select2').select2({
            language: current_lang,
            width: '100%',
            minimumResultsForSearch: -1
        });

        function formatLocationSearch(item) {

            if (!item.id) {
                return item.text;
            }
            if (item.location === null) {
                show_comma = '';
                item.location = '';
            } else {
                show_comma = ', ';
            }
            var $item = $(
                '<span><div class="geo-select-title">' + item.text + ' (' + item.term + ')</div>' + item.location + show_comma + item.province + '</sup></span>'
            );
            return $item;
        }

        $('#location-search').select2({
            language: current_lang,
            ajax: {
                url: child_theme_dir + "resources/app/run-frontend-sync/select-place.php",
                dataType: 'json',
                delay: 0,
                data: function (params) {
                    return {
                        q: params.term,
                        page: params.page
                    };
                },
                processResults: function (data, page) {
                    return {
                        results: data.items
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumInputLength: 1,
            templateResult: formatLocationSearch
        });

        $('#location-search').on('select2:select', function (e) {

            var redirect_url = '/explore/location/';

            if (current_lang == 'fr') {
                redirect_url = '/explorer/emplacement/';
            }

            window.location.href = redirect_url + '?loc=' + e.params.data.id;

        });

        // STICKY KIT

        if ($('body').hasClass('has-alert')) {

            $('#header-primary .logo a').stick_in_parent({
                parent: 'body',
                offset_top: sticky_offset
            });

        }

        // JQUERY UI TABS

        if ($('.tabs').length) {

            $('.tabs').tabs({
                hide: {effect: 'fadeOut', duration: 250},
                show: {effect: 'fadeIn', duration: 250},
            });

        }

        // LISTNAV

        if ($('#glossary').length) {

            var listnav_alltext = 'All';

            if ($('body').hasClass('lang-fr')) {
                listnav_alltext = 'Liste complète';
            }

            $('#glossary-listnav').listnav({
                showCounts: false,
                includeNums: false,
                allText: listnav_alltext,
                list_class: 'navbar-nav tabs-nav justify-content-center col-10 offset-1',
                item_class: 'nav-item',
                link_class: 'px-3 py-3 all-caps'
            });

            //console.log('listnav');
        }

				// SHARE

				if ($('#share').length) {

					window.fbAsyncInit = function() {
				    FB.init({
				      appId            : '387199319682000',
				      autoLogAppEvents : true,
				      xfbml            : true,
				      version          : 'v13.0'
				    });
				  };

					$('#share').share_widget({
					  site_url: '//' + window.location.hostname,
					  theme_dir: child_theme_dir,
					  share_url: window.location.href,
					  title: document.title,
					  elements: {
					    facebook: {
					      display: true,
					      icon: 'fab fa-facebook mr-3'
					    },
					    twitter: {
					      display: true,
					      icon: 'fab fa-twitter mr-3',
					      text: null,
					      via: null
					    },
							linkedin: {
								display: true,
								icon: 'fab fa-linkedin mr-3'
							}
					  },
					  callback: null // callback function
					})

				}

        if (typeof $.fn.renderer !== 'undefined' && $('.renderable').length) {
            $(document).renderer();
        }
        //console.log('end of child-functions');
        
        //
        // TEXT TO SPEECH
        //
        
        if ($('#speak-btn').length) {
            
            let speech_init = false,
                speech_loaded = false,
                speech_started = false,
                speech_playing = false,
                speech_options = {
                    text: ''
                },
                speech_play_text = $('#speak-btn').attr('data-play-text'),
                speech_pause_text = $('#speak-btn').attr('data-pause-text')
                
            $('body').addClass('spinner-on')
            
            EasySpeech.init({ maxTimeout: 5000, interval: 250 })
                .then(function() {
                    
                    speech_init = true
                    
                    $('.page-section:not(.first-section)').each(function() {
                        
                        speech_options.text += $(this).text()
                        
                    })
                    
                    speech_loaded = true
                    
                    $('body').removeClass('spinner-on')
                    
                    // console.log('easy-speech initialized')
                    
                    if (current_lang == 'fr') {
                        
                        let found_voice = false
                            
                        // grab the first available french voice
                        
                        EasySpeech.voices().forEach(function(voice, i) {
                            
                            if (found_voice == false && voice.lang.includes('fr')) {
                                speech_options.voice = voice
                                speech_options.rate = 0.7
                                found_voice = true
                            }
                            
                        })
                        
                    }
                    
                })
                .catch(function(e) {
                    console.error(e)
                    $('body').removeClass('spinner-on')
                })
        
            $('#speak-btn').click(function() {
                
                // check for initialization
                
                if (
                    speech_init == true && 
                    speech_loaded == true
                ) {
                    
                    if (speech_playing == true) {
                        
                        // speech is currently playing
                        
                        // console.log('pause')
                        
                        EasySpeech.pause()
                        speech_playing = false
                        
                        $('#speak-btn').removeClass('active')
                        $('#speak-btn i').removeClass('fa-pause').addClass('fa-play')
                        $('#speak-btn span').text(speech_play_text)
                        
                    } else {
                        
                        // speech is not currently playing
                        
                        if (speech_started == true) {
                            
                            // speech has been started,
                            // so resume
                        
                            // console.log('resume')
                            
                            EasySpeech.resume()
                            speech_playing = true
                            
                        } else {
                        
                            // play for the first time
                            
                            // console.log('play')
                            
                            EasySpeech.speak(speech_options)
                            
                            speech_started = true
                            speech_playing = true
                            
                            $('#restart-btn').fadeIn(150)
                            
                        }
                        
                        
                        $('#speak-btn').addClass('active')
                        $('#speak-btn i').removeClass('fa-play').addClass('fa-pause')
                        $('#speak-btn span').text(speech_pause_text)
                    }
                    
                }
                 
            })
            
            $('#restart-btn').click(function() {
            
                EasySpeech.cancel()
                
                EasySpeech.speak(speech_options)
            
            })
            
        }

    });
})(jQuery);
