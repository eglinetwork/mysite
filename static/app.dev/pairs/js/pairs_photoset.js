/**
 * @author egli
 */

YUI.add('pairs_photoset', function(Y) {
 
    // No private properties or functions

    Y.namespace('PAIRS');
    Y.PAIRS.photoset = {
        createNew : function(themeQuery,photosetLength){
            var nodePhotoList = Y.one('#tabPhotos ul'), 
            nodeCardTable = Y.one('#cardTable'),
            nodelistCards = nodeCardTable.all('.card'),
            cardsLength = nodelistCards.size(),
            photoFlickrUrl,
            loadedPhotos = 0,
            yqlString = 'select * from flickr.photos.sizes where photo_id in (select id from flickr.photos.search('+ photosetLength +') where text="'+themeQuery+'" and api_key="822fb2e40856cc925f8fabf1942f3e61" and license="3") and api_key="822fb2e40856cc925f8fabf1942f3e61"',            
            photoset = {};

            Y.PAIRS.game.setInfo('Loading Photos ...');
            nodeCardTable.removeClass('photosLoaded');

            Y.YQL(yqlString, function(r) {                
                if(r.query.results){
                    var imageSizes = r.query.results.size,
                    urlParts = [], photoId, cardphoto = [], cardIndex, cardAssigns;

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

                                if(cardphoto[cardIndex] == undefined){
                                    cardphoto[cardIndex] = photoId;                                    
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
                    
                    // assign fotos to cards
                    for (var i=0,len=cardsLength; i<len; i++){
                        photoId = cardphoto[i];
                        nodelistCards.item(i).one('.face').append('<img src="'+ photoset[photoId].Small.source +'">');
                        if(parseInt(photoset[photoId].Small.height,10) > parseInt(photoset[photoId].Small.width,10)){
                            nodelistCards.item(i).one('.face img').addClass('portrait');
                        } else {
                            nodelistCards.item(i).one('.face img').addClass('landscape');
                        }
                    }

                    if (loadedPhotos === photosetLength){
                        // Photoset is successfully loaded and complete
                        Y.PAIRS.game.setStatus(1);
                        Y.PAIRS.game.setInfo(Y.PAIRS.game.getCurrentPlayer().name + '. Start the game.');
                        nodeCardTable.addClass('photosLoaded');
                    } else {
                        Y.PAIRS.game.setStatus(101);
                        Y.PAIRS.game.setInfo('Not enough photos for theme \''+themeQuery+'\' found. Change the settings.');
                    }
                } else {                    
                    Y.PAIRS.game.setStatus(100);
                    Y.PAIRS.game.setInfo('No photos for theme \''+themeQuery+'\' found. Change the settings.');
                }
		
                // Create the photo list
                nodePhotoList.empty();
                for (photoId in photoset) {
                    photoFlickrUrl = "http://flickr.com/photo.gne?id=" + photoId
                    nodePhotoList.append('<li><img src="'+ photoset[photoId].Small.source +'"> <a href="'+photoFlickrUrl+'" target="_blank">'+photoFlickrUrl+'</a></li>')
                }
            });
        }
    }
 
}, '0.0.1' /* module version */, {
    requires: ['base','node','yql']
});

