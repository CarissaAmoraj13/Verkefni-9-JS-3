const API_URL = 'https://api.open-meteo.com/v1/forecast';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseResponse(data) {
  const hourly = data.hourly;
  const { time = [], precipitation = [], temperature_2m = [] } = hourly;

  return time.map((t, i) => ({
    time: t,
    precipitation: precipitation[i] ?? 0,
    temperature: temperature_2m[i] ?? 0,
  }));
}

export async function weatherSearch(lat, lng) {
  await sleep(1000);
  const url = new URL(API_URL);
  const querystring = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'temperature_2m,precipitation',
    timezone: 'GMT',
    forecast_days: '1',
  });
  url.search = querystring.toString();

  const response = await fetch(url.href);
  if (response.ok) {
    const data = await response.json();
    return parseResponse(data);
  }
  throw new Error('Failed to fetch weather data');
}
