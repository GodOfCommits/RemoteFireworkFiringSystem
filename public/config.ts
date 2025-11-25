// -----------------------------------------
// ----------------------------------------- IMPORTS
// -----------------------------------------
import {
  apiUrl,
  elSaveBtn,
  elResetBtn,
  elLauncherBtn,
  textColorClassesList,
  elDisplayText,
  elDisplaySubText,
  setDisplayText,
  setDisplaySubText,
  clearText,
  clearSubText,
} from "./constants.js";

// -----------------------------------------
// ----------------------------------------- CONSTANTS & VARIABLES
// -----------------------------------------

// -----------------------------------------
// ----------------------------------------- FUNCTIONS
// -----------------------------------------

function saveConfig() {
  // Logic to save configuration settings
  setDisplayText("CONFIG SAVED", textColorClassesList.green);
  clearSubText();
}

function resetConfig() {
  // Logic to reset configuration settings to default
  setDisplayText("CONFIG RESET", textColorClassesList.red);
  clearSubText();
}

function openLauncherConfig() {
  // Redirect to launcher configuration page
  window.location.href = "launcher.html";
}

// -----------------------------------------
// ----------------------------------------- SCRIPT
// -----------------------------------------

// ----------------------------------------- EVENT LISTENERS

elSaveBtn.addEventListener("click", saveConfig);
elResetBtn.addEventListener("click", resetConfig);
elLauncherBtn.addEventListener("click", openLauncherConfig);
