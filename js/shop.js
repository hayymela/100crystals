// ========================================
// 结晶百相 · 周边商城逻辑
// ========================================

let products = [];
let characters = [];
let statusLabels = {};
let activeCategory = 'all';
let activeStatus = 'all';
let activeSort = 'default';
let currentProduct = null;
let currentShopImageIndex = 0;

async function loadShopData() {
  try {
    const [shopRes, charRes] = await Promise.all([
      fetch('data/shop.json'),
      fetch('data/characters.json')
    ]);
    const shopData = await shopRes.json();
    const charData = await charRes.json();

    products = shopData.products;
    characters = charData.characters;
    statusLabels = shopData.statusLabels;

    renderCategoryFilters(shopData.categories);
    renderProducts();
  } catch(e) {
    console.error('Shop data load error:', e);
    document.getElementById('shopGrid').innerHTML = '<p style="color:var(--danger);">商品数据加载失败</p>';
  }
}

function renderCategoryFilters(categories) {
  const container = document.getElementById('categoryFilters');
  container.innerHTML = categories.map(cat =>
    `<button class="filter-btn ${cat === '全部' ? 'active' : ''}" data-cat="${cat}" onclick="filterProducts('category','${cat}')">${cat}</button>`
  ).join('');
}

function getCharById(id) {
  return characters.find(c => c.id === id);
}

function renderProducts() {
  const grid = document.getElementById('shopGrid');
  let filtered = products.filter(p => {
    const catMatch = activeCategory === 'all' || activeCategory === '全部' || p.category === activeCategory;
    const statusMatch = activeStatus === 'all' || p.status === activeStatus;
    return catMatch && statusMatch;
  });

  if (activeSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-dim);grid-column:1/-1;text-align:center;">没有匹配的商品</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => createProductCard(p)).join('');
}

function createProductCard(p) {
  const statusInfo = getStatusInfo(p.status);
  const charTags = (p.characterIds || []).map(id => {
    const c = getCharById(id);
    return c ? `<span class="shop-char-tag" onclick="event.stopPropagation();location.href='characters.html#${id}'">${c.name}</span>` : '';
  }).join('');

  const priceHtml = p.originalPrice
    ? `<span class="shop-price-cur">¥${p.price}</span><span class="shop-price-orig">¥${p.originalPrice}</span>`
    : `<span class="shop-price-cur">¥${p.price}</span>`;

  const stockHtml = p.status === 'onsale' && p.stock <= 10
    ? `<span class="shop-stock-low">仅剩${p.stock}件</span>`
    : p.status === 'onsale' && p.stock > 0
      ? `<span class="shop-stock">库存${p.stock}件</span>`
      : '';

  return `
    <div class="shop-card" onclick="openShopModal('${p.id}')">
      <div class="shop-card-img-wrap">
        <img class="shop-card-img" src="${p.image}" alt="${p.name}" onerror="this.src='assets/characters/institute1.png'">
        <span class="shop-status-badge shop-status-${p.status}">${statusInfo.label}</span>
        ${(p.images && p.images.length > 1) ? `<span class="shop-img-count">${p.images.length}图</span>` : ''}
      </div>
      <div class="shop-card-body">
        <div class="shop-card-name">${p.name}</div>
        <div class="shop-card-cat">${p.category}</div>
        <div class="shop-card-price">${priceHtml}</div>
        ${stockHtml ? `<div class="shop-card-stock">${stockHtml}</div>` : ''}
        ${charTags ? `<div class="shop-card-chars">${charTags}</div>` : ''}
      </div>
    </div>
  `;
}

function getStatusInfo(status) {
  return { label: statusLabels[status] || status };
}

function openShopModal(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;

  currentProduct = p;
  currentShopImageIndex = 0;

  const statusInfo = getStatusInfo(p.status);
  const modal = document.getElementById('shopModal');
  const body = document.getElementById('shopModalBody');

  const images = (p.images && p.images.length > 0) ? p.images : [{ url: p.image, caption: '商品主图', description: p.name + '的展示图。' }];
  const isMulti = images.length > 1;

  const priceHtml = p.originalPrice
    ? `<span class="shop-price-cur" style="font-size:1.5em;">¥${p.price}</span><span class="shop-price-orig" style="font-size:1em;">¥${p.originalPrice}</span>`
    : `<span class="shop-price-cur" style="font-size:1.5em;">¥${p.price}</span>`;

  const specsHtml = (p.specs || []).map(s => `<li>${s}</li>`).join('');

  const charsHtml = (p.characterIds || []).map(id => {
    const c = getCharById(id);
    if (!c) return '';
    return `
      <div class="shop-linked-char" onclick="location.href='characters.html#${c.id}'">
        <img class="shop-linked-char-img" src="${c.imageUrl}" alt="${c.name}" onerror="this.src='assets/characters/institute1.png'">
        <div class="shop-linked-char-info">
          <div class="shop-linked-char-name">${c.name}${c.codename ? ' · 代号「' + c.codename + '」' : ''}</div>
          <div class="shop-linked-char-desc">${c.symbioteMaterial}共生者 · ${c.identity || ''}</div>
        </div>
        <span class="shop-linked-char-arrow">→</span>
      </div>
    `;
  }).join('');

  const stockInfo = p.status === 'onsale'
    ? (p.stock > 0 ? `<span class="shop-modal-stock">库存 ${p.stock} 件</span>` : '')
    : p.status === 'presale'
      ? '<span class="shop-modal-stock">预售商品，预计下月发货</span>'
      : '<span class="shop-modal-stock">已售罄，等待补货</span>';

  body.innerHTML = `
    <div class="shop-modal-grid">
      <div class="shop-modal-gallery">
        <div class="shop-modal-img-wrap">
          <img class="shop-modal-img" id="shopGalleryMainImg" src="${images[0].url}" alt="${p.name}" onclick="openLightbox(this.src,'${p.name}')" onerror="this.src='assets/characters/institute1.png'">
          ${isMulti ? `
            <button class="gallery-arrow gallery-prev" onclick="changeShopImage(-1)" aria-label="上一张">‹</button>
            <button class="gallery-arrow gallery-next" onclick="changeShopImage(1)" aria-label="下一张">›</button>
            <div class="gallery-counter"><span id="shopGalleryCurrent">1</span> / ${images.length}</div>
          ` : ''}
          <span class="shop-status-badge shop-status-${p.status}" style="position:absolute;top:12px;left:12px;">${statusInfo.label}</span>
        </div>
        ${isMulti ? `
          <div class="gallery-caption">
            <div class="gallery-caption-title" id="shopGalleryCaptionTitle">${images[0].caption || ''}</div>
            <div class="gallery-caption-desc" id="shopGalleryCaptionDesc">${images[0].description || ''}</div>
          </div>
          <div class="gallery-thumbs">
            ${images.map((img, i) => `
              <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="setShopImage(${i})" title="${img.caption || ''}">
                <img src="${img.url}" alt="${img.caption || ''}" onerror="this.src='assets/characters/institute1.png'">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="shop-modal-info">
        <div class="shop-modal-name">${p.name}</div>
        <div class="shop-modal-cat">分类：${p.category}</div>
        <div class="shop-modal-price">${priceHtml}</div>
        ${stockInfo}
        <div class="shop-modal-desc">${p.description}</div>
        ${specsHtml ? `<div class="shop-modal-specs"><div class="shop-modal-specs-title">商品规格</div><ul>${specsHtml}</ul></div>` : ''}
        ${(p.tags || []).length ? `<div class="shop-modal-tags">${p.tags.map(t => `<span class="shop-tag">${t}</span>`).join('')}</div>` : ''}
        ${charsHtml ? `
          <div class="shop-modal-chars">
            <div class="shop-modal-chars-title">关联角色</div>
            ${charsHtml}
          </div>
        ` : '<div class="shop-modal-chars-empty">本商品暂无关联角色</div>'}
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function changeShopImage(delta) {
  if (!currentProduct || !currentProduct.images) return;
  const images = currentProduct.images;
  currentShopImageIndex = (currentShopImageIndex + delta + images.length) % images.length;
  updateShopGalleryImage();
}

function setShopImage(index) {
  if (!currentProduct || !currentProduct.images) return;
  currentShopImageIndex = index;
  updateShopGalleryImage();
}

function updateShopGalleryImage() {
  const images = currentProduct.images;
  const img = document.getElementById('shopGalleryMainImg');
  const counter = document.getElementById('shopGalleryCurrent');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const captionTitle = document.getElementById('shopGalleryCaptionTitle');
  const captionDesc = document.getElementById('shopGalleryCaptionDesc');

  if (img && images[currentShopImageIndex]) {
    img.src = images[currentShopImageIndex].url;
  }
  if (counter) {
    counter.textContent = currentShopImageIndex + 1;
  }
  if (captionTitle && images[currentShopImageIndex]) {
    captionTitle.textContent = images[currentShopImageIndex].caption || '';
  }
  if (captionDesc && images[currentShopImageIndex]) {
    captionDesc.textContent = images[currentShopImageIndex].description || '';
  }
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentShopImageIndex);
  });
}

function closeShopModal() {
  document.getElementById('shopModal').classList.remove('active');
}

function filterProducts(type, value) {
  if (type === 'category') {
    activeCategory = value;
    document.querySelectorAll('[data-cat]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === value);
    });
  } else if (type === 'status') {
    activeStatus = value;
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === value);
    });
  }
  renderProducts();
}

function sortProducts(sort) {
  activeSort = sort;
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === sort);
  });
  renderProducts();
}

// 点击弹窗背景关闭
document.addEventListener('click', e => {
  const modal = document.getElementById('shopModal');
  if (modal && modal.classList.contains('active') && e.target === modal) {
    closeShopModal();
  }
});

// ESC 关闭 / 方向键切换图片
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeShopModal();
  const modal = document.getElementById('shopModal');
  if (!modal || !modal.classList.contains('active')) return;
  if (e.key === 'ArrowLeft') changeShopImage(-1);
  if (e.key === 'ArrowRight') changeShopImage(1);
});

document.addEventListener('DOMContentLoaded', loadShopData);
