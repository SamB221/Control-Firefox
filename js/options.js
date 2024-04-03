const numOfOptions = 3;
const checks = new Array(numOfOptions).fill(false);

document.addEventListener("DOMContentLoaded", initialize);
document.querySelector("form").addEventListener("change", saveOptions);

function initialize() {
    chrome.storage.sync.get(null, function(data) {
        for (let i = 0; i < numOfOptions; i++) {
            if (data[i+""] !== undefined) {
                checks[i] = data[i+""];
                /*document.getElementsByClassName(".slider").style.transition = "0s";*/
                document.getElementById(i+"").checked = checks[i];
                /*document.getElementsByClassName(".slider").style.transition = ".3s";*/
            }
        }
        updateImage();
    });
}

function saveOptions(e) {
    // toggles check
    checks[e.target.id] = !checks[e.target.id];
    updateImage();

    // updates browser storage
    const data = {};
    for (let i = 0; i < numOfOptions; i++) {
        data[i+""] = checks[i];
    }
    chrome.storage.sync.set(data);
    e.preventDefault();

    // reload page if changes are applied
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
        action: 'reloadCSS',
        });
    });
}

function updateImage() {
    for (let i = 0; i < numOfOptions; i++) {
        if (checks[i]) {
            document.getElementById("c1").style.borderColor = "#FF5700";
            document.getElementById("c1").style.backgroundImage = 'url("../icons/control_orange.svg")';
            document.getElementById("title").style.color = "#FF5700";
            return;
        }
    }
    document.getElementById("c1").style.borderColor = "#272727";
    document.getElementById("c1").style.backgroundImage = 'url("../icons/control_grey.svg")';
    document.getElementById("title").style.color = "#272727";
}