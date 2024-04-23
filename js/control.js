// each stylesheet needs info about when it should be turned on 
class Sheet {
    constructor(name, whiteList, blackList, extraSheets) {
        this.name = name;
        this.whiteList = whiteList;
        this.blackList = blackList;
        this.extraSheets = extraSheets;
    }
  
    appliesTo(currentUrl) {
        for (let i = 0; i < this.whiteList.length; i++) {
            if (this.whiteList[i].test(currentUrl)) return true;
        }

        for (let i = 0; i < this.blackList.length; i++) {
            if (this.blackList[i].test(currentUrl)) return false;
        }

        return true;
    }

    loadExtraSheets() {
        for (let i = 0; i < this.extraSheets.length; i++) {
            loadCSS(this.extraSheets[i]);
        }
    }

    unloadExtraSheets() {
        for (let i = 0; i < this.extraSheets.length; i++) {
            unloadCSS(this.extraSheets[i]);
        }
    }
}

// all the possible stylesheets to be turned on
const sheets = [
    new Sheet("main_page", 
        [new RegExp("^.*://.*\\.reddit\\.com/r/all.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/popular.*$"),
        new RegExp("^.*://.*\\.reddit\\.com.$")], 
        [new RegExp("^.*://.*\\.reddit\\.com/r.*$")],
        []),
    new Sheet("subreddits", 
        [],
        [new RegExp("^.*://.*\\.reddit\\.com/r/.*/comments/.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/all.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/popular.*$"),
        new RegExp("^.*://.*\\.reddit\\.com.$"),
        new RegExp("^.*://.*\\.reddit\\.com/\\?.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/user/.*$")],
        ["leftsidebar"]),
    new Sheet("trending", [], [], []),
    new Sheet("notifications", [], [], []),
    new Sheet("grayscale", [], [], [])
];

initialize();

function initialize() {
    var currentUrl = window.location.href;
    // accesses preferences from storage to determine style sheets
    chrome.storage.sync.get(null, function(data) {
        sheets.forEach((sheet, index) => {
            console.log(sheet.name);
            if (!data[index]) {
                unloadCSS(sheet.name);
                sheet.unloadExtraSheets();
            } else if (!sheet.appliesTo(currentUrl)) {
                unloadCSS(sheet.name);
                sheet.loadExtraSheets();
            }
            else {
                loadCSS(sheet.name);
                sheet.loadExtraSheets();
            }
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

// reinitializing when navigating within website
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    initialize();
  }
}).observe(document, {subtree: true, childList: true});