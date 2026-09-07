# ⚡ SkySense — Real-Time Weather Dashboard

SkySense is a modern, responsive, and visually interactive weather dashboard application. Built with vanilla JavaScript, Tailwind CSS, and Chart.js, it fetches real-time meteorological metrics from public REST APIs to deliver instant weather updates worldwide.

---

## 🚀 Live Demo

Check out the live deployed application on Netlify:  
👉 **[SkySense Live Application](https://skysense-weather-dashboard.netlify.app)**

---

## ✨ Features

- **🌐 Live REST API Integration:** Fetches accurate, real-time meteorological metrics via Open-Meteo REST API.
- **🔍 City Search & Geocoding:** Search weather conditions for any global city instantly using Open-Meteo Geocoding API.
- **📈 24-Hour Temperature Chart:** Interactive temperature trend line chart powered by **Chart.js**.
- **📊 Comprehensive Weather Highlights:** Visual cards displaying Humidity, Wind Speed, Surface Pressure, Day Duration, Sunrise & Sunset timings.
- **🌗 Dark / Light Mode Toggle:** Seamless theme switching with local storage state persistence.
- **📱 Fully Responsive Design:** Clean layout optimized for mobile, tablet, and desktop views.
- **⚠️ Graceful Error Handling & Loaders:** Interactive loading spinners during data fetch and user-friendly error banners for invalid searches.

---

## 🛠️ Tech Stack

- **Frontend Framework / Library:** Vanilla JavaScript (ES6+)
- **Styling & UI:** Tailwind CSS (Utility-first styling & Dark Mode)
- **Data Visualization:** Chart.js
- **Icons:** FontAwesome 6
- **APIs Used:** - Open-Meteo Weather Forecast API
  - Open-Meteo Geocoding API

---

## 📁 Project Structure

```text
├── index.html       # Primary HTML5 structure with Tailwind CSS & layout grid
├── script.js        # Core JS logic (Fetch API, Chart.js, DOM updates, Theme toggle)
└── README.md        # Project documentation