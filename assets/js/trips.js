// เที่ยวด้วยรถไฟ: แผนที่ OpenStreetMap (Leaflet) + ตัวกรองทริป
// ถ้าโหลด Leaflet ไม่ได้ เนื้อหาแผนการเดินทางและราคายังอ่านได้ครบ
(function () {
  const data = window.TRIP_ROUTES;
  if (!window.L || !data) return;

  // เซิร์ฟเวอร์ tile.openstreetmap.org บล็อกคำขอที่ไม่มี Referer ("Access blocked")
  // ซึ่งเกิดเมื่อเปิดไฟล์จากเครื่องโดยตรง (file://) กรณีนั้นใช้แผนที่ฐานของ Esri แทน
  const local = location.protocol === 'file:';
  const TILE = local
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ATTR = local
    ? 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dashed = { color: '#57534e', weight: 2.5, dashArray: '6 6', opacity: 0.9 };

  function baseMap(el, opts) {
    const map = L.map(el, Object.assign({ scrollWheelZoom: false, zoomSnap: 0.5 }, opts));
    L.tileLayer(TILE, { maxZoom: 18, attribution: ATTR, className: dark ? 'tiles-dark' : '' }).addTo(map);
    // เลื่อนหน้าด้วยล้อเมาส์ได้ตามปกติ กดที่แผนที่ก่อนจึงจะซูมด้วยล้อได้
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
    return map;
  }

  function drawSegs(t, layer, weight) {
    t.segs.forEach((s) => {
      const style = s.m === 'rail'
        ? { color: t.color, weight: weight, opacity: 0.95, lineJoin: 'round' }
        : dashed;
      L.polyline(s.c, style).addTo(layer);
    });
  }

  function pin(num, color) {
    return L.divIcon({ className: '', html: `<span class="trip-pin" style="background:${color}">${num}</span>`, iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
  }

  // ---------- แผนที่ของแต่ละทริป ----------
  const tripMaps = {};
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(onSee, { rootMargin: '300px' }) : null;
  document.querySelectorAll('.trip-map').forEach((el) => (io ? io.observe(el) : build(el)));
  function onSee(entries) {
    entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); build(e.target); } });
  }

  function build(el) {
    const id = el.dataset.trip, t = data[id];
    if (!t || tripMaps[id]) return tripMaps[id];
    el.innerHTML = '';
    const map = baseMap(el, {});
    const layer = L.featureGroup().addTo(map);
    // เส้นขอบขาวใต้เส้นรถไฟให้เห็นชัดบนพื้นแผนที่
    t.segs.filter((s) => s.m === 'rail').forEach((s) => L.polyline(s.c, { color: '#fff', weight: 8, opacity: 0.8 }).addTo(layer));
    drawSegs(t, layer, 4.5);
    t.stations.forEach((s) => {
      L.circleMarker(s.c, { radius: 6, color: t.color, weight: 3, fillColor: '#fff', fillOpacity: 1 })
        .bindTooltip('สถานี' + s.n, { direction: 'top', offset: [0, -6] }).addTo(layer);
    });
    const markers = t.pois.map((p, i) =>
      L.marker(p.c, { icon: pin(i + 1, t.color), title: p.t, riseOnHover: true })
        .bindPopup(`<b>${i + 1}.</b> ${p.t}<br><small>${dayLabel(id, p.d)}</small>`, { maxWidth: 260 })
        .addTo(layer));
    map.fitBounds(layer.getBounds(), { padding: [24, 24] });
    tripMaps[id] = { map, markers, el };
    return tripMaps[id];
  }

  // ชื่อวันจากหัวข้อในแผนการเดินทาง เช่น "วันที่ 2"
  function dayLabel(id, d) {
    const art = document.getElementById('trip-' + id);
    const h = art && art.querySelectorAll('h4')[d];
    return h ? h.firstChild.textContent.trim() : '';
  }

  // ปุ่มตัวเลขในแผนการเดินทาง: เลื่อนไปที่แผนที่แล้วเปิดหมุดนั้น
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('.poi-btn');
    if (!b) return;
    const m = build(document.querySelector(`.trip-map[data-trip="${b.dataset.trip}"]`));
    if (!m) return;
    m.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const mk = m.markers[+b.dataset.poi];
    m.map.setView(mk.getLatLng(), Math.max(m.map.getZoom(), 13));
    mk.openPopup();
  });

  // ---------- แผนที่ภาพรวม ----------
  const ov = document.getElementById('trips-overview');
  const groups = {};
  if (ov) {
    const map = baseMap(ov, {});
    const all = L.featureGroup().addTo(map);
    Object.keys(data).forEach((id) => {
      const t = data[id];
      const g = L.featureGroup().addTo(all);
      drawSegs(t, g, 4);
      const last = t.stations[t.stations.length - 1];
      const dest = t.stations.reduce((far, s) => (dist(s.c, t.stations[0].c) > dist(far.c, t.stations[0].c) ? s : far), last);
      L.circleMarker(dest.c, { radius: 7, color: '#fff', weight: 2, fillColor: t.color, fillOpacity: 1 }).addTo(g);
      g.bindTooltip(`<b>${t.title}</b><br>${t.dur}`, { sticky: true });
      g.on('click', () => go(id));
      groups[id] = g;
    });
    map.fitBounds(all.getBounds(), { padding: [20, 20] });
  }
  function dist(a, b) { return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; }
  function go(id) {
    const el = document.getElementById('trip-' + id);
    if (el) { history.replaceState(null, '', '#trip-' + id); el.scrollIntoView({ behavior: 'smooth' }); }
  }

  // ---------- ตัวกรอง ----------
  const box = document.getElementById('trip-filters');
  if (!box) return;
  box.hidden = false;
  let fdur = '', freg = '';
  const cards = Array.from(document.querySelectorAll('.trip-card'));
  const arts = Array.from(document.querySelectorAll('article.trip'));
  function apply() {
    let shown = 0;
    const ok = (el) => (!fdur || el.dataset.dur === fdur) && (!freg || el.dataset.region === freg);
    cards.forEach((c) => { const v = ok(c); c.hidden = !v; if (v) shown++; });
    arts.forEach((a) => (a.hidden = !ok(a)));
    Object.keys(groups).forEach((id) => {
      const card = cards.find((c) => c.dataset.trip === id);
      const v = card && !card.hidden;
      groups[id].eachLayer((l) => l.setStyle && l.setStyle({ opacity: v ? 0.95 : 0.12, fillOpacity: v ? 1 : 0.12 }));
    });
    document.getElementById('trip-empty').hidden = shown > 0;
  }
  box.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if ('fdur' in b.dataset) { fdur = b.dataset.fdur; box.querySelectorAll('[data-fdur]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }
    if ('freg' in b.dataset) { freg = b.dataset.freg; box.querySelectorAll('[data-freg]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }
    apply();
  });
})();
