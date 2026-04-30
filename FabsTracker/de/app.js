const login = document.querySelector('.login');
const signup = document.querySelector('.signup');

const messageText = document.getElementById('message');

const body = document.querySelector('.body');

login.addEventListener('click', () => {
  window.location.href = 'login/login.html';
});
signup.addEventListener('click', () => {
  window.location.href = 'signup/signup.html';
});

async function checkLogin() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    if (res.status === 401) { // nicht eingeloggt
      messageText.textContent = '';
      return;
    }

    if (!res.ok) {
      messageText.textContent = 'Fehler beim Laden';
      return;
    }

    const data = await res.json();

    if (!data.success) {
      //messageText.textContent = data.message //Meistens "Nicht eingeloggt"
      return;
    }

    const user = data.user.username;

    window.location.replace('home/home.html');
    messageText.textContent = 'Weiterleitung...';
    body.style.display = "none";

  } catch (err) {
    console.error(err);
    //messageText.textContent = 'Netzwerkfehler';
  }
}

function startLoginCheck() {
  checkLogin();
  // Alle 3000ms (3 Sekunde) prüfen
  setInterval(async () => {
    try {
      await checkLogin();
    } catch (err) {
      console.error('Fehler beim Prüfen des Logins:', err);
    }
  }, 3000);
}

startLoginCheck();