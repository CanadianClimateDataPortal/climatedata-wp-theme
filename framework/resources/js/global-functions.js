document.documentElement.classList.remove('no-js');

var current_script = document.currentScript.src
var filename = current_script.split('/').pop()
var theme_dir = current_script.replace('/resources/js/' + filename, '') + '/'

;(function($) {

  $(function() {
    
    console.log('begin global-functions.js')
    
    //
    // VENDOR
    //
    
    // AOS
    
    if ($('[data-aos]').length) {
      AOS.init()
    }
    
    // SWIPER
    
    if ($('.swiper').length) {
      
      var swipers = {}
      
      $('.swiper').each(function() {
        
        let this_settings = JSON.parse($(this).attr('data-swiper-settings'))
        // console.log($(this), this_settings)
        
        // show controls if options are set
        
        if (this_settings.hasOwnProperty('pagination')) {
          $(this).find('.swiper-pagination').removeClass('d-none')
        }
        
        if (this_settings.hasOwnProperty('navigation')) {
          $(this).find('.swiper-button-prev, .swiper-button-next').removeClass('d-none')
        }
        
        // init
        swipers[$(this).attr('id')] = {
          instance: new Swiper('.swiper', this_settings)
        }
        
      })
      
      console.log(swipers)
      
    }
    
    //
    // BOOTSTRAP
    //
    
    if ($('body').find('[data-offcanvas-trigger]').length) {
      
      $('body').find('[data-offcanvas-trigger]').each(function() {
        
        $('body').find($(this).attr('data-offcanvas-trigger'))
          .attr('data-bs-toggle', 'offcanvas')
          .attr('data-bs-target', '#' + $(this).attr('id'))
        
      })
      
    }
    
    if ($('.fw-query-object').length) {
      $('.fw-query-object').each(function() {
        
        console.log($(this))
        $(this).fw_query()
        
      })
    }
    
    //
    
    console.log('end global-functions.js')

  });
})(jQuery);
