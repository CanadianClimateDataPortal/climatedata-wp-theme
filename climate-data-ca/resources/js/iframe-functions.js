(function ($) {
    $(function () {

        let timeout_timer = $('#i_frame').data('timeout');

        setTimeout(function () {
            if (timeout_timer > 0) {
                $('body').addClass('spinner-on');
                $('.animsition').off('animsition.inEnd');
            }

            let iframe = $('#i_frame');
            iframe.attr('src', iframe.data('src'));
        }, 500);

        if (timeout_timer > 0) {
            // Timeout of timeout_timer sec to healthcheck on the iframe.
            let timeoutID = setTimeout(errorMessageIframe, timeout_timer * 1000);

            // Event listener on the window which will receive a message from the iframe.
            $(window).on("message onmessage", function(e) {
                clearInterval(timeoutID);
                $('body').removeClass('spinner-on');
            });
        }



        // Function replacing the iframe container with an error message
        function errorMessageIframe() {
            let iframe = $('#i_frame');
            let message = iframe.data('timeoutMessage');
            iframe.parent().addClass('bg-danger section-content');
            iframe.parent().removeClass('iframe-container');
            iframe.parent().html('<div class="offset-1">' + message + '</div>');

            $('body').removeClass('spinner-on');
        }
       
    })
 })(jQuery);