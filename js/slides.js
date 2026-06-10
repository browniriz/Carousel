function buildSlideHTML(d, sc, preview=false) {
  const imgW = d.imgW ?? 80;
  const imgX = d.imgX ?? Math.max(0, 320 - imgW - 18);
  const imgY = d.imgY ?? 18;
  const userImg = (!preview && d.img)
    ? `<img class="slide-user-img" src="${d.img}" style="left:${imgX}px;top:${imgY}px;width:${imgW}px;" draggable="false">`
    : '';
  const bgStyle = customBg
    ? `background:url('${customBg}') center/cover no-repeat;`
    : '';

  if (sc === 'sA') return `
    <div class="${sc}" style="width:100%;height:100%;${bgStyle}">
      <div class="blob-1"></div><div class="blob-2"></div><div class="blob-3"></div>
      <div class="s-badge">${d.badge}</div>
      <div class="s-headline">${d.headline}</div>
      ${d.body ? `<div class="s-body">${d.body}</div>` : ''}
      ${d.fix ? `<div class="s-fix">${d.fix}</div>` : ''}
      ${userImg}
      <img class="brand-logo" src="logo.png" alt="" draggable="false">
    </div>`;
  if (sc === 'sB') return `
    <div class="${sc}" style="width:100%;height:100%;${bgStyle}">
      <div class="accent-line"></div>
      <div class="s-badge">${d.badge}</div>
      <div class="s-headline">${d.headline}</div>
      ${d.body ? `<div class="s-body">${d.body}</div>` : ''}
      ${d.fix ? `<div class="s-fix">${d.fix}</div>` : ''}
      ${userImg}
      <img class="brand-logo" src="logo.png" alt="" draggable="false">
    </div>`;
  if (sc === 'sC') return `
    <div class="${sc}" style="width:100%;height:100%;${bgStyle}">
      <div class="glow"></div><div class="glow-2"></div>
      <div class="s-badge">${d.badge}</div>
      <div class="s-headline">${d.headline}</div>
      ${d.body ? `<div class="s-body">${d.body}</div>` : ''}
      ${d.fix ? `<div class="s-fix">${d.fix}</div>` : ''}
      ${userImg}
      <img class="brand-logo" src="logo.png" alt="" draggable="false">
    </div>`;
  if (sc === 'sD') return `
    <div class="${sc}" style="width:100%;height:100%;${bgStyle}">
      <div class="punch-orb"></div><div class="punch-streak"></div>
      <div class="s-badge">${d.badge}</div>
      <div class="s-headline">${d.headline}</div>
      ${d.body ? `<div class="s-body">${d.body}</div>` : ''}
      ${d.fix ? `<div class="s-fix">${d.fix}</div>` : ''}
      ${userImg}
      <img class="brand-logo" src="logo.png" alt="" draggable="false">
    </div>`;
  if (sc === 'sE') return `
    <div class="${sc}" style="width:100%;height:100%;${bgStyle}">
      <div class="graph-line"></div><div class="graph-panel"></div>
      <div class="s-badge">${d.badge}</div>
      <div class="s-headline">${d.headline}</div>
      ${d.body ? `<div class="s-body">${d.body}</div>` : ''}
      ${d.fix ? `<div class="s-fix">${d.fix}</div>` : ''}
      ${userImg}
      <img class="brand-logo" src="logo.png" alt="" draggable="false">
    </div>`;
}

function createSlideImageSizeControl(i) {
  const d = slidesData[i];
  if (!d || !d.img) return null;

  const control = document.createElement('div');
  control.className = 'slide-img-size-control';
  control.innerHTML = `
    <span>Размер PNG</span>
    <input type="range" min="40" max="240" value="${d.imgW ?? 80}" oninput="resizeSlideImage(${i}, this.value)">
    <strong>${d.imgW ?? 80}px</strong>`;
  control.addEventListener('mousedown', e => e.stopPropagation());
  control.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  return control;
}

function syncSlideImageSizeControl(i) {
  const item = document.getElementById(`slideItem${i}`);
  if (!item) return;

  const existing = item.querySelector('.slide-img-size-control');
  if (existing) existing.remove();

  const control = createSlideImageSizeControl(i);
  if (!control) return;

  const actions = item.querySelector('.slide-actions');
  item.insertBefore(control, actions);
}

function renderAllSlides() {
  const row = document.getElementById('slidesRow');
  row.innerHTML = '';
  document.getElementById('s4count').textContent = `${slideCount} слайдов · ${styleNames[selectedStyle]}`;

  slidesData.forEach((d, i) => {
    const sc = styleClass[selectedStyle];
    const slideData = { ...d };

    const item = document.createElement('div');
    item.className = 'slide-item';
    item.id = `slideItem${i}`;

    const canvas = document.createElement('div');
    canvas.className = 'slide-canvas';
    canvas.id = `slideCanvas${i}`;
    canvas.innerHTML = buildSlideHTML(slideData, sc);

    const imgSizeControl = createSlideImageSizeControl(i);

    const actions = document.createElement('div');
    actions.className = 'slide-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Редактировать`;
    editBtn.onclick = () => openEdit(i);

    const dlBtn = document.createElement('button');
    dlBtn.className = 'dl-btn';
    dlBtn.title = 'Скачать слайд';
    dlBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
    dlBtn.onclick = () => downloadSlide(i);

    const numLabel = document.createElement('div');
    numLabel.className = 'slide-index-num';
    numLabel.textContent = `${i+1} / ${slideCount}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'slide-delete-btn';
    delBtn.title = 'Удалить слайд';
    delBtn.innerHTML = '×';
    delBtn.onclick = e => { e.stopPropagation(); deleteSlide(i); };

    actions.appendChild(editBtn);
    actions.appendChild(dlBtn);

    item.appendChild(canvas);
    item.appendChild(delBtn);
    if (imgSizeControl) item.appendChild(imgSizeControl);
    item.appendChild(actions);
    item.appendChild(numLabel);
    row.appendChild(item);

    initSlideImgDrag(i);
  });

  initRowDrag();

  // "+" add slide button
  const addItem = document.createElement('div');
  addItem.className = 'slide-item';
  const addBtn = document.createElement('div');
  addBtn.className = 'slide-add-btn';
  addBtn.innerHTML = `
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    <span>Новый слайд</span>`;
  addBtn.onclick = addNewSlide;
  addItem.appendChild(addBtn);
  row.appendChild(addItem);
}

function refreshSlide(i) {
  const sc = styleClass[selectedStyle];
  const slideData = { ...slidesData[i] };
  document.getElementById(`slideCanvas${i}`).innerHTML = buildSlideHTML(slideData, sc);
  initSlideImgDrag(i);
  syncSlideImageSizeControl(i);
}

function resizeSlideImage(i, value) {
  const data = slidesData[i];
  if (!data || !data.img) return;

  const imgW = parseInt(value, 10) || 80;
  data.imgW = imgW;
  data.imgX = Math.max(0, Math.min(320 - imgW, data.imgX ?? Math.max(0, 320 - imgW - 18)));
  data.imgY = Math.max(0, Math.min(300, data.imgY ?? 18));

  const img = document.querySelector(`#slideCanvas${i} .slide-user-img`);
  if (img) {
    img.style.width = `${imgW}px`;
    img.style.left = `${data.imgX}px`;
    img.style.top = `${data.imgY}px`;
  }

  const control = document.querySelector(`#slideItem${i} .slide-img-size-control`);
  const label = control && control.querySelector('strong');
  if (label) label.textContent = `${imgW}px`;
}

// ── Draggable image on slide ──
let _drag = null;

document.addEventListener('mousemove', e => {
  if (!_drag) return;
  const dx = e.clientX - _drag.sx, dy = e.clientY - _drag.sy;
  const imgW = slidesData[_drag.idx].imgW ?? 80;
  const nl = Math.max(0, Math.min(320 - imgW, _drag.l + dx));
  const nt = Math.max(0, Math.min(300, _drag.t + dy));
  _drag.el.style.left = nl + 'px';
  _drag.el.style.top = nt + 'px';
  slidesData[_drag.idx].imgX = nl;
  slidesData[_drag.idx].imgY = nt;
});

document.addEventListener('mouseup', () => {
  if (_drag) { _drag.el.style.cursor = 'grab'; _drag = null; }
});

function initSlideImgDrag(idx) {
  const cvs = document.getElementById(`slideCanvas${idx}`);
  if (!cvs) return;
  const img = cvs.querySelector('.slide-user-img');
  if (!img) return;
  img.addEventListener('mousedown', e => {
    e.preventDefault();
    _drag = {
      idx,
      sx: e.clientX, sy: e.clientY,
      l: parseFloat(img.style.left) || 0,
      t: parseFloat(img.style.top) || 0,
      el: img
    };
    img.style.cursor = 'grabbing';
  });
}

// ── Delete slide ──
function deleteSlide(i) {
  if (slidesData.length <= 1) return; // keep at least one
  slidesData.splice(i, 1);
  slideCount = slidesData.length;
  document.getElementById('s4count').textContent = `${slideCount} слайдов · ${styleNames[selectedStyle]}`;
  renderAllSlides();
}

// ── Row drag-to-scroll ──
function initRowDrag() {
  const row = document.getElementById('slidesRow');
  if (!row) return;

  let active = false, startX = 0, startScroll = 0;

  row.addEventListener('mousedown', e => {
    if (e.target.closest('.slide-user-img, button, .slide-add-btn')) return;
    active = true;
    startX = e.pageX;
    startScroll = row.scrollLeft;
    row.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', e => {
    if (!active) return;
    e.preventDefault();
    row.scrollLeft = startScroll - (e.pageX - startX);
  }, { passive: false });

  window.addEventListener('mouseup', () => {
    active = false;
    row.classList.remove('is-dragging');
  });
}

// ── Canvas-based download ──

function _loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}


function _textLines(ctx, text, maxW) {
  if (!text) return [];
  const lines = [];

  for (const paragraph of String(text).replace(/\r\n/g, '\n').split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const probe = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(probe).width > maxW) { lines.push(line); line = word; }
      else line = probe;
    }
    if (line) lines.push(line);
  }

  return lines;
}

function _drawText(ctx, text, x, y, maxW, lineH) {
  const lines = _textLines(ctx, text, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
}

function _rRect(ctx, x, y, w, h, r) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr) ctx.arcTo(x + w, y, x + w, y + tr, tr); else ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br);
  if (br) ctx.arcTo(x + w, y + h, x + w - br, y + h, br); else ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl) ctx.arcTo(x, y + h, x, y + h - bl, bl); else ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.arcTo(x, y, x + tl, y, tl); else ctx.lineTo(x, y);
  ctx.closePath();
}

// Returns total height of text content blocks so we can vertically center them.
function _contentHeight(ctx, d, s, cw, fixMaxW) {
  const bSize=7*s, hlSize=28*s, boSize=13*s, fSize=11*s, fpy=9*s;

  // Badge (single line pill)
  let h = (bSize + 5*s*2) + 14*s;

  // Headline
  ctx.font = `900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing = '0px';
  h += _textLines(ctx, d.headline||'', cw).length * hlSize * 1.1 + 12*s;

  // Body
  if (d.body) {
    ctx.font = `500 ${boSize}px Inter, sans-serif`;
    ctx.letterSpacing = '0px';
    h += _textLines(ctx, d.body, cw).length * boSize * 1.6 + 14*s;
  }

  // Fix
  if (d.fix) {
    ctx.font = `400 ${fSize}px Inter, sans-serif`;
    ctx.letterSpacing = '0px';
    h += _textLines(ctx, d.fix, fixMaxW).length * fSize * 1.5 + fpy*2;
  }

  return h;
}

function _drawCoverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function _drawNeonBackground(ctx, size, customBgImg, variant = 0) {
  ctx.save();
  if (customBgImg) {
    _drawCoverImage(ctx, customBgImg, 0, 0, size, size);
    ctx.fillStyle = variant >= 10 ? 'rgba(255, 255, 255, 0.72)' : 'rgba(3, 3, 8, 0.64)';
    ctx.fillRect(0, 0, size, size);
  } else {
    const bg = ctx.createLinearGradient(0, 0, size, size);
    if (variant === 10) {
      bg.addColorStop(0, '#FFFFFF');
      bg.addColorStop(0.52, '#F5F1FF');
      bg.addColorStop(1, '#E6D9FF');
    } else if (variant === 11) {
      bg.addColorStop(0, '#F8F7FC');
      bg.addColorStop(0.52, '#EEE8F8');
      bg.addColorStop(1, '#D8CBF4');
    } else if (variant === 12) {
      bg.addColorStop(0, '#FFFFFF');
      bg.addColorStop(0.48, '#F1EAFF');
      bg.addColorStop(1, '#D8C5FF');
    } else if (variant === 4) {
      bg.addColorStop(0, '#272430');
      bg.addColorStop(0.5, '#17141E');
      bg.addColorStop(1, '#09070E');
    } else if (variant === 4) {
      bg.addColorStop(0, '#19171F');
      bg.addColorStop(0.52, '#2B2833');
      bg.addColorStop(1, '#09070E');
    } else {
      bg.addColorStop(0, variant === 1 ? '#08070D' : '#020204');
      bg.addColorStop(0.52, variant === 2 ? '#10051E' : '#12101C');
      bg.addColorStop(1, '#050208');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  const glowA = ctx.createRadialGradient(size * .78, size * .18, 0, size * .78, size * .18, size * .48);
  glowA.addColorStop(0, variant >= 10 ? 'rgba(139,50,255,0.22)' : 'rgba(157,77,255,0.52)');
  glowA.addColorStop(1, 'rgba(157,77,255,0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, size, size);

  const glowB = ctx.createRadialGradient(size * .12, size * .86, 0, size * .12, size * .86, size * .56);
  glowB.addColorStop(0, variant >= 10 ? 'rgba(139,50,255,0.16)' : (variant === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(100,20,255,0.48)'));
  glowB.addColorStop(1, 'rgba(100,20,255,0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, size, size);

  // Diagonal lines — only sD (variant 12) and sE (variant 4) have them in CSS
  if (variant === 4 || variant === 12) {
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = '#8B32FF';
    ctx.lineWidth = Math.max(1, size * .002);
    const grid = size / 13;
    for (let x = -grid; x < size + grid; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size * .18, size);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Neon arc stroke — only sD (variant 12) has ::after arc in CSS
  if (variant === 12) {
    const stroke = ctx.createLinearGradient(0, size * .3, size, size * .72);
    stroke.addColorStop(0, 'rgba(139,50,255,0)');
    stroke.addColorStop(.32, 'rgba(139,50,255,0.95)');
    stroke.addColorStop(.5, 'rgba(244,241,255,0.9)');
    stroke.addColorStop(.72, 'rgba(139,50,255,0.92)');
    stroke.addColorStop(1, 'rgba(139,50,255,0)');
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.lineWidth = size * .012;
    ctx.shadowColor = '#8B32FF';
    ctx.shadowBlur = size * .025;
    ctx.beginPath();
    ctx.moveTo(-size * .08, size * .72);
    ctx.bezierCurveTo(size * .26, size * .62, size * .66, size * .76, size * 1.08, size * .56);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function _drawNeonBadge(ctx, text, x, y, s, variant = 0) {
  const bSize = 7 * s;
  ctx.font = `700 ${bSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing = `${0.12 * bSize}px`;
  const bText = (text || '').toUpperCase();
  const bPad = 12 * s;
  const bVPad = 5 * s;
  const bH = bSize + bVPad * 2;
  const bW = ctx.measureText(bText).width + bPad * 2;

  if (variant === 1 || variant === 11 || variant === 12) {
    ctx.fillStyle = variant === 12 ? '#6414FF' : '#C6A5FF';
    if (variant === 12) {
      ctx.shadowColor = '#8B32FF';
      ctx.shadowBlur = 10 * s;
    }
    ctx.fillText(bText, x, y + bVPad);
    ctx.shadowBlur = 0;
    if (variant === 12) {
      const line = ctx.createLinearGradient(x + bW, y, x + bW + 36 * s, y);
      line.addColorStop(0, 'rgba(198,165,255,.9)');
      line.addColorStop(1, 'rgba(139,50,255,0)');
      ctx.fillStyle = line;
      ctx.fillRect(x + bW - bPad + 8 * s, y + bH * .48, 36 * s, 2 * s);
    } else if (variant === 11) {
      ctx.fillStyle = 'rgba(123,47,190,0.35)';
      ctx.fillRect(x + bW - bPad + 8 * s, y + bH * .48, 32 * s, 1 * s);
    }
    return bH + 12 * s;
  }

  const grad = ctx.createLinearGradient(x, y, x + bW, y + bH);
  grad.addColorStop(0, variant === 2 ? '#2A064D' : '#6414FF');
  grad.addColorStop(1, '#B06CFF');
  _rRect(ctx, x, y, bW, bH, bH / 2);
  ctx.fillStyle = grad;
  ctx.shadowColor = '#8B32FF';
  ctx.shadowBlur = 12 * s;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 1 * s;
  ctx.stroke();
  ctx.fillStyle = '#F4F1FF';
  ctx.fillText(bText, x + bPad, y + bVPad);
  return bH + 14 * s;
}

function _drawNeonFix(ctx, text, x, y, w, s, variant = 0) {
  if (!text) return 0;
  const fSize = 11 * s;
  const fpx = 13 * s;
  const fpy = 9 * s;
  ctx.font = `400 ${fSize}px Inter, sans-serif`;
  ctx.letterSpacing = '0px';
  const fLines = _textLines(ctx, text, w - fpx * 2);
  const fH = fLines.length * fSize * 1.5 + fpy * 2;

  if (variant === 1) {
    ctx.fillStyle = '#9D4DFF';
    ctx.shadowColor = '#8B32FF';
    ctx.shadowBlur = 12 * s;
    ctx.fillRect(x, y, 3 * s, fH);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    fLines.forEach((l, li) => ctx.fillText(l, x + 15 * s, y + fpy + li * fSize * 1.5));
    return fH;
  }

  _rRect(ctx, x, y, w, fH, 12 * s);
  ctx.fillStyle = variant === 11 ? 'rgba(255,255,255,0.5)'
    : variant === 10 || variant === 12 ? 'rgba(139,50,255,0.1)'
    : variant === 2 ? 'rgba(139,50,255,0.16)'
    : variant === 4 ? 'rgba(139,50,255,0.14)'
    : 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = variant === 11 ? 'rgba(139,50,255,0.24)'
    : variant === 10 || variant === 12 ? 'rgba(139,50,255,0.28)'
    : variant === 4 ? 'rgba(176,108,255,0.34)'
    : 'rgba(176,108,255,0.42)';
  ctx.lineWidth = 1.2 * s;
  ctx.stroke();
  ctx.fillStyle = variant === 11 ? '#211131' : variant >= 10 ? '#2A064D' : 'rgba(255,255,255,0.86)';
  fLines.forEach((l, li) => ctx.fillText(l, x + fpx, y + fpy + li * fSize * 1.5));
  return fH;
}

function _drawUserImage(ctx, d, size, userImg) {
  if (!userImg) return;
  const sc = size / 320;
  const iW = (d.imgW ?? 80) * sc;
  const iH = userImg.height * (iW / userImg.width);
  const imgX = d.imgX ?? Math.max(0, 320 - (d.imgW ?? 80) - 18);
  const imgY = d.imgY ?? 18;
  ctx.save();
  ctx.shadowColor = '#8B32FF';
  ctx.shadowBlur = 18 * sc;
  ctx.drawImage(userImg, imgX * sc, imgY * sc, iW, iH);
  ctx.restore();
}

function _drawBrandLogo(ctx, logoImg, size, s, align = 'right', invert = true) {
  if (!logoImg) return;
  const lH = 16 * s;
  const lW = logoImg.width * (lH / logoImg.height);
  const x = align === 'left' ? 22 * s : size - 22 * s - lW;
  const y = size - 18 * s - lH;
  ctx.save();
  ctx.filter = invert ? 'brightness(0) invert(1)' : 'none';
  ctx.shadowColor = '#8B32FF';
  ctx.shadowBlur = 10 * s;
  ctx.drawImage(logoImg, x, y, lW, lH);
  ctx.restore();
}

function _drawSlideA(ctx, d, size, logoImg, userImg, customBgImg) {
  const s = size / 320, px = 32 * s, py = 32 * s, cw = size - 2 * px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, size, size); ctx.clip();
  _drawNeonBackground(ctx, size, customBgImg, 10);

  // blob-3: small gradient dot bottom-right (CSS: bottom:50px right:24px, 48x48)
  const b3R = 24 * s;
  const b3X = size - 48 * s;
  const b3Y = size - 74 * s;
  ctx.save();
  ctx.globalAlpha = 0.55;
  const b3g = ctx.createLinearGradient(b3X - b3R, b3Y - b3R, b3X + b3R, b3Y + b3R);
  b3g.addColorStop(0, '#F4F1FF');
  b3g.addColorStop(1, '#8B32FF');
  ctx.fillStyle = b3g;
  ctx.beginPath();
  ctx.arc(b3X, b3Y, b3R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.textBaseline = 'top';
  let y = Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  y += _drawNeonBadge(ctx, d.badge, px, y, s, 10);

  const hlSize = 28*s;
  ctx.font = `900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px';
  ctx.fillStyle='#17101F';
  ctx.shadowBlur = 0;
  y += _drawText(ctx, d.headline, px, y, cw, hlSize*1.1);
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='rgba(23,16,31,0.68)';
    y += _drawText(ctx, d.body, px, y, cw, boSize*1.6);
    y += 14*s;
  }

  _drawNeonFix(ctx, d.fix, px, y, cw, s, 10);

  _drawUserImage(ctx, d, size, userImg);
  _drawBrandLogo(ctx, logoImg, size, s, 'right', false);
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideB(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  _drawNeonBackground(ctx, size, customBgImg, 11);

  const topLine = ctx.createLinearGradient(px, 0, px + 36*s, 0);
  topLine.addColorStop(0, '#F4F1FF');
  topLine.addColorStop(1, '#8B32FF');
  ctx.fillStyle=topLine;
  ctx.shadowColor='#8B32FF';
  ctx.shadowBlur=12*s;
  ctx.fillRect(px,0,36*s,4*s);
  ctx.shadowBlur=0;

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-15*s)) / 2);

  y += _drawNeonBadge(ctx, d.badge, px, y, s, 11);

  const hlSize=28*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#17101F';
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.1);
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`; ctx.fillStyle='rgba(23,16,31,0.65)';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  _drawNeonFix(ctx, d.fix, px, y, cw, s, 11);

  _drawUserImage(ctx, d, size, userImg);
  _drawBrandLogo(ctx, logoImg, size, s, 'left', false);
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideC(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  _drawNeonBackground(ctx, size, customBgImg, 2);

  // ::before overlay: two diagonal light streaks (CSS replaces old grid)
  ctx.save();
  ctx.translate(size * .12, size * .5);
  ctx.rotate(0.44); // ~25deg from horizontal = 115deg CSS gradient direction
  const streak1 = ctx.createLinearGradient(-size * .7, 0, size * .7, 0);
  streak1.addColorStop(0, 'rgba(139,50,255,0)');
  streak1.addColorStop(.48, 'rgba(139,50,255,0.22)');
  streak1.addColorStop(.52, 'rgba(139,50,255,0.22)');
  streak1.addColorStop(1, 'rgba(139,50,255,0)');
  ctx.fillStyle = streak1;
  ctx.fillRect(-size * .7, -size * .04, size * 1.4, size * .08);
  ctx.restore();

  ctx.save();
  ctx.translate(size * .62, 0);
  ctx.rotate(0.14); // ~8deg = 172deg CSS direction
  const streak2 = ctx.createLinearGradient(0, 0, 0, size);
  streak2.addColorStop(0, 'rgba(255,255,255,0)');
  streak2.addColorStop(.59, 'rgba(255,255,255,0)');
  streak2.addColorStop(.605, 'rgba(255,255,255,0.08)');
  streak2.addColorStop(.62, 'rgba(255,255,255,0)');
  streak2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streak2;
  ctx.fillRect(-size * .05, 0, size * .1, size);
  ctx.restore();

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  y += _drawNeonBadge(ctx, d.badge, px, y, s, 2);

  const hlSize=28*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#FFFFFF';
  ctx.shadowColor='#8B32FF';
  ctx.shadowBlur=16*s;
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.1);
  ctx.shadowBlur=0;
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='rgba(255,255,255,0.62)';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  _drawNeonFix(ctx, d.fix, px, y, cw, s, 2);

  _drawUserImage(ctx, d, size, userImg);
  _drawBrandLogo(ctx, logoImg, size, s, 'right');
  ctx.shadowBlur=0; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideD(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  _drawNeonBackground(ctx, size, customBgImg, 12);

  const orb = ctx.createRadialGradient(size * .78, size * .16, 0, size * .78, size * .16, size * .28);
  orb.addColorStop(0, 'rgba(139,50,255,0.22)');
  orb.addColorStop(.58, 'rgba(139,50,255,0.08)');
  orb.addColorStop(1, 'rgba(139,50,255,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(size * .5, size * .76);
  ctx.rotate(-0.18);
  const streak = ctx.createLinearGradient(-size * .55, 0, size * .55, 0);
  streak.addColorStop(0, 'rgba(139,50,255,0)');
  streak.addColorStop(.42, 'rgba(139,50,255,0.18)');
  streak.addColorStop(.55, 'rgba(139,50,255,0.58)');
  streak.addColorStop(1, 'rgba(139,50,255,0)');
  ctx.fillStyle = streak;
  ctx.shadowColor = '#8B32FF';
  ctx.shadowBlur = 8 * s;
  ctx.fillRect(-size * .55, -6 * s, size * 1.1, 12 * s);
  ctx.restore();

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  y += _drawNeonBadge(ctx, d.badge, px, y, s, 12);

  const hlSize=34*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#17101F';
  ctx.shadowBlur=0;
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.04);
  y += 10*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='rgba(23,16,31,0.68)';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  _drawNeonFix(ctx, d.fix, px, y, cw, s, 12);

  _drawUserImage(ctx, d, size, userImg);
  _drawBrandLogo(ctx, logoImg, size, s, 'right', false);
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideE(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  _drawNeonBackground(ctx, size, customBgImg, 4);

  ctx.fillStyle='rgba(255,255,255,0.06)';
  _rRect(ctx, size - 130*s, size - 90*s, 96*s, 62*s, 16*s);
  ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.13)';
  ctx.lineWidth=1*s;
  ctx.stroke();

  ctx.save();
  ctx.translate(size * .52, size * .23);
  ctx.rotate(-0.12);
  const line = ctx.createLinearGradient(-size * .56, 0, size * .56, 0);
  line.addColorStop(0, 'rgba(139,50,255,0)');
  line.addColorStop(.45, 'rgba(139,50,255,0.9)');
  line.addColorStop(.55, 'rgba(244,241,255,0.9)');
  line.addColorStop(1, 'rgba(139,50,255,0)');
  ctx.fillStyle=line;
  ctx.shadowColor='#8B32FF';
  ctx.shadowBlur=16*s;
  ctx.fillRect(-size * .56, -2*s, size * 1.12, 4*s);
  ctx.restore();

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  y += _drawNeonBadge(ctx, d.badge, px, y, s, 4);

  const hlSize=34*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#FFFFFF';
  ctx.shadowColor='#8B32FF';
  ctx.shadowBlur=10*s;
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.04);
  ctx.shadowBlur=0;
  y += 10*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='rgba(255,255,255,0.68)';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  _drawNeonFix(ctx, d.fix, px, y, cw, s, 4);

  _drawUserImage(ctx, d, size, userImg);
  _drawBrandLogo(ctx, logoImg, size, s, 'right');
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

async function downloadSlide(i) {
  try {
    // Ensure VAG World Bold is fully loaded before canvas renders text
    await document.fonts.ready;
    await Promise.all([
      document.fonts.load(`900 28px 'VAG World Bold'`),
      document.fonts.load(`700 10px 'VAG World Bold'`),
      document.fonts.load(`500 16px Inter`),
    ]);

    const sc = styleClass[selectedStyle];
    const d = { ...slidesData[i] };
    const size = 1080;

    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    // LOGO_DATA_URL is defined in logo-data.js — no fetch needed, no canvas taint
    const logoImg = (typeof LOGO_DATA_URL !== 'undefined' && LOGO_DATA_URL)
      ? await _loadImg(LOGO_DATA_URL) : null;
    const userImg = d.img ? await _loadImg(d.img) : null;
    const customBgImg = (typeof customBg !== 'undefined' && customBg)
      ? await _loadImg(customBg) : null;

    if (sc === 'sA') _drawSlideA(ctx, d, size, logoImg, userImg, customBgImg);
    else if (sc === 'sB') _drawSlideB(ctx, d, size, logoImg, userImg, customBgImg);
    else if (sc === 'sD') _drawSlideD(ctx, d, size, logoImg, userImg, customBgImg);
    else if (sc === 'sE') _drawSlideE(ctx, d, size, logoImg, userImg, customBgImg);
    else if (sc === 'sC') _drawSlideC(ctx, d, size, logoImg, userImg, customBgImg);

    const link = document.createElement('a');
    link.download = `technotochka_slide_${i+1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch(err) {
    console.error('downloadSlide error:', err);
    alert('Не удалось скачать слайд. Попробуйте открыть файл через локальный сервер (не file://).');
  }
}
