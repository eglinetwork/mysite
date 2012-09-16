
var express = require('express');
var app = module.exports = express();

var conf = require('node-config');

conf.initConfig(
    function(err) {
        if(err) {
            sys.log('Unable to init the config: ' + err); 
            return;
        }

        app.use(function(err, req, res, next){
            console.error(err.stack);
            res.send(500, 'Something broke!');
        });
        app.use(express.static(__dirname + '/static'));

        app.engine('.html', require('ejs').__express);
        app.set('view engine', 'html');

        /////// ROUTES /////////

        app.get('/', function(req, res){
            res.render('index', { 
                title : 'eglinetwork | Marco Egli',
                app_version : conf.app.version,
                app_name : 'index',
                lang : "en",
                description: 'This is my personal website. Here can you find a few things about me and some of my projects.',
                author: 'Marco Egli',
                analyticssiteid: conf.analyticssiteid,
                jslib_yui_version: conf.jslib.yui.version,
                jslib_modernizr_version: conf.jslib.modernizr.version
            });
        });

        app.get('/pairs.:theme?', function(req,res){
            var pairs_theme = "Steam Engine";
            if (req.params && req.params.theme){
                pairs_theme = req.params.theme;
            }
            res.render('pairs', {            
                title : 'Photo Pairs',
                app_version : conf.app.version,
                app_name : 'pairs',
                lang : "en",
                description: 'Play pairs with beautiful photos. Select your personal photo theme to get individual variants of card sets. Play an easy game with 8 pairs or play it difficult with 20 pairs. Challenge yourself or play with up to four players. Pairs is also known as Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Concentration',
                author: 'Marco Egli',
                analyticssiteid: conf.analyticssiteid,
                jslib_yui_version: conf.jslib.yui.version,
                jslib_modernizr_version: conf.jslib.modernizr.version,
                pairs_theme : pairs_theme                
            });
        });
        
        
        app.get('/druidnight', function(req,res){
            res.render('druidnight', {                
                title : '2. Nacht der Druiden',
                app_version : conf.app.version,
                app_name : 'druidnight',
                lang : "de",
                description: 'Einladung zur zweiten Nacht der Druiden',
                author: 'Marco Egli',
                analyticssiteid: conf.analyticssiteid,
                jslib_yui_version: conf.jslib.yui.version,
                jslib_modernizr_version: conf.jslib.modernizr.version              
            });
        });   

        app.get('/*', function(req, res){
            console.log(req);
            res.send(404, 'Not Found!');
        });
       
        var port = conf.port;
        app.listen(port);
        console.log('Listening on port:' + port );

    });