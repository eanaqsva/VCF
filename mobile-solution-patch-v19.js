(() => {
  'use strict';
  if (window.__vcfPatchV19) return;
  window.__vcfPatchV19 = true;

  const STORAGE_KEY = 'vcf-v13';
  const $ = s => document.querySelector(s);
  let revealedId = null;

  const css = document.createElement('style');
  css.textContent = `
    .solution-row-v19{display:flex!important;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px;min-width:0}
    .solution-row-v19>#hint{margin:0!important;min-width:0;flex:1 1 auto}
    #solutionToggleV19{display:none;appearance:none;-webkit-appearance:none;flex:0 0 auto;min-height:32px!important;height:32px!important;width:auto!important;margin:0!important;padding:0 10px!important;border:1px solid var(--line)!important;border-radius:999px!important;background:var(--surface)!important;color:var(--primary)!important;font-size:12px!important;font-weight:800!important;line-height:30px!important;white-space:nowrap!important;box-shadow:none!important;touch-action:manipulation;-webkit-user-select:none;user-select:none}
    #solutionToggleV19.active{background:var(--oksoft)!important;border-color:var(--ok)!important;color:var(--ok)!important}
    .option.solution-correct-v19{background:var(--oksoft)!important;border-color:var(--ok)!important;color:var(--ok)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--ok) 14%,transparent)!important}
    @media(max-width:430px){.solution-row-v19{gap:6px}#solutionToggleV19{font-size:11px!important;padding:0 8px!important;max-width:128px!important}.solution-row-v19>#hint{font-size:.82rem!important}}
  `;
  document.head.appendChild(css);

  function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(_){return null}}
  function question(s){return s&&Array.isArray(s.order)&&window.VCF_QUESTIONS?window.VCF_QUESTIONS[s.order[s.pos]]:null}

  function ensureUi(){
    const hint=$('#hint');
    if(!hint)return null;
    let row=$('.solution-row-v19');
    if(!row){row=document.createElement('div');row.className='solution-row-v19';hint.parentNode.insertBefore(row,hint);row.appendChild(hint)}
    let b=$('#solutionToggleV19');
    if(!b){
      b=document.createElement('button');b.type='button';b.id='solutionToggleV19';b.textContent='👁 Lösung';
      b.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();toggle()});
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
      row.appendChild(b)
    } else if(b.parentNode!==row) row.appendChild(b);
    return b
  }

  function clear(){
    document.querySelectorAll('.option.solution-correct-v19').forEach(x=>x.classList.remove('solution-correct-v19'));
    revealedId=null;
    const b=$('#solutionToggleV19');if(b){b.classList.remove('active');b.textContent='👁 Lösung'}
  }
  function toggle(){
    const s=readState(),q=question(s);if(!q)return;
    if(revealedId===q.id){clear();return}
    clear();
    document.querySelectorAll('.option').forEach(x=>{if(q.answers.includes(x.dataset.k))x.classList.add('solution-correct-v19')});
    revealedId=q.id;const b=$('#solutionToggleV19');if(b){b.classList.add('active');b.textContent='◉ Ausblenden'}
  }
  function sync(){
    const s=readState(),quiz=$('#quiz');if(!s||!quiz||!quiz.classList.contains('active'))return;
    const q=question(s);if(!q)return;
    const b=ensureUi();if(!b)return;
    b.style.display=s.mode==='wrong'?'inline-block':'none';
    if(s.mode!=='wrong'||(revealedId!==null&&revealedId!==q.id))clear();
    const count=$('#counter'),info=$('#modeInfo'),n=Number(s.pos||0)+1,total=s.order?.length||0;
    if(s.mode==='learn'&&s.random){count.textContent=`Zufällige Frage ${n} von ${total}`;if(info)info.textContent=`Originalfrage ${q.id}`}
    else if(s.mode==='wrong'){count.textContent=`Falsche Frage ${n} von ${total}`;if(info)info.textContent=`Originalfrage ${q.id}`}
    else if(s.mode==='favorites'){count.textContent=`Gemerkte Frage ${n} von ${total}`;if(info)info.textContent=`Originalfrage ${q.id}`}
  }

  // iOS PWA restores pages from memory; a lightweight heartbeat keeps the native UI in sync.
  const heartbeat=setInterval(sync,250);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
  window.addEventListener('pageshow',sync);
  document.addEventListener('click',()=>setTimeout(sync,0),false);
  sync();
})();
