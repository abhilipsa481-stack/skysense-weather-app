const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const loader = document.getElementById('loader');
const errorUi = document.getElementById('error-ui');
const errorMessage = document.getElementById('error-message');
const dashboardContent = document.getElementById('dashboard-content');

let tempChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    fetchWeatherData('New Delhi');
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
});

async function fetchWeatherData(city) {
    showLoader();
    try {

        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found.`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        updateDashboardUI(name, country, weatherData);
        hideError();

    } catch (err) {
        showError(err.message);
    } finally {
        hideLoader();
    }
}

function updateDashboardUI(cityName, country, data) {
    const { current, daily, hourly } = data;

    document.getElementById('location-name').innerText = `${cityName}${country ? `, ${country}` : ''}`;
    const now = new Date();
    document.getElementById('day-name').innerText = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('date-text').innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('current-temp').innerText = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('high-low-temp').innerText = `High: ${Math.round(daily.temperature_2m_max[0])}° | Low: ${Math.round(daily.temperature_2m_min[0])}°`;
    document.getElementById('apparent-temp').innerText = `Feels Like ${Math.round(current.apparent_temperature)}°`;

    const weather = decodeWeatherCode(current.weather_code);
    document.getElementById('weather-condition').innerText = weather.label;
    document.getElementById('weather-icon').className = `fa-solid ${weather.icon} text-6xl ${weather.color} drop-shadow-lg`;

    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-status').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('surface-pressure').innerText = `${Math.round(current.surface_pressure)} hPa`;


    if (daily.sunrise && daily.sunset) {
        const sr = new Date(daily.sunrise[0]);
        const ss = new Date(daily.sunset[0]);
        document.getElementById('sunrise-time').innerText = sr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('sunset-time').innerText = ss.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const diffHrs = Math.abs(ss - sr) / 36e5;
        document.getElementById('day-length').innerText = `${Math.floor(diffHrs)}h ${Math.round((diffHrs % 1) * 60)}m`;
    }

    renderHourlyPills(hourly.time, hourly.temperature_2m, hourly.weather_code);

    const hours = hourly.time.slice(0, 24).map(t => new Date(t).toLocaleTimeString([], { hour: 'numeric' }));
    const temps = hourly.temperature_2m.slice(0, 24);
    renderChart(hours, temps);
}

function renderHourlyPills(times, temps, codes) {
    const container = document.getElementById('hourly-container');
    container.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const timeLabel = new Date(times[i]).toLocaleTimeString([], { hour: 'numeric' });
        const weather = decodeWeatherCode(codes[i]);

        const pill = document.createElement('div');
        pill.className = 'bg-slate-100 dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 px-4 py-3 rounded-2xl flex flex-col items-center gap-2 min-w-[75px] shrink-0';
        pill.innerHTML = `
            <span class="text-xs text-slate-500 dark:text-slate-400">${timeLabel}</span>
            <i class="fa-solid ${weather.icon} text-amber-400 text-lg"></i>
            <span class="text-sm font-bold text-slate-900 dark:text-white">${Math.round(temps[i])}°</span>
        `;
        container.appendChild(pill);
    }
}

function renderChart(labels, dataPoints) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    if (tempChartInstance) tempChartInstance.destroy();

    tempChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: dataPoints,
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

function setupThemeToggle() {
    const btns = [document.getElementById('theme-toggle-desktop'), document.getElementById('theme-toggle-mobile')];
    
    btns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons(isDark);
        });
    });

    const isDark = localStorage.getItem('theme') !== 'light';
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
    document.querySelectorAll('.theme-icon').forEach(icon => {
        icon.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
    });
}

function decodeWeatherCode(code) {
    if (code === 0) return { label: 'Clear Sky', icon: 'fa-sun', color: 'text-amber-400' };
    if (code >= 1 && code <= 3) return { label: 'Cloudy', icon: 'fa-cloud-sun', color: 'text-amber-400' };
    if (code >= 51 && code <= 67) return { label: 'Rainy', icon: 'fa-cloud-rain', color: 'text-purple-500' };
    if (code >= 95) return { label: 'Thunderstorm', icon: 'fa-bolt-lightning', color: 'text-amber-400' };
    return { label: 'Overcast', icon: 'fa-cloud', color: 'text-slate-400' };
}

function showLoader() {
    loader.classList.replace('hidden', 'flex');
    dashboardContent.classList.add('opacity-30', 'pointer-events-none');
}

function hideLoader() {
    loader.classList.replace('flex', 'hidden');
    dashboardContent.classList.remove('opacity-30', 'pointer-events-none');
}

function showError(msg) {
    errorMessage.innerText = msg;
    errorUi.classList.remove('hidden');
}

function hideError() {
    errorUi.classList.add('hidden');
}