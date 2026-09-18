// ========================================
// 结晶百相 · 公共功能模块
// ========================================

// ---- 主题切换 ----
function initTheme() {
  const saved = localStorage.getItem('crystal-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('crystal-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
}

// ---- 移动端导航 ----
function toggleNav() {
  const links = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (links) links.classList.toggle('active');
  if (hamburger) hamburger.classList.toggle('active');
}

// ---- 回到顶部 ----
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Lightbox 图片放大 ----
function openLightbox(src, alt) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = '<img>';
    lb.addEventListener('click', () => lb.classList.remove('active'));
    document.body.appendChild(lb);
  }
  lb.querySelector('img').src = src;
  lb.querySelector('img').alt = alt || '';
  lb.classList.add('active');
}

// ---- 搜索功能 ----
let searchData = [];
async function loadSearchData() {
  try {
    const [chars, geo] = await Promise.all([
      fetch('data/characters.json').then(r => r.json()),
      fetch('data/geography.json').then(r => r.json())
    ]);
    searchData = [];
    (chars.characters || []).forEach(c => {
      searchData.push({ type: '角色', name: c.name + (c.codename ? '「' + c.codename + '」' : ''), desc: c.symbioteMaterial + '共生者', url: 'characters.html#' + c.id });
    });
    (geo.geography?.cities || []).forEach(c => {
      searchData.push({ type: '地名', name: c.name, desc: c.englishName || '', url: 'geography.html#' + c.id });
    });
    for (let i = 1; i <= 26; i++) {
      searchData.push({ type: '章节', name: '第' + i + '章', desc: '', url: 'novel.html#ch' + i });
    }
  } catch(e) { console.log('Search data load deferred'); }
}

function initSearch() {
  const input = document.getElementById('navSearch');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;
  loadSearchData();
  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 1) { results.classList.remove('active'); return; }
    const matches = searchData.filter(s => s.name.includes(q) || (s.desc && s.desc.includes(q))).slice(0, 10);
    if (matches.length === 0) { results.innerHTML = '<div class="search-result-item"><span class="search-result-name">无匹配结果</span></div>'; }
    else {
      results.innerHTML = matches.map(m =>
        `<div class="search-result-item" onclick="window.location.href='${m.url}'">
          <span class="search-result-type">${m.type}</span>
          <div class="search-result-name">${m.name}</div>
          <div class="search-result-desc">${m.desc}</div>
        </div>`
      ).join('');
    }
    results.classList.add('active');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-search')) results.classList.remove('active');
  });
}

// ---- 页面初始化 ----
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollTop();
  initSearch();
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleNav);
});
