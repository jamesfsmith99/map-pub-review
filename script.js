// Initialize the map
var map = L.map('map').setView([-33.87, 151.21], 12);

// Load tile layer
L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google'
}).addTo(map);

// Store markers so we can remove them later
var markers = [];

// Function to load and parse CSV file
function loadCSV() {
    // Add a timestamp to the URL to prevent caching
    const sheetURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1y_N4TKR0lW8AB1ezTB0DKYWT6ki88UdkMVIQgBoffnRULeIFiy21Bb9K87pikFfhOKDa3VjNbhoU/pub?gid=406007453&single=true&output=csv&nocache=${new Date().getTime()}`;

    // Remove old markers from the map
    markers.forEach(marker => map.removeLayer(marker));
    markers = []; // Reset the marker array

    Papa.parse(sheetURL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            if (results.data.length === 0) {
                console.error("No valid data! Check Google Sheets.");
                return;
            }

            results.data.forEach(pub => {
                if (pub.Lat && pub.Long) {
                    var lat = parseFloat(pub.Lat);
                    var lng = parseFloat(pub.Long);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        var rating = parseFloat(pub.Rating).toFixed(2);
                        var price = parseInt(pub.Price) || 1;
                        var numReviews = pub["Number of reviews"] || "No reviews";

                        // Price display: $$$ (black) and remaining in grey
                        var priceDisplay = `<span style="color: black;">${"$".repeat(price)}</span>` +
                                           `<span style="color: grey;">${"$".repeat(3 - price)}</span>`;

                        // Features - 1 = black, 0 = grey
                        function featureDisplay(value, label) {
                            return value === "1" ? `<b>${label}</b>` : `<span style="color: grey;">${label}</span>`;
                        }

                        var features = [
                            featureDisplay(pub["Rooftop bar"], "Rooftop"),
                            featureDisplay(pub["Dance floor"], "Dance floor"),
                            featureDisplay(pub["TV for sport"], "TV"),
                            featureDisplay(pub["Cheap drinks"], "Cheap"),
                            featureDisplay(pub["Open late"], "Open late"),
                            featureDisplay(pub["Beer garden"], "Beer garden"),
                            featureDisplay(pub["Pool table / games"], "Pool table"),
                            featureDisplay(pub["Live music"], "Live music"),
                            featureDisplay(pub["Cocktails"], "Cocktails"),
                            featureDisplay(pub["Really good weekly specials"], "Weekly specials"),
                            featureDisplay(pub["Good food"], "Good food")
                        ].join(" | ");

                        // Add Google Maps link for directions
                        var googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                        var directionsLink = `<a href="${googleMapsLink}" target="_blank" class="directions-link">Get Directions</a>`;

                        var popupContent = ` 
                            <b>${pub.Name}</b><br>
                            ${rating}/5 (${numReviews})<br>
                            Price: ${priceDisplay}<br>
                            ${features}<br><br>
                            ${directionsLink}
                        `;

                        var marker = L.marker([lat, lng]).addTo(map);
                        markers.push(marker);
                        marker.bindPopup(popupContent);
                    }
                }
            });
        },
        error: function (error) {
            console.error("Error loading CSV: ", error);
        }
    });
}

// Load the data initially
loadCSV();

// Reload button to fetch new data
document.getElementById("reloadButton").addEventListener("click", function() {
    console.log("Reloading data...");
    loadCSV();
});

console.log("Script is running!");

// Add custom CSS for bottom-right link positioning
var style = document.createElement('style');
style.innerHTML = `
    .leaflet-popup-content {
        position: relative;
    }
    .directions-link {
        position: absolute;
        bottom: 5px;
        right: 5px;
        color: blue;
        text-decoration: none;
    }
    .directions-link:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(style);
