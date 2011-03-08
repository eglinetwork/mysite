/**
 * @author egli
 */

YUI({
    modules:  {
        pairs_layout: {
            fullpath: 'app.dev/pairs/js/pairs_layout.js',
            requires: ['base','node','tabview','overlay']
        },
        pairs_settings: {
            fullpath: 'app.dev/pairs/js/pairs_settings.js',
            requires: ['base','node']
        },        
        pairs_game: {
            fullpath: 'app.dev/pairs/js/pairs_game.js',
            requires: ['base','node','overlay','anim','datatype-date']
        },
        pairs_photoset: {
            fullpath: 'app.dev/pairs/js/pairs_photoset.js',
            requires: ['base','node','yql']
        }
    }
}).use('pairs_layout','pairs_settings', function(Y) {

    // On domready init the application
    var init = function() {

        Y.PAIRS.layout.init();          
        Y.PAIRS.settings.init();                  
         
    };
    Y.on("domready", init);

});