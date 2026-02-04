export interface WeatherData {
  current: {
    temp: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
  };
  hourly: {
    time: string[];
    temp: number[];
    icon: string[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    icon: string[];
    sunrise: string[];
    sunset: string[];
    uvIndexMax: number[];
  };
}

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Fog', icon: '🌫️' },
  48: { desc: 'Depositing rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  61: { desc: 'Slight rain', icon: '🌧️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '❄️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
};

export async function fetchWeather(lat: number, lon: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<WeatherData> {
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
      icon: data.hourly.weather_code.slice(0, 24).map((code: number) => WEATHER_CODES[code]?.icon || '❓'),
      precipitation: data.hourly.precipitation_probability.slice(0, 24),
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max.map(Math.round),
      tempMin: data.daily.temperature_2m_min.map(Math.round),
      icon: data.daily.weather_code.map((code: number) => WEATHER_CODES[code]?.icon || '❓'),
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uvIndexMax: data.daily.uv_index_max,
    }
  };
}
