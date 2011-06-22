
//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support");
var connect = require('connect')
, express = require('express')
, sys = require('sys')
, conf = require('node-config');

conf.initConfig(
    function(err) {
        if(err) {
            sys.log('Unable to init the config: ' + err); 
            return;
        }

        // Config loaded, can do those things now

        //Setup Express
        var server = express.createServer(
            express.logger(),

            // Required by session() middleware
            express.cookieDecoder(),

            // Populates:
            // - req.session
            // - req.sessionStore
            // - req.sessionID
            express.session()
            );

        server.configure(function(){
            server.set('views', __dirname + '/views');
            server.use(connect.bodyDecoder());
            server.use(connect.staticProvider({ root: __dirname + '/static', cache: true, maxAge: 10368000000 }));
            server.use(server.router);
        });

        //setup the errors
        server.error(function(err, req, res, next){
            if (err instanceof NotFound) {
                res.render('404.ejs', {
                    locals: { 
                        title : '404 - Not Found' ,
                        app_version : conf.app.version ,
                        app_name : 'error' ,
                        description: '404 - Not Found' ,
                        author: '' ,
                        analyticssiteid: conf.analyticssiteid,
                        jslib_yui_version: conf.jslib.yui.version,
                        jslib_modernizr_version: conf.jslib.modernizr.version
                    },
                    status: 404
                });
            } else {
                res.render('500.ejs', {
                    locals: { 
                        title : '500 - The Server Encountered an Error',
                        app_version : conf.app.version,
                        app_name : 'error',
                        description: '500 - The Server Encountered an Error',
                        author: '',
                        analyticssiteid: conf.analyticssiteid,
                        jslib_yui_version: conf.jslib.yui.version,
                        jslib_modernizr_version: conf.jslib.modernizr.version,
                        error: err 
                    },
                    status: 500
                });
            }
        });


        ///////////////////////////////////////////
        //              Routes                   //
        ///////////////////////////////////////////

        /////// ADD ALL THE ROUTES HERE  /////////

        server.get('/', function(req,res){
            res.render('index.ejs', {
                locals : { 
                    title : 'eglinetwork | Marco Egli',
                    app_version : conf.app.version,
                    app_name : 'index',
                    lang : "en",
                    description: 'This is my personal website. Here can you find a few things about me and some of my projects.',
                    author: 'Marco Egli',
                    analyticssiteid: conf.analyticssiteid,
                    jslib_yui_version: conf.jslib.yui.version,
                    jslib_modernizr_version: conf.jslib.modernizr.version
                }
            });
        });

        server.get('/pairs.:theme?', function(req,res){
            var pairs_theme = "Steam Engine";
            if (req.params && req.params.theme){
                pairs_theme = req.params.theme;
            }
            res.render('pairs.ejs', {
                locals : { 
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
                }
            });
        });
        

        server.get('/druidnight', function(req,res){
            res.render('druidnight.ejs', {
                locals : { 
                    title : '2. Nacht der Druiden',
                    app_version : conf.app.version,
                    app_name : 'druidnight',
                    lang : "de",
                    description: 'Einladung zur zweiten Nacht der Druiden',
                    author: 'Marco Egli',
                    analyticssiteid: conf.analyticssiteid,
                    jslib_yui_version: conf.jslib.yui.version,
                    jslib_modernizr_version: conf.jslib.modernizr.version 
                }
            });
        });        

        //A Route for Creating a 500 Error (Useful to keep around)
        server.get('/500', function(req, res){
            throw new Error('This is a 500 Error');
        });

        //The 404 Route (ALWAYS Keep this as the last route)
        server.get('/*', function(req, res){
            throw new NotFound;
        });

        var port = conf.port;
        server.listen(port);
        console.log('Listening on port:' + port );
    }
);


function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


