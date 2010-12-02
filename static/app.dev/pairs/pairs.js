/**
 * @author egli
 */

YUI().use('node','yql','tabview','stylesheet', function(Y) {

    var cards = [],
    cardsLength = 44,
    photoset = {},
    photosetLength = cardsLength/2,
    themeQuery = 'steam engine';


    function init() {
        // Y.log('domready fired');

        var tabview = new Y.TabView({
            srcNode: '#tabview'
        });


        tabview.on('selectionChange', function(e) {

            Y.log(e.newVal);
            // On selection of tab table
            if (e.newVal && e.newVal.get('index') === 1){
                var node = Y.one('#cardTable .card');
                var nodeWidth = node.get('offsetWidth')
                Y.log(nodeWidth);
                Y.log(node);
            }

        });


        tabview.render();

        createCards();
	
        createPhotoset();

        createCardStylesheet();


		
    }
    Y.on("domready", init);

    // private functions

    var createCardStylesheet = function(){

        var stylesheet = Y.StyleSheet('card').set('.card', {
            border : "1px solid",
            margin : "0.5em",
            overflow : "hidden"
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
                    nodeCardRows.item(i).append('<div class="yui3-u-1-8"><div data-cardindex="'+cardIndex+'" class="card">card</div></div>');
                    cards[cardIndex] = {
                        status : "created",
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
                        
            if(card.faceDown){
                card.faceDown = false;
                // Show or append the photo
                photoId = card.photo;
                e.currentTarget.append('<img src="'+ photoset[photoId].Square.source +'">');                            
            } else {
                card.faceDown = true;
                // Hide or remove the photo        
                e.currentTarget.removeChild(Y.Node.getDOMNode(e.currentTarget).lastChild);
            }

        };
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