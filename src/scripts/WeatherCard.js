import { API_BASE } from './weatherLogic.js';

function getBoissonImageUrl(boisson) {
  const fileName = Array.isArray(boisson.photo_boisson)
    ? boisson.photo_boisson[0]
    : boisson.photo_boisson;

  return fileName
    ? `${API_BASE}/api/files/${boisson.collectionId}/${boisson.id}/${fileName}`
    : '/images/placeholder-drink.png';
}

export function renderWeatherCards(boissons) {
  return boissons.map((boisson) => {
    const imageUrl = getBoissonImageUrl(boisson);

    return `
      <article class="min-w-full px-1 md:px-14">
        <div class="relative mx-auto mt-[115px] max-w-[310px] md:mt-[170px] md:max-w-[760px]">
          <div class="weather-card-back"></div>

          <img
            class="pointer-events-none absolute right-[-42px] top-[-150px] z-20 h-[210px] w-[170px] object-contain drop-shadow-2xl md:right-[-55px] md:top-[-260px] md:h-[390px] md:w-[320px]"
            src="${imageUrl}"
            alt="${boisson.nom_boisson}"
          />

          <div class="weather-card-main z-10 min-h-[260px] p-5 md:min-h-[260px] md:p-8">
            <div class="max-w-[190px] md:max-w-[520px]">
              <p class="flex items-center gap-2 text-[13px] font-bold text-black md:text-[16px]">
                <img src="/icons/weather/sun-icon.svg" class="h-4 w-4" alt="" />
                Notre recommandation
              </p>

              <h3 class="mt-4 text-[23px] font-black leading-[1.1] text-black md:text-[34px]">
                ${boisson.nom_boisson}
              </h3>

              <p class="mt-4 text-[14px] font-bold leading-6 text-neutral-400 md:max-w-[420px] md:text-[17px]">
                ${boisson.description_courte || ''}
              </p>
            </div>

            <div class="absolute bottom-5 right-4 rounded-2xl bg-white p-3 text-[11px] font-bold text-black shadow-soft md:bottom-8 md:right-8 md:text-[14px]">
              <p class="flex items-center gap-2">
                <img src="/icons/weather/clock.svg" class="h-4 w-4" alt="" />
                ${boisson.temps_preparation || 5} min
              </p>

              <p class="mt-3 flex items-center gap-2">
                <img src="/icons/weather/level.svg" class="h-4 w-4" alt="" />
                ${boisson.difficulte || 'facile'}
              </p>

              <p class="mt-3 flex items-center gap-2">
                <img src="/icons/weather/vegan.svg" class="h-4 w-4" alt="" />
                ${boisson.is_vegan ? 'Vegan' : 'Non vegan'}
              </p>
            </div>

            <a
              href="/boissons/${boisson.slug}"
              class="mt-5 inline-flex items-center gap-3 rounded-full bg-brand-turquoise px-7 py-3 text-[14px] font-black text-black shadow-button transition hover:scale-105 md:text-[15px]"
            >
              Voir la recette
              <img src="/icons/weather/arrow-right.svg" class="h-3 w-3" alt="" />
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}