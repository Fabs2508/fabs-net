const message = document.getElementById('message');
const gripperOverview = document.getElementById('gripper-overview');
const gripperList = document.getElementById('gripper-list');
const addGripperCard = document.getElementById('add-gripper-card');
const calibrationArea = document.getElementById('calibration-area');
const trainingArea = document.getElementById('training-area');
const settingsArea = document.getElementById('settings-area');
const backToOverviewBtn = document.getElementById('back-to-overview');
const backFromCalibrationBtn = document.getElementById('back-from-calibration');
const openGripperSettingsBtn = document.getElementById('open-gripper-settings');
const backFromSettingsBtn = document.getElementById('back-from-settings');
const gripperSettingsForm = document.getElementById('gripper-settings-form');
const newGripperNameInput = document.getElementById('new-gripper-name-input');
const gripperNameInput = document.getElementById('gripper-name-input');
const gripperMinInput = document.getElementById('gripper-min-input');
const gripperMaxInput = document.getElementById('gripper-max-input');
const gripperTurnsInput = document.getElementById('gripper-turns-input');
const deleteGripperBtn = document.getElementById('delete-gripper-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmDeleteBtn = document.getElementById('confirm-delete');

function showMessage(text, color = 'red') {
  message.textContent = text;
  message.style.color = color;
  message.style.display = text ? 'block' : 'none';
}

let messageTimer;

let finished = false;
let loginInterval;
let gripperState = {
  grippers: [],
  activeIndex: 0
};
let activeGripperIndex = 0;
let deleteIndex = null;

async function checkLogin() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (!res.ok) {
      showMessage('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

    if (data.status === 401) {
      clearInterval(loginInterval); // stoppt den Timer
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../../../');
      return;
    }

    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }

    const user = data.user.username;
    const userFormatted = user.charAt(0).toUpperCase() + user.slice(1);

    const role = data.user.role;

    if (role === 'admin') {
      if (typeof window.createAdminButtonSidebar === 'function') {
          window.createAdminButtonSidebar();
      }
      if (typeof window.createAdminButtonBottomNav === 'function') {
          window.createAdminButtonBottomNav();
      }
    }

  } catch (err) {
    console.error('Try error:', err);
    showMessage("Netzwerkfehler");
  }
}
async function getUserData() {
  try {
    const res = await fetch('/getUserData', {
      credentials: 'include'
    });

    const data = await res.json();
    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }

    const theme = data.userData?.theme || "dark";
    document.documentElement.setAttribute("data-theme", theme);

    const themeSwitch = document.getElementById("themeSwitch");
    if (themeSwitch) {
      themeSwitch.checked = theme === "light";
    }

    const gripperData = data.userData?.gripper || {};
    gripperState = normalizeGripperState(gripperData);
    renderGripperOverview();

  } catch (err) {
    console.error('Try error:', err);
    showMessage("Netzwerkfehler");
  }
}

function normalizeGripperState(config) {
    const savedGrippers = Array.isArray(config.grippers) ? config.grippers : [];
    const legacyGripper = config.isCalibrated ? {
        name: "Gripper 1",
        minKg: config.minKg ?? config.gripper1?.minKg ?? 5,
        maxKg: config.maxKg ?? config.gripper1?.maxKg ?? 60,
        totalTurns: config.totalTurns ?? config.gripper1?.totalTurns
    } : null;

    const grippers = savedGrippers.length > 0 ? savedGrippers : (legacyGripper ? [legacyGripper] : []);

    return {
        firstTime: grippers.length === 0,
        isCalibrated: grippers.length > 0,
        activeIndex: Number.isInteger(config.activeIndex) ? config.activeIndex : 0,
        grippers
    };
}

function getDefaultGripperName() {
    let counter = gripperState.grippers.length + 1;
    let name = `Gripper ${counter}`;

    while (isDuplicateGripperName(name)) {
        counter += 1;
        name = `Gripper ${counter}`;
    }

    return name;
}

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function isDuplicateGripperName(name, ignoredIndex = -1) {
    const normalizedName = normalizeName(name);
    return gripperState.grippers.some((gripper, index) => (
        index !== ignoredIndex && normalizeName(gripper.name) === normalizedName
    ));
}

async function saveGripperState(updatedGrippers, activeIndex = 0) {
    const nextActiveIndex = updatedGrippers.length > 0
        ? Math.min(Math.max(activeIndex, 0), updatedGrippers.length - 1)
        : 0;

    const nextState = {
        ...gripperState,
        grippers: updatedGrippers,
        activeIndex: nextActiveIndex,
        isCalibrated: updatedGrippers.length > 0,
        firstTime: updatedGrippers.length === 0
    };

    const res = await fetch('/updateUserData', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gripper: nextState
        })
    });

    if (!res.ok) {
        throw new Error("Fehler beim Speichern.");
    }

    gripperState = nextState;
    activeGripperIndex = nextActiveIndex;
}

function renderGripperOverview() {
    message.style.display = 'none';
    calibrationArea.style.display = 'none';
    trainingArea.style.display = 'none';
    settingsArea.style.display = 'none';
    gripperOverview.style.display = 'block';
    gripperList.innerHTML = '';

    gripperState.grippers.forEach((gripper, index) => {
        const card = document.createElement('div');
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.className = 'gripper-card';

        const name = document.createElement('span');
        name.className = 'gripper-name';
        name.textContent = gripper.name || `Gripper ${index + 1}`;

        const range = document.createElement('span');
        range.className = 'gripper-range';
        range.textContent = `${gripper.minKg || 5} - ${gripper.maxKg || 60} kg`;

        const turns = document.createElement('span');
        turns.className = 'gripper-turns';
        if (gripper.totalTurns === 1) {
            turns.textContent = `${gripper.totalTurns} Umdrehung`;
        } else {
            turns.textContent = `${gripper.totalTurns} Umdrehungen`;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'card-delete-btn';
        deleteBtn.setAttribute('aria-label', `${gripper.name || `Gripper ${index + 1}`} löschen`);
        deleteBtn.textContent = '';
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            openDeleteModal(index);
        });

        card.append(name, range, turns, deleteBtn);
        card.addEventListener('click', () => initTrainingMode(gripper, index));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                initTrainingMode(gripper, index);
            }
        });
        gripperList.appendChild(card);
    });

    gripperList.appendChild(addGripperCard);
}

// Hilfsfunktionen für die Anzeige
function initCalibrationMode() {
    message.style.display = 'none';
    gripperOverview.style.display = 'none';
    trainingArea.style.display = 'none';
    settingsArea.style.display = 'none';
    calibrationArea.style.display = 'block';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    currentTurns = 0;
    newGripperNameInput.value = getDefaultGripperName();
    const display = document.getElementById('turnsValue');
    if (display) display.textContent = currentTurns;
}

function initTrainingMode(config, index = activeGripperIndex) {
    activeGripperIndex = index;
    message.style.display = 'none';
    gripperOverview.style.display = 'none';
    calibrationArea.style.display = 'none';
    settingsArea.style.display = 'none';
    trainingArea.style.display = 'block';

    const slider = document.getElementById('turnSlider');
    const weightDisplay = document.getElementById('weight-display');
    const turnLabel = document.getElementById('current-turn-label');

    const minKg = Number(config.minKg);
    const maxKg = Number(config.maxKg);
    const totalTurns = Number(config.totalTurns);

    if (!Number.isFinite(minKg) || !Number.isFinite(maxKg) || !Number.isFinite(totalTurns) || totalTurns <= 0 || maxKg <= minKg) {
        showMessage("Kalibrierungsdaten ungueltig");
        trainingArea.style.display = 'none';
        return;
    }

    slider.max = totalTurns;
    slider.value = 0;

    function updateTarget() {
        const turns = Number(slider.value);
        const weight = minKg + (turns * (maxKg - minKg) / totalTurns);
        const progress = totalTurns > 0 ? (turns / totalTurns) * 100 : 0;

        weightDisplay.textContent = weight.toFixed(1) + " kg";
        turnLabel.textContent = turns.toFixed(1) + " Umdrehungen";
        slider.style.setProperty("--slider-progress", `${progress}%`);
    }
    
    slider.addEventListener('input', updateTarget);
    updateTarget();
}

function initSettingsMode() {
    const gripper = gripperState.grippers[activeGripperIndex];
    if (!gripper) {
        renderGripperOverview();
        return;
    }

    message.style.display = 'none';
    gripperOverview.style.display = 'none';
    calibrationArea.style.display = 'none';
    trainingArea.style.display = 'none';
    settingsArea.style.display = 'block';

    gripperNameInput.value = gripper.name || `Gripper ${activeGripperIndex + 1}`;
    gripperMinInput.value = gripper.minKg ?? 5;
    gripperMaxInput.value = gripper.maxKg ?? 60;
    gripperTurnsInput.value = gripper.totalTurns ?? 1;
}

async function saveGripperSettings(event) {
    event.preventDefault();

    const gripper = gripperState.grippers[activeGripperIndex];
    if (!gripper) {
        renderGripperOverview();
        return;
    }

    const name = gripperNameInput.value.trim() || `Gripper ${activeGripperIndex + 1}`;
    const minKg = Number(gripperMinInput.value);
    const maxKg = Number(gripperMaxInput.value);
    const totalTurns = Number(gripperTurnsInput.value);

    if (!Number.isFinite(minKg) || !Number.isFinite(maxKg) || !Number.isFinite(totalTurns)) {
        showMessage("Bitte gib gültige Werte ein.");
        return;
    }

    if (minKg < 0 || maxKg <= minKg || totalTurns <= 0) {
        showMessage("Maximum kg muss größer als Minimum kg sein.");
        return;
    }

    if (isDuplicateGripperName(name, activeGripperIndex)) {
        showMessage("Dieser Gripper-Name existiert schon.");
        return;
    }

    const updatedGrippers = gripperState.grippers.map((item, index) => {
        if (index !== activeGripperIndex) return item;

        return {
            ...item,
            name,
            minKg,
            maxKg,
            totalTurns
        };
    });

    try {
        await saveGripperState(updatedGrippers, activeGripperIndex);
        initTrainingMode(gripperState.grippers[activeGripperIndex], activeGripperIndex);
    } catch (err) {
        console.error("Settings Save Error:", err);
        showMessage(err.message || "Netzwerkfehler");
    }
}

function openDeleteModal(index = activeGripperIndex) {
    const gripper = gripperState.grippers[index];
    if (!gripper) {
        renderGripperOverview();
        return;
    }

    const name = gripper.name || `Gripper ${index + 1}`;
    deleteIndex = index;
    confirmText.textContent = `${name} wirklich löschen?`;
    confirmModal.style.display = 'flex';
}

function closeDeleteModal() {
    deleteIndex = null;
    confirmModal.style.display = 'none';
}

async function deleteSelectedGripper() {
    if (deleteIndex === null) return;

    const removedIndex = deleteIndex;
    const updatedGrippers = gripperState.grippers.filter((_, index) => index !== removedIndex);

    try {
        await saveGripperState(updatedGrippers, removedIndex - 1);
        closeDeleteModal();
        renderGripperOverview();
    } catch (err) {
        console.error("Delete Error:", err);
        showMessage(err.message || "Netzwerkfehler");
    }
}

window.goToStep = function(num) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    if (num === 2) {

        

        if (isDuplicateGripperName(newGripperNameInput.value.trim() || getDefaultGripperName())) {
            showMessage("Dieser Gripper-Name existiert schon.");

            // Falls noch ein alter Timer läuft, löschen wir ihn
            clearTimeout(messageTimer);

            // Neuen Timer starten
            messageTimer = setTimeout(() => {
                showMessage("");
            }, 1000);

            return;
        }

        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';

    } else if (num === 1) {
        if (step2) step2.style.display = 'none';
        if (step1) step1.style.display = 'block';
    }
};

let currentTurns = 0;

// Funktion für die Plus/Minus Buttons
window.changeTurns = function(amount) {
    currentTurns += amount;
    if (currentTurns < 0) currentTurns = 0; // Keine negativen Umdrehungen
    
    const display = document.getElementById('turnsValue');
    if (display) display.textContent = currentTurns;
};

window.finishCalibration = async function() {
    if (currentTurns <= 0) {
        showMessage("Bitte gib die Anzahl der Umdrehungen an.");
        return;
    }

    try {
        const newGripper = {
            name: newGripperNameInput.value.trim() || getDefaultGripperName(),
            minKg: 5,
            maxKg: 60,
            totalTurns: currentTurns
        };

        const updatedGrippers = [...gripperState.grippers, newGripper];

        await saveGripperState(updatedGrippers, updatedGrippers.length - 1);
        renderGripperOverview();
    } catch (err) {
        console.error("Save Error:", err);
        showMessage("Fehler beim Speichern.");
    }
};

addGripperCard.addEventListener('click', initCalibrationMode);
backToOverviewBtn.addEventListener('click', renderGripperOverview);
backFromCalibrationBtn.addEventListener('click', renderGripperOverview);
openGripperSettingsBtn.addEventListener('click', initSettingsMode);
backFromSettingsBtn.addEventListener('click', () => {
    initTrainingMode(gripperState.grippers[activeGripperIndex], activeGripperIndex);
});
gripperSettingsForm.addEventListener('submit', saveGripperSettings);
deleteGripperBtn.addEventListener('click', () => openDeleteModal(activeGripperIndex));
confirmCancelBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', deleteSelectedGripper);
confirmModal.addEventListener('click', (event) => {
    if (event.target === confirmModal) closeDeleteModal();
});

function startTimer() {
  checkLogin();
  getUserData();
  // Alle 1000ms (1 Sekunde) prüfen
  setInterval(async () => {
    try {
      await checkLogin();
    } catch (err) {
      console.error('Fehler beim Prüfen des Logins:', err);
    }
  }, 5000);
}

startTimer();
