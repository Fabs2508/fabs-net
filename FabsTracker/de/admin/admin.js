const actionsDiv = document.getElementById('actions');

const messageDiv = document.getElementById('message');


let linksSet = false;


function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

function addLink(text, href) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  actionsDiv.appendChild(link);
}


async function loadUsers() {

    const res = await fetch('/admin/users', {
        method: 'GET',
        credentials: 'include'
    });

    showMessage(res.status, 'green');

    if (res.status === 401) {
        showMessage('Nicht eingeloggt');
        window.location.href = '../login/login.html'
        return;
    }
    if (res.status === 403) {
        showMessage('Kein Zugriff');
        window.location.replace('../home')
        return;
    }
    if (res.status === 503) {
        showMessage('Server nicht erreichbar');
        messageDiv2.innerHTML = '<p>Zu <a href="../login/login.html">Login</a></p>';
        tablewrapper.style.display = 'none'; // Tabelle unsichtbar machen
        return;
    }

    if (res.status === 200) {
        if (!linksSet) {
            addLink('User bearbeiten', 'edit_user.html');
            addLink('Status', 'status.html');

            window.createAdminButtonSidebar();
            window.createAdminButtonBottomNav();

            linksSet = true;
        }
    }

    const data = await res.json();
    if (!data.success) {
        showMessage(data.message || 'Fehler beim Laden');
        return;
    }
}

loadUsers();