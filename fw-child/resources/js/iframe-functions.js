(function ($) {
    $(function () {

        let timeout_timer = $('#i_frame').data('timeout');

        setTimeout(function () {
            let iframe = $('#i_frame');
            iframe.attr('src', iframe.data('src'));

            if (timeout_timer == 0) {
                $('#iframe-spinner').hide()
            }
        }, 500);

        if (timeout_timer > 0) {
            // Timeout of timeout_timer sec to healthcheck on the iframe.
            let timeoutID = setTimeout(errorMessageIframe, timeout_timer * 1000);

            // Event listener on the window which will receive a message from the iframe.
            $(window).on("message onmessage", function(e) {
                clearInterval(timeoutID);
                $('#iframe-spinner').hide();
            });
        }



        // Function replacing the iframe container with an error message
        function errorMessageIframe() {
            let iframe = $('#i_frame');
            let message = iframe.data('timeoutMessage');
            $("#iframe-error").html(message).show();
            $('#iframe-spinner').hide();
        }
       
    })
 })(jQuery);