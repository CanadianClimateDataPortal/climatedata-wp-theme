 (function ($) {
    $(function () {

        // Timeout of 10 sec to healthcheck on the iframe.
        var timeoutID = setTimeout(errorMessageIframe, 10 * 1000);

        // This is event listener on the window wich will reveive a message from the iframe.
        $(window).on("message onmessage", function(e) {
            console.log(e.originalEvent.data);
            clearInterval(timeoutID);
        });

        // Function overiding the "srcDoc" attribute from the iframe to an Error Message
        function errorMessageIframe() {
            console.log("Iframe Failed.")
            var iframe = document.getElementById('i_frame');
            iframe.srcdoc = "This iframe failed to load after 10 sec. <br>Check the URL : " +iframe.src + "<br> Also make sure the iframe url application send a message onmesage.";
        }
        
    })
 })(jQuery);