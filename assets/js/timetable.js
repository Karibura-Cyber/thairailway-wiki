// ตารางเดินรถ: สลับแท็บ + ค้นหาขบวน/สถานี (ไม่ใช้ framework)
// ถ้าปิด JavaScript ทุกแท็บจะแสดงเรียงกันลงมาและยังอ่านได้ครบ
(function () {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const input = document.getElementById('tt-search');
  const empty = document.getElementById('tt-empty');
  if (!tabs.length) return;

  document.getElementById('tt-tablist').hidden = false;
  document.getElementById('tt-searchbox').hidden = false;

  function select(key, focus) {
    const tab = tabs.find((t) => t.dataset.tab === key) || tabs[0];
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => (p.hidden = p.id !== tab.getAttribute('aria-controls')));
    // บนจอแคบ แถบแท็บเลื่อนแนวนอนได้ ให้แท็บที่เลือกอยู่ในมุมมองเสมอ
    const bar = tab.parentElement;
    bar.scrollLeft = tab.offsetLeft - bar.offsetLeft - 16;
    if (focus) tab.focus();
    return tab;
  }

  // #bts เลือกแท็บ, #tt-north หรือ #ln-blue เลือกแท็บที่มีส่วนนั้นแล้วเลื่อนไปหา
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return select(tabs[0].dataset.tab);
    if (tabs.some((t) => t.dataset.tab === id)) return select(id);
    const target = document.getElementById(id);
    const panel = target && target.closest('[role="tabpanel"]');
    if (panel) {
      select(tabs.find((t) => t.getAttribute('aria-controls') === panel.id).dataset.tab);
      target.scrollIntoView();
    } else {
      select(tabs[0].dataset.tab);
    }
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      if (input.value) { input.value = ''; filter(''); }
      select(t.dataset.tab);
      history.replaceState(null, '', '#' + t.dataset.tab);
    });
    t.addEventListener('keydown', (ev) => {
      const step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      ev.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next.dataset.tab, true);
      history.replaceState(null, '', '#' + next.dataset.tab);
    });
  });

  // ค้นหา: ค้นทุกแท็บพร้อมกัน แล้วซ่อนแถว/กลุ่มที่ไม่ตรง
  const items = Array.from(document.querySelectorAll('[role="tabpanel"] [data-search]'));
  const groups = Array.from(document.querySelectorAll('[role="tabpanel"] .tt-group, [role="tabpanel"] article'));
  const norm = (s) => s.toLowerCase().replace(/\s+/g, '');

  function filter(q) {
    const query = norm(q);
    if (!query) {
      items.forEach((el) => (el.hidden = false));
      groups.forEach((g) => (g.hidden = false));
      empty.hidden = true;
      fromHash();
      return;
    }
    let hits = 0;
    items.forEach((el) => {
      const ok = norm(el.dataset.search).includes(query);
      el.hidden = !ok;
      if (ok) hits++;
    });
    groups.forEach((g) => (g.hidden = !g.querySelector('[data-search]:not([hidden])')));
    // เปิดรายชื่อสถานีที่พับไว้ เมื่อมีสถานีที่ค้นเจออยู่ข้างใน
    document.querySelectorAll('[role="tabpanel"] article details').forEach((d) => {
      d.open = !!d.querySelector('[data-search]:not([hidden])');
    });
    panels.forEach((p) => (p.hidden = !p.querySelector('[data-search]:not([hidden])')));
    tabs.forEach((t) => t.setAttribute('aria-selected', false));
    empty.hidden = hits > 0;
  }

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => filter(input.value), 150);
  });
  // #q=ชื่อสถานี (ลิงก์จากทำเนียบสถานี) จะใส่คำค้นให้อัตโนมัติ
  function fromQuery() {
    const m = location.hash.match(/^#q=(.+)$/);
    if (!m) return false;
    input.value = decodeURIComponent(m[1]);
    filter(input.value);
    return true;
  }

  window.addEventListener('hashchange', () => fromQuery() || fromHash());
  if (!fromQuery()) fromHash();
})();
