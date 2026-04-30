const message = document.getElementById('message');

function showMessage(text, color = 'red') {
  message.textContent = text;
  message.style.color = color;
}

let finished = false;
let loginInterval;

async function checkLogin() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (res.status === 401) {
      clearInterval(loginInterval); // stoppt den Timer
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../../../');
      return;
    }

    if (!res.ok) {
      showMessage('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

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
    const gripperData = data.userData.gripper;

    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }

    if (!gripperData.isCalibrated) {
      initCalibrationMode();
    } else {
      initTrainingMode(gripperData);
    }

  } catch (err) {
    console.error('Try error:', err);
    showMessage("Netzwerkfehler");
  }
}

// Hilfsfunktionen für die Anzeige
function initCalibrationMode() {
    message.style.display = 'none';
    document.getElementById('calibration-area').style.display = 'block';
}

function initTrainingMode(config) {
    message.style.display = 'none';
    const trainingArea = document.getElementById('training-area');
    trainingArea.style.display = 'block';

    const slider = document.getElementById('turnSlider');
    const weightDisplay = document.getElementById('weight-display');
    
    slider.max = config.totalTurns;
    slider.addEventListener('input', () => {
        const turns = parseFloat(slider.value);
        // Deine Formel: min + (aktuelle_turns * (range / total_turns))
        const weight = config.minKg + (turns * (config.maxKg - config.minKg) / config.totalTurns);
        weightDisplay.textContent = weight.toFixed(1) + " kg";
    });
}

window.goToStep = function(num) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    if (num === 2) {
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';
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
        alert("Bitte gib die Anzahl der Umdrehungen an.");
        return;
    }

    try {
        const res = await fetch('/updateUserData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gripper: {
                    minKg: 5,
                    maxKg: 60,
                    totalTurns: currentTurns,
                    isCalibrated: true
                }
            })
        });

        if (res.ok) {
            location.reload(); 
        } else {
            alert("Fehler beim Speichern.");
        }
    } catch (err) {
        console.error("Save Error:", err);
    }
};

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