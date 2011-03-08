/**
 * @author egli
 */

YUI.add('pairs_game', function(Y) {
 
    var game,
    turn,
    players,
    createCards = function(){
        var cardsInRow,
        nodeCardTable = Y.one('#cardTable'),
        nodeCardRows, cardIndex = 0,
        cardsLength = game.photosetLength * 2;

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
                    nodeCardRows.item(i).append('<div class="card"><div class="inner face"></div><div class="inner back"></div></div>');
                    cardIndex++;
                }
            }
        }

        var onClickCard = function(e) {   
            var cardNode = e.currentTarget;

            var faceDownAllCards = function(){
                Y.all('#cardTable .faceup').removeClass('faceup');
            }

            if(game.status > 0 && game.status < 10){
                if(Y.all('#cardTable .faceup').size() === 0){
                    startTurn();
                    flipCard(cardNode);
                } else if (Y.all('#cardTable .faceup').size() === 1){
                    if(Y.one('#cardTable .faceup') !== cardNode){
                        flipCard(cardNode);
                        // Automatically flip cards
                        window.setTimeout(function() {
                            // If not already manually flipped
                            if (Y.all('#cardTable .faceup').size() === 2){
                                endTurn();
                                faceDownAllCards();
                            }
                        }, 1500);

                    }
                } else {
                    endTurn();
                    faceDownAllCards();
                }
            }
        };
        Y.all('#cardTable .card').on('click', onClickCard);
    },
    flipCard = function(cardNode){
        if(cardNode.hasClass('faceup')){
            // Hide the photo and show the back
            // Remove faceup class
            cardNode.removeClass("faceup");
        } else {
            // Show the photo and hide the back
            // Add faceup class
            cardNode.addClass("faceup");
        }
    },
    wonPair = function(){
        var cardIndex;
        Y.all('#cardTable .faceup').each(function(n){
            flipCard(n);
            // Hide the card
            n.setStyle("visibility","hidden");
        })
    },
    startTurn = function(){
        if (turn.counter === 0){
            game.status = 2;
            game.startDate = new Date();
        }
        turn.counter += 1;
        turn.startDate = new Date();
        turn.endDate = null;
    },
    endTurn = function(){
        turn.endDate = new Date();
        players[turn.currentPlayer].usedTime += turn.endDate - turn.startDate;

        if(Y.all('#cardTable .faceup img').item(0).get('src') == Y.all('#cardTable .faceup img').item(1).get('src')){
            wonPair();
            // Current player can play again
            players[turn.currentPlayer].wonPairs += 1;
			
            // Check if it's the end of the game
            var totalWonPairs = 0;
            for (var i=0,len=players.length; i<len; i++){
                totalWonPairs += players[i].wonPairs;
            }
            if(totalWonPairs == game.photosetLength){
                // End of the game
                game.status = 9;
                game.endDate = new Date();
				
                var winner = {
                    name : '',
                    pairs : 0
                };
                for (var i=0,len=players.length; i<len; i++){
                    if (players[i].wonPairs > winner.pairs){
                        winner.name = players[i].name;
                        winner.pairs = players[i].wonPairs;
                    } else if (players[i].wonPairs == winner.pairs){
                        winner.name += ' & '+players[i].name;
                    }
                }
                Y.PAIRS.game.setInfo(winner.name+' won the game with '+winner.pairs+' pairs.');
                //gameOverWidget.show();
                Y.PAIRS.layout.showGameOverWidget();
            } else {
                Y.PAIRS.game.setInfo(players[turn.currentPlayer].name + '. You won the pair. Your turn again.')
            }

        } else {
            // next Player
            if(turn.currentPlayer+1 === game.players){
                turn.currentPlayer = 0;
            } else {
                turn.currentPlayer += 1;
            }
            Y.PAIRS.game.setInfo(players[turn.currentPlayer].name + '. It is your turn now.')
        }
    },
    updateGameStats = function(){
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

        Y.PAIRS.layout.updateGameStatsWidgetBody('');

        bodyContent += '<h3>Game</h3>';
        bodyContent += addDataRow('Photo Theme',game.themeQuery);
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

        for (var i=0,len=players.length; i<len; i++){
            bodyContent += '<h3>'+players[i].name+'</h3>';
            bodyContent += addDataRow('Pairs',players[i].wonPairs);
            bodyContent += addDataRow('Time',formatTime(players[i].usedTime));
        }

        Y.PAIRS.layout.updateGameStatsWidgetBody(bodyContent);

    };

    Y.namespace('PAIRS');
    Y.PAIRS.game = {
        startNew : function(){
                          
            players = Y.PAIRS.settings.getPlayers();
            
            // Set the initial game status
            game = {
                players : players.length,
                themeQuery : Y.PAIRS.settings.getThemeQuery(),
                photosetLength : Y.PAIRS.settings.getPhotosetLength(),
                startDate : null,
                endDate : null,
                status : 0
            };
            // game status: 0: init, 1: photos loaded and ready to play, 2: game started, 9: game over, >99; game error

            // Set the initial turn status
            turn = {
                currentPlayer : 0,
                counter : 0,
                startDate : null,
                endDate: null
            };
                     
            createCards();
            Y.PAIRS.photoset.createNew(game.themeQuery, game.photosetLength);
               
        },
        getCurrentPlayer : function(){
            return players[turn.currentPlayer];
        },
        setInfo : function(text){
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
            updateGameStats();
        }, 
        setStatus : function(status){
            game.status = status;
        }
    }
 
}, '0.0.1' /* module version */, {
    requires: ['base','node','overlay','anim','datatype-date']
});

