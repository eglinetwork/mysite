
var fs = require('fs');
var conf = require('node-config');

conf.initConfig(
    function(err) {
        if(err) {
            sys.log('Unable to init the config: ' + err); 
            return;
        }
        
        var newAppFolderName = "static/app."+conf.app.version;
        fs.renameSync('static/app.dev', newAppFolderName);
        
        console.log("application version: "+conf.app.version);
        console.log("new app folder name: "+newAppFolderName);        
        console.log("pre deploy process completed");
    });