const messageDiv = document.getElementById('message');

let linksSet;

username.innerHTML = "test";

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

async function getData() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (res.status === 401) {
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../../');
      return;
    }

    if (!res.ok) {
      console.log('Server nicht erreichbar')
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

     if (!linksSet) {
      username.textContent = `${userFormatted}`;



      linksSet = true;
    }

  } catch (err) {
    console.error('Try error:', err);
  }
}

getData();