const profileBtn = document.getElementById('profileBtn');
const h3username = document.getElementById('h3username');
const dropdown = document.getElementById('profileDropdown');
const themeSwitch = document.getElementById("themeSwitch");
const logoutBtn = document.getElementById('logoutBtn');

const BASE_PATH_HEADER = "/FabsTracker/de/";

// Initialisierung des Switches basierend auf dem aktuellen data-theme
(function initThemeSwitch() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  if (themeSwitch) {
    themeSwitch.checked = (currentTheme === "light");
  }
})();

profileBtn.addEventListener('click', () => {
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-wrapper')) {
    dropdown.style.display = 'none';
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    window.location.replace(BASE_PATH_HEADER);
  } catch (err) {
    console.error("Logout Error:" + err);
  }
});

let debounceTimer;
themeSwitch.addEventListener("change", async (e) => {
  const Theme = e.target.checked ? "light" : "dark";
  themeSwitch.disabled = true;

  // Sofort visuell anwenden
  document.documentElement.setAttribute("data-theme", Theme);

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await fetch('/updateTheme', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Theme })
      });
    } catch (err) {
      console.error("Theme Error:", err);
    } finally {
      themeSwitch.disabled = false;
    }
  }, 500);
});

async function me() {
  try {
    const res = await fetch('/me', { credentials: 'include' });
    const data = await res.json();

    if (data.status === 401 || !res.ok) return;

    // Username setzen
    const username1 = data.user.username;
    h3username.textContent = username1.charAt(0).toUpperCase() + username1.slice(1);

    // WICHTIG: Falls der Server ein Theme schickt, Switch synchronisieren
    if (data.user.theme) {
      document.documentElement.setAttribute("data-theme", data.user.theme);
      themeSwitch.checked = (data.user.theme === "light");
    }
  } catch(err) {
    console.log("me Error: " + err);
  } 
}

me();
