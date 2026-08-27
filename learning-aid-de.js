(() => {
  const IMPORTANT = [
    'Which two','Which three','Which four','Choose two','Choose three','Choose four','must','required','prerequisite','before','after','default','minimum','only','not','first','initial','existing','new','without','RPO','dark site','air-gapped','High Availability','Simple','workload domain','management domain','VCF Installer','SDDC Manager','VCF Operations','vSAN','NSX','Kubernetes','vSphere Supervisor','Active Policy','Identity Broker','ClusterRoleBinding','Resource Pool','EVC','180 days'
  ];
  const TIP_MAP = [
    [/choose (two|three|four)/i,'Achte zuerst auf die geforderte Anzahl der Antworten. Die Frage ist erst vollständig beantwortet, wenn genau diese Anzahl ausgewählt wurde.'],
    [/must|required|prerequisite/i,'Schlüsselwort: Pflichtanforderung. Gesucht ist keine Empfehlung, sondern eine zwingende Voraussetzung.'],
    [/before/i,'Achte auf die Reihenfolge. Gesucht ist der Schritt, der vor dem beschriebenen Workflow abgeschlossen sein muss.'],
    [/after/i,'Achte auf die Reihenfolge. Gesucht ist eine Aktion nach dem genannten Ereignis.'],
    [/default/i,'Schlüsselwort: Standardverhalten. Wähle die voreingestellte Funktion, nicht eine mögliche Alternative.'],
    [/minimum|smallest/i,'Schlüsselwort: Minimum. Gesucht ist die kleinste unterstützte Ausprägung, nicht die leistungsfähigste.'],
    [/only|without/i,'Achte auf die Einschränkung. Antworten, die zusätzliche Komponenten oder einen erweiterten Scope einführen, sind häufig Ablenker.'],
    [/dark site|air-gapped|does not have internet/i,'Erkenne das Offline-Szenario. Entscheidend ist der dokumentierte Workflow für Umgebungen ohne Internetzugang.'],
    [/VCF Installer/i,'Prüfungsmuster: Bei VCF 9.0 und initialem Deployment beziehungsweise Bring-up besonders auf den VCF Installer achten.'],
    [/SDDC Manager/i,'Prüfungsmuster: SDDC Manager steht typischerweise für Lifecycle- und Verwaltungsaufgaben nach dem Bring-up.'],
    [/vSAN/i,'Bei vSAN-Fragen Hostanzahl, Architekturtyp, Storage Policy und Ausfalltoleranz getrennt betrachten.'],
    [/Kubernetes|Supervisor|VKS/i,'Bei Kubernetes-Fragen genau zwischen Cluster-, Namespace- und Supervisor-Ebene unterscheiden.'],
    [/NSX|VPC|Tier-0|T0/i,'Bei NSX-Fragen auf Scope und Routing-Ebene achten: Segment, VPC, Projekt, Tier-0 und externe Anbindung sind nicht austauschbar.'],
    [/alert|symptom|policy/i,'Bei Operations-Alerts die Kette Symptomdefinition → Alertdefinition → aktive Policy beachten.']
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mark(text){
    let out=esc(text);
    [...IMPORTANT].sort((a,b)=>b.length-a.length).forEach(k=>{
      const re=new RegExp(`\\b(${k.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')})\\b`,'gi');
      out=out.replace(re,'<mark class="exam-keyword">$1</mark>');
    });
    return out;
  }
  function tip(q){
    const text=q.question;
    const hits=TIP_MAP.filter(([r])=>r.test(text)).map(([,t])=>t);
    return hits.slice(0,2).join(' ')
      || 'Lies zuerst den letzten Satz der Frage und markiere gedanklich Produkt, Aufgabe und Einschränkung. Prüfe danach jede Antwort nur gegen diese drei Punkte.';
  }
  function germanSummary(q){
    const correct=q.answers.map(k=>`${k}) ${q.options[k]}`).join(' · ');
    return `Für diese Frage ist beziehungsweise sind ${correct} als richtige Lösung hinterlegt. Entscheidend ist, dass die ausgewählte Antwort alle Bedingungen der Frage erfüllt. Beachte dabei besonders die hervorgehobenen Schlüsselwörter und Einschränkungen.`;
  }
  function wrongReasons(q){
    return Object.entries(q.options).filter(([k])=>!q.answers.includes(k)).map(([k,v])=>
      `<li><b>${esc(k)}) ${esc(v)}</b><span>Diese Option gehört nicht zur hinterlegten richtigen Lösung. Vergleiche die Option besonders mit den hervorgehobenen Pflichtbegriffen und Einschränkungen der Frage.</span></li>`
    ).join('');
  }
  const css=document.createElement('style');css.textContent=`
    .exam-keyword{background:#fde68a;color:#713f12;padding:.05em .24em;border-radius:.3em;font-weight:850;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    [data-theme=dark] .exam-keyword{background:#713f12;color:#fef3c7}
    .learning-de{display:grid;gap:13px;margin-top:14px}.learning-card{background:var(--s);border:1px solid var(--l);border-radius:16px;padding:14px}.learning-card h3{margin:0 0 9px;font-size:.82rem;letter-spacing:.035em;text-transform:uppercase;color:var(--p)}.learning-card p{margin:0;line-height:1.7}.learning-card summary{cursor:pointer;font-weight:800;color:var(--p)}.wrong-list{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:10px}.wrong-list li{padding:11px;border-radius:12px;background:var(--s2);border-left:4px solid var(--bad)}.wrong-list b,.wrong-list span{display:block}.wrong-list span{margin-top:5px;color:var(--m);line-height:1.55}.original-explanation{margin-top:10px;color:var(--m);line-height:1.65}
  `;document.head.appendChild(css);
  function enhanceQuestion(){
    const el=document.getElementById('question'); if(!el||!window.VCF_QUESTIONS)return;
    const q=window.VCF_QUESTIONS.find(x=>x.question===el.textContent);if(!q)return;
    el.innerHTML=mark(q.question);
  }
  function enhanceFeedback(){
    const f=document.getElementById('feedback');if(!f||!f.classList.contains('show')||f.dataset.learning==='1')return;
    const q=window.VCF_QUESTIONS?.find(x=>x.question===document.getElementById('question')?.textContent);if(!q)return;
    const original=q.explanation;
    f.innerHTML=`<div class="learning-de"><section class="learning-card"><h3>✓ Richtige Antwort</h3><p>${q.answers.map(k=>`<b>${esc(k)}) ${esc(q.options[k])}</b>`).join('<br>')}</p></section><section class="learning-card"><h3>▤ Deutsche Lernzusammenfassung</h3><p>${esc(germanSummary(q))}</p></section><section class="learning-card"><h3>🎯 Prüfungstipp</h3><p>${esc(tip(q))}</p></section><details class="learning-card"><summary>Warum die anderen Antworten nicht zur Lösung gehören</summary><ul class="wrong-list">${wrongReasons(q)}</ul></details><details class="learning-card"><summary>Originalerklärung wortgetreu anzeigen</summary><div class="original-explanation">${esc(original)}</div></details></div>`;
    f.dataset.learning='1';
  }
  const o=new MutationObserver(()=>{const f=document.getElementById('feedback');if(f&&!f.classList.contains('show'))delete f.dataset.learning;enhanceQuestion();enhanceFeedback()});o.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});enhanceQuestion();enhanceFeedback();
})();
