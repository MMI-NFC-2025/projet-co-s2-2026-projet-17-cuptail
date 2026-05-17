export const API_BASE = 'https://api.ruslanabudniak.fr';

export const DEFAULT_LOCATION = {
  city: 'Montbéliard',
  latitude: 47.5102,
  longitude: 6.7981,
};

export const STORAGE_KEY = 'cuptail_location_choice';

export function saveLocation(location) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export function getSavedLocation() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export async function getWeather(location) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.searchParams.set('latitude', location.latitude);
  url.searchParams.set('longitude', location.longitude);
  url.searchParams.set('current', 'temperature_2m,precipitation,rain,weather_code,wind_speed_10m,is_day');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);
  const data = await response.json();

  return data.current;
}

export async function getCityCoords(cityName) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');

  url.searchParams.set('name', cityName);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'fr');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('Ville introuvable');
  }

  const city = data.results[0];

  return {
    city: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

export function getTemperatureBucket(temperature) {
  if (temperature >= 30) return 'tres_chaud';
  if (temperature >= 24) return 'chaud';
  if (temperature >= 18) return 'doux_chaud';
  if (temperature >= 11) return 'doux';
  if (temperature >= 5) return 'froid';
  return 'tres_froid';
}

export function getWeatherContext(weather) {
  const temperature = weather.temperature_2m;
  const precipitation = weather.precipitation;
  const rain = weather.rain;
  const code = weather.weather_code;
  const wind = weather.wind_speed_10m;

  if (precipitation > 0 || rain > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'pluie';
  if (wind >= 35) return 'vent';
  if (temperature >= 24) return 'chaud';
  if (temperature <= 10) return 'froid';
  if ([0, 1].includes(code)) return 'soleil';
  if ([2, 3, 45, 48].includes(code)) return 'nuageux';

  return 'normal';
}

export function getWeatherLabel(context, bucket) {
  if (bucket === 'tres_chaud') return 'Très chaud';
  if (bucket === 'chaud') return 'Chaud';
  if (bucket === 'doux_chaud') return 'Ensoleillé';
  if (bucket === 'doux') return 'Doux';
  if (bucket === 'froid') return 'Frais';
  if (bucket === 'tres_froid') return 'Très froid';

  const labels = {
    pluie: 'Pluvieux',
    nuageux: 'Nuageux',
    vent: 'Venteux',
    normal: 'Doux',
  };

  return labels[context] || 'Doux';
}

export function getWeatherMessage(context, bucket) {
  if (bucket === 'tres_chaud') return 'On part sur du très frais.';
  if (bucket === 'chaud') return 'Parfait pour une boisson fraîche !';
  if (bucket === 'doux_chaud') return 'Une boisson légère et fraîche.';
  if (bucket === 'doux') return 'Une boisson simple pour aujourd’hui.';
  if (bucket === 'froid') return 'Une boisson chaude serait parfaite.';
  if (bucket === 'tres_froid') return 'Mission réconfort : boisson chaude.';

  const messages = {
    pluie: 'Une boisson réconfortante serait parfaite.',
    nuageux: 'Une boisson douce pour une météo calme.',
    vent: 'Une boisson énergisante pour tenir le rythme.',
    normal: 'Une boisson simple pour aujourd’hui.',
  };

  return messages[context] || messages.normal;
}

export function getWeatherIcon(context) {
  const icons = {
    chaud: '/icons/weather/sun.svg',
    soleil: '/icons/weather/sun.svg',
    froid: '/icons/weather/cold.svg',
    pluie: '/icons/weather/rain.svg',
    nuageux: '/icons/weather/cloud.svg',
    vent: '/icons/weather/wind.svg',
    normal: '/icons/weather/sun.svg',
  };

  return icons[context] || icons.normal;
}

export async function getAllActiveBoissons() {
  const url = new URL(`${API_BASE}/api/collections/boissons/records`);

  url.searchParams.set('filter', 'is_active = true');
  url.searchParams.set('expand', 'categorie');
  url.searchParams.set('perPage', '200');
  url.searchParams.set('sort', '-is_recommended,-is_new,nom_boisson');

  const response = await fetch(url);
  const data = await response.json();

  return data.items || [];
}

function getSeededVariation(boisson, location, context, bucket) {
  const now = new Date();
  const period = Math.floor(now.getHours() / 6);
  const key = `${boisson.id}-${location.city}-${context}-${bucket}-${now.toDateString()}-${period}`;

  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash % 12);
}

function scoreBoisson(boisson, weather, context, bucket, location) {
  let score = 0;

  const tags = Array.isArray(boisson.weather_context)
    ? boisson.weather_context
    : boisson.weather_context
      ? [boisson.weather_context]
      : [];

  const category = boisson.expand?.categorie?.nom_categorie?.toLowerCase() || '';

  if (tags.includes(context)) score += 35;
  if (tags.includes('normal')) score += 8;
  if (boisson.is_recommended) score += 10;
  if (boisson.is_new) score += 6;

  if (['tres_chaud', 'chaud'].includes(bucket)) {
    if (boisson.temperature_service === 'froid') score += 40;
    if (boisson.temperature_service === 'chaud') score -= 30;
    if (['fruite', 'baies', 'acidule', 'legume'].includes(boisson.profil_gout)) score += 10;
  }

  if (bucket === 'doux_chaud') {
    if (boisson.temperature_service === 'froid') score += 20;
    if (boisson.temperature_service === 'tempere') score += 16;
  }

  if (bucket === 'doux') {
    if (boisson.temperature_service === 'tempere') score += 20;
    if (boisson.temperature_service === 'chaud') score += 12;
    if (boisson.temperature_service === 'froid') score += 10;
  }

  if (['froid', 'tres_froid'].includes(bucket)) {
    if (boisson.temperature_service === 'chaud') score += 40;
    if (boisson.temperature_service === 'froid') score -= 18;
    if (['cremeux', 'epice', 'doux', 'amer'].includes(boisson.profil_gout)) score += 10;
  }

  if (context === 'pluie') {
    if (boisson.temperature_service === 'chaud') score += 28;
    if (category.includes('infusion') || category.includes('thé') || category.includes('café')) score += 12;
  }

  score += getSeededVariation(boisson, location, context, bucket);

  return score;
}

export async function getRecommendedBoissons(weather, context, bucket, location) {
  const boissons = await getAllActiveBoissons();

  return boissons
    .map((boisson) => ({
      ...boisson,
      recommendation_score: scoreBoisson(boisson, weather, context, bucket, location),
    }))
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 10);
}