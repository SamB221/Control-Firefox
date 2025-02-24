// each stylesheet needs info about when it should be turned on 
class Sheet {
    constructor(name, whiteList, blackList, hrefs) {
        this.name = name;
        this.whiteList = whiteList;
        this.blackList = blackList;
        this.hrefs = hrefs;
    }
  
    appliesTo(currentUrl) {
        if (this.whiteList.length == 0 && this.blackList.length == 0) return false;

        for (let i = 0; i < this.whiteList.length; i++) {
            if (this.whiteList[i].test(currentUrl)) return true;
        }

        for (let i = 0; i < this.blackList.length; i++) {
            if (this.blackList[i].test(currentUrl)) return false;
        }

        return true;
    }

    blockAssigned() {
        if (this.name == "sidebar") {
            removeLeftSidebar();
        } else {
            // blocks main content on given page
            let elements = document.querySelectorAll('[role="main"]');
            elements.forEach((element) => {
                element.remove();
            });
        }
    }

    blockLinks() {
        if (this.name == "subreddits") {
            const del = document.querySelectorAll("reddit-recent-pages");
            del.forEach((element) => {
                element.remove();
            });

            const elementsWithoutHref = document.querySelectorAll('[name="LeftNavCommunitiesSection_sNHRQN"]');
            elementsWithoutHref.forEach(element => {
                element.remove();
            });
        } else if (this.name == "main_page") {
            const element = document.querySelector('left-nav-top-section');
            if (element != null) element.remove();
        }

        for (let i = 0; i < this.hrefs.length; i++) {
            removeLinks(this.hrefs[i]);
        }
    }

    reAddLinks() {
        for (let i = 0; i < this.hrefs.length; i++) {
            addLinks(this.hrefs[i]);
        }
    }
}

// all the possible stylesheets to be turned on
const sheets = [
    new Sheet("main_page", 
        [new RegExp("^.*://.*\\.reddit\\.com/r/all.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/popular.*$"),
        new RegExp("^.*://.*\\.reddit\\.com.$")], 
        [new RegExp("^.*://.*\\.reddit\\.com/r.*$"),
        new RegExp("^.*://.*\\.reddit.com/settings/*"),
        new RegExp("^.*://.*\\.reddit.com/submit*"),
        new RegExp("^.*://.*\\.reddit.com/wiki*"),
        new RegExp("^.*://.*\\.reddit.com/prefs*"),
        new RegExp("^.*://.*\\.reddit.com/subreddits/*"),
        new RegExp("^.*://.*\\.reddit.com/user*")],
        ["/?feed=home"]),
    new Sheet("subreddits", 
        [],
        [new RegExp("^.*://.*\\.reddit\\.com/r/.*/comments/.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/all.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/r/popular.*$"),
        new RegExp("^.*://.*\\.reddit\\.com.$"),
        new RegExp("^.*://.*\\.reddit\\.com/\\?.*$"),
        new RegExp("^.*://.*\\.reddit\\.com/user/.*$"),
        new RegExp("^.*://.*\\.reddit.com/settings/*"),
        new RegExp("^.*://.*\\.reddit.com/submit*"),
        new RegExp("^.*://.*\\.reddit.com/prefs*"),
        new RegExp("^.*://.*\\.reddit.com/wiki*"),
        new RegExp("^.*://.*\\.reddit.com/user*")],
        ["recent_menu", "communities_menu"]),
    new Sheet("sidebar", [new RegExp("^.*://.*\\.reddit\\.com.*")], [], []),
    new Sheet("notifications", [], [], ["inbox"]),
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
                if (sheet.name == "grayscale") {
                    document.documentElement.style.filter = 'grayscale(0%)';
                } else if (sheet.name == "notifications") {
                    sheet.reAddLinks();
                }
            } else if (sheet.name == "grayscale") {
                document.documentElement.style.filter = 'grayscale(100%)';
            } else if (sheet.appliesTo(currentUrl)) {
                sheet.blockAssigned(); 
                sheet.blockLinks();
            } else {
                sheet.blockLinks();
            }
        });
    });
}

function removeLinks(elementName) {
    // Select all <a> tags 
    let elementsWithHref = document.querySelectorAll('[href]');
    // Iterate through each <a> tag and check its href attribute
    elementsWithHref.forEach(element => {
        const href = element.getAttribute('href');
        // Check if href attribute contains the desired substring
        if (href.includes(elementName)) {
            element.remove();
        }
    });

    const elementsWithoutHref = document.querySelectorAll('[data-part="'+elementName+'"]');

    elementsWithoutHref.forEach(element => {
        element.style.visibility = "hidden";
        element.style.pointerEvents = 'none';
    });
}

function addLinks(elementName) {
    const elementsWithoutHref = document.querySelectorAll('[data-part="'+elementName+'"]');

    elementsWithoutHref.forEach(element => {
        element.style.visibility = "visable";
        element.style.pointerEvents = 'auto';
    });
}

function removeLeftSidebar() {
    const masthead = document.querySelector(".masthead");
    if (masthead != null) masthead.remove();
    const sidebar = document.getElementById("left-sidebar");
    if (sidebar != null) sidebar.remove();
    const container = document.getElementById("left-sidebar-container");
    if (container != null) container.remove();
    //const recents = document.querySelector("recent-posts");
    //if (recents != null) recents.remove();
}

// reloads upon message from extension's popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action.includes('reloadCSS')) {
        currentSheet = sheets[Number(message.action.slice(-1))];
        if (currentSheet.name == "grayscale" || currentSheet.name == "notifications") {
            initialize();
        } else {
            if (currentSheet.appliesTo(window.location.href)) {
                location.reload(); 
            } else {
                initialize();
            }
        }
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

document.addEventListener('DOMContentLoaded', initialize);