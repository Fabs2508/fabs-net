const messageDiv = document.getElementById('message');

let linksSet;

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

async function getData() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (!res.ok) {
      console.log('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

    if (data.status === 401) {
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../../');
      return;
    }

    console.log(data)

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
    console.error("me Error:" + err);
  }
}

getData();