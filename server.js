//Global site settings
var settings = {
    analyticssiteid : 'UA-10297507-1',
    app_version : 'dev'
};

//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support");
var connect = require('connect')
, express = require('express')
, sys = require('sys')
, port = 80;

var conf = require('node-config');

conf.initConfig(
    function(err) {
        if(err) {
            sys.log('Unable to init the config: ' + err); 
            return;
        }

        // Config loaded, can do those things now:
        var port = conf.port;

        server.listen(port);
        console.log('Listening on port:' + port );
    }
);


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
    server.use(connect.staticProvider(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.ejs', {
            locals: { 
                header: '#Header#' ,
                footer: '#Footer#' ,
                title : '404 - Not Found' ,
                app_version : settings.app_version ,
                app_name : 'error' ,
                description: '' ,
                author: '' ,
                analyticssiteid: settings.analyticssiteid 
            },
            status: 404
        });
    } else {
        res.render('500.ejs', {
            locals: { 
                header: '#Header#',
                footer: '#Footer#',
                title : '500 - The Server Encountered an Error',
                app_version : settings.app_version,
                app_name : 'error',
                description: '',
                author: '',
                analyticssiteid: settings.analyticssiteid,
                error: err 
            },
            status: 500
        });
    }
});
//server.listen(port);


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
    res.render('index.ejs', {
        locals : { 
            header: '',
            footer: '',
            title : 'My Personal Website | eglinetwork',
            app_version : settings.app_version,
            app_name : 'index',
            description: 'This is my personal website. Here can you find a few things about me and some of my projects.',
            author: 'Marco Egli',
            analyticssiteid: settings.analyticssiteid 
        }
    });
});

server.get('/pairs', function(req,res){
    res.render('pairs.ejs', {
        locals : { 
            header: '',
            footer: '',
            title : 'Photo Pairs',
            app_version : settings.app_version,
            app_name : 'pairs',
            description: 'Play Pairs with beautiful photos. Pairs is also known as Concentration, Memory, Pelmanism, Shinkei-suijaku or Pexeso. All photos are loaded from Flickr. Change the photo theme to get individual variants of card sets.',
            author: 'Marco Egli',
            analyticssiteid: settings.analyticssiteid 
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

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


