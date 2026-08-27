(() => {
  'use strict';
  if (window.__vcfPatchV17) return;
  window.__vcfPatchV17 = true;

  const STORAGE_KEY = 'vcf-v13';
  const $ = selector => document.querySelector(selector);
  let revealedQuestionId = null;

  const style = document.createElement('style');
  style.textContent = `
    .option.reveal-correct-v17 {
      background: var(--oksoft) !important;
      border-color: var(--ok) !important;
      color: var(--ok) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--ok) 16%, transparent);
    }
    #revealCorrectV17 { margin-top: 10px; }
    #revealCorrectV17.active {
      border-color: var(--ok);
      color: var(--ok);
      background: var(--oksoft);
    }
  `;
  document.head.appendChild(style);

  function getState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function getQuestion(state) {
    if (!state || !Array.isArray(state.order) || !window.VCF_QUESTIONS) return null;
    return window.VCF_QUESTIONS[state.order[state.pos]] || null;
  }

  function clearReveal() {
    document.querySelectorAll('.option.reveal-correct-v17').forEach(button => {
      button.classList.remove('reveal-correct-v17');
    });
    revealedQuestionId = null;
    const button = $('#revealCorrectV17');
    if (button) {
      button.classList.remove('active');
      button.innerHTML = '<span>👁 Richtige Antworten anzeigen</span><b>›</b>';
    }
  }

  function showReveal(question) {
    document.querySelectorAll('.option').forEach(button => {
      if (question.answers.includes(button.dataset.k)) {
        button.classList.add('reveal-correct-v17');
      }
    });
    revealedQuestionId = question.id;
    const button = $('#revealCorrectV17');
    if (button) {
      button.classList.add('active');
      button.innerHTML = '<span>◉ Richtige Antworten ausblenden</span><b>×</b>';
    }
  }

  function toggleReveal() {
    const state = getState();
    const question = getQuestion(state);
    if (!question) return;
    if (revealedQuestionId === question.id) clearReveal();
    else {
      clearReveal();
      showReveal(question);
    }
  }

  function updateCounter() {
    const state = getState();
    const quiz = $('#quiz');
    const counter = $('#counter');
    const modeInfo = $('#modeInfo');
    if (!state || !quiz || !counter || !quiz.classList.contains('active')) return;

    const question = getQuestion(state);
    const current = Number(state.pos || 0) + 1;
    const total = state.order?.length || 0;

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

  function updateRevealButton() {
    const state = getState();
    const quiz = $('#quiz');
    if (!quiz || !quiz.classList.contains('active')) return;

    const question = getQuestion(state);
    let button = $('#revealCorrectV17');

    if (state?.mode === 'wrong') {
      if (!button) {
        button = document.createElement('button');
        button.id = 'revealCorrectV17';
        button.className = 'btn';
        button.innerHTML = '<span>👁 Richtige Antworten anzeigen</span><b>›</b>';
        $('#options')?.insertAdjacentElement('afterend', button);
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          toggleReveal();
        });
      }
      button.style.display = 'flex';
      if (question && revealedQuestionId !== null && revealedQuestionId !== question.id) clearReveal();
    } else {
      if (button) button.style.display = 'none';
      clearReveal();
    }
  }

  function refresh() {
    updateCounter();
    updateRevealButton();
  }

  // Antworten bleiben jederzeit anklickbar. Der Patch deaktiviert keine Antwort-Buttons
  // und blendet auch keine Erklärungen ein.
  document.addEventListener('click', event => {
    if (event.target.closest('.option') || event.target.closest('#next') || event.target.closest('[data-home]')) {
      setTimeout(() => {
        const state = getState();
        const question = getQuestion(state);
        if (question && revealedQuestionId !== null && revealedQuestionId !== question.id) clearReveal();
        refresh();
      }, 35);
    }
  }, true);
  document.addEventListener('change', () => setTimeout(refresh, 35), true);
  window.addEventListener('pageshow', refresh);
  setTimeout(refresh, 140);
})();
