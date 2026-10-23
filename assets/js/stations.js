// ทำเนียบสถานี: ค้นหา + กรองตามสาย + กรองตามจังหวัด (ไม่ใช้ framework)
(function () {
  const input = document.getElementById('st-search');
  const line = document.getElementById('st-line');
  const count = document.getElementById('st-count');
  const rows = Array.from(document.querySelectorAll('#st-table tbody tr'));
  if (!input || !rows.length) return;
  const norm = (s) => s.toLowerCase().replace(/\s+/g, '');
  const keys = rows.map((r) => norm(r.dataset.search));

  function apply() {
    const q = norm(input.value);
    const l = line.value;
    let n = 0;
    rows.forEach((r, i) => {
      const ok = (!q || keys[i].includes(q)) && (!l || r.dataset.lines.split(' ').includes(l));
      r.hidden = !ok;
      if (ok) n++;
    });
    count.textContent = n;
  }

  let timer;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
  line.addEventListener('change', apply);
  document.querySelectorAll('.prov-btn').forEach((b) =>
    b.addEventListener('click', () => {
      input.value = b.dataset.prov;
      apply();
      document.getElementById('st-table').scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );

  // ลิงก์ #st-รหัส ให้แถวนั้นเด่นขึ้น
  function highlight() {
    rows.forEach((r) => r.classList.remove('bg-amber-50', 'dark:bg-amber-950/40'));
    const id = location.hash.slice(1);
    const row = id && document.getElementById(id);
    if (row && row.tagName === 'TR') {
      row.hidden = false;
      row.classList.add('bg-amber-50', 'dark:bg-amber-950/40');
    }
  }
  window.addEventListener('hashchange', highlight);
  highlight();
})();
