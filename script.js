function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
} 

// Count calories
let totalCalories = 0;
let calories = [];

docReady(function() {
    var resultContainer = document.getElementById('qr-reader-results');
    var lastResult, countResults = 0;

    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 10, qrbox: 250 });

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText !== lastResult) {
            ++countResults;
            lastResult = decodedText;
            console.log(`Scan result = ${decodedText}`, decodedResult);

            let url = "https://world.openfoodfacts.net/api/v2/product/" + decodedText + ".json";
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const nutriments = data.product.nutriments;
                    let caloriesValue = nutriments["energy-kcal"];
                    document.getElementById("output").innerText = caloriesValue;
                    // Update total calories and display and convert to int
                    totalCalories += parseInt(caloriesValue);
                    calories.push(caloriesValue);
                    document.getElementById("total-calories").innerText = "Total Calories: " + totalCalories;
                    resultContainer.innerHTML += `<div>[${countResults}] - ${decodedText} - Product Name: ${data.product.product_name}</div>`;
                })
                .catch(error => {
                    console.error("Error fetching product data:", error);
                });

            // Optional: To close the QR code scanning after the result is found
            // html5QrcodeScanner.clear();
        }
    }

    // Optional callback for error, can be ignored.
    function onScanError(qrCodeError) {
        // This callback would be called in case of qr code scan error or setup error.
        // You can avoid this callback completely, as it can be very verbose in nature.
    }

    html5QrcodeScanner.render(onScanSuccess, onScanError);
});