/**
 * @author egli
 */

YUI().use('node','yql','tabview','stylesheet', function(Y) {

    var cards = [],
    cardsLength = 40,
    photoset = {},
    photosetLength = cardsLength/2,
    themeQuery = 'steam engine';


    function init() {
        // Y.log('domready fired');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });


        tabview.on('selectionChange', function(e) {

            // Y.log(e.newVal);
            // On selection of tab table
            //            if (e.newVal && e.newVal.get('index') === 1){
            //                var node = Y.one('#cardTable .card');
            //                var nodeWidth = node.get('offsetWidth')
            //                Y.log(nodeWidth);
            //                Y.log(node);
            //            }

            });


        tabview.render();

        createCards();
	
        createPhotoset();

        createCardStylesheet();


		
    }
    Y.on("domready", init);

    // private functions

    var createCardStylesheet = function(){

        var stylesheet = Y.StyleSheet('card');
        
        stylesheet.set('.card', {
            border : "1px solid",
            borderRadius : "5px",
            margin : "0.5em",
            overflow : "hidden"
        });
        
        stylesheet.set('.card .back', {
            margin : "1em",
            border : "1px solid",
            lineHeight : "0px"
        });
        
                
        stylesheet.set('.card .face', {
            margin : "1em",
            border : "1px solid",
            overflow : "hidden",
            textAlign : "center",
            display : "none"
        });

    }

    var createCards = function(){
        var cardsInRow = 8,
        nodeCardTable = Y.one('#cardTable'),
        nodeCardRows, cardIndex = 0;

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
            var card, cardIndex, photoId;
            cardIndex = e.currentTarget.getAttribute('data-cardindex');
            card = cards[cardIndex];

            // Append the photo
            if(card.status === "initialized"){
                photoId = card.photo;
                    
                e.currentTarget.one('.face').append('<img src="'+ photoset[photoId].Small.source +'">');  
                card.status = "completed";         
                    
                if(parseInt(photoset[photoId].Small.height,10) > parseInt(photoset[photoId].Small.width,10)){
                    e.currentTarget.one('.face img').setStyle("height","125%");
                } else {
                    e.currentTarget.one('.face img').setStyle("width","100%");
                    e.currentTarget.one('.face img').setStyle("verticalAlign","middle");
                } 
            }

            flipCard(e,card);


        };
        
        var flipCard = function(e,card){
            if(card.faceDown){
                card.faceDown = false;

                // Show the photo
                var backHeigth = e.currentTarget.one('.back').get('offsetHeight')-2;
                
                e.currentTarget.one('.face').setStyle("display","block");
                e.currentTarget.one('.face').setStyle("height",backHeigth);
                e.currentTarget.one('.face').setStyle("lineHeight",backHeigth);
                
                // Hide the back
                e.currentTarget.one('.back').setStyle("display","none");
 
            } else {
                card.faceDown = true;
                
                // Hide the photo                   
                e.currentTarget.one('.face').setStyle("display","none");
                
                // Show the back
                e.currentTarget.one('.back').setStyle("display","block");  
            }
        }
        
        Y.all('#cardTable .card').on('click', onClickCard);

    }

    var createPhotoset = function(){
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

            Y.log(photoset);

        // Y.log(cards);
        });
    };

});