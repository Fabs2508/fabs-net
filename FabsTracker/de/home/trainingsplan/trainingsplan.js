let linksSet = false;
let loginInterval;

async function checkLogin() {
  try {
    const res = await fetch('/getUserData', {
      credentials: 'include'
    });

    if (res.status === 401) {
      clearInterval(loginInterval); // stoppt den Timer
      //showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../../');
      return;
    }

    if (!res.ok) {
      //showMessage('Server nicht erreichbar')
      return;
    }

    const data = await res.json();

    if (!data.success) {
      welcomeText.textContent = data.message || 'Fehler';
      return;
    }

    

    const trainingsplanData = data.userData;
    const firstTime = trainingsplanData.trainingsplan.firstTime;

    const role = data.role;

    //console.log('First Time:', firstTime);
    //console.log('Role:', role);

    if (role === 'admin') {
      if (typeof window.createAdminButtonSidebar === 'function') {
          window.createAdminButtonSidebar();
      }
      if (typeof window.createAdminButtonBottomNav === 'function') {
          window.createAdminButtonBottomNav();
      }
    }

     if (!linksSet) {
      //welcomeText.textContent = `Wilkommen zurück ${userFormatted}`;



      linksSet = true;
    }

  } catch (err) {
    console.error('Try error:', err);
    //welcomeText.textContent = 'Netzwerkfehler';
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