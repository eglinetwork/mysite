
var fs = require('fs');
var conf = require('node-config');

conf.initConfig(
    function(err) {
        if(err) {
            sys.log('Unable to init the config: ' + err); 
            return;
        }
        
        var newAppFolderName = "static/app."+conf.app.version;
        fs.renameSync(newAppFolderName, 'static/app.dev');
              
        console.log("post deploy process completed");
    });