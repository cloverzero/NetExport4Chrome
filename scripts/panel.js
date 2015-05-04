var backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-panel'
});

backgroundPageConnection.onMessage.addListener(function(message){
    if (message.name = "pageLoaded") {
        chrome.devtools.network.getHAR(function (har) {

            har = { log: har };

            backgroundPageConnection.postMessage({
                name: 'har',
                content: JSON.stringify(har)
            });
        });
    }
});

var isStarted = false;

var startButton = document.getElementById("startButton");
var state = document.getElementById("state");

var serverUrl = document.getElementById("serverUrl");
var refreshInterval = document.getElementById("refreshInterval");
var toFile = document.getElementById("toFile");
var toRemote = document.getElementById("toRemote");

startButton.addEventListener("click", function () {
    if (isStarted) {
        backgroundPageConnection.postMessage({
            name: 'stop',
            tabId: chrome.devtools.inspectedWindow.tabId
        });
        isStarted = false;
        state.textContent = "Stopped";
        startButton.textContent = "Start";
    } else {
        backgroundPageConnection.postMessage({
            name: 'start',
            tabId: chrome.devtools.inspectedWindow.tabId,
            server: serverUrl.value,
            toFile: toFile.checked,
            toRemote: toRemote.checked,
            interval: refreshInterval.value - 0
        });
        isStarted = true;
        state.textContent = "Running";
        startButton.textContent = "Stop";
    }
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

