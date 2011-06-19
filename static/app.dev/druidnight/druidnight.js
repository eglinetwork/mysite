/**
 * @author egli
 */

YUI().use('node','tabview', function(Y) {
    function main() {

        Y.one('.yui3-js-enabled').removeClass('yui3-js-enabled');

        Y.log("foo");
        
    }
    Y.on("domready", main);
});