(function ($) {
  $(function () {
    if ($( '#page-home' ).length) {
      console.log( $( '#resources-query .fw-query-items' ) );
      // Add Slick carousel to news images on mobile only.
      $( '#resources-query .fw-query-items' ).slick( {
        dots: true,
        arrows: false,
        mobileFirst: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 575,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 991,
            settings: 'unslick'
          },
        ],
      } );
    };
  });
})(jQuery);
