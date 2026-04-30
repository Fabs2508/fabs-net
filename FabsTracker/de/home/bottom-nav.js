const BASE_PATH_NAV = "/FabsTracker/de";

function handleBottomNavClick(tab) {
    let targetUrl = "";
    switch (tab) {
        case "home": targetUrl = BASE_PATH_NAV + '/home/'; break;
        //case "foodtracker": targetUrl = BASE_PATH_NAV + '/home/foodtracker/'; break;
        case "trainingsplan": targetUrl = BASE_PATH_NAV + '/home/trainingsplan/'; break;
        case "more": targetUrl = BASE_PATH_NAV + '/home/more/griptrainer/'; break;
        case "admin": targetUrl = BASE_PATH_NAV + "/admin/admin.html"; break;
    }

    if (targetUrl) {
        window.location.replace(targetUrl);
    }
}

// Global für home.js verfügbar machen
window.createAdminButtonBottomNav = function() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav || bottomNav.querySelector('[data-tab="admin"]')) return;

    const adminBtn = document.createElement('button');
    adminBtn.dataset.tab = "admin";
    adminBtn.innerHTML = `🔑<span>Admin</span>`;

    if (window.location.pathname.includes('/admin/admin.html')) {
        adminBtn.classList.add('active');
    }

    adminBtn.addEventListener("click", () => handleBottomNavClick("admin"));

    // Einfügen an der 3. Position (vor dem Button mit Index 2)
    const referenceButton = bottomNav.children[2]; 
    bottomNav.insertBefore(adminBtn, referenceButton);
};

// Event-Listener für vorhandene Bottom-Nav-Buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.hasAttribute('disabled')) {
                handleBottomNavClick(btn.dataset.tab);
            }
        });
    });
});
