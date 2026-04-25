const loginBtn = document.querySelector('.btn');


(function() {
      // Hier musst du prüfen, wie dein Login gespeichert ist 
      // (z.B. ein Token im localStorage oder ein Cookie)
      const isLoggedIn = localStorage.getItem('user_token'); 

      // Wenn die URL '/login' ist UND der User eingeloggt ist -> ab nach Hause
      if (isLoggedIn && window.location.pathname.includes('login')) {
        window.location.replace('/home');
      }
    })();


loginBtn.addEventListener('click', () => {
  login();
});

const passwordInput = document.getElementById('password');

let lastLoginAttempt = 0; // Speichert den Zeitpunkt des letzten Versuchs
let Functionable = true; // Verhindert, dass die Funktion mehrfach gleichzeitig ausgeführt wird

passwordInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    
    const now = Date.now();
    const cooldownTime = 2000; // 2 Sekunden

    // Prüfen, ob die 2 Sekunden schon um sind
    if (now - lastLoginAttempt < cooldownTime && Functionable) {
      const timeLeft = ((cooldownTime - (now - lastLoginAttempt)) / 1000).toFixed(1);
      msg1(`Bitte noch ${timeLeft} Sekunden warten.`, cooldownTime, 'red');

      return; // Funktion hier abbrechen
    }

    lastLoginAttempt = now; // Zeitstempel aktualisieren
    await login();          // Login-Funktion ausführen
  }
});

async function loadConfig() {
  const res = await fetch('/config');
  const config = await res.json();

  const DOMAIN = config.appDOMAIN;
  const PORT = config.appPORT;
}
loadConfig();

function msg1(msg, duration, color) {
  document.querySelector('.msg').innerHTML =  msg;
  document.querySelector('.msg').style.display = 'block';
  document.querySelector('.msg').style.color = color;

  if(duration === 0) {
     document.querySelector('.msg').style.display = 'display';
  } else {
    setTimeout(function() {
      document.querySelector('.msg').style.display = 'none';
    }, duration);
  }
}

function failedfetch(err) {
  //msg1('Netzwerkfehler. Bitte versuchen Sie es später erneut.', 5000, 'red');
  msg1(err, 20000, 'red');
  //console.error("Serverfehler: " + err);
  button('reset');
}

function button(parameter) {
  const button = document.querySelector('.btn');
  if(parameter === 'loading') {
    document.querySelector('.msg').style.display = 'none';
    button.disabled = true;
    button.innerText = 'Lädt...';
  } else if(parameter === 'reset') {
    button.disabled = false;
    button.innerText = 'Login';
  }
}

function login() {
  button('loading');

  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  if(data.email === '' || data.password === '') {
    msg1('Bitte füllen Sie alle Felder aus!', 2000, 'red');
    button('reset');
    return;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    msg1('Bitte geben Sie eine gültige E-Mail-Adresse ein!', 2500, 'red');
    button('reset');
    return;
  }

  Functionable = false; // Verhindert weitere Login-Versuche
  
  fetch('/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => {
      if(msg.success) {
        msg1('Login erfolgreich! Weiterleitung...', 0, 'green');
        button('reset');
        window.location.replace('../home/home.html');
      } else {
        Functionable = true; // Erlaubt weitere Login-Versuche
        msg1(msg.message, 2500, 'red');
        button('reset');
      }
    })
    .catch(err => failedfetch(err));
}