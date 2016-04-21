var Getopt = require('node-getopt');
var efc = require ("../../spine/simpleNativeConnection");

var getopt = new Getopt([
  ['s' , 'stream-config=ARG'             , 'file containing the stream config JSON'], 
  ['h' , 'help'                          , 'display this help']
]);

opt = getopt.parse(process.argv.slice(2));

var metadata, serverurl, subscribers,
    publishers, publishersAreSubscribers,
    file, streamConfig;

for (var prop in opt.options) {
    if (opt.options.hasOwnProperty(prop)) {
        var value = opt.options[prop];
        switch (prop) {
            case "help":
                getopt.showHelp();
                process.exit(0);
                break;
            case "stream-config":
                streamConfig = value;
                break;
            default:
                console.log("Default");
                break;
        }
    }
}

if (streamConfig){
    console.log("Loading stream config file", streamConfig);
    streamConfig = require("./"+streamConfig)
}

publishersAreSubscribers = publishers || false;
file = file || "file://vagrant/test_1000_pli.mkv";

if (streamConfig.publishConfig){
    var streamPublishConfig = {
        publishConfig: streamConfig.publishConfig,
        serverUrl: streamConfig.basicExampleUrl
    };

    if (streamConfig.publishersAreSubscribers){
        streamPublishConfig.subscribeConfig = streamConfig.subscribeConfig;
    }
}

if (streamConfig.subscribeConfig){
    var streamSubscribeConfig = {
        subscribeConfig : streamConfig.subscribeConfig,
        serverUrl : streamConfig.basicExampleUrl
    };
    console.log("StreamSubscribe", streamSubscribeConfig);
}



var startStreams = function(stConf, num, time){
    var started = 0;
    var interval = setInterval(function(){
        if(++started>=num){
            console.log("All streams have been started");
            clearInterval(interval);
        }
        efc.ErizoSimpleNativeConnection (stConf, function(msg){
            console.log("Getting Callback", msg);
        });
    }, time);
};

console.log("Starting ", streamConfig.numSubscribers, "subscriber streams",
        "and", streamConfig.numPublishers, "publisherStreams");
if (streamPublishConfig && streamConfig.numPublishers)
    startStreams(streamPublishConfig, streamConfig.numPublishers, streamConfig.connectionCreationInterval);
if (streamSubscribeConfig && streamConfig.numSubscribers)
    startStreams(streamSubscribeConfig, streamConfig.numSubscribers, streamConfig.connectionCreationInterval);