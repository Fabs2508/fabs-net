function calculateTotal() {
    let total = 0;
    // Alle Zellen mit der Klasse "price" finden
    const priceElements = document.querySelectorAll('.price');
    priceElements.forEach(el => {
        // Text säubern (Euro-Zeichen weg, Komma zu Punkt für JS)
        let priceText = el.innerText.replace('€', '').replace(',', '.').trim();
        let priceValue = parseFloat(priceText) || 0;
        total += priceValue;
    });
    // Ergebnis zurück in das deutsche Format bringen (Punkt zu Komma)
    document.getElementById('total-price').innerText = total.toFixed(2).replace('.', ',') + ' €';
}
// Berechnung beim Laden der Seite ausführen
window.onload = calculateTotal();