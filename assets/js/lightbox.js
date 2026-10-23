// กดที่ภาพเพื่อดูภาพขยาย (เฉพาะคอมพิวเตอร์: จอกว้าง ≥ 1024px และใช้เมาส์)
// บนมือถือ/แท็บเล็ตจะไม่ทำงาน ภาพยังแสดงตามปกติ
(function () {
  const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  // ภาพที่ขยายได้: มี data-full และไม่ได้เป็นส่วนหนึ่งของการ์ดลิงก์ไปหน้าอื่นในเว็บ
  const enlargeable = (img) => {
    const a = img.closest('a');
    return !a || !/\.html(#|$)/.test(a.getAttribute('href') || '');
  };
  const images = () => Array.from(document.querySelectorAll('img[data-full]')).filter(enlargeable);

  function markCursor() {
    images().forEach((img) => (img.style.cursor = desktop.matches ? 'zoom-in' : ''));
  }
  markCursor();
  desktop.addEventListener('change', markCursor);

  let box, view, cap, count, prevBtn, nextBtn, closeBtn, list = [], idx = 0, lastFocus = null;

  function build() {
    box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'ภาพขยาย');
    box.style.cssText = 'position:fixed;inset:0;z-index:100;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px 72px;background:rgba(12,10,9,.92)';
    box.innerHTML = `
      <button type="button" data-lb="close" aria-label="ปิด" style="position:absolute;top:16px;right:20px;width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:26px;line-height:1">×</button>
      <button type="button" data-lb="prev" aria-label="ภาพก่อนหน้า" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:28px">‹</button>
      <button type="button" data-lb="next" aria-label="ภาพถัดไป" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:28px">›</button>
      <img data-lb="img" alt="" style="max-width:100%;max-height:calc(100vh - 140px);object-fit:contain;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#1c1917">
      <div style="max-width:min(900px,100%);text-align:center;color:#e7e5e4;font-size:15px;line-height:1.5">
        <p data-lb="cap"></p><p data-lb="count" style="margin-top:4px;font-size:12px;color:#a8a29e"></p>
      </div>`;
    document.body.appendChild(box);
    view = box.querySelector('[data-lb="img"]');
    cap = box.querySelector('[data-lb="cap"]');
    count = box.querySelector('[data-lb="count"]');
    prevBtn = box.querySelector('[data-lb="prev"]');
    nextBtn = box.querySelector('[data-lb="next"]');
    closeBtn = box.querySelector('[data-lb="close"]');
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(idx - 1));
    nextBtn.addEventListener('click', () => show(idx + 1));
    box.addEventListener('click', (ev) => { if (ev.target === box) close(); });
  }

  function caption(img) {
    const fig = img.closest('figure');
    if (fig && fig.querySelector('figcaption')) {
      return Array.from(fig.querySelectorAll('figcaption span')).map((s) => s.textContent.trim()).filter(Boolean).join(' — ');
    }
    return [img.alt, img.dataset.credit].filter(Boolean).join(' — ');
  }

  function show(i) {
    idx = (i + list.length) % list.length;
    const img = list[idx];
    view.src = img.currentSrc || img.src;          // แสดงภาพเล็กก่อน
    view.alt = img.alt;
    const full = new Image();                      // แล้วสลับเป็นภาพความละเอียดสูงเมื่อโหลดเสร็จ
    full.onload = () => { if (list[idx] === img) view.src = full.src; };
    full.src = img.dataset.full;
    cap.textContent = caption(img);
    count.textContent = list.length > 1 ? `${idx + 1} / ${list.length} · กด ← → เพื่อเลื่อน, Esc เพื่อปิด` : 'กด Esc เพื่อปิด';
    const many = list.length > 1;
    prevBtn.style.display = nextBtn.style.display = many ? '' : 'none';
  }

  function open(img) {
    if (!box) build();
    list = images();
    lastFocus = document.activeElement;
    box.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    show(list.indexOf(img));
    closeBtn.focus();
  }

  function close() {
    box.style.display = 'none';
    view.removeAttribute('src');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', (ev) => {
    const img = ev.target.closest && ev.target.closest('img[data-full]');
    if (!img || !desktop.matches || !enlargeable(img)) return;
    ev.preventDefault();   // ภาพในแกลเลอรีที่มีลิงก์ไป Commons จะขยายแทนการเปิดลิงก์
    open(img);
  });

  document.addEventListener('keydown', (ev) => {
    if (!box || box.style.display !== 'flex') return;
    if (ev.key === 'Escape') close();
    else if (ev.key === 'ArrowLeft') show(idx - 1);
    else if (ev.key === 'ArrowRight') show(idx + 1);
    else if (ev.key === 'Tab') { // วนโฟกัสอยู่ในหน้าต่างภาพ
      const f = [closeBtn, prevBtn, nextBtn].filter((b) => b.style.display !== 'none');
      const k = f.indexOf(document.activeElement);
      ev.preventDefault();
      f[(k + (ev.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
})();
