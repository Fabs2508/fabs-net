const welcomeText = document.getElementById('welcome');
const actionsDiv = document.getElementById('actions');
const logoutBtn = document.getElementById('logoutBtn');

const bottomNav = document.querySelector('.bottom-nav');

const messageDiv = document.getElementById('message');

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

let linksSet = false;
let loginInterval;

const BottomNav = document.querySelector(".bottom-nav");
const tabs = document.querySelectorAll(".tab");
const NavButtons = document.querySelectorAll(".bottom-nav button");

BottomNav.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const tabId = button.dataset.tab;

  // 🔹 Buttons aktualisieren
  NavButtons.forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");

  // 🔹 Tabs anzeigen/verstecken
  tabs.forEach(tab => {
    tab.classList.remove("active");
    if (tab.id === tabId) {
      tab.classList.add("active");
    }
  });
});

NavButtons.forEach(button => {
  button.addEventListener("click", () => {
    
    // active reset
    NavButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const tab = button.dataset.tab;

    if (tab === "home") {
      content.innerHTML = "<h1>Home</h1>";
    } else if (tab === "analytics") {
      content.innerHTML = "<h1>Analyse</h1>";
    } else if (tab === "contracts") {
      content.innerHTML = "<h1>Verträge</h1>";
    } else if (tab === "settings") {
      content.innerHTML = "<h1>Einstellungen</h1>";
    }

  });
});

async function checkLogin() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (res.status === 401) {
      clearInterval(loginInterval); // stoppt den Timer
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.href = '../';
      return;
    }

    if (!res.ok) {
      showMessage('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

    if (!data.success) {
      welcomeText.textContent = data.message || 'Fehler';
      return;
    }

    const user = data.user.username;

     if (!linksSet) {
      welcomeText.textContent = `Wilkommen zurück ${user}`;



      linksSet = true;
    }

  } catch (err) {
    console.error('Try error:', err);
    welcomeText.textContent = 'Netzwerkfehler';
  }
}

function addLink(text, href) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  actionsDiv.appendChild(link);
}

function addNavLink(text, href) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  nav.appendChild(link);
}

// 🔓 Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });

    window.location.href = '../';
  } catch (err) {
    console.error(err);
  }
});

function startLoginCheck() {
  checkLogin();
  // Alle 1000ms (1 Sekunde) prüfen
  setInterval(async () => {
    try {
      await checkLogin();
    } catch (err) {
      console.error('Fehler beim Prüfen des Logins:', err);
    }
  }, 1000);
}

startLoginCheck();