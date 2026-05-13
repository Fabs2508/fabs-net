const usersTable = document.getElementById('usersTable');
const messageDiv = document.getElementById('message');
const messageDiv2 = document.getElementById('secondmessage');
const tablewrapper = document.querySelector('.table-wrapper');
const adminbox = document.querySelector('.admin-box');

const createUserBox = document.querySelector('.create-user');
const createUserButton = document.getElementById('createUserButton');
const ignoreSwitch = document.getElementById('switch');
const backButton = document.getElementById('backButton');

let currentPage = 1; 
const rowsPerPage = 5;

ignoreSwitch.checked = localStorage.getItem('ignoreEmptyFields') === 'true';

backButton.addEventListener('click', () => {
  window.location.href = '../admin/admin.html';
});

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

let loginInterval;

async function checkLogin() {
  try {
    const res = await fetch('/getUserStatus', {
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
     

  } catch (err) {
    console.error('Try error:', err);
    showMessage("Netzwerkfehler")
  } finally {
    setTimeout(checkLogin, 5000); // Alle 5 Sekunden erneut prüfen
  }
}

checkLogin();

function renderPagination(totalPages) {
  let nav = document.getElementById('pagination-nav');
  if (!nav) {
    nav = document.createElement('div');
    nav.id = 'pagination-nav';
    nav.className = 'pagination';
    tablewrapper.after(nav);
  }

  if (totalPages <= 1) {
    nav.innerHTML = '';
    nav.style.display = 'none';
    return;
  }

  nav.style.display = 'flex'; 
  nav.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = (i === currentPage) ? 'active' : '';
    btn.onclick = async (e) => {
      e.preventDefault();
      currentPage = i;
      await loadUsers(); 
    };
    nav.appendChild(btn);
  }
}

async function loadUsers() {
  try {
    const res = await fetch('/admin/users', { method: 'GET', credentials: 'include' });

    if (res.status === 403) {
      showMessage('Kein Zugriff');
      tablewrapper.style.display = 'none';
      createUserBox.style.display = 'none';
      return;
    }

    const data = await res.json();
    if (!data.success) {
      showMessage(data.message || 'Fehler beim Laden');
      return;
    }

    // Sortierung: ID 1 nach oben
    data.users.sort((a, b) => a.id - b.id);

    const tbody = usersTable.querySelector("tbody");
    tbody.innerHTML = '';
    const allRows = [];

    data.users.forEach(user => {
        const row = document.createElement('tr');
        const formatted_last_seen = new Date(user.last_seen).toLocaleString('de-DE');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
              <select class="role-select" id="role-${user.id}" name="role-${user.id}">
                <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
              </select>
            </td>
            <td><button class="delete-button">Löschen</button></td>
            <td>${formatted_last_seen}</td>
        `;

        row.querySelector(".delete-button").onclick = () => deleteUser(user.id);
        
        const roleSelect = row.querySelector(".role-select");
        roleSelect.onchange = () => updateRole(user.id, roleSelect.value, user.username);

        allRows.push(row);
    });

    const totalPages = Math.ceil(allRows.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allRows.slice(start, end).forEach(row => tbody.appendChild(row));

    renderPagination(totalPages);
    tablewrapper.style.display = 'block';

  } catch (err) {
    console.error(err);
    showMessage('Netzwerkfehler');
  }
}

// --- HIER SIND DIE FEHLENDEN FUNKTIONEN ---

async function deleteUser(id) {
  const confirmed = confirm(`User ${id} wirklich löschen?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/admin/del_user/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();

    if (data.success) {
      showMessage('User gelöscht', 'green');
      loadUsers();
    } else {
      showMessage(data.message || 'Fehler beim Löschen');
    }
  } catch (err) {
    showMessage('Netzwerkfehler');
  }
}

async function updateRole(userId, role, username) {
  if (role === "admin") {
    const confirmed = confirm(`Willst du ${username} wirklich Adminrechte geben?`);
    if (!confirmed) {
      loadUsers(); // Setzt das Dropdown zurück
      return;
    }
  }

  try {
    const res = await fetch('/admin/change_role', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role })
    });
    const data = await res.json();

    if (data.success) {
      showMessage('Rolle aktualisiert', 'green');
    } else {
      showMessage(data.message || 'Fehler beim Aktualisieren');
      loadUsers();
    }
  } catch (err) {
    showMessage('Netzwerkfehler');
  }
}

async function createUser(username, email, password, role) {
  if (!ignoreSwitch.checked) {
    if (!username || !email || !password || !role) return showMessage('Bitte alle Felder ausfüllen!');
    if (username.length < 3 || username.length > 20) return showMessage('Username: 3-20 Zeichen!');
  }

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
    showMessage('Netzwerkfehler');
  }
}

// Event Listener binden
createUserButton.onclick = () => createUser(
  document.getElementById('newUsername').value,
  document.getElementById('newEmail').value,
  document.getElementById('newPassword').value,
  document.getElementById('newRole').value
);

ignoreSwitch.onchange = () => {
  localStorage.setItem('ignoreEmptyFields', ignoreSwitch.checked);
  showMessage(ignoreSwitch.checked ? 'Leere Felder werden ignoriert' : 'Leere Felder werden geprüft', 'green');
};

// Initialer Start
loadUsers();
