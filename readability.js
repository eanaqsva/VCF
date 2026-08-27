(() => {
  const style = document.createElement('style');
  style.textContent = `
    .readable-explanation{margin-top:16px;display:grid;gap:14px;color:var(--t)}
    .readable-section{background:var(--s2);border:1px solid var(--l);border-radius:15px;padding:14px 15px}
    .readable-section-title{display:flex;align-items:center;gap:8px;margin:0 0 9px;font-size:.79rem;font-weight:850;letter-spacing:.035em;text-transform:uppercase;color:var(--p)}
    .readable-paragraph{margin:0;line-height:1.72;font-size:.98rem;color:var(--t)}
    .readable-paragraph + .readable-paragraph{margin-top:10px}
    .readable-quote{margin:10px 0 0;padding:11px 13px;border-left:4px solid var(--p);border-radius:0 10px 10px 0;background:var(--s);line-height:1.65;color:var(--t)}
    .readable-answer{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid var(--ok);border-radius:99px;background:var(--oks);color:var(--ok);font-weight:850}
    .readable-keyword{font-weight:800;color:var(--p)}
    .readable-sentence{display:block;margin-bottom:7px}
    .readable-sentence:last-child{margin-bottom:0}
    #question{max-width:42ch;margin-top:17px;margin-bottom:17px;line-height:1.5;letter-spacing:-.01em}
    .answer{line-height:1.55}
    .feedback.show{padding:0;border:0;background:transparent;box-shadow:none}
    @media(max-width:480px){.readable-section{padding:13px}.readable-paragraph{font-size:.95rem}.readable-sentence{margin-bottom:8px}}
  `;
  document.head.appendChild(style);

  const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function sentenceSpans(text){
    const parts = text.match(/[^.!?]+(?:[.!?]+[”"']?|$)/g) || [text];
    return parts.map(x => `<span class="readable-sentence">${esc(x.trim())}</span>`).join('');
  }

  function formatFeedback(node){
    if(!node || !node.classList.contains('show') || node.dataset.readable === '1') return;
    const bold = node.querySelector('b');
    const why = node.querySelector('.why');
    if(!why) return;
    const answerText = bold ? bold.textContent : '';
    const explanationText = why.textContent;
    node.innerHTML = `
      <div class="readable-explanation">
        ${answerText ? `<section class="readable-section"><div class="readable-section-title">✓ Richtige Antwort</div><div class="readable-answer">${esc(answerText.replace(/^Richtige Antworten?:\s*/i,''))}</div></section>` : ''}
        <section class="readable-section">
          <div class="readable-section-title">▤ Erklärung</div>
          <p class="readable-paragraph">${sentenceSpans(explanationText)}</p>
        </section>
      </div>`;
    node.dataset.readable = '1';
  }

  const observer = new MutationObserver(() => {
    const feedback = document.getElementById('feedback');
    if(feedback && !feedback.classList.contains('show')) delete feedback.dataset.readable;
    formatFeedback(feedback);
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  formatFeedback(document.getElementById('feedback'));
})();
