(() => {
  'use strict';
  if (window.__vcfLearningV9Loaded) return;
  window.__vcfLearningV9Loaded = true;

  const KEYWORDS = [
    'Choose two','Choose three','Choose four','Which two','Which three','Which four',
    'must','required','prerequisite','before','after','default','minimum','smallest',
    'only','without','first','initial','existing','new','RPO','dark site','air-gapped',
    'VCF Installer','SDDC Manager','VCF Operations','vSAN','NSX','Kubernetes',
    'vSphere Supervisor','Active Policy','Identity Broker','ClusterRoleBinding','EVC'
  ];

  const styles = document.createElement('style');
  styles.textContent = `
    .exam-keyword{background:#fde68a;color:#713f12;padding:.05em .24em;border-radius:.3em;font-weight:850;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    [data-theme=dark] .exam-keyword{background:#713f12;color:#fef3c7}
    .learn-v9{display:grid;gap:12px;margin-top:14px}
    .learn-v9-card{background:var(--s);border:1px solid var(--l);border-radius:16px;padding:14px}
    .learn-v9-card h3{margin:0 0 9px;font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;color:var(--p)}
    .learn-v9-card p{margin:0;line-height:1.7}
    .learn-v9-card summary{cursor:pointer;font-weight:800;color:var(--p)}
    .learn-v9-answer{display:grid;gap:7px;color:var(--ok);font-weight:850}
    .learn-v9-wrong{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:9px}
    .learn-v9-wrong li{padding:11px;border-radius:12px;background:var(--s2);border-left:4px solid var(--bad)}
    .learn-v9-wrong b,.learn-v9-wrong span{display:block}
    .learn-v9-wrong span{margin-top:5px;color:var(--m);line-height:1.55}
    .learn-v9-original{margin-top:10px;color:var(--m);line-height:1.7;white-space:pre-wrap}
    #question{line-height:1.52;max-width:46ch}
    .answer{line-height:1.55}
    .feedback.show{padding:0;border:0;background:transparent}
  `;
  document.head.appendChild(styles);

  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function getQuestion() {
    const el = document.getElementById('question');
    if (!el || !Array.isArray(window.VCF_QUESTIONS)) return null;
    const idText = document.getElementById('modeInfo')?.textContent || '';
    const originalId = Number((idText.match(/Originalfrage\s+(\d+)/i) || [])[1]);
    if (originalId) return window.VCF_QUESTIONS.find(q => q.id === originalId) || null;
    const plain = el.dataset.originalQuestion || el.textContent;
    return window.VCF_QUESTIONS.find(q => q.question === plain) || null;
  }

  function regexEscape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlightQuestion() {
    const el = document.getElementById('question');
    const q = getQuestion();
    if (!el || !q || el.dataset.v9Highlighted === String(q.id)) return;
    el.dataset.originalQuestion = q.question;
    let html = esc(q.question);
    [...KEYWORDS].sort((a,b) => b.length-a.length).forEach(keyword => {
      html = html.replace(new RegExp(`(${regexEscape(keyword)})`, 'gi'), '<mark class="exam-keyword">$1</mark>');
    });
    el.innerHTML = html;
    el.dataset.v9Highlighted = String(q.id);
  }

  function examTip(q) {
    const t = q.question;
    const tips = [];
    if (/choose (two|three|four)/i.test(t)) tips.push('Wähle exakt die geforderte Anzahl an Antworten.');
    if (/must|required|prerequisite/i.test(t)) tips.push('Gesucht ist eine zwingende Voraussetzung, keine Empfehlung.');
    if (/before/i.test(t)) tips.push('Achte auf die Reihenfolge: Der gesuchte Schritt muss vor dem Workflow erfolgen.');
    if (/after/i.test(t)) tips.push('Achte auf die Reihenfolge: Die gesuchte Aktion erfolgt nach dem genannten Ereignis.');
    if (/default/i.test(t)) tips.push('Gefragt ist das Standardverhalten, nicht nur eine mögliche Alternative.');
    if (/minimum|smallest/i.test(t)) tips.push('Gefragt ist die kleinste unterstützte Ausprägung.');
    if (/only|without/i.test(t)) tips.push('Die Einschränkung ist entscheidend. Schließe Antworten aus, die zusätzliche Komponenten oder einen größeren Scope einführen.');
    if (/dark site|air-gapped|does not have internet/i.test(t)) tips.push('Erkenne das Offline-Szenario und den dafür vorgesehenen VCF-Workflow.');
    if (/VCF Installer/i.test(t)) tips.push('Bei VCF 9.0 und initialem Bring-up ist der VCF Installer ein häufiges Prüfungsmuster.');
    if (/SDDC Manager/i.test(t)) tips.push('SDDC Manager steht typischerweise für Lifecycle- und Verwaltungsaufgaben nach dem Bring-up.');
    if (/vSAN/i.test(t)) tips.push('Trenne bei vSAN-Fragen Hostanzahl, Architektur, Storage Policy und Ausfalltoleranz.');
    return (tips.length ? tips.slice(0,2) : ['Lies zuerst den letzten Satz. Bestimme dann Produkt, Aufgabe und Einschränkung.']).join(' ');
  }

  function germanExplanation(q) {
    const answers = q.answers.map(k => `${k}) ${q.options[k]}`).join(' und ');
    const constraints = [];
    if (/must|required|prerequisite/i.test(q.question)) constraints.push('eine zwingende Voraussetzung');
    if (/before/i.test(q.question)) constraints.push('die richtige Reihenfolge vor dem Workflow');
    if (/after/i.test(q.question)) constraints.push('die richtige Aktion nach dem genannten Ereignis');
    if (/default/i.test(q.question)) constraints.push('das Standardverhalten');
    if (/minimum|smallest/i.test(q.question)) constraints.push('die kleinste unterstützte Ausprägung');
    if (/only|without/i.test(q.question)) constraints.push('die ausdrücklich genannte Einschränkung');
    const focus = constraints.length ? ` Entscheidend ist dabei ${constraints.join(' sowie ')}.` : '';
    return `Als richtige Lösung ist ${answers} hinterlegt.${focus} Die hervorgehobenen Schlüsselbegriffe zeigen, welche Bedingung die Antwort vollständig erfüllen muss.`;
  }

  function wrongCards(q) {
    return Object.entries(q.options)
      .filter(([key]) => !q.answers.includes(key))
      .map(([key, value]) => `<li><b>${esc(key)}) ${esc(value)}</b><span>Diese Option ist nicht als richtige Lösung hinterlegt. Vergleiche die Option mit den hervorgehobenen Pflichtbegriffen, dem Scope und der geforderten Reihenfolge.</span></li>`)
      .join('');
  }

  function formatFeedback() {
    const feedback = document.getElementById('feedback');
    const q = getQuestion();
    if (!feedback || !q || !feedback.classList.contains('show') || feedback.dataset.v9Formatted === String(q.id)) return;
    feedback.innerHTML = `
      <div class="learn-v9">
        <section class="learn-v9-card"><h3>✓ Richtige Antwort</h3><div class="learn-v9-answer">${q.answers.map(k => `<span>${esc(k)}) ${esc(q.options[k])}</span>`).join('')}</div></section>
        <section class="learn-v9-card"><h3>▤ Deutsche Erklärung</h3><p>${esc(germanExplanation(q))}</p></section>
        <section class="learn-v9-card"><h3>🎯 Prüfungstipp</h3><p>${esc(examTip(q))}</p></section>
        <details class="learn-v9-card"><summary>Warum die anderen Antworten nicht richtig sind</summary><ul class="learn-v9-wrong">${wrongCards(q)}</ul></details>
        <details class="learn-v9-card"><summary>Englische Originalerklärung wortgetreu</summary><div class="learn-v9-original">${esc(q.explanation)}</div></details>
      </div>`;
    feedback.dataset.v9Formatted = String(q.id);
  }

  function refresh() {
    window.requestAnimationFrame(() => {
      highlightQuestion();
      formatFeedback();
    });
  }

  document.addEventListener('click', () => window.setTimeout(refresh, 40), true);
  document.addEventListener('change', () => window.setTimeout(refresh, 40), true);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
  window.setTimeout(refresh, 100);
})();
