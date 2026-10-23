// แบบทดสอบ: ตรวจคะแนนและแสดงเฉลย (ไม่ใช้ framework)
(function () {
  const form = document.getElementById('quiz');
  const score = document.getElementById('quiz-score');
  if (!form) return;
  const qs = Array.from(form.querySelectorAll('.quiz-q'));
  const OK = ['border-emerald-500', 'bg-emerald-50', 'dark:bg-emerald-950/40'];
  const BAD = ['border-rose-500', 'bg-rose-50', 'dark:bg-rose-950/40'];

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let right = 0, answered = 0;
    qs.forEach((q) => {
      const picked = q.querySelector('input:checked');
      q.querySelectorAll('label').forEach((l) => l.classList.remove(...OK, ...BAD));
      const correct = q.querySelectorAll('label')[Number(q.dataset.answer)];
      if (picked) {
        answered++;
        const label = picked.closest('label');
        if (picked.value === q.dataset.answer) { right++; label.classList.add(...OK); }
        else { label.classList.add(...BAD); correct.classList.add(...OK); }
        q.querySelector('.quiz-why').open = true;
      }
    });
    score.textContent = `ได้ ${right} จาก ${qs.length} คะแนน` + (answered < qs.length ? ` (ยังไม่ตอบ ${qs.length - answered} ข้อ)` : '');
  });

  form.addEventListener('reset', () => {
    qs.forEach((q) => {
      q.querySelectorAll('label').forEach((l) => l.classList.remove(...OK, ...BAD));
      q.querySelector('.quiz-why').open = false;
    });
    score.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
