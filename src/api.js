const WEATHER_CODES = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌦️' },
    55: { desc: 'Dense drizzle', icon: '🌦️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow', icon: '❄️' },
    73: { desc: 'Moderate snow', icon: '❄️' },
    75: { desc: 'Heavy snow', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌦️' },
    82: { desc: 'Violent rain showers', icon: '🌧️' },
    85: { desc: 'Slight snow showers', icon: '❄️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

export async function fetchWeather(lat, lon, unit = 'celsius') {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&temperature_unit=${unit}`;

    const response = await fetch(url);
    const data = await response.json();

    const currentCode = data.current.weather_code;

    return {
        current: {
            temp: Math.round(data.current.temperature_2m),
            description: WEATHER_CODES[currentCode]?.desc || 'Unknown',
            icon: WEATHER_CODES[currentCode]?.icon || '❓',
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            feelsLike: Math.round(data.current.apparent_temperature),
            uvIndex: Math.round(data.daily.uv_index_max[0]),
            visibility: Math.round(data.current.visibility / 1000), // convert to km
            pressure: Math.round(data.current.surface_pressure),
        },
        hourly: {
            time: data.hourly.time.slice(0, 24),
            temp: data.hourly.temperature_2m.slice(0, 24).map(Math.round),
            icon: data.hourly.weather_code.slice(0, 24).map((code) => WEATHER_CODES[code]?.icon || '❓'),
            precipitation: data.hourly.precipitation_probability.slice(0, 24),
        },
        daily: {
            time: data.daily.time,
            tempMax: data.daily.temperature_2m_max.map(Math.round),
            tempMin: data.daily.temperature_2m_min.map(Math.round),
            icon: data.daily.weather_code.map((code) => WEATHER_CODES[code]?.icon || '❓'),
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset,
            uvIndexMax: data.daily.uv_index_max,
        }
    };
}

export async function reverseGeocode(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await res.json();
        return data.city || data.locality || 'Your Location';
    } catch {
        return 'Your Location';
    }
}
