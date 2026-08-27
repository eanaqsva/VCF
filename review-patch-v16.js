(() => {
  'use strict';
  if (window.__vcfPatchV16) return;
  window.__vcfPatchV16 = true;

  const STORAGE_KEY = 'vcf-v13';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  function getState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function getQuestion(state) {
    if (!state || !Array.isArray(state.order) || !window.VCF_QUESTIONS) return null;
    return window.VCF_QUESTIONS[state.order[state.pos]] || null;
  }

  function updateRoundCounter() {
    const state = getState();
    const quiz = $('#quiz');
    const counter = $('#counter');
    const modeInfo = $('#modeInfo');
    if (!state || !quiz || !counter || !quiz.classList.contains('active')) return;

    const question = getQuestion(state);
    const current = Number(state.pos || 0) + 1;
    const total = Array.isArray(state.order) ? state.order.length : 0;

    if (state.mode === 'learn' && state.random) {
      counter.textContent = `Zufällige Frage ${current} von ${total}`;
      if (modeInfo && question) modeInfo.textContent = `Originalfrage ${question.id}`;
    } else if (state.mode === 'wrong') {
      counter.textContent = `Falsche Frage ${current} von ${total}`;
      if (modeInfo && question) modeInfo.textContent = `Originalfrage ${question.id}`;
    } else if (state.mode === 'favorites') {
      counter.textContent = `Gemerkte Frage ${current} von ${total}`;
      if (modeInfo && question) modeInfo.textContent = `Originalfrage ${question.id}`;
    }
  }

  function renderExplanation(question) {
    const box = $('#feedback');
    if (!box) return;
    const wrong = Object.entries(question.wrongReasons || {}).map(([key, value]) =>
      `<li><b>${key}) ${esc(question.options[key])}</b><span>${esc(value)}</span></li>`
    ).join('');

    box.innerHTML = `
      <section class="learnCard"><h3>✓ Richtige Antwort</h3>${question.answers.map(key => `<p><b>${key}) ${esc(question.options[key])}</b></p>`).join('')}</section>
      <section class="learnCard"><h3>Warum ist das richtig?</h3><p>${esc(question.deExplanation || '')}</p></section>
      <section class="learnCard"><h3>🎯 Prüfungstipp</h3><p>${esc(question.examTip || '')}</p></section>
      <details class="learnCard"><summary>Warum die anderen Antworten falsch sind</summary><ul class="wrongList">${wrong}</ul></details>
      <details class="learnCard"><summary>Englische Originalerklärung</summary><p class="muted">${esc(question.explanation || '')}</p></details>`;
    box.className = 'feedback show';
    const next = $('#next');
    if (next) next.style.display = 'flex';
  }

  function revealAnswer() {
    const state = getState();
    const question = getQuestion(state);
    if (!question) return;

    document.querySelectorAll('.option').forEach(button => {
      button.classList.remove('selected', 'previous', 'correct', 'wrong');
      if (question.answers.includes(button.dataset.k)) button.classList.add('correct');
      button.disabled = true;
    });

    renderExplanation(question);
    const button = $('#revealCorrect');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span>✓ Richtige Antwort angezeigt</span>';
    }
  }

  function updateRevealButton() {
    const state = getState();
    const quiz = $('#quiz');
    if (!quiz || !quiz.classList.contains('active')) return;

    let button = $('#revealCorrect');
    if (state && state.mode === 'wrong') {
      if (!button) {
        button = document.createElement('button');
        button.id = 'revealCorrect';
        button.className = 'btn';
        button.innerHTML = '<span>👁 Richtige Antwort anzeigen</span><b>›</b>';
        $('#options')?.insertAdjacentElement('afterend', button);
        button.addEventListener('click', revealAnswer);
      }
      button.disabled = false;
      button.style.display = 'flex';
      button.innerHTML = '<span>👁 Richtige Antwort anzeigen</span><b>›</b>';
    } else if (button) {
      button.style.display = 'none';
    }
  }

  function refresh() {
    updateRoundCounter();
    updateRevealButton();
  }

  document.addEventListener('click', () => setTimeout(refresh, 35), true);
  document.addEventListener('change', () => setTimeout(refresh, 35), true);
  window.addEventListener('pageshow', refresh);
  setTimeout(refresh, 140);
})();
