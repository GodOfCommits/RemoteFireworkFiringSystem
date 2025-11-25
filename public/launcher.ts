// -----------------------------------------
// ----------------------------------------- IMPORTS
// -----------------------------------------
import {
  apiUrl,
  elPowerBtn,
  elFireAllBtn,
  elResetBtn,
  elConfigBtn,
  elsFireBtn,
  elsSequenceBtn,
  textColorClassesList,
  setDisplayText,
  setDisplaySubText,
  clearSubText,
} from "./constants.js";

// -----------------------------------------
// ----------------------------------------- CONSTANTS & VARIABLES
// -----------------------------------------

let power = false;

// -----------------------------------------
// ----------------------------------------- FUNCTIONS
// -----------------------------------------

function init() {
  power = false;
  disarm();
}

function togglePower() {
  power = !power;

  if (power) {
    arm();
  } else {
    disarm();
    clearSubText();
  }
}

function configSequence() {
  // Redirect to configuration page
  window.location.href = "config.html";
}

function arm() {
  power = true;
  elsFireBtn.forEach((fireBtn) => {
    fireBtn.disabled = false;
  });
  elsSequenceBtn.forEach((seqBtn) => {
    seqBtn.disabled = false;
  });

  elFireAllBtn.disabled = false;

  setDisplayText("ARMED", textColorClassesList.red);
  elPowerBtn.classList.remove("off");
  elPowerBtn.classList.add("on");
}

function disarm() {
  power = false;
  elsFireBtn.forEach((fireBtn) => {
    fireBtn.disabled = true;
  });
  elsSequenceBtn.forEach((seqBtn) => {
    seqBtn.disabled = true;
  });
  elFireAllBtn.disabled = true;
  elResetBtn.disabled = true;

  setDisplayText("NOT ARMED", textColorClassesList.green);
  elPowerBtn.classList.remove("on");
  elPowerBtn.classList.add("off");
}

function resetBoard() {
  clearSubText();
  elFireAllBtn.disabled = false;
  elsFireBtn.forEach((fireBtn) => {
    fireBtn.disabled = false;
  });
  elsSequenceBtn.forEach((seqBtn) => {
    seqBtn.disabled = false;
  });
  elResetBtn.disabled = true;
}

function fireall() {
  elFireAllBtn.disabled = true;
  elsFireBtn.forEach((fireBtn) => {
    fireBtn.disabled = true;
  });
  elsSequenceBtn.forEach((seqBtn) => {
    seqBtn.disabled = true;
  });
  elResetBtn.disabled = false;

  setDisplaySubText("Send signal to all channels", textColorClassesList.white);

  fetch(`${apiUrl}/api.php/fireall`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        setDisplaySubText("Fired all channels", textColorClassesList.white);
      } else {
        setDisplaySubText(`${data.message}`, textColorClassesList.red);
      }
    });
}

function fireSequence(sequenceBtn: HTMLButtonElement): void {
  const sequenceId = sequenceBtn.dataset.id;

  elResetBtn.disabled = false;
  elFireAllBtn.disabled = true;
  sequenceBtn.disabled = true;
  setDisplaySubText(
    `Send signal to sequence ${sequenceId}`,
    textColorClassesList.white
  );

  fetch(`${apiUrl}/api.php/fire/sequence/${sequenceId}`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        setDisplaySubText(
          `Fired sequence ${sequenceId}`,
          textColorClassesList.white
        );
      } else {
        setDisplaySubText(`${data.message}`, textColorClassesList.red);
      }
    });
}

function fireSingle(fireBtn: HTMLButtonElement): void {
  // if one of the channel fire buttons are pressed,
  // the fireall btn and the fire channel x btn is disabled

  const id = fireBtn.dataset.id;

  elResetBtn.disabled = false;
  elFireAllBtn.disabled = true;
  fireBtn.disabled = true;
  setDisplaySubText(`Send signal to channel ${id}`, textColorClassesList.white);

  fetch(`${apiUrl}/api.php/fire/${id}`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        setDisplaySubText(`Fired channel ${id}`, textColorClassesList.white);
      } else {
        setDisplaySubText(`${data.message}`, textColorClassesList.red);
      }
    });
}

// -----------------------------------------
// ----------------------------------------- SCRIPT
// -----------------------------------------

init();

// ----------------------------------------- EVENT LISTENERS
// if power button was pressed
elPowerBtn.addEventListener("click", () => {
  togglePower();
});

// if reset button was pressed
elResetBtn.addEventListener("click", () => {
  resetBoard();
});

// if fire all button was pressed
elFireAllBtn.addEventListener("click", () => {
  fireall();
});

// if config button was pressed
elConfigBtn.addEventListener("click", () => {
  configSequence();
});

// if one of the sequence fire buttons was pressed
elsSequenceBtn.forEach((sequenceBtn) => {
  sequenceBtn.addEventListener("click", () => {
    fireSequence(sequenceBtn);
  });
});

// if one of the channel fire buttons was pressed
elsFireBtn.forEach((fireBtn) => {
  fireBtn.addEventListener("click", () => {
    fireSingle(fireBtn);
  });
});
