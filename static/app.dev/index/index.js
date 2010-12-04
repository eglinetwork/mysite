/**
 * @author egli
 */

YUI().use("node","io-base", "json",'tabview', function(Y) {
 
    function init() {
        // Y.log('domready fired');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });
        tabview.render();
        
		
    }
    Y.on("domready", init);
 
    //Get a reference to the Node that we are using
    //to report results:
    var div = Y.Node.get('#responseContainer');
 
    //A function handler to use for successful requests:
    var handleSuccess = function(ioId, o){
        Y.log(arguments);
        Y.log("The success handler was called.  Id: " + ioId + ".", "info", "example");
 
        if(o.responseText !== undefined){
            var s = "<li>Transaction id: " + ioId + "</li>";
            s += "<li>HTTP status: " + o.status + "</li>";
            s += "<li>Status code message: " + o.statusText + "</li>";
            s += "<li>HTTP headers received: <ul>" + o.getAllResponseHeaders() + "</ul></li>";
            s += "<li>Response: " + o.responseText + "</li>";
            div.set("innerHTML", s);
            
            Y.log(Y.JSON.parse(o.responseText));
        }
    };
 
    //A function handler to use for failed requests:
    var handleFailure = function(ioId, o){
        Y.log("The failure handler was called.  Id: " + ioId + ".", "info", "example");
 
        if(o.responseText !== undefined){
            var s = "<li>Transaction id: " + ioId + "</li>";
            s += "<li>HTTP status: " + o.status + "</li>";
            s += "<li>Status code message: " + o.statusText + "</li>";
            div.set("innerHTML", s);
        }
    };
 
    //Subscribe our handlers to IO's global custom events:
    Y.on('io:success', handleSuccess);
    Y.on('io:failure', handleFailure);
 
 
    var dataRaw = {
        troop : [
        {
            name: "Ashley", 
            age: 12
        },{
            name: "Abby", 
            age:9
        } ]
    }; 

 
    /* Configuration object for POST transaction */
    var cfg = {
        method: "POST",
        data: Y.JSON.stringify(dataRaw),
        headers: {
            'X-Transaction': 'POST Example'
        }
    };
 
    //The URL of the resource to which we're POSTing data:
    var sUrl = "service";
 
    //Handler to make our XHR request when the button is clicked:
    function makeRequest(){
 
        div.set("innerHTML", "Loading data from new request...");
 
        var request = Y.io(sUrl, cfg);
        Y.log("Initiating request; Id: " + request.id + ".", "info", "example");
 
    }
 
    // Make a request when the button is clicked:
    Y.on("click", makeRequest, "#requestButton");
});