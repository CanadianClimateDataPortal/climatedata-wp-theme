(function($) {

  $(function() {

		gsap.registerPlugin(ScrollTrigger)

		function once(el, event, fn, opts) {
		  var onceFn = function (e) {
		    el.removeEventListener(event, onceFn);
		    fn.apply(this, arguments);
		  };
		  el.addEventListener(event, onceFn, opts);
		  return onceFn;
		}
    
/*
    if ($('.video-background').length) {
      
      var videos = []
      
      $('.video-background').each(function() {
        
        
        
      })
      
      
  		var video = document.querySelector(".video-background");
  		let src = video.currentSrc || video.src;
  		// console.log(video, src);
  
  		once(document.documentElement, "touchstart", function (e) {
  		  video.play();
  		  video.pause();
  		});
		}
*/

		// $('.element').css('opacity', 0)

		var tweens = {
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
		}

		var tl_effects = {
			enter: {
				'fade': {
					from: { opacity: 0 },
					to: { opacity: 1 }
				},
				'fade-left': {
					from: { opacity: 0, xPercent: 50 },
					to: { opacity: 1, xPercent: 0 }
				},
				'fade-right': {
					from: { opacity: 0, xPercent: -50 },
					to: { opacity: 1, xPercent: 0 }
				},
				'fade-down': {
					from: { opacity: 0, yPercent: -50 },
					to: { opacity: 1, yPercent: 0 }
				},
				'fade-up': {
					from: { opacity: 0, yPercent: 50 },
					to: { opacity: 1, yPercent: 0 }
				},
				'scale': {
					from: { opacity: 0, scale: 0.5 },
					to: { opacity: 1, scale: 1 }
				}
			},
			exit: {
				'fade': { opacity: 0 },
				'fade-left': { opacity: 0, xPercent: -50 },
				'fade-right': { opacity: 0, xPercent: 50 },
				'fade-down': { opacity: 0, yPercent: 50 },
				'fade-up': { opacity: 0, yPercent: -50 },
				'scale': { scale: 0.5 }
			}
		}

		gsap.utils.toArray(".tl-container").forEach((panel, i) => {

			var this_container = $(panel)

			var id_pre = '#' + this_container.attr('id') + '-element-'

			var container_height = $(window).innerHeight() * this_container.find('.element').length

			// console.log(this_container.find('.element').length, container_height)

			var tl = gsap.timeline({
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
					// markers: true
				}
			})

			var tl_array = JSON.parse(this_container.attr('data-timeline'))

			// console.log(tl_array)

			// add timeline events

			tl_array.forEach(function(el) {
  			
  			var this_from, this_to
  			
  			if (!$(id_pre + el.id).hasClass('entered')) {
    			$(id_pre + el.id).css('opacity', 0).addClass('entered')
    			
    			if ($(id_pre + el.id).hasClass('type-video')) {
  
						console.log('video', el)
						
						var video = document.querySelector(id_pre + el.id + '-video');
						
						//console.log(video)
						
						video.onloadedmetadata = function() {
              //console.log('metadata loaded!');
              console.log(this.duration);//this refers to myVideo
              
              tl.fromTo( video, { currentTime: 0 }, { duration: el.duration, currentTime: video.duration || 1 }, el.position )
            };
            
          }
  			}
 
				//console.log(el)
				
				if (el.effect == 'manual' ) {
  				
  				this_to = {
						...el.properties,
						...{ duration: el.duration }
					}
  				
  				tl.fromTo( id_pre + el.id, this_from, this_to, el.position )
  				
				} else {
  				
					this_to = {
						...tweens[el.effect].to,
						...{ duration: el.duration }
					}
					
					//console.log(el, this_to)
  				
  				tl.fromTo( id_pre + el.id, tweens[el.effect].from, this_to, el.position )
  				
				}

/*
				if (el.type == 'enter') {

					var this_to = {
						...tl_effects.enter[el.effect].to,
						...{ duration: el.duration }
					}

					//console.log(el, this_to)

					tl.fromTo( id_pre + el.id, tl_effects.enter[el.effect].from, this_to, el.position )

					if (el.content == 'video') {

						console.log('video', el)
						
						var video = document.querySelector(id_pre + el.id + '-video');
						
						//console.log(video)
						
						video.onloadedmetadata = function() {
              //console.log('metadata loaded!');
              //console.log(this.duration);//this refers to myVideo
              
              tl.fromTo( video, { currentTime: 0 }, { duration: el.duration, currentTime: video.duration || 1 }, el.position )
            };

						

						// once(video, "loadedmetadata", () => {
						// 	console.log('yup', video.duration)
						//   tl.fromTo( video, { currentTime: 0 }, { currentTime: video.duration || 1 } )
						// })

					} else {



					}

				} else if (el.type == 'tween') {

					// var this_effect = tl_effects.exit[el.effect]
					
					var this_to = {}

					if ( el.effect == 'manual') {

						this_to = {
							...el.properties,
							...{ duration: el.duration }
						}
						
						if (el.delay != '0') {
    					this_to.delay = parseInt(el.delay)
    				}

						console.log(this_to)

						tl.to( id_pre + el.id, this_to )

					} else {

						this_to = {
							...tweens[el.effect].to,
							...{ duration: el.duration }
						}
						
						if (el.delay != '0') {
    					this_to.delay = parseInt(el.delay)
    				}

						// console.log(this_to)

						tl.to( id_pre + el.id, this_to, el.position )

					}

				} else if (el.type == 'exit') {

					var this_effect = tl_effects.exit[el.effect]

					if (el.delay != '0') {
						this_effect = {
							...tl_effects.exit[el.effect],
							...{ delay: parseInt(el.delay) }
						}
					}

					tl.to( id_pre + el.id, this_effect )
				}
*/

			})

			console.log(tl)

		})

	});
})(jQuery);
