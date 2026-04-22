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
      welcomeText.textContent = data.message || 'Fehler';
      return;
    }

    const user = data.user.username;

    window.location.href = 'home/home.html';
    messageText.textContent = 'Weiterleitung...F';
    body.style.display = "none";

  } catch (err) {
    console.error(err);
    //messageText.textContent = 'Netzwerkfehler';
  }
}

checkLogin();