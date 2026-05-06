const node_box = document.getElementsByClassName('node-box')[0];
const node_statusValue = document.getElementById('node_statusValue');
const node_uptime = document.getElementById('node_uptime');
const node_memory = document.getElementById('node_memory');
const node_cpu = document.getElementById('node_cpu');
const node_version = document.getElementById('node_version');

const node_refreshButton = document.getElementById('node_refresh');

const pi_box = document.getElementsByClassName('pi-box')[0];
const pi_statusValue = document.getElementById('pi_statusValue');
const pi_cpu = document.getElementById('pi_cpu');
const pi_cpu_temp = document.getElementById('pi_cpu_temp');
const pi_gpu_temp = document.getElementById('pi_gpu_temp');
const pi_memory = document.getElementById('pi_memory');
const pi_volts = document.getElementById('pi_volts');
const pi_uptime = document.getElementById('pi_uptime');

const pi_moreBtn = document.getElementById('pi_more');
const pi_refreshButton = document.getElementById('pi_refresh');

const pi_more1 = document.getElementsByClassName('pi-more1')[0];
const pi_more2 = document.getElementsByClassName('pi-more2')[0];

const messageDiv = document.getElementById('message');
const backButton = document.getElementById('backButton');

const cpuCanvas = document.getElementById("cpuChart");
const cpu_row = document.querySelector("#node_cpu").parentElement;

const ctx = document.getElementById('cpuChart').getContext('2d');
const ctx_style = document.getElementById('cpuChart');

let errorNode = 0;
let errorPi = 0;
let intervalNode;
let intervalPi;

let cpuData = [];
let labels = [];

pi_more1.style.display = "none";
pi_more2.style.display = "none";
pi_refreshButton.style.display = "none";

backButton.addEventListener('click', () => {
  window.location.href = '../admin/admin.html';
});

const cpuChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'CPU Load',
            data: cpuData,
            borderColor: '#2bbcff',
            backgroundColor: 'rgba(43,188,255,0.1)',
            borderWidth: 2,          // Eine feste, dünne Linie
            tension: 0,              // Wir stellen die Kurven (Tension) mal auf 0 (zackig)
            pointRadius: 0,          // Keine Punkte
            fill: false,             // Wir schalten die Hintergrundfarbe unter der Linie aus
            borderCapStyle: 'butt',  // Verhindert komische Endstücke an der Linie
            borderJoinStyle: 'miter' // Verhindert Abrundungsfehler
        }]
    },
    options: {
        animation: false,
        responsive: true,
        plugins: {
            tooltip: { enabled: false }  // Versteckt Tooltips beim Drüberfahren
        },
        scales: {
            x: {
                display: false // VERSTECKT DIE TIMESTAMPS UNTEN KOMPLETT
            },
            y: {
                max: 3,
                min: 0,
                ticks: {
                    stepSize: 0.5
                }
            }
        }
    }
});

cpu_row.addEventListener("click", () => {
    if (cpuCanvas.style.display === "none") {
        cpuCanvas.style.display = "block";
    } else {
        cpuCanvas.style.display = "none";
    }
});

pi_moreBtn.addEventListener("click", () => {
    if (pi_more1.style.display === "none") {
        pi_more1.style.display = "table-row";
        pi_more2.style.display = "table-row";
        pi_moreBtn.innerText = "Weniger";
    } else {
        pi_more1.style.display = "none";
        pi_more2.style.display = "none";
        pi_moreBtn.innerText = "Mehr";
    }
});

function formatUptime(seconds) {
    seconds = Math.floor(seconds);

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = "";

    if (days > 0) result += days + "d ";
    if (hours > 0) result += hours + "h ";
    if (minutes > 0) result += minutes + "m ";
    if (seconds > 0 || result === "") result += seconds + "s";

    return result.trim();
}

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

async function loadNodeStatus() {
    
    try {
        const res = await fetch("/admin/NodeStatus", {
            credentials: "include",
            mode: "cors"
        });

        if (res.status === 401) {
            node_box.style.display = 'none'; // Alles unsichtbar machen
            window.location.href = '../login/login.html';
            return;
        }
        if (res.status === 403) {
            node_box.style.display = 'none'; // Box unsichtbar machen
            showMessage('Kein Zugriff');
            return;
        }
        if (res.status === 503) {
            node_statusValue.innerText = "nicht erreichbar";
            node_statusValue.style.color = "red";
            clearInterval(intervalNode);
            return;
        }

        errorNode = 0; // reset bei Erfolg

        const data = await res.json();

        const cpuValue = Number(data.cpuLoad[0]); // erster Wert
        if (!Number.isFinite(cpuValue)) {
            throw new Error("Ungueltiger CPU Load Wert");
        }

        cpuData.push(cpuValue);
        labels.push(new Date().toLocaleTimeString());

        // max 20 Punkte behalten (wie Task Manager)
        if (cpuData.length > 10) {
            cpuData.shift();
            labels.shift();
        }

        if (!document.hidden) {
            cpuChart.update();
        }

        node_statusValue.innerText = "online";
        node_statusValue.style.color = "green";

        if (data.cpuLoad[0] < 1) {
            node_cpu.style.color = "green";
        } else if (data.cpuLoad[0] < 2) {
            node_cpu.style.color = "orange";
        } else {
            node_cpu.style.color = "red";
        }


        node_cpu.innerText = `${cpuValue}`;
        node_cpu.setAttribute('title', data.cpuLoad);

        node_memory.innerText = `${Math.round(data.memory.free / 1024 / 1024)} MB`;

        node_uptime.innerText = `${formatUptime(data.uptime)}`;

        node_version.innerText = `${data.nodeVersion}`;

    } catch (err) {
        errorNode++;

        node_statusValue.innerText = "offline";
        node_statusValue.style.color = "red";

        ctx_style.style.display = 'none'; // Chart verstecken

        node_cpu.innerText = `-`;
        node_memory.innerText = `-`;
        node_uptime.innerText = `-`;
        node_version.innerText = `-`;


        if (errorNode >= 2) {
            clearInterval(intervalNode);
            intervalNode = null;

            console.log("Polling gestoppt");
            node_refreshButton.style.display = 'block';
        }
    }
}

node_refreshButton.onclick = () => {
    errorNode = 0;
    node_refreshButton.style.display = 'none';
    loadNodeStatus(); // Sofort einmal laden
    intervalNode = setInterval(loadNodeStatus, 2000);
};

async function loadPiStatus() {
    
    try {
        
        const res = await fetch("/admin/PiStatus", {
            credentials: "include",
            mode: "cors"
        });

        if (res.status === 401) {
            pi_box.style.display = 'none'; // Alles unsichtbar machen
            window.location.href = '../login/login.html';
            return;
        }
        if (res.status === 403) {
            pi_box.style.display = 'none'; // Box unsichtbar machen
            showMessage('Kein Zugriff');
            return;
        }

        errorPi = 0; // reset bei Erfolg

        const data = await res.json();

        //console.log("Pi Status:", data);

        pi_statusValue.innerText = "online";
        pi_statusValue.style.color = "green";

        if (data.cpu_temp < 45) {
            pi_cpu_temp.style.color = "green";
        } else if (data.cpu_temp < 55) {
            pi_cpu_temp.style.color = "orange";
        } else {
            pi_cpu_temp.style.color = "red";
        }

        if (data.gpu_temp < 45) {
            pi_gpu_temp.style.color = "green";
        } else if (data.gpu_temp < 55) {
            pi_gpu_temp.style.color = "orange";
        } else {
            pi_gpu_temp.style.color = "red";
        }

        //pi_uptime.innerText = `${formatUptime(data)}`;

        //pi_memory.innerText = `${Math.round(data.memory.free / 1024 / 1024)} MB`;

        pi_cpu.innerText = `${data.CpuMhz} MHz`;

        pi_memory.innerText = `${data.memoryUsedMB} MB / ${data.memoryTotalMB} MB (${data.memoryPercent}%)`;

        pi_cpu_temp.innerText = `${data.cpu_temp}°C`;

        pi_gpu_temp.innerText = `${data.gpu_temp}°C`;

        pi_volts.innerText = `${data.volt}V`;

        pi_uptime.innerText = `${formatUptime(data.uptime)}`;// `${formatUptime(data.uptime)}`;

    } catch (err) {
        errorPi++;

        //console.log(err)

        pi_statusValue.innerText = "nicht erreichbar";
        pi_statusValue.style.color = "red";

        ctx_style.style.display = 'none'; // Chart verstecken

        pi_cpu.innerText = `-`;
        pi_memory.innerText = `-`;
        pi_cpu_temp.innerText = `-`;
        pi_gpu_temp.innerText = `-`;
        pi_volts.innerText = `-`;
        pi_uptime.innerText = `-`;


        if (errorPi >= 2) {
            clearInterval(intervalPi);
            intervalPi = null;

            console.log("Polling gestoppt");
            pi_refreshButton.style.display = 'block';
        }
    }
}

pi_refreshButton.onclick = () => {
    errorPi = 0;
    pi_refreshButton.style.display = 'none';
    loadPiStatus(); // Sofort einmal laden
    intervalPi = setInterval(loadPiStatus, 2000);
};

function RloadPiStatus() {
    errorPi = 0;
    pi_refreshButton.style.display = 'none';
    loadPiStatus();
}

function init() {
    loadNodeStatus();
    loadPiStatus();
    intervalNode = setInterval(loadNodeStatus, 2000);
    intervalPi = setInterval(loadPiStatus, 2000);
}

init();
