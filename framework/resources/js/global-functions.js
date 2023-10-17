document.documentElement.classList.remove('no-js');

var current_script = document.currentScript.src
var filename = current_script.split('/').pop()
var theme_dir = current_script.replace('/resources/js/' + filename, '') + '/'

;(function($) {

  $(function() {
    
    console.log('begin global-functions.js')
    
    if ($('[data-aos]').length) {
      AOS.init()
    }
    
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
    
    console.log('end global-functions.js')

  });
})(jQuery);
