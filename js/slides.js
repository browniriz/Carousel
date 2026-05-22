function buildSlideHTML(d, sc, preview=false) {
  const userImg = (!preview && d.img)
    ? `<img class="slide-user-img" src="${d.img}" style="left:${d.imgX||100}px;top:${d.imgY||180}px;width:${d.imgW||80}px;" draggable="false">`
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
}

// ── Draggable image on slide ──
let _drag = null;

document.addEventListener('mousemove', e => {
  if (!_drag) return;
  const dx = e.clientX - _drag.sx, dy = e.clientY - _drag.sy;
  const imgW = slidesData[_drag.idx].imgW || 80;
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
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(probe).width > maxW) { lines.push(line); line = word; }
    else line = probe;
  }
  if (line) lines.push(line);
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

function _drawSlideA(ctx, d, size, logoImg, userImg, customBgImg) {
  const s = size / 320, px = 32 * s, py = 32 * s, cw = size - 2 * px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, size, size); ctx.clip();
  if (customBgImg) { ctx.drawImage(customBgImg, 0, 0, size, size); }
  else { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, size, size); }

  { const bx=270*s,by=40*s,br=90*s, g=ctx.createRadialGradient(bx-br*.2,by-br*.2,0,bx,by,br);
    g.addColorStop(0,'#C77DFF'); g.addColorStop(1,'#7B2FBE');
    ctx.globalAlpha=.45; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill(); ctx.globalAlpha=1; }
  { const bx=40*s,by=300*s,br=70*s, g=ctx.createRadialGradient(bx+br*.2,by-br*.2,0,bx,by,br);
    g.addColorStop(0,'#FFB3D1'); g.addColorStop(1,'#E84393');
    ctx.globalAlpha=.35; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill(); ctx.globalAlpha=1; }
  { const bx=272*s,by=246*s,br=24*s, g=ctx.createLinearGradient(bx-br,by-br,bx+br,by+br);
    g.addColorStop(0,'#FFD93D'); g.addColorStop(1,'#FF9500');
    ctx.globalAlpha=.55; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill(); ctx.globalAlpha=1; }

  ctx.textBaseline = 'top';
  let y = Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  const bSize = 7*s;
  ctx.font = `700 ${bSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing = `${0.12*bSize}px`;
  const bText = (d.badge||'').toUpperCase();
  const bPad=12*s, bVPad=5*s, bH=bSize+bVPad*2;
  const bW=ctx.measureText(bText).width+bPad*2;
  const bGrad=ctx.createLinearGradient(px,y,px+bW,y+bH);
  bGrad.addColorStop(0,'#7B2FBE'); bGrad.addColorStop(1,'#E84393');
  _rRect(ctx,px,y,bW,bH,bH/2); ctx.fillStyle=bGrad; ctx.fill();
  ctx.fillStyle='#FFFFFF'; ctx.fillText(bText,px+bPad,y+bVPad);
  y += bH+14*s;

  const hlSize = 28*s;
  ctx.font = `900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#5A1FA0';
  y += _drawText(ctx, d.headline, px, y, cw, hlSize*1.1);
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='#555555';
    y += _drawText(ctx, d.body, px, y, cw, boSize*1.6);
    y += 14*s;
  }

  if (d.fix) {
    const fSize=11*s, fpx=13*s, fpy=9*s;
    ctx.font=`400 ${fSize}px Inter, sans-serif`; ctx.letterSpacing='0px';
    const fLines=_textLines(ctx,d.fix,cw-fpx*2);
    const fH=fLines.length*fSize*1.5+fpy*2;
    _rRect(ctx,px,y,cw,fH,12*s);
    const fBg=ctx.createLinearGradient(px,y,px+cw,y+fH);
    fBg.addColorStop(0,'rgba(123,47,190,0.07)'); fBg.addColorStop(1,'rgba(232,67,147,0.07)');
    ctx.fillStyle=fBg; ctx.fill();
    ctx.strokeStyle='rgba(123,47,190,0.22)'; ctx.lineWidth=1.5*s; ctx.stroke();
    ctx.fillStyle='#5A1FA0';
    fLines.forEach((l,li)=>ctx.fillText(l,px+fpx,y+fpy+li*fSize*1.5));
  }

  if (userImg) {
    const sc2=size/320, iW=(d.imgW||80)*sc2, iH=userImg.height*(iW/userImg.width);
    ctx.drawImage(userImg,(d.imgX||100)*sc2,(d.imgY||180)*sc2,iW,iH);
  }

  if (logoImg) {
    const lH=22*s, lW=logoImg.width*(lH/logoImg.height);
    ctx.drawImage(logoImg, size-22*s-lW, size-18*s-lH, lW, lH);
  }
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideB(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  if (customBgImg) { ctx.drawImage(customBgImg, 0, 0, size, size); }
  else { ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,size,size); }

  ctx.fillStyle='#7B2FBE';
  ctx.beginPath(); ctx.roundRect(px,0,36*s,3*s,[0,0,3*s,3*s]); ctx.fill();

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-15*s)) / 2);

  const bSize=7*s;
  ctx.font=`700 ${bSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing=`${0.12*bSize}px`; ctx.fillStyle='#7B2FBE';
  const bText=(d.badge||'').toUpperCase();
  ctx.fillText(bText,px,y);
  const bW=ctx.measureText(bText).width;
  ctx.fillStyle='rgba(123,47,190,0.35)';
  ctx.fillRect(px+bW+8*s,y+bSize*.5-.5*s,32*s,1*s);
  y += bSize+12*s;

  const hlSize=28*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#1A1A2E';
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.1);
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`; ctx.fillStyle='#666666';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  if (d.fix) {
    const fSize=11*s, bord=3*s, fInner=12*s, fpy=8*s;
    ctx.font=`400 ${fSize}px Inter, sans-serif`; ctx.letterSpacing='0px';
    const fLines=_textLines(ctx,d.fix,cw-bord-fInner);
    const fH=fLines.length*fSize*1.5+fpy*2;
    ctx.fillStyle='#7B2FBE'; ctx.fillRect(px,y,bord,fH);
    ctx.fillStyle='#444444';
    fLines.forEach((l,li)=>ctx.fillText(l,px+bord+fInner,y+fpy+li*fSize*1.5));
  }

  if (userImg) {
    const sc2=size/320, iW=(d.imgW||80)*sc2, iH=userImg.height*(iW/userImg.width);
    ctx.drawImage(userImg,(d.imgX||100)*sc2,(d.imgY||180)*sc2,iW,iH);
  }

  if (logoImg) {
    const lH=22*s, lW=logoImg.width*(lH/logoImg.height);
    ctx.drawImage(logoImg, 22*s, size-18*s-lH, lW, lH);
  }
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.restore();
}

function _drawSlideC(ctx, d, size, logoImg, userImg, customBgImg) {
  const s=size/320, px=32*s, py=32*s, cw=size-2*px;

  ctx.save();
  ctx.beginPath(); ctx.rect(0,0,size,size); ctx.clip();
  if (customBgImg) { ctx.drawImage(customBgImg, 0, 0, size, size); }
  else { ctx.fillStyle='#0D0D1A'; ctx.fillRect(0,0,size,size); }

  const grid=24*s;
  ctx.strokeStyle='rgba(123,47,190,0.06)'; ctx.lineWidth=1;
  for (let gx=0;gx<size;gx+=grid){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,size);ctx.stroke();}
  for (let gy=0;gy<size;gy+=grid){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(size,gy);ctx.stroke();}

  { const gx=270*s,gy=50*s,gr=100*s, g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
    g.addColorStop(0,'rgba(123,47,190,0.5)'); g.addColorStop(1,'rgba(123,47,190,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill(); }
  { const gx=90*s,gy=300*s,gr=80*s, g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
    g.addColorStop(0,'rgba(232,67,147,0.22)'); g.addColorStop(1,'rgba(232,67,147,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill(); }

  ctx.textBaseline='top';
  let y=Math.max(py, (size - _contentHeight(ctx, d, s, cw, cw-26*s)) / 2);

  const bSize=7*s;
  const lineW=20*s,lineH=2*s;
  const bGradLine=ctx.createLinearGradient(px,0,px+lineW,0);
  bGradLine.addColorStop(0,'#7B2FBE'); bGradLine.addColorStop(1,'#E84393');
  ctx.fillStyle=bGradLine;
  ctx.fillRect(px,y+bSize*.4-lineH/2,lineW,lineH);
  ctx.font=`600 ${bSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing=`${0.15*bSize}px`;
  ctx.fillStyle='#C084FC';
  ctx.fillText((d.badge||'').toUpperCase(),px+lineW+8*s,y);
  y += bSize+14*s;

  const hlSize=28*s;
  ctx.font=`900 ${hlSize}px 'VAG World Bold', sans-serif`;
  ctx.letterSpacing='0px'; ctx.fillStyle='#FFFFFF';
  y += _drawText(ctx,d.headline,px,y,cw,hlSize*1.1);
  y += 12*s;

  if (d.body) {
    const boSize=13*s;
    ctx.font=`500 ${boSize}px Inter, sans-serif`;
    ctx.fillStyle='rgba(255,255,255,0.5)';
    y += _drawText(ctx,d.body,px,y,cw,boSize*1.6);
    y += 14*s;
  }

  if (d.fix) {
    const fSize=11*s,fpx=13*s,fpy=9*s;
    ctx.font=`400 ${fSize}px Inter, sans-serif`; ctx.letterSpacing='0px';
    const fLines=_textLines(ctx,d.fix,cw-fpx*2);
    const fH=fLines.length*fSize*1.5+fpy*2;
    _rRect(ctx,px,y,cw,fH,10*s);
    ctx.fillStyle='rgba(123,47,190,0.12)'; ctx.fill();
    ctx.strokeStyle='rgba(123,47,190,0.4)'; ctx.lineWidth=1*s; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.7)';
    fLines.forEach((l,li)=>ctx.fillText(l,px+fpx,y+fpy+li*fSize*1.5));
  }

  if (userImg) {
    const sc2=size/320, iW=(d.imgW||80)*sc2, iH=userImg.height*(iW/userImg.width);
    ctx.drawImage(userImg,(d.imgX||100)*sc2,(d.imgY||180)*sc2,iW,iH);
  }

  if (logoImg) {
    const lH=22*s, lW=logoImg.width*(lH/logoImg.height);
    ctx.filter='brightness(0) invert(1)';
    ctx.drawImage(logoImg, size-22*s-lW, size-18*s-lH, lW, lH);
    ctx.filter='none';
  }
  ctx.shadowBlur=0; ctx.textAlign='left'; ctx.textBaseline='top';
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
