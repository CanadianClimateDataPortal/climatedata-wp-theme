var swipers = {}

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
    
    if ($('.has-swiper').length) {
      
      $('.has-swiper').each(function() {
        
        let this_swiper = $(this).find('> .swiper'),
            this_settings = JSON.parse($(this).attr('data-swiper-settings'))
            
        if (
          $('body').hasClass('fw-builder') && 
          this_settings.hasOwnProperty('autoplay')
        ) {
          this_settings.autoplay.enabled = false
        }
        
        // console.log($(this), this_settings)
        
        // show controls if options are set
        
        if (this_settings.hasOwnProperty('pagination')) {
          this_swiper.find('.swiper-pagination').removeClass('d-none')
        }
        
        if (this_settings.hasOwnProperty('navigation')) {
          this_swiper.find('.swiper-button-prev, .swiper-button-next').removeClass('d-none')
        }
        
        // init
        swipers[$(this).attr('id')] = {
          element: this_swiper,
          settings: this_settings,
        }
        
        if (!$('body').hasClass('fw-builder')) {
          swipers[$(this).attr('id')].instance = new Swiper('#' + this_swiper.attr('id'), this_settings)
        } else {
          $(this).find('.swiper').removeClass('swiper')
          $(this).find('.swiper-wrapper').removeClass('swiper-wrapper')
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
    
    $('body').find('.accordion').each(function() {
      
      let this_ID = $(this).attr('id'),
          this_heading = $(this).attr('data-accordion-heading')
      
      $(this).find(this_heading).each(function(i) {
        
        let this_section_ID = this_ID + '-section-' + (i + 1)
        
        $(this).addClass('accordion-header')
        
        $(this).find('> .fw-element-inner').addClass('accordion-button collapsed').attr('data-bs-toggle', 'collapse').attr('data-bs-target', '#' + this_section_ID)
        
        $(this).nextUntil(this_heading).andSelf().wrapAll('<div class="accordion-item">')
        
        $(this).nextUntil(this_heading).wrapAll('<div id="' + this_section_ID + '" class="accordion-collapse collapse" data-bs-parent="#' + this_ID + '"><div class="accordion-body">')
        
      })
      
    })
    
    //
    // QUERY
    //
    
    if ($('.fw-query-object').length) {
      
      $(document).on('fw_query_success', function (e, item) {
        if (item.find('[data-aos') && typeof AOS != 'undefined') {
          AOS.refreshHard()
        }
      })
      
      $('.fw-query-object').each(function() {
        
        console.log($(this))
        $(this).fw_query()
        
      })
    }
    
    //
    
    console.log('end global-functions.js')

  });
})(jQuery);
