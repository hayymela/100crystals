// ========================================
// 结晶百相 · 角色图鉴逻辑
// ========================================

let characters = [];
let activeFaction = 'all';
let activeMaterial = 'all';
let currentChar = null;
let currentImageIndex = 0;

const factionLabels = {
  miners: 'Miners', tenabirui: '特纳比睿', institute: '地质学研究所',
  finalfront: '最终阵线', other: '其他'
};

async function loadCharacters() {
  try {
    const res = await fetch('data/characters.json');
    const data = await res.json();
    characters = data.characters;
    renderCharacters();
  } catch(e) {
    document.getElementById('charGrid').innerHTML = '<p>加载失败</p>';
  }
}

function renderCharacters() {
  const grid = document.getElementById('charGrid');
  const factionOrder = ['miners','tenabirui','institute','other'];
  const filtered = characters.filter(c => {
    const fMatch = activeFaction === 'all' || c.faction === activeFaction;
    const mMatch = activeMaterial === 'all' || c.symbioteMaterial.includes(activeMaterial);
    return fMatch && mMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-dim);grid-column:1/-1;text-align:center;">没有匹配的角色</p>';
    return;
  }

  if (activeFaction === 'all') {
    // 按阵营分组
    grid.innerHTML = '';
    factionOrder.forEach(f => {
      const factionChars = filtered.filter(c => c.faction === f);
      if (factionChars.length === 0) return;
      const groupDiv = document.createElement('div');
      groupDiv.style.gridColumn = '1 / -1';
      groupDiv.innerHTML = `<h3 style="color:var(--accent-light);margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">${factionLabels[f]}（${factionChars.length}人）</h3>`;
      grid.appendChild(groupDiv);
      factionChars.forEach(c => grid.appendChild(createCard(c)));
    });
  } else {
    grid.innerHTML = '';
    filtered.forEach(c => grid.appendChild(createCard(c)));
  }
}

function createCard(c) {
  const card = document.createElement('div');
  card.className = 'char-card';
  card.onclick = () => openModal(c);
  const imgCount = (c.images && c.images.length) || 0;
  card.innerHTML = `
    <div style="position:relative;">
      <img class="char-card-img" src="${c.imageUrl}" alt="${c.name}" onerror="this.src='assets/characters/institute1.png'">
      <span class="char-card-faction faction-${c.faction}">${factionLabels[c.faction] || c.faction}</span>
      ${imgCount > 1 ? `<span class="char-img-count">${imgCount}图</span>` : ''}
    </div>
    <div class="char-card-body">
      <div class="char-card-name">${c.name}</div>
      ${c.codename ? `<div class="char-card-code">代号「${c.codename}」</div>` : ''}
      <div class="char-card-material">${c.symbioteMaterial}共生者</div>
    </div>
  `;
  return card;
}

function openModal(c) {
  currentChar = c;
  currentImageIndex = 0;
  const modal = document.getElementById('charModal');
  const body = document.getElementById('modalBody');
  const images = c.images && c.images.length > 0 ? c.images : [{ url: c.imageUrl, caption: '立绘' }];
  const isMulti = images.length > 1;

  body.innerHTML = `
    <div class="modal-gallery">
      <div class="gallery-main">
        <img id="galleryMainImg" class="modal-img" src="${images[0].url}" alt="${c.name}"
             onerror="this.src='assets/characters/institute1.png'"
             onclick="openLightbox(this.src,'${c.name}')">
        ${isMulti ? `
          <button class="gallery-arrow gallery-prev" onclick="changeImage(-1)" aria-label="上一张">‹</button>
          <button class="gallery-arrow gallery-next" onclick="changeImage(1)" aria-label="下一张">›</button>
          <div class="gallery-counter"><span id="galleryCurrent">1</span> / ${images.length}</div>
        ` : ''}
      </div>
      <div class="gallery-caption">
        <div class="gallery-caption-title" id="galleryCaptionTitle">${images[0].caption || ''}</div>
        <div class="gallery-caption-desc" id="galleryCaptionDesc">${images[0].description || ''}</div>
      </div>
      ${isMulti ? `
        <div class="gallery-thumbs">
          ${images.map((img, i) => `
            <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="setImage(${i})" title="${img.caption || ''}">
              <img src="${img.url}" alt="${img.caption || ''}" onerror="this.src='assets/characters/institute1.png'">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    <div class="modal-info">
      <div class="modal-name">${c.name}${c.codename ? ' · 代号「' + c.codename + '」' : ''}</div>
      <span class="char-card-faction faction-${c.faction}" style="position:static;margin-top:8px;display:inline-block;">${factionLabels[c.faction] || c.faction}</span>
      <div class="modal-row" style="margin-top:16px;">
        <span class="modal-label">共生物质</span>
        <span class="modal-value">${c.symbioteMaterial}</span>
      </div>
      <div class="modal-row">
        <span class="modal-label">身份</span>
        <span class="modal-value">${c.identity || '—'}</span>
      </div>
      ${c.age ? `<div class="modal-row"><span class="modal-label">年龄</span><span class="modal-value">${c.age}</span></div>` : ''}
      ${c.squad ? `<div class="modal-row"><span class="modal-label">所属小队</span><span class="modal-value">${c.squad}</span></div>` : ''}
      ${c.stationedAt ? `<div class="modal-row"><span class="modal-label">驻扎地</span><span class="modal-value">${c.stationedAt}</span></div>` : ''}
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <div class="modal-label" style="margin-bottom:6px;">人物简介</div>
        <p style="font-size:0.9em;line-height:1.8;color:var(--text);">${c.description}</p>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function changeImage(delta) {
  if (!currentChar || !currentChar.images) return;
  const images = currentChar.images;
  currentImageIndex = (currentImageIndex + delta + images.length) % images.length;
  updateGalleryImage();
}

function setImage(index) {
  if (!currentChar || !currentChar.images) return;
  currentImageIndex = index;
  updateGalleryImage();
}

function updateGalleryImage() {
  const images = currentChar.images;
  const img = document.getElementById('galleryMainImg');
  const counter = document.getElementById('galleryCurrent');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const captionTitle = document.getElementById('galleryCaptionTitle');
  const captionDesc = document.getElementById('galleryCaptionDesc');

  if (img && images[currentImageIndex]) {
    img.src = images[currentImageIndex].url;
  }
  if (counter) {
    counter.textContent = currentImageIndex + 1;
  }
  if (captionTitle && images[currentImageIndex]) {
    captionTitle.textContent = images[currentImageIndex].caption || '';
  }
  if (captionDesc && images[currentImageIndex]) {
    captionDesc.textContent = images[currentImageIndex].description || '';
  }
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentImageIndex);
  });
}

function closeModal() {
  document.getElementById('charModal').classList.remove('active');
  currentChar = null;
  currentImageIndex = 0;
}

function filterCharacters(type, value) {
  if (type === 'faction') {
    activeFaction = value;
    document.querySelectorAll('[data-faction]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.faction === value);
    });
  } else {
    activeMaterial = value;
    document.querySelectorAll('[data-material]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.material === value);
    });
  }
  renderCharacters();
}

// 键盘导航
document.addEventListener('keydown', e => {
  const modal = document.getElementById('charModal');
  if (!modal || !modal.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') changeImage(-1);
  if (e.key === 'ArrowRight') changeImage(1);
  if (e.key === 'Escape') closeModal();
});

// 点击弹窗背景关闭
document.addEventListener('click', e => {
  const modal = document.getElementById('charModal');
  if (modal && modal.classList.contains('active') && e.target === modal) {
    closeModal();
  }
});

function viewFactionMembers(faction) {
  filterCharacters('faction', faction);
  setTimeout(() => {
    document.getElementById('charGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

document.addEventListener('DOMContentLoaded', loadCharacters);
