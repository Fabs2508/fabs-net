const profileBtn = document.getElementById('profileBtn');
const h3username = document.getElementById('h3username');
const dropdown = document.getElementById('profileDropdown');

const themeSwitch = document.getElementById("themeSwitch");

const logoutBtn = document.getElementById('logoutBtn');

const BASE_PATH_HEADER = "/FabsTracker/de/";

profileBtn.addEventListener('click', () => {
  dropdown.style.display =
    dropdown.style.display === 'block' ? 'none' : 'block';
});

// Klick außerhalb schließt Menü
document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-wrapper')) {
    dropdown.style.display = 'none';
  }
});

// 🔓 Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });

    window.location.replace(BASE_PATH_HEADER);
  } catch (err) {
    console.error("Logout Error:" + err);
  }
});

(function initThemeSwitch() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

  themeSwitch.checked = currentTheme === "light";
})();

let debounceTimer;
themeSwitch.addEventListener("change", async (e) => {
  const Theme = e.target.checked ? "light" : "dark";

  themeSwitch.disabled = true;

  // sofort UI ändern
  document.documentElement.setAttribute("data-theme", Theme);

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch('/updateTheme', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Theme })
      });

      const data = await res.json();
      //console.log("Theme gespeichert:", data.theme);

      // 👉 sofort im Frontend anwenden
      document.documentElement.setAttribute("data-theme", Theme);

    } catch (err) {
      console.error("Theme Error:", err);
    } finally {
      themeSwitch.disabled = false;
    }
  }, 500);
});

async function me() {
  try {
    const res = await fetch('/me', {
      credentials: 'include'
    });

    const data = await res.json();
    const username = data.user.username;
    const userFormatted = username.charAt(0).toUpperCase() + username.slice(1);

    h3username.textContent = userFormatted;
  } catch(err) {
    console.log("me Error" + err);
  } 
}

me();