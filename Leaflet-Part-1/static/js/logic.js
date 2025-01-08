// Define the URL for the earthquake data
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define the base layers
const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

const satellite = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors, Tiles courtesy of HOT"
});

const grayscale = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors, Tiles courtesy of OSM France"
});

// Create the map with the default base layer
const map = L.map("map", {
    center: [37.7749, -122.4194], // San Francisco, CA
    zoom: 5,
    layers: [streets] // Default base layer
});

// Define a layer group for the earthquake data
const earthquakeLayer = L.layerGroup();

// Fetch the earthquake data
d3.json(earthquakeDataUrl).then(data => {
    // Loop through the features (earthquake data)
    data.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const properties = feature.properties;

        // Add a circle marker for each earthquake
        const circle = L.circleMarker([coordinates[1], coordinates[0]], {
            radius: markerSize(properties.mag),
            fillColor: markerColor(coordinates[2]), // Depth
            color: "#000000",
            weight: 0.5,
            fillOpacity: 0.8
        });

        // Bind a styled popup to the circle
        circle.bindPopup(`
            <div style="font-family: Arial, sans-serif; font-size: 14px;">
                <h3 style="margin: 0; font-size: 16px;">${properties.place}</h3>
                <hr style="margin: 5px 0;">
                <p><strong>Magnitude:</strong> ${properties.mag}</p>
                <p><strong>Depth:</strong> ${coordinates[2]} km</p>
            </div>
        `);

        // Add hover effect for marker interactivity
        circle.on("mouseover", function () {
            this.setStyle({ color: "#FFD700", weight: 2 }); // Highlight
        });
        circle.on("mouseout", function () {
            this.setStyle({ color: "#000000", weight: 0.5 }); // Reset
        });

        circle.addTo(earthquakeLayer); // Add marker to the earthquake layer
    });

    // Add the earthquake layer to the map
    earthquakeLayer.addTo(map);
});

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 4;
}

// Function to determine marker color based on depth
function markerColor(depth) {
    return depth > 90 ? "#FF0000" :
           depth > 70 ? "#FF4500" :
           depth > 50 ? "#FFA500" :
           depth > 30 ? "#FFD700" :
           depth > 10 ? "#ADFF2F" : "#7FFF00";
}

// Add a legend to the map
const legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#7FFF00", "#ADFF2F", "#FFD700", "#FFA500", "#FF4500", "#FF0000"];

    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]} km<br>` : "+ km"}`;
    }

    return div;
};
legend.addTo(map);

// Define the base maps object
const baseMaps = {
    "Streets": streets,
    "Satellite": satellite,
    "Grayscale": grayscale
};

// Define the overlay maps object
const overlayMaps = {
    "Earthquakes": earthquakeLayer
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false // Show the control panel expanded by default
}).addTo(map);
