'use strict';

chrome.runtime.onConnect.addListener(function(port) {

    var isStarted = false;

    var serverUrl;
    var toRemote = false;
    var toFile = false;
    var interval = 0;

    var eventHandlers = {
        init: function (message) {
            chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
                if (isStarted && message.tabId == tabId && changeInfo.status == 'complete') {
                    port.postMessage({name: "pageLoaded"});
                }
            });

            chrome.alarms.onAlarm.addListener(function () {
                chrome.tabs.executeScript(message.tabId, {
                    code: "location.reload();"
                });
            });
        },

        start: function (message) {
            serverUrl = message.server;
            toRemote = message.toRemote;
            toFile = message.toFile;
            interval = message.interval;
            chrome.alarms.create("refresh", {delayInMinutes: 1, periodInMinutes: interval});
            isStarted = true;
        },

        stop: function (message) {
            chrome.alarms.clear("refresh");
            isStarted = false;
        },

        har: function (message) {


            var harString = message.content;

            if (toRemote) {
                var xhr = new XMLHttpRequest();
                xhr.open("post", serverUrl, true);
                xhr.setRequestHeader("Content-type","application/json");
                xhr.send(harString);
            }

            if (toFile) {
                var harBlob = new Blob([harString]);
                var harUrl =  URL.createObjectURL(harBlob);
                var now = new Date().getTime();
                chrome.downloads.download({
                    url: harUrl,
                    filename: "net_export_" + now + ".har"
                });
            }



        }
    };

    function devToolsListener(message) {
        var handler = eventHandlers[message.name];
        handler.call(this, message);
    }

    if (port.name == "devtools-panel") {
        port.onMessage.addListener(devToolsListener);
        port.onDisconnect.removeListener(devToolsListener);
    }
});