// -----------------------------------------
// ----------------------------------------- IMPORTS
// -----------------------------------------
import {
  apiUrl,
  elSaveBtn,
  elResetBtn,
  elLauncherBtn,
  elsSequenceBtn,
  elChannelBtn,
  elDelayBtn,
  channelInput,
  channelSelectorDisplay,
  delayInput,
  textColorClassesList,
  setDisplayText,
  setDisplaySubText,
  clearText,
  clearSubText,
} from "./constants.js";

// -----------------------------------------
// ----------------------------------------- CONSTANTS & VARIABLES
// -----------------------------------------

let configuration: { [sequenceId: string]: { type: string; value: string }[] } =
  {};
let currentlySelectedSequenceId: string | null = null;

// -----------------------------------------
// ----------------------------------------- FUNCTIONS
// -----------------------------------------

function init() {
  setDisplayText("CONFIGURATION", textColorClassesList.green);
}

function saveConfig() {
  setDisplayText("CONFIG SAVED", textColorClassesList.green);
  saveConfiguration();
}

function resetConfig() {
  setDisplayText("CONFIG RESET", textColorClassesList.red);
  resetConfiguration();
}

function openLauncherConfig() {
  // Redirect to launcher configuration page
  window.location.href = "launcher.html";
}

function selectSequence(sequenceBtn: HTMLButtonElement) {
  const sequenceId = sequenceBtn.getAttribute("data-id");
  currentlySelectedSequenceId = sequenceId;

  elsSequenceBtn.forEach((btn) => {
    btn.disabled = false;
  });
  sequenceBtn.disabled = true;

  updateSequenceDisplay(sequenceId || undefined);
  setDisplayText(`Sequence: ${sequenceId}`, textColorClassesList.white);
}

function updateChannelSelector() {
  if (channelSelectorDisplay) {
    channelSelectorDisplay.textContent = `Channel - ${channelInput.value}`;
  }
}

function updateSequenceDisplay(currentlySelectedSequenceId?: string) {
  const displaySubTextElement = document.getElementById("display-sub-text");

  if (!displaySubTextElement) return;

  if (!currentlySelectedSequenceId) {
    displaySubTextElement.innerHTML = "No Sequence Selected";
    displaySubTextElement.className =
      "w-100 text-white flex-center-center text-red";
    return;
  }

  let sequenceHTML = "";

  const sequenceSteps = configuration[currentlySelectedSequenceId];
  if (sequenceSteps && sequenceSteps.length > 0) {
    sequenceSteps.forEach((step, index) => {
      let stepValue = step.value;
      if (step.type === "delay") {
        if (!step.value) {
          stepValue = "0 ms";
        } else stepValue = `${step.value} ms`;
      }
      sequenceHTML += `${
        index + 1
      }. ${step.type.toUpperCase()} - ${stepValue}<br>`;
    });
  } else {
    sequenceHTML += "No steps in this sequence.";
  }

  displaySubTextElement.innerHTML = sequenceHTML;
  displaySubTextElement.className = "w-100 text-white flex-center-center";
}

function addChannel() {
  if (!currentlySelectedSequenceId) {
    setDisplaySubText(
      "Please select a sequence before adding a channel.",
      textColorClassesList.red
    );
    return;
  }

  const channelValue = channelInput.value;
  if (!configuration[currentlySelectedSequenceId]) {
    configuration[currentlySelectedSequenceId] = [];
  }
  configuration[currentlySelectedSequenceId].push({
    type: "channel",
    value: channelValue,
  });
  updateSequenceDisplay(currentlySelectedSequenceId);
}

function addDelay() {
  if (!currentlySelectedSequenceId) {
    setDisplaySubText(
      "Please select a sequence before adding a delay.",
      textColorClassesList.red
    );
    return;
  }

  const delayValue = delayInput.value;
  if (!configuration[currentlySelectedSequenceId]) {
    configuration[currentlySelectedSequenceId] = [];
  }
  configuration[currentlySelectedSequenceId].push({
    type: "delay",
    value: delayValue,
  });
  updateSequenceDisplay(currentlySelectedSequenceId);
}

function saveConfiguration() {
  fetch(`${apiUrl}/api.php/save-configuration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ configuration }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Configuration saved:", data);
    })
    .catch((error) => {
      console.error("Error saving configuration:", error);
    });
}

function resetConfiguration() {
  configuration[currentlySelectedSequenceId || ""] = [];
  updateSequenceDisplay(currentlySelectedSequenceId || undefined);

  saveConfiguration();
}

// -----------------------------------------
// ----------------------------------------- SCRIPT
// -----------------------------------------

init();

// ----------------------------------------- EVENT LISTENERS

elSaveBtn.addEventListener("click", saveConfig);
elResetBtn.addEventListener("click", resetConfig);
elLauncherBtn.addEventListener("click", openLauncherConfig);
elChannelBtn.addEventListener("click", addChannel);
elDelayBtn.addEventListener("click", addDelay);
channelInput.addEventListener("change", updateChannelSelector);
elsSequenceBtn.forEach((seqBtn) => {
  seqBtn.addEventListener("click", () => selectSequence(seqBtn));
});
