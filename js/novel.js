// ========================================
// 结晶百相 · 小说阅读页逻辑
// ========================================

let novelData = null;
let currentChapter = 1;

async function loadNovel() {
  try {
    const res = await fetch('data/novel.json');
    novelData = await res.json();
    const novel = novelData.novel;
    renderChapterList(novel.chapters);

    // 从localStorage恢复阅读位置
    const saved = localStorage.getItem('crystal-reading');
    if (saved) {
      const pos = JSON.parse(saved);
      currentChapter = pos.chapter || 1;
    }

    // 从URL hash获取章节
    const hash = location.hash.match(/ch(\d+)/);
    if (hash) currentChapter = parseInt(hash[1]);

    renderChapter(currentChapter);
  } catch(e) {
    document.getElementById('novelContent').innerHTML = '<p>加载失败，请确保通过本地服务器访问。</p>';
    console.error('Novel load error:', e);
  }
}

function renderChapterList(chapters) {
  const list = document.getElementById('chapterList');
  list.innerHTML = chapters.map(ch =>
    `<li class="chapter-item" data-ch="${ch.id}" onclick="goToChapter(${ch.id})">
      <span class="chapter-num">${ch.id}.</span>${ch.title}
    </li>`
  ).join('');
}

function renderChapter(chNum) {
  const novel = novelData.novel;
  const chapter = novel.chapters.find(c => c.id === chNum);
  if (!chapter) return;

  currentChapter = chNum;

  // 更新URL
  history.replaceState(null, null, '#ch' + chNum);

  // 更新侧边栏高亮
  document.querySelectorAll('.chapter-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.ch) === chNum);
  });

  // 滚动侧边栏到当前章节
  const activeItem = document.querySelector('.chapter-item.active');
  if (activeItem) activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' });

  // 渲染内容
  const content = document.getElementById('novelContent');
  const paragraphs = chapter.content.split('\n').filter(l => l.trim());
  content.innerHTML = `<h2>${chapter.fullTitle}</h2>` +
    paragraphs.map(p => `<p>${p}</p>`).join('');

  // 更新按钮状态
  document.getElementById('prevChapter').disabled = chNum <= 1;
  document.getElementById('nextChapter').disabled = chNum >= novel.totalChapters;

  // 保存阅读位置
  localStorage.setItem('crystal-reading', JSON.stringify({ chapter: chNum }));

  // 回到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 关闭移动端侧边栏
  document.getElementById('novelSidebar').classList.remove('active');
}

function goToChapter(num) {
  renderChapter(num);
}

function changeChapter(delta) {
  const next = currentChapter + delta;
  if (next >= 1 && next <= novelData.novel.totalChapters) {
    renderChapter(next);
  }
}

function toggleSidebar() {
  document.getElementById('novelSidebar').classList.toggle('active');
}

// 阅读设置
function setFontSize(size) {
  document.documentElement.style.setProperty('--reading-font-size', size + 'px');
  localStorage.setItem('crystal-font-size', size);
  document.querySelectorAll('[data-font]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.font) === size);
  });
}

function setLineHeight(height) {
  document.documentElement.style.setProperty('--reading-line-height', height);
  localStorage.setItem('crystal-line-height', height);
  document.querySelectorAll('[data-line]').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.line) === height);
  });
}

// 恢复阅读设置
function restoreSettings() {
  const fontSize = parseInt(localStorage.getItem('crystal-font-size')) || 17;
  const lineHeight = parseFloat(localStorage.getItem('crystal-line-height')) || 1.8;
  setFontSize(fontSize);
  setLineHeight(lineHeight);
}

// 键盘导航
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft' && currentChapter > 1) changeChapter(-1);
  if (e.key === 'ArrowRight' && currentChapter < 26) changeChapter(1);
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  restoreSettings();
  loadNovel();
});
