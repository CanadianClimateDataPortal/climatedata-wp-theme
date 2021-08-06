(function($) {
  
  $(function() {
        
    console.log('start archive-functions');

    $('#archive-filter a').click(function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      $('#archive-filter').collapse('hide');
      
      if (!$(this).hasClass('ui-state-active')) {
        
        $('#archive-filter a').removeClass('ui-state-active');
        $(this).addClass('ui-state-active');
        
        $('body').addClass('spinner-on');
        
        $.ajax({
          url: $(this).attr('href'),
          success: function (data) {
            
            var new_html = $(data).find('#archive-posts').html();
            
            $('#archive-posts').html(new_html);
            
          },
          complete: function() {
            $('body').removeClass('spinner-on');
            if (typeof collapse_init !== 'undefined' && $('.collapseomatic').length) {
              collapse_init();
            }
          }
        });
      }
      
    });

    console.log('end of archive-functions');
    console.log('- - - - -');
    
  });
})(jQuery);

