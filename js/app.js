// ── State ──
let slideCount = 0;
let userText = '';
let selectedStyle = 0;
let slidesData = [];
let editingIndex = -1;

let _editImgData = null;
let _editImgW = 80;

const styleNames = ['Стиль 1 — Яркий', 'Стиль 2 — Минимализм', 'Стиль 3 — Тёмный'];
const styleClass = ['sA','sB','sC'];

// ── Screen navigation ──
function goScreen(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen' + n).classList.add('active');
  window.scrollTo(0,0);
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

// ── Screen 3: style picker ──
function changeStyle(d) {
  selectedStyle = (selectedStyle + d + 3) % 3;
  renderStylePreview();
  updateStyleDots();
}

function setStyle(i) {
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
    headline: 'Пример слайда',
    body: 'Короткое описание или объяснение — читается за 2–3 секунды.',
    fix: '✔ Решение или ключевой акцент здесь',
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
  _editImgW = d.imgW || 80;
  document.getElementById('imgSizeRange').value = _editImgW;
  document.getElementById('imgSizeVal').textContent = _editImgW + 'px';
  _renderImgZone();

  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editingIndex = -1;
}

function applyEdit() {
  if (editingIndex < 0) return;
  const prev = slidesData[editingIndex];
  slidesData[editingIndex] = {
    badge:    document.getElementById('editBadge').value,
    headline: document.getElementById('editHeadline').value,
    body:     document.getElementById('editBody').value,
    fix:      document.getElementById('editFix').value,
    img:      _editImgData,
    imgW:     _editImgW,
    imgX:     _editImgData ? (prev.imgX || 100) : 0,
    imgY:     _editImgData ? (prev.imgY || 180) : 0,
  };
  refreshSlide(editingIndex);
  closeModal();
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
