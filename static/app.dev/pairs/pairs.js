/**
 * @author egli
 */
YUI().use('node','yql','tabview','stylesheet', function(Y) {

    var cards,
    cardNodes,
    cardsLength,
    photoset,
    photosetLength,
    themeQuery,
    game,
    turn;


    function init() {
        // Y.log('domready fired');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });


        tabview.on('selectionChange', function(e) {

            // On selection of tab table
            if (e.prevVal && e.prevVal.get('index') === 0){
                

                
                loadSettings();
                
                createCards();
                
                createPhotoset();
            }

        });


        tabview.render();
        createCardStylesheet();
    }
    Y.on("domready", init);

    // private functions

    var createCardStylesheet = function(){

        var stylesheet = Y.StyleSheet('card');
        
        stylesheet.set('.card', {
            border : "1px solid",
            borderRadius : "5px",
            margin : "5px",
            overflow : "hidden"
        });
        
        stylesheet.set('.card .back', {
            margin : "8px",
            border : "1px solid",
            lineHeight : "0px"
        });
        
                
        stylesheet.set('.card .face', {
            margin : "8px",
            border : "1px solid",
            overflow : "hidden",
            textAlign : "center",
            display : "none"
        });

    }
    
    var loadSettings = function(){
        cards = [];
        cardsLength = document.getElementById('inputCardsLength').value; 
        photoset = {};
        photosetLength = cardsLength/2;
        themeQuery = document.getElementById('inputTheme').value;  
        
        game = {
            players : 1, 
            startDate : ''
        };
        turn = {
            currentPlayer : 1, 
            flippedCards: [], 
            counter : 0,
            startDate : null, 
            endDate: null
        };
    }

    var createCards = function(){
        var cardsInRow,
        nodeCardTable = Y.one('#cardTable'),
        nodeCardRows, cardIndex = 0;
        
        if(cardsLength<=32){
            cardsInRow = Math.ceil(cardsLength/4);
        } else {
            cardsInRow = Math.ceil(cardsLength/Math.ceil(cardsLength/8));
        }
        
        clearChilds(Y.Node.getDOMNode(nodeCardTable));

        // Create rows
        for (var i=0,len=Math.ceil(cardsLength/cardsInRow); i<len; i++){
            nodeCardTable.append('<div class="yui3-g cardRow"></div>');
        }

        nodeCardRows = Y.all('#cardTable .cardRow');		
        for (var i=0,len=nodeCardRows.size(); i<len; i++){

            for (var j=0; j<cardsInRow; j++){

                if(cardIndex < cardsLength){
                    //TODO: replace app.dev with value from configruation
                    nodeCardRows.item(i).append('<div class="yui3-u-1-8"><div data-cardindex="'+cardIndex+'" class="card"><div class="face"></div><div class="back"><img style="width:100%;" src="app.dev/pairs/images/bg.png"></div></div></div>');
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

            // Append the photo
            if(card.status === "initialized"){
                photoId = card.photo;
                    
                cardNode.one('.face').append('<img src="'+ photoset[photoId].Small.source +'">');  
                card.status = "completed";         
                    
                if(parseInt(photoset[photoId].Small.height,10) > parseInt(photoset[photoId].Small.width,10)){
                    cardNode.one('.face img').setStyle("height","125%");
                } else {
                    cardNode.one('.face img').setStyle("width","100%");
                    cardNode.one('.face img').setStyle("verticalAlign","middle");
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
                }
            } else {
                cardNodes.each(function(n){
                    if(cards[parseInt(n.getAttribute('data-cardindex'),10)].faceDown == false){
                        flipCard(n);
                    }
                })
                endTurn();
            }

        };
        
        Y.all('#cardTable .card').on('click', onClickCard);
        cardNodes = Y.all('#cardTable .card'); 

    }

    var createPhotoset = function(){
        var nodePhotoList = Y.one('#tabPhotos ul'), photoFlickrUrl;
        var yqlString = 'select * from flickr.photos.sizes where photo_id in (select id from flickr.photos.search('+ photosetLength +') where text="'+themeQuery+'" and license="3")';
        //Y.log(yqlString);
        Y.YQL(yqlString, function(r) {

            var imageSizes = r.query.results.size,
            urlParts = [], photoId, cardIndex, cardAssigns;

            //Y.log(imageSizes.length);
            for(var i=0,len=imageSizes.length; i<len; i++){

                //Y.log(imageSizes[i].url);

                urlParts = imageSizes[i].url.split("/");
                photoId = urlParts[5];

                // Create a new photo in the set
                if (photoset[photoId] === undefined){
                    photoset[photoId] = {};

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
                    url :  imageSizes[i].url
                };

            }

            //Y.log(photoset);
            
            // Create the photo list
            for (photoId in photoset) {
                photoFlickrUrl = "http://flickr.com/photo.gne?id=" + photoId
                nodePhotoList.append('<li><img src="'+ photoset[photoId].Small.source +'"> <a href="'+photoFlickrUrl+'" target="_blank">'+photoFlickrUrl+'</a></li>')
            }
            Y.on('load', function(){
               Y.log("all photos loaded"); 
            },window);

        // Y.log(cards);
        });
    };
    
    
    var flipCard = function(cardNode){
        
        var card, cardIndex;
        cardIndex = parseInt(cardNode.getAttribute('data-cardindex'),10);
        card = cards[cardIndex];
                
        if(card.faceDown){
            card.faceDown = false;

            // Show the photo
            var backHeigth = cardNode.one('.back').get('offsetHeight')-2;
                
            cardNode.one('.face').setStyle("display","block");
            cardNode.one('.face').setStyle("height",backHeigth);
            cardNode.one('.face').setStyle("lineHeight",backHeigth);
                
            // Hide the back
            cardNode.one('.back').setStyle("display","none");
 
        } else {
            card.faceDown = true;
                
            // Hide the photo                   
            cardNode.one('.face').setStyle("display","none");
                
            // Show the back
            cardNode.one('.back').setStyle("display","block");  
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
        turn.counter += 1;
        turn.startDate = new Date();
        turn.endDate = null;
    };
    
    var endTurn = function(){
        var cardIndex0 = turn.flippedCards[0],
        cardIndex1 = turn.flippedCards[1];
        
        turn.endDate = new Date();
        
        if(cards[cardIndex0].photo == cards[cardIndex1].photo){
            wonPair(turn.flippedCards);
        // Current player can play again
        } else {
        // next Player
        }
        
        turn.flippedCards = [];
    }
    
    var clearChilds = function(el) {
        while(el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

});