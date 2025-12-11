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
function loadConfiguration() {
  fetch(`${apiUrl}/api.php?endpoint=get-configuration`)
    .then((response) => {
      if (!response.ok) {
        return {};
      }
      return response.json();
    })
    .then((data) => {
      configuration = data;
      console.log("Configuration loaded successfully.");
      if (currentlySelectedSequenceId) {
        updateSequenceDisplay(currentlySelectedSequenceId);
      }
    })
    .catch((error) => {
      console.error("Error loading configuration:", error);
      setDisplaySubText(
        "Could not load saved config.",
        textColorClassesList.red
      );
    });
}
function init() {
  setDisplayText("CONFIGURATION", textColorClassesList.green);
  loadConfiguration();
}

function saveConfig() {
  if (Object.keys(configuration).length === 0) {
    setDisplaySubText("Nothing to save.", textColorClassesList.red);
    return;
  }
  setDisplayText("CONFIG SAVED", textColorClassesList.green);
  saveConfiguration();
}

function resetConfig() {
  if (!currentlySelectedSequenceId) {
    setDisplaySubText(
      "Please select a sequence to reset.",
      textColorClassesList.red
    );
    return;
  }
  setDisplayText("SEQUENCE RESET", textColorClassesList.red);
  resetConfiguration();
}

function openLauncher() {
  window.location.href = "launcher.html";
}

function selectSequence(sequenceBtn: HTMLButtonElement) {
  const sequenceId = sequenceBtn.getAttribute("data-id");
  currentlySelectedSequenceId = sequenceId;

  elsSequenceBtn.forEach((btn) => {
    btn.style.borderColor = "";
  });
  sequenceBtn.style.borderColor = "var(--white)";

  updateSequenceDisplay(sequenceId || undefined);
  setDisplayText(`SEQUENCE ${sequenceId}`, textColorClassesList.white);
}

function updateChannelSelector() {
  if (channelSelectorDisplay) {
    channelSelectorDisplay.textContent = `Channel - ${channelInput.value}`;
  }
}

function updateSequenceDisplay(sequenceId?: string) {
  const displaySubTextElement = document.getElementById("display-sub-text");

  if (!displaySubTextElement) return;

  if (!sequenceId) {
    displaySubTextElement.innerHTML = "No Sequence Selected";
    displaySubTextElement.className =
      "w-100 text-white flex-center-center text-red";
    return;
  }

  const sequenceSteps = configuration[sequenceId] || [];
  let sequenceHTML = "";

  if (sequenceSteps.length > 0) {
    sequenceSteps.forEach((step, index) => {
      let stepValue = step.value;
      if (step.type === "delay") {
        stepValue = `${step.value} ms`;
      }
      sequenceHTML += `${
        index + 1
      }. ${step.type.toUpperCase()} - ${stepValue}<br>`;
    });
  } else {
    sequenceHTML += "This sequence is empty.";
  }

  displaySubTextElement.innerHTML = sequenceHTML;
}

function addChannel() {
  if (!currentlySelectedSequenceId) {
    setDisplaySubText(
      "Please select a sequence first.",
      textColorClassesList.red
    );
    return;
  }

  const channelValue = channelInput.value;
  if (!configuration[currentlySelectedSequenceId]) {
    configuration[currentlySelectedSequenceId] = [];
  } //check if the channel number is already used in this sequence
  else if (
    configuration[currentlySelectedSequenceId].some(
      (step) => step.type === "channel" && step.value === channelValue
    )
  ) {
    setDisplaySubText(
      `Channel ${channelValue} is already used in this sequence.`,
      textColorClassesList.red
    );
    return;
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
      "Please select a sequence first.",
      textColorClassesList.red
    );
    return;
  }

  let delayValue = delayInput.value.trim().replace(/[^0-9]/g, "");
  if (delayValue === "") {
    setDisplaySubText("Please enter a valid delay.", textColorClassesList.red);
    return;
  }

  if (!configuration[currentlySelectedSequenceId]) {
    configuration[currentlySelectedSequenceId] = [];
  }
  configuration[currentlySelectedSequenceId].push({
    type: "delay",
    value: delayValue,
  });

  updateSequenceDisplay(currentlySelectedSequenceId);
  // Clear the input for the next entry
  delayInput.value = "";
}

// -----------------------------------------
// ----------------------------------------- API CALLS
// -----------------------------------------

function saveConfiguration() {
  fetch(`${apiUrl}/api.php?endpoint=save-configuration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ configuration }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Configuration saved:", data);
      if (!data.status) {
        setDisplaySubText(data.message, textColorClassesList.red);
      }
    })
    .catch((error) => {
      console.error("Error saving configuration:", error);
      setDisplaySubText("SAVE FAILED", textColorClassesList.red);
    });
}

function resetConfiguration() {
  if (currentlySelectedSequenceId) {
    configuration[currentlySelectedSequenceId] = [];
    updateSequenceDisplay(currentlySelectedSequenceId);
    saveConfiguration();
  }
}

// -----------------------------------------
// ----------------------------------------- SCRIPT & EVENT LISTENERS
// -----------------------------------------

init();

elSaveBtn.addEventListener("click", saveConfig);
elResetBtn.addEventListener("click", resetConfig);
elLauncherBtn.addEventListener("click", openLauncher);
elChannelBtn.addEventListener("click", addChannel);
elDelayBtn.addEventListener("click", addDelay);
channelInput.addEventListener("input", updateChannelSelector);
elsSequenceBtn.forEach((seqBtn) => {
  seqBtn.addEventListener("click", () => selectSequence(seqBtn));
});

delayInput.addEventListener("input", () => {
  delayInput.value = delayInput.value.replace(/[^0-9]/g, "");
});
