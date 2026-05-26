// ── State ──
let slideCount = 0;
let userText = '';
let selectedStyle = 0;
let slidesData = [];
let editingIndex = -1;

let _editImgData = null;
let _editImgW = 80;
let customBg = null;

const SLIDE_SIZE = 320;
const DEFAULT_IMG_W = 80;
const DEFAULT_IMG_MARGIN = 18;
const PROJECTS_STORAGE_KEY = 'carouselBuilderProjects';

function getDefaultImgPosition(imgW = DEFAULT_IMG_W) {
  return {
    x: Math.max(0, SLIDE_SIZE - imgW - DEFAULT_IMG_MARGIN),
    y: DEFAULT_IMG_MARGIN
  };
}

const styleNames = ['White Volt', 'Soft Glass', 'Violet Punch', 'Graphite Neon', 'Dark Pulse'];
const styleClass = ['sA','sB','sD','sE','sC'];

// ── Screen navigation ──
function goScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen' + n).classList.add('active');
  window.scrollTo(0,0);
}

// ── Projects ──
function getProjectTitle() {
  const fromFirstSlide = (slidesData[0] && slidesData[0].headline || '').trim();
  const fromText = (userText || '').split('\n').map(s => s.trim()).find(Boolean) || '';
  return (fromFirstSlide || fromText || 'Без названия').slice(0, 64);
}

function readSavedProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Cannot read saved projects:', e);
    return [];
  }
}

function writeSavedProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (e) {
    console.error('Cannot save projects:', e);
    return false;
  }
}

function getCurrentProjectSnapshot() {
  return {
    id: `project_${Date.now()}`,
    title: getProjectTitle(),
    updatedAt: new Date().toISOString(),
    slideCount,
    userText,
    selectedStyle,
    customBg,
    slidesData: slidesData.map(slide => ({ ...slide }))
  };
}

function saveProject() {
  if (!slidesData.length) {
    showProjectToast('Нет слайдов для сохранения');
    return;
  }

  const project = getCurrentProjectSnapshot();
  const projects = readSavedProjects();
  const sameTitleIndex = projects.findIndex(p => p.title === project.title);

  if (sameTitleIndex >= 0) {
    project.id = projects[sameTitleIndex].id;
    projects[sameTitleIndex] = project;
  } else {
    projects.unshift(project);
  }

  if (!writeSavedProjects(projects)) {
    showProjectToast('Не хватает места для сохранения');
    return;
  }
  renderProjectsList();
  showProjectToast('Проект сохранён');
}

function saveProjectFromModal() {
  if (editingIndex >= 0) applyEdit(false);
  saveProject();
  closeModal();
}

function openProjectsScreen() {
  renderProjectsList();
  goScreen(5);
}

function loadProject(projectId) {
  const project = readSavedProjects().find(p => p.id === projectId);
  if (!project) return;

  slideCount = project.slideCount || project.slidesData.length || 0;
  userText = project.userText || '';
  selectedStyle = styleClass[project.selectedStyle] ? project.selectedStyle : 0;
  customBg = project.customBg || null;
  slidesData = Array.isArray(project.slidesData) ? project.slidesData.map(slide => ({ ...slide })) : [];

  document.getElementById('countNum').textContent = slideCount;
  document.getElementById('btn1Confirm').disabled = slideCount === 0;
  document.getElementById('mainTextarea').value = userText;
  updateStyleDots();
  renderStylePreview();
  syncBgPreview();
  renderAllSlides();
  goScreen(4);
}

function deleteProject(projectId) {
  const projects = readSavedProjects().filter(p => p.id !== projectId);
  writeSavedProjects(projects);
  renderProjectsList();
}

function startNewProject() {
  slideCount = 0;
  userText = '';
  selectedStyle = 0;
  slidesData = [];
  editingIndex = -1;
  _editImgData = null;
  _editImgW = DEFAULT_IMG_W;
  customBg = null;

  document.getElementById('countNum').textContent = '0';
  document.getElementById('btn1Confirm').disabled = true;
  document.getElementById('mainTextarea').value = '';
  document.getElementById('bgFileInput').value = '';
  updateStyleDots();
  renderStylePreview();
  syncBgPreview();
  goScreen(1);
}

function formatProjectDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderProjectsList() {
  const list = document.getElementById('projectsList');
  if (!list) return;

  const projects = readSavedProjects();
  if (!projects.length) {
    list.innerHTML = `
      <div class="projects-empty">
        Пока нет сохранённых проектов. Собери карусель и нажми «Сохранить проект».
      </div>`;
    return;
  }

  list.innerHTML = projects.map(project => `
    <div class="project-card">
      <div>
        <div class="project-title">${escapeHtml(project.title || 'Без названия')}</div>
        <div class="project-meta">${project.slideCount || 0} слайдов · ${escapeHtml(styleNames[project.selectedStyle] || 'Стиль')} · ${formatProjectDate(project.updatedAt)}</div>
      </div>
      <div class="project-actions">
        <button class="btn-secondary" onclick="loadProject('${project.id}')">Открыть</button>
        <button class="project-delete-btn" onclick="deleteProject('${project.id}')" title="Удалить">×</button>
      </div>
    </div>
  `).join('');
}

function showProjectToast(text) {
  let toast = document.getElementById('projectToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'projectToast';
    toast.className = 'project-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function syncBgPreview() {
  const wrap = document.getElementById('bgPreviewWrap');
  const btn = document.getElementById('bgUploadBtn');
  const thumb = document.getElementById('bgPreviewThumb');
  const name = document.getElementById('bgPreviewName');

  if (customBg) {
    thumb.src = customBg;
    name.textContent = 'Сохранённый фон';
    wrap.style.display = 'flex';
    btn.style.display = 'none';
  } else {
    thumb.src = '';
    wrap.style.display = 'none';
    btn.style.display = 'flex';
  }
}

// ── Screen 1: count ──
function changeCount(d) {
  slideCount = Math.max(0, Math.min(20, slideCount + d));
  document.getElementById('countNum').textContent = slideCount;
  document.getElementById('btn1Confirm').disabled = slideCount === 0;
}

// ── Screen 2: text input ──
function submitText() {
  const val = document.getElementById('mainTextarea').value.trim();
  if (!val) return;
  userText = val;
  goScreen(3);
  renderStylePreview();
}

function fillSample() {
  document.getElementById('mainTextarea').value = `Даже мощный ноутбук со временем может начать лагать

Перегрев и троттлинг
Вентиляция забивается пылью, а термопаста со временем высыхает. Из-за перегрева процессор начинает снижать мощность, чтобы не сгореть.
Решение: почистить ноутбук от пыли и заменить термопасту.

Фоновые программы
Некоторые приложения работают скрыто и перегружают систему.
Решение: открыть «Диспетчер задач» и убрать лишние программы из автозагрузки.

Нехватка места на SSD
Если накопитель заполнен больше чем на 80–90%, скорость работы заметно падает.
Решение: освободить место или перенести файлы на внешний диск.

Вирусы и мусор
Майнеры, рекламные программы и переполненный кэш тоже могут вызывать лаги.
Решение: проверить систему антивирусом и очистить лишние файлы.

Обновления Windows
Иногда система загружает или устанавливает обновления в фоне.

А ваш ноутбук летает или уже «думает» по 5 минут?`;
}

// ── Custom background ──
function handleBgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    customBg = ev.target.result;
    document.getElementById('bgPreviewThumb').src = customBg;
    document.getElementById('bgPreviewName').textContent = file.name;
    document.getElementById('bgPreviewWrap').style.display = 'flex';
    document.getElementById('bgUploadBtn').style.display = 'none';
    renderStylePreview();
  };
  reader.readAsDataURL(file);
}

function removeBg() {
  customBg = null;
  document.getElementById('bgPreviewWrap').style.display = 'none';
  document.getElementById('bgUploadBtn').style.display = 'flex';
  document.getElementById('bgFileInput').value = '';
  renderStylePreview();
}

// ── Screen 3: style picker ──
function changeStyle(d) {
  selectedStyle = (selectedStyle + d + styleClass.length) % styleClass.length;
  renderStylePreview();
  updateStyleDots();
}

function setStyle(i) {
  if (!styleClass[i]) return;
  selectedStyle = i;
  renderStylePreview();
  updateStyleDots();
}

function updateStyleDots() {
  document.querySelectorAll('.sdot').forEach((d,i) => d.classList.toggle('active', i===selectedStyle));
  document.getElementById('styleName').textContent = styleNames[selectedStyle];
}

function renderStylePreview() {
  const wrap = document.getElementById('stylePreview');
  const sc = styleClass[selectedStyle];
  wrap.innerHTML = buildSlideHTML({
    badge: 'ТЕХНОТОЧКА',
    headline: 'Сильный хук',
    body: 'Короткий текст, который быстро считывается в ленте.',
    fix: 'Акцент, выгода или CTA здесь',
    num: '1 / 5'
  }, sc, true);
  document.getElementById('styleName').textContent = styleNames[selectedStyle];
}

// ── Edit modal ──
function openEdit(i) {
  editingIndex = i;
  const d = slidesData[i];
  document.getElementById('editBadge').value = d.badge || '';
  document.getElementById('editHeadline').value = d.headline || '';
  document.getElementById('editBody').value = d.body || '';
  document.getElementById('editFix').value = d.fix || '';

  _editImgData = d.img || null;
  _editImgW = d.imgW ?? DEFAULT_IMG_W;
  document.getElementById('imgSizeRange').value = _editImgW;
  document.getElementById('imgSizeVal').textContent = _editImgW + 'px';
  _renderImgZone();

  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editingIndex = -1;
}

function applyEdit(closeAfter = true) {
  if (editingIndex < 0) return;
  const prev = slidesData[editingIndex];
  const defaultImgPos = getDefaultImgPosition(_editImgW);
  const hadImg = Boolean(prev.img);
  slidesData[editingIndex] = {
    badge:    document.getElementById('editBadge').value,
    headline: document.getElementById('editHeadline').value,
    body:     document.getElementById('editBody').value,
    fix:      document.getElementById('editFix').value,
    img:      _editImgData,
    imgW:     _editImgW,
    imgX:     _editImgData ? (hadImg ? (prev.imgX ?? defaultImgPos.x) : defaultImgPos.x) : 0,
    imgY:     _editImgData ? (hadImg ? (prev.imgY ?? defaultImgPos.y) : defaultImgPos.y) : 0,
  };
  refreshSlide(editingIndex);
  if (closeAfter) closeModal();
}

document.getElementById('editModal').addEventListener('click', e => {
  if (e.target === document.getElementById('editModal')) closeModal();
});

// ── Image handling ──
function _renderImgZone() {
  const zone = document.getElementById('imgDropZone');
  const sizeWrap = document.getElementById('imgSizeWrap');
  if (_editImgData) {
    zone.className = 'img-drop-zone has-img';
    zone.innerHTML = `
      <img class="img-preview" src="${_editImgData}" alt="">
      <button class="img-remove-btn" onclick="removeEditImg()" title="Удалить">×</button>`;
    sizeWrap.style.display = 'block';
  } else {
    zone.className = 'img-drop-zone';
    zone.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <div class="img-drop-hint">
        <span>Нажми</span> или перетащи PNG<br>изображение сюда
      </div>`;
    sizeWrap.style.display = 'none';
  }
}

function triggerImgUpload() {
  document.getElementById('imgFileInput').click();
}

function handleImgInputChange(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    _editImgData = e.target.result;
    _renderImgZone();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeEditImg() {
  _editImgData = null;
  _renderImgZone();
}

function liveUpdateImgSize(val) {
  _editImgW = parseInt(val);
  document.getElementById('imgSizeVal').textContent = val + 'px';
  if (editingIndex >= 0) {
    const cvs = document.getElementById(`slideCanvas${editingIndex}`);
    const img = cvs && cvs.querySelector('.slide-user-img');
    if (img) { img.style.width = val + 'px'; slidesData[editingIndex].imgW = _editImgW; }
  }
}

// ── Download all slides ──
async function downloadAllSlides() {
  const btn = document.getElementById('btnDlAll');
  if (btn) { btn.disabled = true; btn.textContent = 'Скачиваем...'; }
  for (let i = 0; i < slidesData.length; i++) {
    await downloadSlide(i);
    await new Promise(r => setTimeout(r, 700));
  }
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Скачать все`;
  }
}

// ── Add new slide ──
function addNewSlide() {
  slidesData.push({
    badge: 'НОВЫЙ СЛАЙД',
    headline: 'Укажите заголовок',
    body: 'Укажите описание',
    fix: '',
    img: null, imgX: 100, imgY: 180, imgW: 80
  });
  slideCount = slidesData.length;
  document.getElementById('s4count').textContent = `${slideCount} слайдов · ${styleNames[selectedStyle]}`;
  renderAllSlides();
  setTimeout(() => {
    const row = document.getElementById('slidesRow');
    row.scrollLeft = row.scrollWidth;
  }, 50);
}

// ── Init ──
renderStylePreview();
