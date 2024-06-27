//
// Legacy code from climate-data-ca theme.
// Essential for making old GSAP Training Resource work.
//
(function($) {

  $(function() {

    let tl;

    gsap.registerPlugin(ScrollTrigger);

    function request(method, url) {

      $('body').addClass('spinner-on');

      return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
      });
    }

    function video_trigger(element_id) {

      const this_vid = document.querySelector(element_id);

      this_vid.pause();
      this_vid.currentTime = 0;
      this_vid.play();

    }

    const tweens = {
      'fade-in': {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      'fade-in-left': {
        from: { opacity: 0, xPercent: 50 },
        to: { opacity: 1, xPercent: 0 }
      },
      'fade-in-right': {
        from: { opacity: 0, xPercent: -50 },
        to: { opacity: 1, xPercent: 0 }
      },
      'fade-in-up': {
        from: { opacity: 0, yPercent: 50 },
        to: { opacity: 1, yPercent: 0 }
      },
      'fade-in-down': {
        from: { opacity: 0, yPercent: -50 },
        to: { opacity: 1, yPercent: 0 }
      },
      'scale-in': {
        from: { opacity: 0, scale: 0.5 },
        to: { opacity: 1, scale: 1 }
      },
      'fade-out': { to: { opacity: 0 } },
      'fade-out-left': { to: { opacity: 0, xPercent: -50 } },
      'fade-out-right': { to: { opacity: 0, xPercent: 50 } },
      'fade-out-down': { to: { opacity: 0, yPercent: 50 } },
      'fade-out-up': { to: { opacity: 0, yPercent: -50 } },
      'scale-out': { to: { scale: 0.5 } }
    };

    let videos_to_load = 0;

    if ($('video').length) {

      videos_to_load = $('video').length;

      $('body').addClass('spinner-on');

      $('video').each(function() {

        const this_vid = $(this),
              video_ID = $(this).attr('id');

        const url = $(this).attr('src');

        request('GET', url)
          .then(function (e) {
            const video2 = document.getElementById(video_ID);

            this_vid.attr('data-duration', video2.duration);

            videos_to_load -= 1;

            if (videos_to_load === 0) {
              $(document).trigger('videos_loaded');
            }

          });

      });

    } else {

      setTimeout(function() {
        $(document).trigger('videos_loaded');
      }, 100);

    }

    $(document).on('videos_loaded', function() {

      gsap.utils.toArray(".tl-container").forEach((panel, i) => {

        const this_container = $(panel);

        const id_pre = '#' + this_container.attr('id') + '-element-';

        const container_height = $(window).innerHeight() * this_container.find('.element').length;

        tl = gsap.timeline({
          scrollTrigger: {
            defaults: {
              duration: 1
            },
            trigger: panel,
            start: 'top top',
            end: () => '+=' + container_height,
            scrub: true,
            pin: true,
            toggleActions: "play none reverse none",
            invalidateOnRefresh: true,
          }
        });

        const tl_array = JSON.parse(this_container.attr('data-timeline'));

        tl_array.forEach(function(el) {

          if ($(id_pre + el.id).length) {

            if (!$(id_pre + el.id).hasClass('entered')) {
              $(id_pre + el.id).css('opacity', 0).addClass('entered');
            }

            if (el.effect === 'manual' ) {

              const this_to = {
                ...el.properties,
                ...{
                  duration: el.duration,
                  onStart: function() {

                    if ($(id_pre + el.id).hasClass('type-video')) {

                      video_trigger(id_pre + el.id + '-video');

                    }

                  }
                }
              };

              tl.fromTo( id_pre + el.id, null, this_to, el.position );

            } else {

              const this_to = {
                ...tweens[el.effect].to,
                ...{
                  duration: el.duration,
                  onStart: function() {

                    if ($(id_pre + el.id).hasClass('type-video')) {

                      video_trigger(id_pre + el.id + '-video');

                    }

                  }
                }
              };

              tl.fromTo( id_pre + el.id, tweens[el.effect].from, this_to, el.position );

            }
          } else {
            console.warn('⚠ ' + id_pre + el.id + ' does not exist');
          }

        });

        $('body').removeClass('spinner-on');

      });

    });

    $(window).resize(function() {
      if ($(window).outerWidth() < 800 && $(window).outerWidth() > $(window).outerHeight()) {

        setTimeout(function() {
          tl.scrollTrigger.refresh();
        }, 100);

      }
    });

  });
})(jQuery);
