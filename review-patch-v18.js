(() => {
  'use strict';
  if (window.__vcfPatchV18) return;
  window.__vcfPatchV18 = true;

  const STORAGE_KEY = 'vcf-v13';
  const $ = selector => document.querySelector(selector);
  let revealedQuestionId = null;

  const style = document.createElement('style');
  style.textContent = `
    .hintRowV18{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .hintRowV18 #hint{margin:0;flex:1}
    #revealCorrectV18{display:none;align-items:center;gap:5px;flex:0 0 auto;border:1px solid var(--line);background:var(--surface);color:var(--primary);border-radius:999px;padding:6px 9px;font-size:.75rem;font-weight:750;line-height:1.1;white-space:nowrap}
    #revealCorrectV18.active{border-color:var(--ok);background:var(--oksoft);color:var(--ok)}
    .option.reveal-correct-v18{background:var(--oksoft)!important;border-color:var(--ok)!important;color:var(--ok)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--ok) 15%,transparent)}
    @media(max-width:390px){#revealCorrectV18{font-size:.7rem;padding:6px 8px}.hintRowV18{gap:7px}}
  `;
  document.head.appendChild(style);

  function getState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(_){return null}
  }
  function getQuestion(state){
    if(!state||!Array.isArray(state.order)||!window.VCF_QUESTIONS)return null;
    return window.VCF_QUESTIONS[state.order[state.pos]]||null;
  }
  function ensurePlacement(){
    const hint=$('#hint');
    if(!hint)return null;
    let row=$('.hintRowV18');
    if(!row){
      row=document.createElement('div');
      row.className='hintRowV18';
      hint.parentNode.insertBefore(row,hint);
      row.appendChild(hint);
    }
    let button=$('#revealCorrectV18');
    if(!button){
      button=document.createElement('button');
      button.id='revealCorrectV18';
      button.type='button';
      button.innerHTML='<span>👁 Lösung</span>';
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        toggleReveal();
      });
      row.appendChild(button);
    }else if(button.parentNode!==row){row.appendChild(button)}
    return button;
  }
  function clearReveal(){
    document.querySelectorAll('.option.reveal-correct-v18').forEach(b=>b.classList.remove('reveal-correct-v18'));
    revealedQuestionId=null;
    const button=$('#revealCorrectV18');
    if(button){button.classList.remove('active');button.innerHTML='<span>👁 Lösung</span>'}
  }
  function showReveal(question){
    document.querySelectorAll('.option').forEach(button=>{
      if(question.answers.includes(button.dataset.k))button.classList.add('reveal-correct-v18');
    });
    revealedQuestionId=question.id;
    const button=$('#revealCorrectV18');
    if(button){button.classList.add('active');button.innerHTML='<span>◉ Ausblenden</span>'}
  }
  function toggleReveal(){
    const state=getState(),question=getQuestion(state);
    if(!question)return;
    if(revealedQuestionId===question.id)clearReveal();
    else{clearReveal();showReveal(question)}
  }
  function updateCounter(state,question){
    const counter=$('#counter'),modeInfo=$('#modeInfo');
    if(!counter)return;
    const current=Number(state.pos||0)+1,total=state.order?.length||0;
    if(state.mode==='learn'&&state.random){counter.textContent=`Zufällige Frage ${current} von ${total}`;if(modeInfo)modeInfo.textContent=`Originalfrage ${question.id}`}
    else if(state.mode==='wrong'){counter.textContent=`Falsche Frage ${current} von ${total}`;if(modeInfo)modeInfo.textContent=`Originalfrage ${question.id}`}
    else if(state.mode==='favorites'){counter.textContent=`Gemerkte Frage ${current} von ${total}`;if(modeInfo)modeInfo.textContent=`Originalfrage ${question.id}`}
  }
  function refresh(){
    const state=getState(),quiz=$('#quiz');
    if(!state||!quiz||!quiz.classList.contains('active'))return;
    const question=getQuestion(state);if(!question)return;
    const button=ensurePlacement();
    updateCounter(state,question);
    if(state.mode==='wrong'){
      button.style.display='inline-flex';
      if(revealedQuestionId!==null&&revealedQuestionId!==question.id)clearReveal();
    }else{
      button.style.display='none';
      clearReveal();
    }
  }

  // Bubble phase means the app's own click handlers run first; refresh then sees the new mode immediately.
  document.addEventListener('click',()=>setTimeout(refresh,0),false);
  document.addEventListener('change',()=>setTimeout(refresh,0),false);
  window.addEventListener('pageshow',refresh);
  setTimeout(refresh,100);
})();
