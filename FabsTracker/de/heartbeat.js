async function sendHeartbeat() {
  try {

    await fetch("/heartbeat", {
      method: "POST",
      credentials: "include"
    })
    /*
    .then(res => res.json())
    .then(msg => {
        console.log(msg)
    });
    */

  } catch (err) {
    console.error("Heartbeat Fehler:", err);
  }
}

/* sofort */
sendHeartbeat();

/* alle 15 Sekunden */
setInterval(sendHeartbeat, 15000);