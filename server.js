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
, port = 8081;

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
server.listen(port);


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
    res.render('index.ejs', {
        locals : { 
            header: '#Header#',
            footer: '#Footer#',
            title : 'Node Site with Express',
            app_version : settings.app_version,
            app_name : 'index',
            description: 'Page Description',
            author: 'Marco Egli',
            analyticssiteid: settings.analyticssiteid 
        }
    });
});

server.get('/pairs', function(req,res){
    console.log(req.session);
    console.log(req.sessionID);
    res.render('pairs.ejs', {
        locals : { 
            header: '#Header#',
            footer: '#Footer#',
            title : 'Pairs',
            app_version : settings.app_version,
            app_name : 'pairs',
            description: 'Page Description',
            author: 'Marco Egli',
            analyticssiteid: settings.analyticssiteid 
        }
    });
});

server.post('/service', function(req,res){
    //res.send('Hello World'); 
    res.send(req.body);
   
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

console.log('Listening on http://127.0.0.1:' + port );