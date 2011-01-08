/**
 * @author egli
 */

YUI().use('node','tabview', function(Y) {
 
    function init() {
        // Y.log('domready fired');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });
        tabview.render();
        
		
    }
    Y.on("domready", init);
 
});