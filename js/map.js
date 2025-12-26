// Initialize map
const map = L.map("map").setView([22.5, 78.9], 5);

// Base tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Load data
Promise.all([
  fetch("data/flights.json").then(res => res.json()),
  fetch("data/airports.json").then(res => res.json())
]).then(([flights, airports]) => {

  flights.forEach(flight => {

    // Skip empty / header rows
    if (!flight["Unnamed: 0"] || flight["Unnamed: 0"] === "ORIGIN ICAO") return;

    const origin = flight["Unnamed: 0"];
    const dest = flight["Unnamed: 1"];
    const flightNo = flight["Unnamed: 2"];
    const aircraft = flight["Unnamed: 3"];
    const status = (flight["Unnamed: 5"] || "").toLowerCase();

    const from = airports[origin];
    const to = airports[dest];
    if (!from || !to) return;

    const coords = [
      [from.lat, from.lng],
      [to.lat, to.lng]
    ];

    // Status-based styling
    let color = "#999999";
    let dashArray = "8,8";
    let speed = 120;

    if (status.includes("operating")) {
      color = "#ffcc00"; // Akasa yellow
      dashArray = "1,10";
      speed = 60;
    } else if (status.includes("planned") || status.includes("contention")) {
      color = "#4da6ff"; // blue
      dashArray = "6,12";
      speed = 140;
    }

    // Create animated polyline
    const line = L.polyline(coords, {
      color: color,
      weight: 2,
      opacity: 0.9,
      dashArray: dashArray
    }).addTo(map);

    // Animate dash offset
    let offset = 0;
    setInterval(() => {
      offset = (offset + 1) % 100;
      line.setStyle({
        dashOffset: offset
      });
    }, speed);

    // Popup
    line.bindPopup(`
      <b>${flightNo}</b><br>
      ${origin} → ${dest}<br>
      <b>Status:</b> ${flight["Unnamed: 5"]}<br>
      ${aircraft ? `<b>Aircraft:</b> ${aircraft}` : ""}
    `);

    // Airport markers
    L.circleMarker(coords[0], {
      radius: 4,
      color: "#ffffff",
      fillOpacity: 1
    }).addTo(map).bindTooltip(origin);

    L.circleMarker(coords[1], {
      radius: 4,
      color: "#ffffff",
      fillOpacity: 1
    }).addTo(map).bindTooltip(dest);
  });
});
