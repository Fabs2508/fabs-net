const welcomeText = document.getElementById('welcome');

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

    if (!res.ok) {
      showMessage('Server nicht erreichbar')
      return;
    } else {
      showMessage('');
    }

    const data = await res.json();

    if (data.status === 401) {
      clearInterval(loginInterval); // stoppt den Timer
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../');
      return;
    }

    if (!data.success) {
      welcomeText.textContent = data.message || 'Fehler';
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

     if (!linksSet) {
      welcomeText.textContent = `Wilkommen zurück ${userFormatted}`;



      linksSet = true;
    }

  } catch (err) {
    console.error('Try error:', err);
    welcomeText.textContent = 'Netzwerkfehler';
  } finally {
    setTimeout(checkLogin, 5000); // Alle 5 Sekunden erneut prüfen
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

checkLogin();