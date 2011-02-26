/**
 * @author egli
 */
YUI().use('node','yql','tabview','anim','overlay','datatype-date', function(Y) {

    var cards,
    cardNodes,
    cardsLength,
    photoset,
    photosetLength,
    themeQuery,
    game,
    turn,
    players,
    gameStatsWidget,
    gameOverWidget,
    tabview;

    // On domready init the application
    function init() {

        tabview = new Y.TabView({
            srcNode: '#tabview'
        });

        tabview.on('selectionChange', function(e) {

            // On blur of tab settings
            if (e.prevVal && e.prevVal.get('index') === 0){
                startNewGame();
            }

            // On selection of tab table
            if (e.newVal && e.newVal.get('index') === 1){
                Y.one('#applicationTitle').setStyle("display","none");
                Y.one('#divGameInfo').setStyle("display","block");
            } else {
                Y.one('#applicationTitle').setStyle("display","block");
                Y.one('#divGameInfo').setStyle("display","none");
            }

        });
        tabview.render();

        createGameStatsWidget();
        Y.one('#divGameInfo .button').on('click',function(){
            if (gameStatsWidget.get('visible')){
                hideGameStatsWidget();
            } else {
                showGameStatsWidget();
            }
        });

        createAboutWidget();
        createGameOverWidget();

        Y.one('#buttonPlayNow').on('click',function(){
            tabview.selectChild(1);
        });
                         
        // If placeholders are not supported
        // write placeholder values as default values
        if(!Modernizr.input['placeholder']){
            Y.all('#tabSettings form input').each(function(node,nodeIndex,nodeList){
                if (node.getAttribute('placeholder') != ""){
                    node.set('value',node.getAttribute('placeholder'));
                }
            });
        }
                
                
    }
    Y.on("domready", init);

    // private functions

    var startNewGame = function(){
        gameOverWidget.hide();
        loadSettings();
        createCards();
        createPhotoset();
    };

    var loadSettings = function(){
        cards = [];
        photosetLength = parseInt(Y.one('#inputPairsLength').get('value'),10);
        photoset = {};
        cardsLength = photosetLength * 2;
        themeQuery = Y.one('#inputTheme').get('value');
        if (themeQuery == ""){
            themeQuery = Y.one('#inputTheme').getAttribute('placeholder');
        }

        var playersLength = 0;
        players = [];
        Y.all('#fieldsetPlayersNames input').each(function(node,nodeIndex,nodeList){
            if (node.get('value') != ""){
                playersLength += 1;
                players[playersLength] = {
                    name : node.get('value'),
                    wonPairs : 0,
                    usedTime : 0
                };
            }
        });
        if (playersLength == 0){
            playersLength = 1;
            players[playersLength] = {
                name : Y.one('#fieldsetPlayersNames input').getAttribute('placeholder'),
                wonPairs : 0,
                usedTime : 0
            };
        }

        game = {
            players : playersLength,
            startDate : null,
            endDate : null,
            status : 0
        };
        /* game status: 0: init, 1: photos loaded and ready to play, 2: game started, 9: game over */

        turn = {
            currentPlayer : 1,
            flippedCards: [],
            counter : 0,
            startDate : null,
            endDate: null
        };

    };

    var createCards = function(){
        var cardsInRow,
        nodeCardTable = Y.one('#cardTable'),
        nodeCardRows, cardIndex = 0;

        if(cardsLength<=32){
            cardsInRow = Math.ceil(cardsLength/4);
        } else {
            cardsInRow = Math.ceil(cardsLength/Math.ceil(cardsLength/8));
        }

        nodeCardTable.empty();

        // Create rows
        for (var i=0,len=Math.ceil(cardsLength/cardsInRow); i<len; i++){
            nodeCardTable.append('<div class="cardRow"></div>');
        }

        nodeCardRows = Y.all('#cardTable .cardRow');
        for (var i=0,len=nodeCardRows.size(); i<len; i++){

            for (var j=0; j<cardsInRow; j++){

                if(cardIndex < cardsLength){
                    nodeCardRows.item(i).append('<div data-cardindex="'+cardIndex+'" class="card"><div class="inner face"></div><div class="inner back"></div></div>');
                    cards[cardIndex] = {
                        status : "initialized",
                        faceDown : true,
                        photo : null
                    };
                    cardIndex++;
                }
            }
        }

        var onClickCard = function(e) {
            var card, cardNode, cardIndex, photoId;
            cardNode = e.currentTarget;
            cardIndex = parseInt(cardNode.getAttribute('data-cardindex'),10);
            card = cards[cardIndex];
            
            var faceDownAllCards = function(){
                cardNodes.each(function(n){
                    if(cards[parseInt(n.getAttribute('data-cardindex'),10)].faceDown == false){
                        flipCard(n);
                    }
                });
            }

            if(game.status > 0){
                // Append the photo
                if(card.status === "initialized"){
                    photoId = card.photo;

                    cardNode.one('.face').append('<img src="'+ photoset[photoId].Small.source +'">');
                    card.status = "completed";

                    if(parseInt(photoset[photoId].Small.height,10) > parseInt(photoset[photoId].Small.width,10)){
                        cardNode.one('.face img').addClass('portrait');
                    } else {
                        cardNode.one('.face img').addClass('landscape');
                    }
                }

                if(turn.flippedCards.length == 0){
                    startTurn();
                    flipCard(cardNode);
                    turn.flippedCards[0] = cardIndex;
                } else if (turn.flippedCards.length == 1){
                    if(turn.flippedCards[0] !== cardIndex){
                        flipCard(cardNode);
                        turn.flippedCards[1] = cardIndex;
                        // Automatically flip cards
                        window.setTimeout(function() {
                            // If not already manually flipped
                            if (turn.flippedCards.length == 2){
                                faceDownAllCards();
                                endTurn();
                            }
                        }, 2000);

                    }
                } else {
                    faceDownAllCards();
                    endTurn();
                }
            }
        };

        Y.all('#cardTable .card').on('click', onClickCard);
        cardNodes = Y.all('#cardTable .card');

    };

    var createPhotoset = function(){
        var nodePhotoList = Y.one('#tabPhotos ul'), 
        nodeCardTable = Y.one('#cardTable'),
        photoFlickrUrl,
        loadedPhotos = 0,
        yqlString = 'select * from flickr.photos.sizes where photo_id in (select id from flickr.photos.search('+ photosetLength +') where text="'+themeQuery+'" and license="3")';

        setGameInfo('Loading Photos ...');
        nodeCardTable.removeClass('photosLoaded');

        Y.YQL(yqlString, function(r) {
            if(r.query.results){
                var imageSizes = r.query.results.size,
                urlParts = [], photoId, cardIndex, cardAssigns;

                for(var i=0,len=imageSizes.length; i<len; i++){

                    urlParts = imageSizes[i].url.split("/");
                    photoId = urlParts[5];

                    // Create a new photo in the set
                    if (photoset[photoId] === undefined){
                        photoset[photoId] = {};
                        loadedPhotos += 1;

                        // Assign to 2 cards
                        cardAssigns = 0;
                        while (cardAssigns < 2) {
                            cardIndex = Math.floor(Math.random()*cardsLength);

                            if(cards[cardIndex].photo === null){
                                cards[cardIndex].photo = photoId;
                                cardAssigns ++;
                            }
                        }

                    }

                    // Add the size to the photo in the set
                    photoset[photoId][imageSizes[i].label] = {
                        source : imageSizes[i].source,
                        height : imageSizes[i].height,
                        width : imageSizes[i].width,
                        url : imageSizes[i].url
                    };

                }

                //Y.log(photoset);

                if (loadedPhotos == photosetLength){
                    game.status = 1;
                    setGameInfo(players[turn.currentPlayer].name + '. Start the game.');
                    nodeCardTable.addClass('photosLoaded');
                } else {
                    game.status = 101;
                    setGameInfo('Not enough photos for theme \''+themeQuery+'\' found. Change the settings.');
                }
            } else {
                game.status = 100;
                setGameInfo('No photos for theme \''+themeQuery+'\' found. Change the settings.');
            }
		

            // Create the photo list
            nodePhotoList.empty();
            for (photoId in photoset) {
                photoFlickrUrl = "http://flickr.com/photo.gne?id=" + photoId
                nodePhotoList.append('<li><img src="'+ photoset[photoId].Small.source +'"> <a href="'+photoFlickrUrl+'" target="_blank">'+photoFlickrUrl+'</a></li>')
            }
        });
    };


    var createGameStatsWidget = function(){
        /* Create Overlay from script, this time. With no footer */
        gameStatsWidget = new Y.Overlay({
            zIndex:2
        });

        /* Render it as a child of the #tabTable element */
        gameStatsWidget.render('#tabTable');
        gameStatsWidget.hide();
        Y.on("resize", alignGameStatsWidget, window);
    };

    var alignGameStatsWidget = function(){
        var nodeCardTable = Y.one('#cardTable');
        gameStatsWidget.set('height',nodeCardTable.get('offsetHeight'));
        gameStatsWidget.set('width',nodeCardTable.get('offsetWidth')/3);
        gameStatsWidget.set("align", {
            node:"#tabTable",
            points:[Y.WidgetPositionAlign.TR, Y.WidgetPositionAlign.TR]
        });
    };

    var showGameStatsWidget = function(){
        alignGameStatsWidget();
        gameStatsWidget.show();
    };

    var hideGameStatsWidget = function(){
        gameStatsWidget.hide();
    };

    var updateGameStatsWidget = function(){
        var bodyContent = '',
        addDataRow = function(title,value){
            var html = '';
            html += '<div class="yui3-g">';
            html += '	<div class="yui3-u-1-2"><p>'+title+'</p></div>';
            html += '	<div class="yui3-u-1-2"><p>'+value+'</p></div>';
            html += '</div>';
            return html;
        },
        formatTime = function(ms){
            var totalSeconds = Math.ceil(ms/1000),
            hours = Math.floor(totalSeconds / 3600),
            minutes = Math.floor((totalSeconds-hours*3600)/ 60),
            seconds = totalSeconds - hours*3600 - minutes*60;

            if (hours < 10){
                hours = '0' + hours;
            }
            if (minutes < 10){
                minutes = '0' + minutes;
            }
            if (seconds < 10){
                seconds = '0' + seconds;
            }
            return hours +':'+ minutes +':'+ seconds;
        },
        getTextGameStatus = function(status){
            var textStatus = '';
            if(status == 0){
                return 'Loading photos from Flickr';
            } else if (status == 1){
                return 'Ready to play';
            } else if (status == 2){
                return 'Game started';
            } else if (status == 9){
                return 'Game over';
            } else {
                return 'Error '+status+'! Want to <a href="javascript:location.reload()">restart</a>?';
            }
        };

        gameStatsWidget.set('bodyContent','');

        bodyContent += '<h3>Game</h3>';
        bodyContent += addDataRow('Photo Theme',themeQuery);
        bodyContent += addDataRow('Status',getTextGameStatus(game.status));
        bodyContent += addDataRow('Start Time',Y.DataType.Date.format(game.startDate, {
            format:"%T"
        }));
        if (game.endDate){
            bodyContent += addDataRow('End Time',Y.DataType.Date.format(game.endDate, {
                format:"%T"
            }));
            bodyContent += addDataRow('Total Time',formatTime(game.endDate-game.startDate));
        }

        bodyContent += addDataRow('Played Turns',turn.counter);

        for (var i=1,len=players.length; i<len; i++){
            bodyContent += '<h3>'+players[i].name+'</h3>';
            bodyContent += addDataRow('Pairs',players[i].wonPairs);
            bodyContent += addDataRow('Time',formatTime(players[i].usedTime));
        }

        gameStatsWidget.set('bodyContent',bodyContent);

    };

    var createGameOverWidget = function(){
        /* Create Overlay from script */
        gameOverWidget = new Y.Overlay({
            headerContent:'<h3>Game Over</h3>',
            bodyContent:'<span id="buttonPlayAgain" class="button blue">Play again</span> <span id="buttonShowPhotos" class="button blue">Show photos</span>',
            zIndex:3
        });

        /* Render it as a child of the #tabTable element */
        gameOverWidget.render('#tabTable');

        gameOverWidget.on('visibleChange',function(){
            gameOverWidget.set('centered','#cardTable');
        });

        Y.one('#buttonPlayAgain').on('click',function(){
            startNewGame();
        });
        Y.one('#buttonShowPhotos').on('click',function(){
            tabview.selectChild(2);
        });
    }

    var createAboutWidget = function(){
        /* Create Overlay from script */
        var notSupportedEnrichmentsArray = [], notSupportedEnrichmentsText = '';
        var aboutWidget = new Y.Overlay({
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
		

        var alignAboutWidget = function(){
            aboutWidget.set('height',Y.one('#tabSettings').get('offsetHeight'));
            aboutWidget.set('width',Y.one('#tabSettings').get('offsetWidth')/2);
            aboutWidget.set("align", {
                node:"#tabSettings",
                points:[Y.WidgetPositionAlign.TR, Y.WidgetPositionAlign.TR]
            });
            aboutWidget.set('fillHeight','WidgetStdMod.BODY');
        };

        alignAboutWidget();
        Y.on("resize", alignAboutWidget, window);
        tabview.on('selectionChange', function(e) {
            if (e.newVal && e.newVal.get('index') === 0){
                setTimeout ( alignAboutWidget, 1 );
            }
        });
    };

    var flipCard = function(cardNode){

        var card, cardIndex;
        cardIndex = parseInt(cardNode.getAttribute('data-cardindex'),10);
        card = cards[cardIndex];

        if(card.faceDown){
            card.faceDown = false;
            // Show the photo
            cardNode.one('.face').setStyle("display","block");
            // Hide the back
            cardNode.one('.back').hide()
            // Add faceup class
            cardNode.addClass("faceup");

        } else {
            card.faceDown = true;
            // Hide the photo
            cardNode.one('.face').hide();
            // Show the back
            cardNode.one('.back').setStyle("display","block");
            // Remove faceup class
            cardNode.removeClass("faceup");
        }
    };

    var hideCard = function(cardNode){
        // Hide the photo
        cardNode.setStyle("visibility","hidden");

    };


    var wonPair = function(flippedCards){
        var cardIndex;
        cardNodes.each(function(n){
            cardIndex = parseInt(n.getAttribute('data-cardindex'),10);
            if(cardIndex == flippedCards[0] || cardIndex == flippedCards[1]){
                hideCard(n);
            }
        })
    };


    var startTurn = function(){
        if (turn.counter === 0){
            game.status = 2;
            game.startDate = new Date();
        }
        turn.counter += 1;
        turn.startDate = new Date();
        turn.endDate = null;
    };

    var endTurn = function(){
        var cardIndex0 = turn.flippedCards[0],
        cardIndex1 = turn.flippedCards[1];

        turn.endDate = new Date();
        players[turn.currentPlayer].usedTime += turn.endDate - turn.startDate;

        if(cards[cardIndex0].photo == cards[cardIndex1].photo){
            wonPair(turn.flippedCards);
            // Current player can play again
            players[turn.currentPlayer].wonPairs += 1;
			
            // Check if it's the end of the game
            var totalWonPairs = 0;
            for (var i=1,len=players.length; i<len; i++){
                totalWonPairs += players[i].wonPairs;
            }
            if(totalWonPairs == cardsLength/2){
                // End of the game
                game.status = 9;
                game.endDate = new Date();
				
                var winner = {
                    name : '',
                    pairs : 0
                };
                for (var i=1,len=players.length; i<len; i++){
                    if (players[i].wonPairs > winner.pairs){
                        winner.name = players[i].name;
                        winner.pairs = players[i].wonPairs;
                    } else if (players[i].wonPairs == winner.pairs){
                        winner.name += ' & '+players[i].name;
                    }
                }
                setGameInfo(winner.name+' won the game with '+winner.pairs+' pairs.');
                gameOverWidget.show();
            } else {
                setGameInfo(players[turn.currentPlayer].name + '. You won the pair. Your turn again.')
            }

        } else {
            // next Player
            if(turn.currentPlayer === game.players){
                turn.currentPlayer = 1;
            } else {
                turn.currentPlayer += 1;
            }
            setGameInfo(players[turn.currentPlayer].name + '. It is your turn now.')
        }

        turn.flippedCards = [];
    };

    var setGameInfo = function(text){
        var nodeGameInfo = Y.one('#divGameInfo'),
        nodeGameInfoText = Y.one('#divGameInfo h2');
        nodeGameInfoText.set('innerHTML', text);

        var anim = new Y.Anim({
            node: nodeGameInfo,
            from: {
                color:'#D7D7D7'
            },
            to: {
                color:'#F47A20'
            },
            duration:0.8
        });
        anim.run();
        var eventAnimOnEnd = anim.on('end', function() {
            anim.set('reverse', true);
            anim.run();
            Y.detach(eventAnimOnEnd);
        });

        updateGameStatsWidget();
    };

});