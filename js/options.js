const numOfOptions = 4;
const checks = new Array(numOfOptions).fill(false);

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("change", saveOptions);


function saveOptions(e) {
    // toggles check
    checks[e.target.id] = !checks[e.target.id];
    updateImage();
    e.preventDefault();
    browser.storage.sync.set({
      color: document.querySelector("#color").value,
    });
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.querySelector("#color").value = result.color || "blue";
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("color");
    getting.then(setCurrentChoice, onError);
}

function removesheet() {
    for (i = 0; i < document.styleSheets.length; i++) {
        void(document.styleSheets.item(i).disabled = true);
    }
}

function updateImage() {
    for (let i = 0; i < numOfOptions; i++) {
        if (checks[i]) {
            document.getElementById("c1").style.borderColor = "#FF5700";
            document.getElementById("c1").style.backgroundImage = 'url("../icons/control_orange.svg")';
            return;
        }
    }
    document.getElementById("c1").style.borderColor = "#272727";
    document.getElementById("c1").style.backgroundImage = 'url("../icons/control_grey.svg")';
}