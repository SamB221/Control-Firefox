const numOfOptions = 4;
const checks = new Array(numOfOptions).fill(false);

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

document.addEventListener("DOMContentLoaded", initialize);
document.querySelector("form").addEventListener("change", saveOptions);


function saveOptions(e) {
    // toggles check
    checks[e.target.id] = !checks[e.target.id];
    updateImage();

    // Update Chrome storage
    const data = {};
    for (let i = 0; i < numOfOptions; i++) {
        data[i+""] = checks[i];
    }
    chrome.storage.sync.set(data);
    
    e.preventDefault();
}

function removeSheet() {
    for (i = 0; i < document.styleSheets.length; i++) {
        if (!checks[i]) void(document.styleSheets.item(i).disabled = true);
    }
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