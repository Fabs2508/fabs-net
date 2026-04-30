// Pfad-Konfiguration
const BASE_PATH_SIDEBAR = "/FabsTracker/de";

function handleSidebarClick(tab) {
    let targetUrl = "";
    switch (tab) {
        case "home": targetUrl = BASE_PATH_SIDEBAR + '/home/'; break;
        //case "foodtracker": targetUrl = BASE_PATH_SIDEBAR + '/home/foodtracker/'; break;
        case "trainingsplan": targetUrl = BASE_PATH_SIDEBAR + '/home/trainingsplan/'; break;
        case "griptrainer": targetUrl = BASE_PATH_SIDEBAR + '/home/more/griptrainer/'; break;
        case "admin": targetUrl = BASE_PATH_SIDEBAR + "/admin/admin.html"; break;
    }

    if (targetUrl) {
        window.location.replace(targetUrl);
    }
}

// Global für home.js verfügbar machen
window.createAdminButtonSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || sidebar.querySelector('[data-tab="admin"]')) return;

    // Erstellt die Überschrift "Verwaltung" vor dem Admin-Button
    const label = document.createElement('span');
    label.className = 'label';
    label.innerText = 'Verwaltung';
    sidebar.appendChild(label);

    const adminBtn = document.createElement('button');
    adminBtn.dataset.tab = "admin";
    adminBtn.innerHTML = `🔑&nbsp<span>Admin</span>`;
    
    // Aktiv-Status prüfen
    if (window.location.pathname.includes('/admin/admin.html')) {
        adminBtn.classList.add('active');
    }

    adminBtn.addEventListener("click", () => handleSidebarClick("admin"));
    sidebar.appendChild(adminBtn);
};

// Event-Listener für vorhandene Sidebar-Buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.hasAttribute('disabled')) {
                handleSidebarClick(btn.dataset.tab);
            }
        });
    });
});
