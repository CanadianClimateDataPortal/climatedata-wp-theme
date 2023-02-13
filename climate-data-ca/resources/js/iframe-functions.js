 (function ($) {
    $(function () {

        const timeout_timer = document.getElementById("i_frame").getAttribute('timeout_timer')

        if (timeout_timer > 0) {
            // Timeout of 10 sec to healthcheck on the iframe.
            let timeoutID = setTimeout(errorMessageIframe, timeout_timer * 1000);

            // Event listener on the window wich will reveive a message from the iframe.
            $(window).on("message onmessage", function(e) {
                console.log("Message from iframe:" + e.originalEvent.data)
                clearInterval(timeoutID);
            });
        }


        // Function overiding the "srcDoc" attribute from the iframe to an Error Message
        function errorMessageIframe() {
            console.log("Iframe Failed.")
            let iframe = document.getElementById('i_frame');
            iframe.srcdoc = "This iframe failed to load after "+timeout_timer+" sec. <br>Check the URL : " +iframe.src + "<br> Also make sure the iframe url application send a message onmesage.";
        }
       
    })
 })(jQuery);