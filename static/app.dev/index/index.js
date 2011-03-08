/**
 * @author egli
 */

YUI().use('node','tabview', function(Y) {
    function init() {

        Y.one('.yui3-js-enabled').removeClass('yui3-js-enabled');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });
        tabview.render();
        
    }
    Y.on("domready", init);
});