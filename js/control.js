const sheets = [
    "main_page",
    "subreddits",
    "trending",
    "notifications",
];

initialize();

function initialize() {
    // accesses preferences from storage to determine style sheets
    chrome.storage.sync.get(null, function(data) {
        sheets.forEach((sheet, index) => {
            if (!data[index]) unloadCSS(sheet);
            else loadCSS(sheet);
        });
    });
}

// adds css file to doc
function loadCSS(file) {
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL('css/reddit/' + file + '.css');
    link.id = file;
    console.log(link.href);
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("html")[0].appendChild(link);
}

// removes css file from doc
function unloadCSS(file) {
  var cssNode = document.getElementById(file);
  cssNode && cssNode.parentNode.removeChild(cssNode);
}

// reloads upon message from extension's popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'reloadCSS') {
        initialize();
    }
  });