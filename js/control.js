// each stylesheet needs info about when it should be turned on
class Sheet {
    constructor(name, appliedTo, notAppliedTo) {
      this.name = name;
      this.appliedTo = appliedTo;
      this.notAppliedTo = notAppliedTo;
    }
  
    appliesTo(currentUrl) {
        for (let i = 0; i < this.appliedTo.length; i++) {
            if (this.appliedTo[i].test(currentUrl)) {
                return true;
            }
        }

        for (let i = 0; i < this.notAppliedTo.length; i++) {
            if (this.notAppliedTo[i].test(currentUrl)) return false;
        }

        return shouldApply;
    }
}

// all the possible stylesheets to be turned on
const sheets = [
    new Sheet("main_page", 
        [new RegExp("^.*://.*\\.reddit\\.com/r/all.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/popular.*$"),
        new RegExp("^.*://.*\\.reddit\\.com.$")], 
        [new RegExp("^.*://.*\\.reddit\\.com/r.*$")]),
    new Sheet("trending", [], []),
    new Sheet("notifications", [], [])
]; // for future use: new RegExp("^.*://.*\\.reddit\\.com/.*$") = all pages


initialize();

function initialize() {
    alert("load");
    var currentUrl = window.location.href;
    // accesses preferences from storage to determine style sheets
    chrome.storage.sync.get(null, function(data) {
        sheets.forEach((sheet, index) => {
            if (!data[index]) unloadCSS(sheet.name);
            else if (!sheet.appliesTo(currentUrl)) {alert(sheet.name + " does not apply"); unloadCSS(sheet.name);}
            else {alert(sheet.name + " does apply");loadCSS(sheet.name);}
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
    console.log("cool!");
    initialize();
  }
}).observe(document, {subtree: true, childList: true});