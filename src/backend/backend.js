import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://api.ruslanabudniak.fr');

export function getFileUrl(record, fileName) {
  return pb.files.getURL(record, fileName);
}

export async function getBoissons() {
  const boissons = await pb.collection('boissons').getFullList({
    sort: '-created',
    expand: 'categories',
  });

  return boissons;
}

export async function getCategories() {
  const categories = await pb.collection('categories_boissons').getFullList({
    sort: 'ordre',
  });

  return categories;
}

export async function getBoissonsByWeather(weather) {
  const boissons = await pb.collection('boissons').getFullList({
    sort: '-is_recommended,temps_preparation',
    filter: `weather_context ?~ "${weather}"`,
    expand: 'categories',
  });

  return boissons;
}

export async function getBoissonsByQuiz(temperature, gout, sucre) {
  const boissons = await pb.collection('boissons').getFullList({
    sort: 'temps_preparation',
    filter: `
      temperature_service = "${temperature}" 
      && profil_gout = "${gout}" 
      && taux_sucre = "${sucre}"
    `,
    expand: 'categories',
  });

  return boissons;
}


export async function getWeatherByCoords(latitude, longitude) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set(
    'current',
    'temperature_2m,precipitation,rain,weather_code,wind_speed_10m,is_day'
  );
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erreur météo');
  }

  const data = await response.json();

  return data.current;
}

export function getWeatherContext(weather) {
  const temperature = weather.temperature_2m;
  const precipitation = weather.precipitation;
  const rain = weather.rain;
  const weatherCode = weather.weather_code;
  const windSpeed = weather.wind_speed_10m;

  if (precipitation > 0 || rain > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return 'pluie';
  }

  if (windSpeed >= 35) {
    return 'vent';
  }

  if (temperature >= 24) {
    return 'chaud';
  }

  if (temperature <= 10) {
    return 'froid';
  }

  if ([0, 1].includes(weatherCode)) {
    return 'soleil';
  }

  if ([2, 3, 45, 48].includes(weatherCode)) {
    return 'nuageux';
  }

  return 'normal';
}

export function getWeatherLabel(context) {
  const labels = {
    chaud: 'Chaud',
    froid: 'Froid',
    pluie: 'Pluvieux',
    soleil: 'Ensoleillé',
    nuageux: 'Nuageux',
    normal: 'Doux',
    vent: 'Venteux',
  };

  return labels[context] || 'Doux';
}

export function getWeatherMessage(context) {
  const messages = {
    chaud: 'Parfait pour une boisson fraîche !',
    soleil: 'Parfait pour une boisson fraîche !',
    froid: 'Parfait pour une boisson chaude !',
    pluie: 'Une boisson réconfortante serait parfaite.',
    nuageux: 'Une boisson douce pour une météo calme.',
    vent: 'Une boisson énergisante pour tenir le rythme.',
    normal: 'Une boisson simple et agréable pour aujourd’hui.',
  };

  return messages[context] || messages.normal;
}

export async function getRecommendedBoissonsByWeather(context) {
  const boissons = await pb.collection('boissons').getFullList({
    sort: '-is_recommended,temps_preparation',
    filter: `is_active = true && weather_context ?~ "${context}"`,
    expand: 'categories',
  });

  return boissons;
}

export async function registerUser({ name, email, password, avatar }) {
  const formData = new FormData();

  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('passwordConfirm', password);

  if (avatar) {
    formData.append('avatar', avatar);
  }

  return await pb.collection('users').create(formData);
}

export async function loginUser(email, password) {
  return await pb.collection('users').authWithPassword(email, password);
}

export function logoutUser() {
  pb.authStore.clear();
}

export function getCurrentUser() {
  return pb.authStore.model;
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}

export async function updateUserProfile(userId, { name, avatar }) {
  const formData = new FormData();

  if (name) formData.append('name', name);
  if (avatar) formData.append('avatar', avatar);

  return await pb.collection('users').update(userId, formData);
}

export async function deleteUserAccount(userId) {
  return await pb.collection('users').delete(userId);
}

