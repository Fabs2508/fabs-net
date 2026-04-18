const welcomeText = document.getElementById('welcome');
const actionsDiv = document.getElementById('actions');
const logoutBtn = document.getElementById('logoutBtn');
const nav = document.getElementById('nav');

const messageDiv = document.getElementById('message');

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

let linksSet = false;
let loginInterval;

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
      welcomeText.textContent = `Wilkommen ${user}`;
      addNavLink('Home', '../home/home.html');
      if (data.user.role === 'admin') addNavLink('Admin', '../admin/admin.html');
      addLink('Profil', '#');
      addLink('Meine Trainingspläne', '#');
      if (data.user.role === 'admin') addLink('Admin Dashboard', '../admin/admin.html');
      linksSet = true;
    }

  } catch (err) {
    console.error(err);
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