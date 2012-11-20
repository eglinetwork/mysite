/**
 * @author egli
 */

YUI.add('pairs_settings', function(Y) {
 
    // No private properties or functions

    Y.namespace('PAIRS');
    Y.PAIRS.settings = {
        init : function(){
            // If placeholders are not supported
            // write placeholder values as default values
            if(!Modernizr.input['placeholder']){
                Y.all('#tabSettings form input').each(function(node,nodeIndex,nodeList){
                    if (node.getAttribute('placeholder') != ""){
                        node.set('value',node.getAttribute('placeholder'));
                    }
                });
            } 
        }, 
        getPhotosetLength : function(){
            var photosetLength
            photosetLength = parseInt(Y.one('#inputPairsLength').get('value'),10);
            photosetLength=Math.round(photosetLength);
            if (photosetLength < 8 || photosetLength > 20){
                // It the value is invalid, set it to a default
                photosetLength = Y.one('#inputPairsLength').getAttribute('placeholder');
            }
            Y.one('#inputPairsLength').set('value',photosetLength);
            return photosetLength;
        },
        getThemeQuery : function(){
            var themeQuery;
            themeQuery = Y.one('#inputTheme').get('value');
            if (themeQuery == ""){
                themeQuery = Y.one('#inputTheme').getAttribute('placeholder');
            }
            return themeQuery;
        },
        getPlayers : function(){
            var players = [];
            // Read the players names from input fields
            Y.all('#fieldsetPlayersNames input').each(function(node,nodeIndex,nodeList){
                if (node.get('value') != ""){
                    
                    players[players.length] = {
                        name : node.get('value'),
                        wonPairs : 0,
                        usedTime : 0
                    };
                }
            });
            // If no player name defined
            if (players.length == 0){
                players[players.length] = {
                    name : Y.one('#fieldsetPlayersNames input').getAttribute('placeholder'),
                    wonPairs : 0,
                    usedTime : 0
                };
            }            
            
            return players;
        }
    }
 
}, '0.0.1' /* module version */, {
    requires: ['base','node','overlay','anim']
});

