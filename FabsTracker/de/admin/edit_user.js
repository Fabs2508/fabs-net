const usersTable = document.getElementById('usersTable');
const messageDiv = document.getElementById('message');
const messageDiv2 = document.getElementById('secondmessage');
const tablewrapper = document.getElementsByClassName('table-wrapper')[0];
const adminbox = document.getElementsByClassName('admin-box')[0];

const createUserBox = document.getElementsByClassName('create-user')[0];
const createUserButton = document.getElementById('createUserButton');
const ignoreSwitch = document.getElementById('switch');
const backButton = document.getElementById('backButton');

const username = document.getElementById('newUsername').value;
const email = document.getElementById('newEmail').value;
const password = document.getElementById('newPassword').value;
const role = document.getElementById('newRole').value;

ignoreSwitch.checked = localStorage.getItem('ignoreEmptyFields') === 'true';

backButton.addEventListener('click', () => {
  window.location.href = '../admin/admin.html';
});

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

async function loadUsers() {
  try {
    const res = await fetch('/admin/users', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 401) {
      adminbox.style.display = 'none'; // Alles unsichtbar machen
      window.location.href = '../login/login.html';
      return;
    }

    if (res.status === 403) {
      showMessage('Kein Zugriff');
      messageDiv2.innerHTML = '<p>Zu <a href="../login/login.html">Login</a></p>';
      tablewrapper.style.display = 'none'; // Tabelle unsichtbar machen
      createUserBox.style.display = 'none'; //createUser unsichtbar machen
      return;
    }

    createUserButton.addEventListener('click', () => createUser(document.getElementById('newUsername').value, // Erstellen Button
      document.getElementById('newEmail').value,
      document.getElementById('newPassword').value,
      document.getElementById('newRole').value
    ));

    ignoreSwitch.addEventListener('change', () => {
      if (ignoreSwitch.checked) {
        showMessage('Leere Felder werden ignoriert', 'green');
        localStorage.setItem('ignoreEmptyFields', 'true');
      } else {
        showMessage('Leere Felder werden nicht ignoriert', 'green');
        localStorage.setItem('ignoreEmptyFields', 'false');
      }
    });

    const data = await res.json();

    if (!data.success) {
      showMessage(data.message || 'Fehler beim Laden');
      return;
    }

    // Tabelle leeren
    const tbody = usersTable.querySelector("tbody");
    tbody.innerHTML = '';

    // Daten einfügen
    data.users.forEach(user => {
        const row = document.createElement('tr');

        tablewrapper.style.display = 'block'; // Tabelle sichtbar machen

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="password">********</span>
                <button class="toggle-password" data-hash="${user.password}">Show</button>
            </td>
            <td>${user.role}</td>
            <td><button class="delete-button" data-id="${user.id}">Löschen</button></td>
        `;

        // Delete-Button Listener
        row.querySelector(".delete-button").addEventListener('click', () => deleteUser(user.id));

        // Toggle-Password Listener
        const btn = row.querySelector(".toggle-password");
        btn.addEventListener('click', () => {
          const span = btn.parentElement.querySelector("span");
          const hash = btn.dataset.hash;

          if (btn.textContent === 'Show') {
            if (hash.length <= 6) {
              // zu kurz, alles anzeigen
              span.textContent = hash;
            } else {
              const first = hash.slice(0, 5);       // erste 5 Zeichen
              const last = hash.slice(-5);          // letzte 5 Zeichen
              span.textContent = `${first}...${last}`; // nur EIN "..." dazwischen
            }
            btn.textContent = 'Hide';
          } else {
            span.textContent = '********';
            btn.textContent = 'Show';
          }
        });

        tbody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    showMessage('Netzwerkfehler');
  }
}

async function deleteUser(id) {
  const confirmed = confirm(`User ${id} wirklich löschen?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/admin/del_user/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await res.json();

    if (data.success) {
      showMessage('User gelöscht', 'green');
      loadUsers(); // Tabelle neu laden
    } else {
      showMessage(data.message || 'Fehler beim Löschen');
    }
  } catch (err) {
    console.error(err);
    showMessage('Netzwerkfehler');
  }
}

async function createUser(username, email, password, role) {
  // Validierung nur wenn der Switch NICHT aktiv ist
  if (!ignoreSwitch.checked) {

    if (!username || !email || !password || !role) {
      showMessage('Bitte alle Felder ausfüllen!');
      return;
    }

    if (username.length < 3 || username.length > 20) {
      showMessage('Der Benutzername muss zwischen 3 und 20 Zeichen lang sein!');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein!');
      return;
    }

    // Optional wieder aktivieren
    if (password.length < 6) {
      showMessage('Das Passwort muss mindestens 6 Zeichen lang sein!');
      return;
    }
  }

  // 👉 Fetch nur EINMAL
  try {
    const res = await fetch('/admin/create_user', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await res.json();

    if (data.success) {
      showMessage('User erstellt', 'green');
      loadUsers();
    } else {
      showMessage(data.message || 'Fehler beim Erstellen');
    }

  } catch (err) {
    console.error(err);
    showMessage('Netzwerkfehler');
  }
}


function startLoginCheck() {
  loadUsers()
  // Alle 1000ms (1 Sekunde) prüfen
  setInterval(async () => {
    try {
      await loadUsers();
    } catch (err) {
      console.error('Fehler beim Prüfen des Logins:', err);
    }
  }, 1000);
}

loadUsers();