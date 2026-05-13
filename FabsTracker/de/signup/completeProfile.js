const h2username = document.getElementById('h2username');
const completeP = document.querySelector('.completeP');
const rowone = document.querySelector('.row-one');
const rowtwo = document.querySelector('.row-two');
const btn = document.querySelector('.btn');

const yearSlider = document.getElementById('birthYear');
const display = document.getElementById('birthDisplay');

const heightSlider = document.getElementById('height');
const heightValueDisplay = document.getElementById('heightValue');

const weightSlider = document.getElementById('weight');
const weightValueDisplay = document.getElementById('weightValue');

const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const btnComplete = document.querySelector('.btn');


function setupCustomDropdown(id, items, selectedValue, callback) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    
    const selected = dropdown.querySelector('.dropdown-selected');
    const list = dropdown.querySelector('.dropdown-list');
    const hiddenInput = dropdown.querySelector('input');

    list.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;
        div.onclick = (e) => {
            e.stopPropagation();
            selected.textContent = item;
            hiddenInput.value = (id === 'monthDropdown') ? index : parseInt(item);
            dropdown.classList.remove('active');
            if (callback) callback();
        };
        list.appendChild(div);
    });

    if (id === 'monthDropdown') {
        selected.textContent = months[hiddenInput.value];
    } else {
        selected.textContent = hiddenInput.value.padStart(2, '0');
    }

    dropdown.onclick = (e) => {
        e.stopPropagation();
        const isActive = dropdown.classList.contains('active');
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
        if (!isActive) {
            dropdown.classList.add('active');
        }
    };
}

function updateDate() {
    const year = yearSlider.value;
    const month = parseInt(document.getElementById('birthMonth').value);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let currentDay = parseInt(document.getElementById('birthDay').value) || 1;
    if (currentDay > daysInMonth) currentDay = daysInMonth;

    const dayArray = Array.from({length: daysInMonth}, (_, i) => {
        return (i + 1 < 10 ? '0' : '') + (i + 1);
    });

    setupCustomDropdown('dayDropdown', dayArray, currentDay, updateDisplayOnly);
    updateDisplayOnly();
}

function updateDisplayOnly() {
    const d = document.getElementById('birthDay').value;
    const m = parseInt(document.getElementById('birthMonth').value) + 1;
    const y = yearSlider.value;
    
    const formattedDay = d.padStart(2, '0');
    const formattedMonth = m < 10 ? "0" + m : m;
    
    display.textContent = `${formattedDay}.${formattedMonth}.${y}`;
}

yearSlider.addEventListener('input', updateDate);

window.onclick = () => {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
};


heightSlider.addEventListener('input', function() {
    let val = parseInt(this.value);
    let displayText = "";

    if (val >= 100) {
        let meters = Math.floor(val / 100);
        let cm = val % 100;
        displayText = meters + "m " + (cm < 10 ? "0" + cm : cm) + "cm";
    } else {
        displayText = val + "cm";
    }
    heightValueDisplay.textContent = displayText;
});

if(weightSlider) {
    weightSlider.addEventListener('input', function() {
        weightValueDisplay.textContent = this.value + "kg";
    });
}

function msg1(msg, duration, color) {
  const msgElement = document.querySelector('.msg');
  msgElement.innerHTML = msg;
  msgElement.style.display = 'block';
  msgElement.style.color = color || 'white';

  if(duration !== 0) {
    setTimeout(() => {
      msgElement.style.display = 'none';
    }, duration);
  }
}

function failedfetch(err) {
  msg1('Server gerade nicht Erreichbar.', 5000, "red");
  console.error("Serverfehler: " + err);
}

function button(parameter) {
  const button = document.querySelector('.btn');
  if(parameter === 'loading') {
    button.disabled = true;
    button.innerText = 'Lädt...';
  } else if(parameter === 'reset') {
    button.disabled = false;
    button.innerText = 'Abschließen';
  }
}

btnComplete.onclick = async () => {
    // 1. Daten sammeln
    const year = yearSlider.value;
    const month = (parseInt(document.getElementById('birthMonth').value) + 1).toString().padStart(2, '0');
    const day = document.getElementById('birthDay').value.padStart(2, '0');
    
    const birthdate = `${year}-${month}-${day}`;
    const genderActive = document.querySelector('input[name="gender"]:checked');
    const height = heightSlider.value;
    const weight = weightSlider.value;

    // 2. Validierung
    if (!genderActive) return msg1('Bitte Geschlecht wählen', 3000, 'red');

    // 3. Objekt für den Server
    const data = {
        birthdate,
        gender: genderActive.value,
        height: parseInt(height),
        weight: parseInt(weight)
    };

    button("loading");
    console.log("Sende:", data);
    msg1('Senden...', 0, '#2bbcff');

    try {
        fetch('/completeProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(msg => {
            if(msg.success) {
                button("reset");
                msg1('Weiterleitung...', 0, 'green');
                window.location.replace("../home");
            } else {
                msg1(msg.message, 3500, 'red');
                button('reset');

            }
            button('reset');
        })
    } catch (err) {
        failedfetch(err);
    }
};

setupCustomDropdown('monthDropdown', months, 0, updateDate);
updateDate();
