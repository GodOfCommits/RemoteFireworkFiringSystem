// -----------------------------------------
// ----------------------------------------- CONSTANTS & VARIABLES
// -----------------------------------------

export const apiUrl = "http://10.10.10.106";

export const elPowerBtn = document.getElementById(
  "power-btn"
) as HTMLButtonElement;
export const elFireAllBtn = document.getElementById(
  "fire-all-btn"
) as HTMLButtonElement;
export const elResetBtn = document.getElementById(
  "reset-btn"
) as HTMLButtonElement;
export const elConfigBtn = document.getElementById(
  "config-btn"
) as HTMLButtonElement;

export const elDisplayText = document.getElementById(
  "display-text"
) as HTMLHeadingElement;
export const elDisplaySubText = document.getElementById(
  "display-sub-text"
) as HTMLHeadingElement;

export const elsFireBtn = document.querySelectorAll(
  ".fire-btn"
) as NodeListOf<HTMLButtonElement>;
export const elsSequenceBtn = document.querySelectorAll(
  ".sequence-btn"
) as NodeListOf<HTMLButtonElement>;

export const textColorClassesList = {
  red: "text-red",
  black: "text-black",
  green: "text-green",
  white: "text-white",
};

export const elSaveBtn = document.getElementById(
  "save-btn"
) as HTMLButtonElement;
export const elLauncherBtn = document.getElementById(
  "launcher-btn"
) as HTMLButtonElement;
export const elChannelBtn = document.getElementById(
  "add-channel-btn"
) as HTMLButtonElement;
export const elDelayBtn = document.getElementById(
  "add-delay-btn"
) as HTMLButtonElement;

export const channelInput = document.getElementById(
  "channel"
) as HTMLInputElement;
export const channelSelectorDisplay = document.getElementById(
  "channel-selector-display"
);
export const delayInput = document.getElementById("delay") as HTMLInputElement;

// -----------------------------------------
// ----------------------------------------- FUNCTIONS
// -----------------------------------------

// \/ START ----------------------------------------- DISPLAY TEXT \/
export function setDisplayText(
  text: string,
  color = textColorClassesList.white
) {
  clearText();
  elDisplayText.textContent = text;
  elDisplayText.classList.add(color);
}

export function setDisplaySubText(
  text: string,
  color = textColorClassesList.white
) {
  clearSubText();
  elDisplaySubText.textContent = text;
  elDisplaySubText.classList.add(color);
}

export function clearText() {
  elDisplayText.textContent = "";
  Object.values(textColorClassesList).forEach((colorClass) => {
    elDisplayText.classList.remove(colorClass);
  });
}

export function clearSubText() {
  elDisplaySubText.textContent = "";
  Object.values(textColorClassesList).forEach((colorClass) => {
    elDisplaySubText.classList.remove(colorClass);
  });
}
// /\ END ----------------------------------------- DISPLAY TEXT /\
