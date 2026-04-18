const welcomeText = document.getElementById('welcome');
const actionsDiv = document.getElementById('actions');

const toggle = document.getElementById('animationToggle');
const mainBox = document.querySelector('.main-box');

const messageDiv = document.getElementById('message');

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

showMessage("test")

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    mainBox.classList.remove('animate-glow');
  } else {
    mainBox.classList.add('animate-glow');
  }
});


async function init() {
  try{
    const res = await fetch('/init', {
      credentials: 'include'
    });

    const data = await res.text();

    showMessage(data, "green");

  } catch (error) {
    showMessage(error);
  }
}

//send
async function send(data) {
      const payload = { 
        username: "Fab", 
        message: "Hallo Server!" 
    };

  try {
    const response = await fetch('/init', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Antwort vom Server:", result);
  } catch (error) {
      console.error("Fehler beim Senden:", error);
  }
}

//init();
send();