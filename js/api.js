async function generateSlides() {
  goScreen('3b');
  const messages = [
    {
      role: 'user',
      content: `Ты — эксперт по Instagram-каруселям для бренда ТЕХНОТОЧКА (комиссионный магазин техники).
Стиль: уверенный, современный, коротко, по делу, лёгкий молодёжный вайб, без канцелярита.

Разбей следующий текст на ровно ${slideCount} слайдов для карусели Instagram.

Текст:
${userText}

Требования:
- На каждом слайде одна мысль
- Первый слайд — сильный хук (цепляющий заголовок)
- Последний слайд — итог + CTA или вопрос для вовлечения
- Промежуточные слайды — раскрытие по пунктам
- Текст на слайде читается за 2–3 секунды

Верни ТОЛЬКО JSON-массив, никакого текста до или после, никаких markdown-backtick-обёрток. Массив содержит ровно ${slideCount} объектов. Каждый объект:
{
  "badge": "краткая метка (например 'Причина 01' или 'ЛАЙФХАК' или 'ТЕХНОТОЧКА')",
  "headline": "заголовок слайда (1–5 слов, мощно)",
  "body": "описание (1–2 предложения максимум, или пусто если хук/CTA)",
  "fix": "блок решения или акцент (1 строка, или пусто если не нужен)"
}`
    }
  ];

  try {
    document.getElementById('loadingText').textContent = 'ИИ разбивает текст по слайдам...';
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages
      })
    });
    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g,'').trim();
    slidesData = JSON.parse(clean);
    if (!Array.isArray(slidesData)) throw new Error('not array');
    while (slidesData.length < slideCount) slidesData.push({ badge:'ТЕХНОТОЧКА', headline:'Слайд', body:'', fix:'' });
    slidesData = slidesData.slice(0, slideCount).map(d => ({ ...d, img:null, imgX:100, imgY:180, imgW:80 }));
  } catch(e) {
    slidesData = buildFallbackSlides(userText, slideCount);
  }

  renderAllSlides();
  goScreen(4);
}

function buildFallbackSlides(text, n) {
  const paras = text.split(/\n\n+/).filter(p => p.trim());
  const result = [];
  for (let i = 0; i < n; i++) {
    const para = paras[i] || paras[paras.length-1] || '';
    const lines = para.split('\n').filter(l=>l.trim());
    result.push({
      badge: i === 0 ? 'ТЕХНОТОЧКА' : `Пункт ${i}`,
      headline: lines[0] || `Слайд ${i+1}`,
      body: lines.slice(1,3).join(' '),
      fix: lines[3] || '',
      img: null, imgX: 100, imgY: 180, imgW: 80
    });
  }
  return result;
}
