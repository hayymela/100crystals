// ========================================
// 结晶百相 · 角色图鉴逻辑
// ========================================

let characters = [];
let activeFaction = 'all';
let activeMaterial = 'all';

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
  card.innerHTML = `
    <div style="position:relative;">
      <img class="char-card-img" src="${c.imageUrl}" alt="${c.name}" onerror="this.src='assets/characters/institute1.png'">
      <span class="char-card-faction faction-${c.faction}">${factionLabels[c.faction] || c.faction}</span>
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
  const modal = document.getElementById('charModal');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <img class="modal-img" src="${c.imageUrl}" alt="${c.name}" onerror="this.src='assets/characters/institute1.png'" onclick="openLightbox('${c.imageUrl}','${c.name}')">
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

function closeModal() {
  document.getElementById('charModal').classList.remove('active');
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

document.addEventListener('DOMContentLoaded', loadCharacters);
