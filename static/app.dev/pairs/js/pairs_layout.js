/**
 * @author egli
 */

YUI.add('pairs_layout', function(Y) {
 
    var tabview = {},
    aboutWidget = {},
    gameStatsWidget = {},
    gameOverWidget = {},
    createTabview = function(){
        tabview = new Y.TabView({
            srcNode: '#tabview'
        });

        tabview.on('selectionChange', function(e) {

            // Start a new game on blur of tab settings
            if (e.prevVal && e.prevVal.get('index') === 0){
                Y.PAIRS.game.startNew();
            }

            // Set the game info title on selection of tab table
            if (e.newVal && e.newVal.get('index') === 1){
                Y.one('#applicationTitle').setStyle("display","none");
                Y.one('#divGameInfo').setStyle("display","block");
            } else {
                Y.one('#applicationTitle').setStyle("display","block");
                Y.one('#divGameInfo').setStyle("display","none");
            }
            
            if (e.newVal && e.newVal.get('index') === 0){
                setTimeout ( alignAboutWidget, 1 );
            }

        });
        tabview.render();
    },
    createAboutWidget = function(){
        // Create Overlay from script
        var notSupportedEnrichmentsArray = [], notSupportedEnrichmentsText = '';
        
        aboutWidget = new Y.Overlay({
            srcNode:"#divAboutWidget",
            visible:true,
            zIndex:2
        });

        // Render it as a child of the #tabSettings element
        aboutWidget.render('#tabSettings');

        // Using Modernizr to detect the used HTML5 and CSS3 features

        // HTML5 features
        if(!Modernizr.inputtypes['number']){
            notSupportedEnrichmentsArray.push('number input fields');
        }
        if(!Modernizr.input['placeholder']){
            notSupportedEnrichmentsArray.push('placeholders for empty input fields');
        }

        // CSS features
        if(!Modernizr.rgba){
            notSupportedEnrichmentsArray.push('semi transparent colors');
        }
        if(!Modernizr.borderradius){
            notSupportedEnrichmentsArray.push('rounded corners');
        }
        if(!Modernizr.cssgradients){
            notSupportedEnrichmentsArray.push('background color gradients');
        }
        if(!Modernizr.csstransforms){
            notSupportedEnrichmentsArray.push('scale 2d transformations');
        }
        if(!Modernizr.csstransitions){
            notSupportedEnrichmentsArray.push('smooth transitions');
        }
        if(!Modernizr.fontface){
            notSupportedEnrichmentsArray.push('custom web fonts');
        }


        if(notSupportedEnrichmentsArray.length > 0){
            for(var i=0,len=notSupportedEnrichmentsArray.length;i<len;i++){
                notSupportedEnrichmentsText += notSupportedEnrichmentsArray[i];
                if(i<len-1){
                    notSupportedEnrichmentsText += ', ';
                }
            }
            Y.one('#spanEnrichments').set('innerHTML', notSupportedEnrichmentsText);
        } else {
            Y.one('#spanBrowserSupport').set('innerHTML', '');
        }
	

        alignAboutWidget();
        Y.on("resize", alignAboutWidget, window);

    },
    alignAboutWidget = function(){
        aboutWidget.set('height',Y.one('#tabSettings').get('offsetHeight'));
        aboutWidget.set('width',Y.one('#tabSettings').get('offsetWidth')/2);
        aboutWidget.set("align", {
            node:"#tabSettings",
            points:[Y.WidgetPositionAlign.TR, Y.WidgetPositionAlign.TR]
        });
        aboutWidget.set('fillHeight','WidgetStdMod.BODY');
    },
    createGameStatsWidget = function(){
        gameStatsWidget = new Y.Overlay({
            visible:false,
            zIndex:2
        });

        // Render it as a child of the #tabTable element
        gameStatsWidget.render('#tabTable');
        
        Y.on("resize", alignGameStatsWidget, window);
        
        Y.one('#divGameInfo .button').on('click',function(){
            if (gameStatsWidget.get('visible')){
                gameStatsWidget.hide();
            } else {
                alignGameStatsWidget();
                gameStatsWidget.show();
            }
        });
    },
    alignGameStatsWidget = function(){
        var nodeCardTable = Y.one('#cardTable');
        gameStatsWidget.set('height',nodeCardTable.get('offsetHeight'));
        gameStatsWidget.set('width',nodeCardTable.get('offsetWidth')/3);
        gameStatsWidget.set("align", {
            node:"#tabTable",
            points:[Y.WidgetPositionAlign.TR, Y.WidgetPositionAlign.TR]
        });
    },
    createGameOverWidget = function(){
        // Create Overlay from script
        gameOverWidget = new Y.Overlay({
            headerContent:'<h3>Game Over</h3>',
            bodyContent:'<span id="buttonPlayAgain" class="button blue">Play again</span> <span id="buttonShowPhotos" class="button blue">Show photos</span>',
            visible:false,
            zIndex:3
        });

        // Render it as a child of the #tabTable element
        gameOverWidget.render('#tabTable');

        gameOverWidget.on('visibleChange',function(){
            gameOverWidget.set('centered','#cardTable');
        });

        Y.one('#buttonPlayAgain').on('click',function(){
            gameOverWidget.hide();
            Y.PAIRS.game.startNew();
        });
        Y.one('#buttonShowPhotos').on('click',function(){
            tabview.selectChild(2);
        });
    }


    Y.namespace('PAIRS');
    Y.PAIRS.layout = {
        init : function(){
            createTabview();
            createAboutWidget();
            createGameStatsWidget();
            createGameOverWidget();
            
            // If placeholders are not supported
            // write placeholder values as default values
            if(!Modernizr.input['placeholder']){
                Y.all('#tabSettings form input').each(function(node,nodeIndex,nodeList){
                    if (node.getAttribute('placeholder') != ""){
                        node.set('value',node.getAttribute('placeholder'));
                    }
                });
            } 
            
            // Add the event listener to the start button    
            Y.one('#buttonPlayNow').on('click',function(){
                // Selection the table tab does start a new game
                tabview.selectChild(1);
            });            
        },
        updateGameStatsWidgetBody : function(bodyContent){
            gameStatsWidget.set('bodyContent',bodyContent);
        },
        showGameOverWidget : function(){
            gameOverWidget.show();
        }
    }
 
}, '0.0.1' /* module version */, {
    requires: ['base','node','tabview','overlay']
});

