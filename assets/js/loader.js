// หน้าจอโหลดรูปรถไฟ (ใส่ใน <head> ทุกหน้า ทำงานก่อน Tailwind เพื่อบังหน้าที่ยังไม่จัดรูปแบบ)
// วันที่การรถไฟฯ จัดขบวนรถจักรไอน้ำพิเศษ จะแสดงเป็นรถจักรไอน้ำ
// ทดสอบได้ด้วย ?loader=steam หรือ ?loader=train
// ภาพเป็นเงาสีเทา ล้อ ราง ควัน และก้านสูบเป็นองค์ประกอบ HTML แยกที่ขยับด้วย transform
// เบราว์เซอร์จึงเล่นต่อได้แม้ระหว่างที่หน้ากำลังโหลดหนัก ๆ
(function () {
  const STEAM_DAYS = {
    '3-26': 'วันสถาปนาการรถไฟแห่งประเทศไทย',
    '8-12': 'วันแม่แห่งชาติ',
    '10-23': 'วันปิยมหาราช',
    '12-5': 'วันพ่อแห่งชาติ',
  };
  const now = new Date();
  const force = (location.search.match(/[?&]loader=(steam|train)/) || [])[1];
  const today = STEAM_DAYS[now.getMonth() + 1 + '-' + now.getDate()];
  const steam = force ? force === 'steam' : !!today;
  const dayName = today || 'ขบวนรถจักรไอน้ำ';

  // แสดงนานขึ้นเฉพาะหน้าแรกที่เปิดในแต่ละครั้ง หน้าถัดไปแสดงแค่ระหว่างที่โหลดจริง
  let first = true;
  try { first = !sessionStorage.getItem('tl-seen'); sessionStorage.setItem('tl-seen', '1'); } catch (e) {}
  const MIN = first ? (steam ? 1600 : 900) : 0;

  // ฉากกว้าง 340 x 112 หน่วย ตำแหน่งชิ้นส่วน HTML คิดเป็น % ของฉาก
  const W = 340, H = 112, GAP = 24; // GAP = ระยะห่างหมอนรองราง
  const pos = (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%`;

  const css = `
#tl{--s:#a8a29e;--bg:#fdfaf4;position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg);color:#78716c;font-family:"Noto Sans Thai",system-ui,sans-serif;transition:opacity .45s ease,visibility .45s}
#tl.tl-out{opacity:0;visibility:hidden}
#tl p{margin:0;font-size:15px;letter-spacing:.02em}
#tl small{display:block;text-align:center;font-size:12px;margin-top:2px}
.tl-scene{position:relative;width:min(340px,80vw);aspect-ratio:${W}/${H};container-type:inline-size}
.tl-scene>*,.tl-car>*{position:absolute}
.tl-scene svg{display:block;width:100%;height:100%;overflow:visible}
.tl-car{inset:0;animation:tl-bob .9s ease-in-out infinite;will-change:transform}
.tl-ties{overflow:hidden}
.tl-ties i{position:absolute;top:0;bottom:0;left:0;width:calc(100% + ${(GAP / W) * 100}cqw);background:repeating-linear-gradient(90deg,var(--s) 0 ${(12 / W) * 100}cqw,transparent 0 ${(GAP / W) * 100}cqw);opacity:.55;animation:tl-run .4s linear infinite;will-change:transform}
.tl-rail{background:var(--s);border-radius:2px}
.tl-w{animation:tl-spin .5s linear infinite;will-change:transform}
.tl-rod{animation:tl-rod .5s linear infinite;will-change:transform}
.tl-puff{border-radius:50%;background:var(--s);opacity:0;animation:tl-puff 1.5s ease-out infinite;will-change:transform,opacity}
.tl-dots i{display:inline-block;width:5px;height:5px;margin:0 2px;border-radius:50%;background:currentColor;animation:tl-dot 1.2s infinite}
.tl-dots i:nth-child(2){animation-delay:.2s}.tl-dots i:nth-child(3){animation-delay:.4s}
@keyframes tl-run{to{transform:translateX(-${(GAP / W) * 100}cqw)}}
@keyframes tl-bob{50%{transform:translateY(-1px)}}
@keyframes tl-spin{to{transform:rotate(-360deg)}}
@keyframes tl-rod{0%{transform:translate(0,0)}25%{transform:translate(-3%,-90%)}50%{transform:translate(0,-180%)}75%{transform:translate(3%,-90%)}100%{transform:translate(0,0)}}
@keyframes tl-puff{0%{opacity:.7;transform:translate(0,0) scale(.4)}100%{opacity:0;transform:translate(-260%,-190%) scale(1.9)}}
@keyframes tl-dot{0%,80%,100%{opacity:.25}40%{opacity:1}}
@media (prefers-color-scheme:dark){#tl{--s:#57534e;--bg:#0c0a09;color:#a8a29e}}
@media (prefers-reduced-motion:reduce){.tl-car,.tl-puff,.tl-rod{animation:none}.tl-puff{display:none}.tl-w{animation-duration:1.6s}.tl-ties i{animation-duration:1.3s}}`;

  // ล้อ: วงกลมสีเงา มีก้านล้อสีพื้นหลังให้เห็นการหมุน
  function wheel(cx, cy, r) {
    return `<span class="tl-w" style="${pos(cx - r, cy - r, r * 2, r * 2)}"><svg viewBox="-10 -10 20 20"><circle r="10" fill="var(--s)"/><path d="M-7 0H7M0-7V7M-5-5 5 5M-5 5 5-5" stroke="var(--bg)" stroke-width="1.6"/><circle r="2.2" fill="var(--bg)"/></svg></span>`;
  }
  const track = `<div class="tl-ties" style="${pos(-10, 101, 360, 7)}"><i></i></div><div class="tl-rail" style="${pos(-10, 100, 360, 2.5)}"></div>`;
  const svg = (inner) => `<svg viewBox="0 0 ${W} ${H}" style="inset:0" aria-hidden="true">${inner}</svg>`;

  // รถดีเซลราง 2 คัน
  function trainScene() {
    const car = (x, front) => {
      const w = front ? 118 : 108;
      return `<rect x="${x}" y="52" width="${w}" height="42" rx="7" fill="var(--s)"/>
        ${front ? `<path d="M${x + 108} 52h4c10 0 18 10 20 24l2 18h-26z" fill="var(--s)"/><path d="M${x + 114} 58c7 2 11 9 13 18h-13z" fill="var(--bg)" opacity=".7"/>` : ''}
        ${[0, 1, 2, 3].map((i) => `<rect x="${x + 8 + i * 25}" y="64" width="17" height="10" rx="2" fill="var(--bg)" opacity=".7"/>`).join('')}
        <rect x="${x}" y="80" width="${front ? 134 : w}" height="2" fill="var(--bg)" opacity=".5"/>`;
    };
    const wheels = (x, front) => [18, 32, front ? 92 : 76, front ? 106 : 90].map((d) => wheel(x + d, 98, 5)).join('');
    return `${track}<div class="tl-car">${svg(car(40, false) + '<rect x="148" y="70" width="10" height="6" fill="var(--s)"/>' + car(156, true))}${wheels(40, false)}${wheels(156, true)}</div>`;
  }

  // รถจักรไอน้ำพร้อมรถพ่วงถ่านและควัน
  function steamScene() {
    const body = `
      <rect x="34" y="56" width="74" height="34" rx="4" fill="var(--s)"/><rect x="38" y="50" width="66" height="8" rx="3" fill="var(--s)"/>
      <rect x="108" y="78" width="10" height="6" fill="var(--s)"/>
      <path d="M118 40h40v50h-40z" fill="var(--s)"/><path d="M114 35h48v7h-48z" fill="var(--s)"/>
      <rect x="126" y="50" width="22" height="16" rx="2" fill="var(--bg)" opacity=".7"/>
      <rect x="156" y="56" width="92" height="30" rx="14" fill="var(--s)"/>
      <rect x="200" y="46" width="12" height="12" rx="5" fill="var(--s)"/>
      <path d="M236 38h14l-2 20h-10z" fill="var(--s)"/><rect x="233" y="33" width="20" height="6" rx="2" fill="var(--s)"/>
      <circle cx="256" cy="71" r="14" fill="var(--s)"/><circle cx="256" cy="71" r="5" fill="var(--bg)" opacity=".6"/>
      <path d="M262 84l18 12h-26z" fill="var(--s)"/>`;
    const puffs = [0, 0.5, 1].map((d) => `<span class="tl-puff" style="${pos(234, 18, 20, 20)};animation-delay:${d}s"></span>`).join('');
    const wheels = wheel(52, 97, 6) + wheel(88, 97, 6) + wheel(176, 92, 11) + wheel(204, 92, 11) + wheel(232, 92, 11) + wheel(256, 99, 5);
    const rod = `<span class="tl-rod" style="${pos(172, 89, 66, 3.5)}"><svg viewBox="0 0 66 3.5" preserveAspectRatio="none"><rect width="66" height="3.5" rx="1.75" fill="var(--s)"/><rect x="1" y="1" width="64" height="1.5" rx=".75" fill="var(--bg)" opacity=".5"/></svg></span>`;
    return `${track}<div class="tl-car">${puffs}${svg(body)}${wheels}${rod}</div>`;
  }

  const el = document.createElement('div');
  el.id = 'tl';
  el.setAttribute('role', 'status');
  el.innerHTML = `<style>${css}</style><div class="tl-scene" aria-hidden="true">${steam ? steamScene() : trainScene()}</div>
    <div><p>กำลังโหลด <span class="tl-dots"><i></i><i></i><i></i></span></p>${steam ? `<small>${dayName} · ขบวนรถจักรไอน้ำ</small>` : ''}</div>`;
  document.documentElement.appendChild(el);

  const start = performance.now();
  let done = false;
  function hide() {
    if (done) return;
    done = true;
    setTimeout(() => {
      el.classList.add('tl-out');
      setTimeout(() => el.remove(), 500);
    }, Math.max(0, MIN - (performance.now() - start)));
  }
  window.addEventListener('load', hide);
  el.addEventListener('click', hide);
  setTimeout(hide, 6000); // กันค้าง ถ้ารูปหรือแผนที่โหลดช้า
})();
