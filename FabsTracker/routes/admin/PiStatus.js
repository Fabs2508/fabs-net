const express = require("express");
const router = express.Router();
const os = require('os');
const fs = require('fs');

const { execSync } = require('child_process');
const { requireAdmin } = require("../middleware/requireAdmin");

router.get("/", requireAdmin, (req, res) => {
    try {

        // 1. CPU Taktfrequenz (in MHz)
        const clockRaw = execSync('vcgencmd measure_clock arm').toString().split('=')[1];
        const clockMhz = (parseInt(clockRaw) / 1000000).toFixed(0);

        //2. Memory (freier RAM in MB)
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

        // 3. CPU Temp° (aus der System-Datei)
        const cpuRaw = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp", "utf8");
        const cpuTemp = (parseInt(cpuRaw) / 1000).toFixed(1);

        // 4. GPU Temp° (über vcgencmd)
        const gpuRaw = execSync('vcgencmd measure_temp').toString();
        const gpuTemp = gpuRaw.replace('temp=', '').replace("'C\n", "");

        // 5. Spannung (Volt) - Wichtig bei schwachen Netzteilen
        const voltage = execSync('vcgencmd measure_volts core').toString().replace('volt=', '').replace('V\n', '');

        // 6. Throttling-Status (Hat der Pi wegen Hitze gedrosselt?)
        // 0x0 bedeutet alles okay
        const throttled = execSync('vcgencmd get_throttled').toString().split('=')[1].trim();

        res.json({
            CpuMhz: clockMhz,

            memoryPercent: memoryUsagePercent,
            memoryUsedMB: Math.round(usedMemory / 1024 / 1024), // in MB
            memoryTotalMB: Math.round(totalMemory / 1024 / 1024), // in MB

            cpu_temp: cpuTemp,
            gpu_temp: gpuTemp,
            volt: voltage,
            uptime: os.uptime(),
            throttled: throttled === "0x0" ? "OK" : "⚠️ Drosselung!"
        });
    } catch (err) {
        res.status(500).json({ error: "Hardware-Daten nicht lesbar" + err });
    }
});

module.exports = router;