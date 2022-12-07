 (function ($) {
    $(function () {



        // $('#i_frame').load(function(e){
        //     console.log('test_load');
        //     var url = e.target.src;
        //     console.log($('.bk-root'));

        //     console.log(e.target.contentWindow.document);
        // });

        $(window).on("message onmessage", function(e) {
            console.log(e.originalEvent.data);
        });


        // function checkIframeLoaded() {
        //     console.log("Iframes checking...");

        //     $('iframe').each(function(index,iframe){

        //         console.log(iframe);

        //         if ( iframe.contentDocument == null ) {
          
        //             console.log("Iframe id:'"+iframe.id+"' has failed to load");
        //             iframe.srcdoc = "<h1>Bonjour</h1>";
        //             // iframe.contentWindow.postMessage('message', '*');
        //             // alert(iframe.src);
        //             // iframe.content = "Content tesxt";
        //             // window.setTimeout(checkIframeLoaded, 100);
        //             return;
        //         }

        //         var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        //         // Check if loading is complete
        //         if ( iframeDoc.readyState == 'complete' ) {
                    
        //             console.log("Iframe id:'"+iframe.id+"' is correctly loaded")
        //             // afterLoading();
        //             return
        //         } else {
        //             console.log('Failed to load te url of the iframe');
        //         }

        //     }); 
        // }








        // function checkIframeLoaded() {
        //     console.log("Iframes checking...");
        //     $('#i_frame').each(function(index,iframe){
        //         fetch(new Request(iframe.src)).then(function(response){
        //             // console.log(iframe.src);
        //             // console.log("boucle each");
        //             // console.log(response.status);
        //         }).catch(function(error){
        //             var html_link = "<a href="+iframe.src+"/a>"
        //             var message_err = "This url : " +html_link+ ""; 
        //             document.getElementById("i_frame").srcdoc ="<h3>" + message_err + "</h3>";
        //         })
        //         // $(elem).attr('onerror',"'srcdoc','<p>You need to be online to view this content.</p>');").attr('onload', "if(navigator.onLine===false) eval(this.getAttribute('onerror'));"); 
        //     }); 
        // }

        // checkIframeLoaded();

        // function checkIframeLoaded() {
        //     console.log("Checking if iframe is loading");

        //     // Get a handle to the iframe element
        //     var iframe_section = document.getElementById('iframe-section');
        //     var iframe = document.getElementById('i_frame');
            

        //     if ( iframe.contentDocument == null ) {
      
        //         console.log("Iframe id:'"+iframe.id+"' has failed to load");
        //         iframe.srcdoc = "<h1>Bonjour</h1>";
        //         // iframe.contentWindow.postMessage('message', '*');
        //         // alert(iframe.src);
        //         // iframe.content = "Content tesxt";
        //         // window.setTimeout(checkIframeLoaded, 100);
        //         return;
        //     }

        //     var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        //     // Check if loading is complete
        //     if ( iframeDoc.readyState == 'complete' ) {
                
        //         console.log("Iframe id:'"+iframe.id+"' is correctly loaded")
        //         // afterLoading();
        //         return
        //     } else {
        //         console.log('Failed to load te url of the iframe');
        //     }

        // }

        // checkIframeLoaded();
        
    })
 })(jQuery);