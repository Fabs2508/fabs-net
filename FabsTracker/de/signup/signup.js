const signupBtn = document.querySelector('.btn');

signupBtn.addEventListener('click', () => {
  register();
});

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
  msg1('Es gab ein Problem mit der Verbindung zum Server. Bitte versuchen Sie es später erneut.', 5000);
  console.error("Serverfehler: " + err);
}

function button(parameter) {
  const button = document.querySelector('.btn');
  if(parameter === 'loading') {
    button.disabled = true;
    button.innerText = 'Lädt...';
  } else if(parameter === 'reset') {
    button.disabled = false;
    button.innerText = 'Login';
  }
}

function register() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('confirm').value;

  const token = document.querySelector('[name="cf-turnstile-response"]').value;

  button('reset');
  
  //Prüfen
  if(username === '' || email === '' || password === '' || passwordConfirm === '') {
    msg1('Bitte fülle alle Felder aus!', 1500, 'red');
    return;
  } else if (username.length < 3 || username.length > 20) {
    msg1('Der Benutzername muss zwischen 3 und 20 Zeichen lang sein!', 2500, 'red');
    return;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg1('Bitte gebe eine gültige E-Mail-Adresse ein!', 1500, 'red');
    return;
  } else if (password !== passwordConfirm) {
    msg1('Die Passwörter stimmen nicht überein!', 1500, 'red');
    return;
  }


  //Zusammenfassen
  const data = {
    username: username,
    email: email,
    password: password,
    "cf-turnstile-response": token
  };
  
  button('loading');

  getUserData();

  //Senden
  /*
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(msg => {
    if(msg.success) {
      msg1('Registrierung erfolgreich! Weiterleitung...', 0, 'green');
      //window.location.href = '../home/home.html';
    } else {
      msg1(msg.message, 3500, 'red');
      button('reset');

      if (window.turnstile) {
      turnstile.reset('#turnstile-widget');
    }
    }
    button('reset');
  })
  .catch(err => failedfetch(err));
  */
}

async function getUserData() {
  try {
    const res = await fetch('/getUserData', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      //msg1('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

    if (!data.profileCompleted) {
      console.log("NotCompleted:", data);
    } else {
      console.log("Completed:", data);
    }

  } catch (err) {
    console.error("Try Error:", err);
  }
}