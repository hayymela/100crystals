// ========================================
// 结晶百相 · 地理页面逻辑
// ========================================

let geoData = null;

async function loadGeography() {
  try {
    const res = await fetch('data/geography.json');
    geoData = await res.json();
  } catch(e) {
    console.log('Geography data load deferred');
  }
}

function openCityModal(cityId) {
  if (!geoData) { loadGeography().then(() => openCityModal(cityId)); return; }
  const city = geoData.geography.cities.find(c => c.id === cityId);
  if (!city) return;
  document.getElementById('cityName').textContent = city.name + (city.englishName ? ' · ' + city.englishName : '');
  document.getElementById('cityDesc').textContent = city.description;
  document.getElementById('cityModal').classList.add('active');
}

function closeCityModal() {
  document.getElementById('cityModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', loadGeography);
