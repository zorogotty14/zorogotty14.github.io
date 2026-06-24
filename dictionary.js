/* ============================================================
   dictionary.js — Word of the Day + Search
   Uses: https://api.dictionaryapi.dev (free, no key needed)
   ============================================================ */

(function () {
  'use strict';

  const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  // Curated word list for Word of the Day (cycles by day of year)
  const WORD_LIST = [
    'ephemeral','luminous','serendipity','eloquent','nebulous','zenith',
    'perspicacious','alacrity','mellifluous','veridical','sanguine','effulgent',
    'loquacious','tenacious','equanimity','perspicuous','sagacious','redolent',
    'pellucid','quintessential','penchant','ebullient','soliloquy','incandescent',
    'laconic','pulchritude','ineffable','sempiternal','labyrinthine','quixotic',
    'nefarious','iridescent','ephemeral','ruminate','scintillating','verdant',
    'evanescent','labyrinthine','crepuscular','seraphic','diaphanous','halcyon',
    'syzygy','bucolic','petrichor','sonder','hiraeth','euphoria','melancholy',
    'catharsis','elysian','arcadian','gossamer','vestigial','ephemeral','liminal',
    'penumbra','solstice','parallax','aphelion','perihelion','zenith','nadir',
    'astral','cosmic','stellar','nebula','quasar','pulsar','aurora','celestial'
  ];

  let searchHistory = JSON.parse(localStorage.getItem('dict-history') || '[]');

  /* ── Word of the Day ─────────────────────────────────── */
  function getTodaysWord() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return WORD_LIST[dayOfYear % WORD_LIST.length];
  }

  async function loadWordOfTheDay() {
    const word = getTodaysWord();
    const data = await fetchWord(word);
    if (!data) return;

    document.getElementById('wotd-word').textContent     = word;
    document.getElementById('wotd-phonetic').textContent = data.phonetic || '';
    document.getElementById('wotd-pos').textContent      = data.pos || '';
    document.getElementById('wotd-def').textContent      = data.definition || 'Definition not found.';
    document.getElementById('wotd-example').textContent  = data.example ? `"${data.example}"` : '';
    if (!data.example) document.getElementById('wotd-example').style.display = 'none';
  }

  /* ── Fetch word from API ─────────────────────────────── */
  async function fetchWord(word) {
    try {
      const res  = await fetch(API + encodeURIComponent(word.toLowerCase()));
      if (!res.ok) return null;
      const json = await res.json();
      if (!Array.isArray(json) || !json.length) return null;

      const entry    = json[0];
      const meanings = entry.meanings || [];
      const phonetic = entry.phonetics?.find(p => p.text)?.text || entry.phonetic || '';
      const meaning  = meanings[0];
      const def      = meaning?.definitions?.[0];

      return {
        word:       entry.word,
        phonetic,
        pos:        meaning?.partOfSpeech || '',
        definition: def?.definition || '',
        example:    def?.example || '',
        allMeanings: meanings,
        phonetics: entry.phonetics
      };
    } catch {
      return null;
    }
  }

  /* ── Render search result ────────────────────────────── */
  function renderResult(data) {
    const container = document.getElementById('dict-results');
    if (!container) return;
    container.innerHTML = '';

    if (!data) {
      container.innerHTML = `<div class="dict-result-card"><div class="card-text" style="color:#ff6b6b;">❌ Word not found. Check spelling or try another.</div></div>`;
      return;
    }

    const card = document.createElement('div');
    card.className = 'dict-result-card';

    // Title + phonetic
    let html = `<div class="word-title">${data.word}</div>`;
    if (data.phonetic) html += `<div class="word-phonetic">${data.phonetic}</div>`;

    // All meanings
    (data.allMeanings || []).slice(0, 3).forEach(m => {
      html += `<div style="font-size:0.65rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--accent-gold); margin:0.5rem 0 0.25rem;">${m.partOfSpeech}</div>`;
      (m.definitions || []).slice(0, 2).forEach((d, i) => {
        html += `<div class="word-meaning">${i+1}. ${d.definition}</div>`;
        if (d.example) html += `<div class="word-example">"${d.example}"</div>`;
      });

      if (m.synonyms?.length) {
        html += `<div style="margin-top:0.35rem; font-size:0.68rem; color:var(--text-dim);">
          <span style="font-weight:600;">Synonyms:</span> ${m.synonyms.slice(0,5).join(', ')}</div>`;
      }
    });

    card.innerHTML = html;
    container.appendChild(card);
  }

  /* ── Search ──────────────────────────────────────────── */
  async function doSearch(word) {
    word = word.trim().toLowerCase();
    if (!word) return;

    const btn = document.getElementById('dict-search-btn');
    if (btn) { btn.textContent = '…'; btn.disabled = true; }

    const data = await fetchWord(word);
    renderResult(data);

    if (btn) { btn.textContent = 'Look up'; btn.disabled = false; }

    if (data) {
      // Save to history
      searchHistory = [word, ...searchHistory.filter(w => w !== word)].slice(0, 12);
      localStorage.setItem('dict-history', JSON.stringify(searchHistory));
      renderHistory();
    }
  }

  /* ── History ─────────────────────────────────────────── */
  function renderHistory() {
    const container = document.getElementById('dict-history');
    const label     = document.getElementById('dict-history-label');
    if (!container) return;
    container.innerHTML = '';
    if (searchHistory.length) {
      if (label) label.style.display = 'block';
      searchHistory.forEach(w => {
        const chip = document.createElement('span');
        chip.className = 'dict-history-chip';
        chip.textContent = w;
        chip.addEventListener('click', () => {
          const input = document.getElementById('dict-search');
          if (input) input.value = w;
          doSearch(w);
        });
        container.appendChild(chip);
      });
    } else {
      if (label) label.style.display = 'none';
    }
  }

  /* ── Init ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('dict-search-btn');
    const searchInput = document.getElementById('dict-search');

    searchBtn?.addEventListener('click', () => doSearch(searchInput?.value || ''));
    searchInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch(searchInput.value);
    });

    renderHistory();

    // Load WOTD when dictionary app opens
    const dictScreen = document.getElementById('app-dictionary');
    if (dictScreen) {
      let loaded = false;
      new MutationObserver(() => {
        if (dictScreen.style.display !== 'none' && !loaded) {
          loaded = true;
          loadWordOfTheDay();
        }
      }).observe(dictScreen, { attributes: true, attributeFilter: ['style'] });
    }
  });
})();