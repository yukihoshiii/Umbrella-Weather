import { fetchWeather, WeatherData } from './api';

let currentUnit: 'celsius' | 'fahrenheit' = 'celsius';
let lastCoords: { lat: number; lon: number } | null = null;

const elements = {
    cityName: document.getElementById('city-name')!,
    currentDate: document.getElementById('current-date')!,
    mainTemp: document.getElementById('main-temp')!,
    weatherDesc: document.getElementById('weather-desc')!,
    highTemp: document.getElementById('high-temp')!,
    lowTemp: document.getElementById('low-temp')!,
    hourlyList: document.getElementById('hourly-list')!,
    dailyList: document.getElementById('daily-list')!,
    app: document.getElementById('app')!,
    settingsBtn: document.getElementById('settings-btn')!,
    settingsModal: document.getElementById('settings-modal')!,
    closeSettings: document.getElementById('close-settings')!,
    unitC: document.getElementById('unit-c')!,
    unitF: document.getElementById('unit-f')!,
};

async function init() {
    updateDate();
    setupEventListeners();
    await getLocation();
}

function updateDate() {
    const now = new Date();
    elements.currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

function setupEventListeners() {
    elements.settingsBtn.onclick = () => elements.settingsModal.classList.remove('hidden');
    elements.closeSettings.onclick = () => elements.settingsModal.classList.add('hidden');

    elements.unitC.onclick = () => switchUnit('celsius');
    elements.unitF.onclick = () => switchUnit('fahrenheit');
}

async function switchUnit(unit: 'celsius' | 'fahrenheit') {
    if (currentUnit === unit) return;
    currentUnit = unit;

    elements.unitC.classList.toggle('active', unit === 'celsius');
    elements.unitF.classList.toggle('active', unit === 'fahrenheit');

    if (lastCoords) {
        await updateWeather(lastCoords.lat, lastCoords.lon);
    }
}

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                lastCoords = { lat: latitude, lon: longitude };
                await updateWeather(latitude, longitude);
                await reverseGeocode(latitude, longitude);
            },
            () => {
                elements.cityName.textContent = 'Location Access Denied';
            }
        );
    } else {
        elements.cityName.textContent = 'Geolocation not supported';
    }
}

async function reverseGeocode(lat: number, lon: number) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await res.json();
        elements.cityName.textContent = data.city || data.locality || 'Your Location';
    } catch {
        elements.cityName.textContent = 'Your Location';
    }
}

async function updateWeather(lat: number, lon: number) {
    try {
        const data = await fetchWeather(lat, lon, currentUnit);
        renderWeather(data);
        updateBackground(data.current.description);
    } catch (err) {
        console.error('Failed to fetch weather:', err);
    }
}

function renderWeather(data: WeatherData) {
    elements.mainTemp.textContent = data.current.temp.toString();
    elements.weatherDesc.textContent = `${data.current.icon} ${data.current.description}`;
    elements.highTemp.textContent = data.daily.tempMax[0].toString();
    elements.lowTemp.textContent = data.daily.tempMin[0].toString();

    // Hourly
    elements.hourlyList.innerHTML = data.hourly.time.map((time, i) => `
    <div class="hourly-item">
      <span class="time">${new Date(time).getHours()}:00</span>
      <span class="icon">${data.hourly.icon[i]}</span>
      <span class="temp">${data.hourly.temp[i]}°</span>
    </div>
  `).join('');

    // Daily
    elements.dailyList.innerHTML = data.daily.time.map((time, i) => {
        const date = new Date(time);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        return `
      <div class="daily-item">
        <span class="day">${dayName}</span>
        <span class="icon">${data.daily.icon[i]}</span>
        <div class="temp-range">
          <span>${data.daily.tempMax[i]}°</span> 
          <span style="opacity: 0.5; margin-left: 10px">${data.daily.tempMin[i]}°</span>
        </div>
      </div>
    `;
    }).join('');
}

function updateBackground(desc: string) {
    const lowerDesc = desc.toLowerCase();
    elements.app.className = ''; // reset

    if (lowerDesc.includes('clear')) {
        const hour = new Date().getHours();
        elements.app.classList.add(hour > 6 && hour < 20 ? 'weather-clear-day' : 'weather-clear-night');
    } else if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle') || lowerDesc.includes('thunderstorm')) {
        elements.app.classList.add('weather-rain');
    } else {
        elements.app.classList.add('weather-cloudy');
    }
}

init();
