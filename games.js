/* ============================================================
   games.js — Snake, Sudoku, Tic-Tac-Toe
   All game buttons use .game-btn class (NOT .back-btn)
   so they never trigger the phone navigation.
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   SNAKE
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const CELL = 18;
  let canvas, ctx, loopId, snake, dir, nextDir, food, score, best, running, paused;

  function roundRect(cx, x, y, w, h, r) {
    cx.beginPath();
    cx.moveTo(x + r, y);
    cx.lineTo(x + w - r, y);
    cx.quadraticCurveTo(x + w, y, x + w, y + r);
    cx.lineTo(x + w, y + h - r);
    cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    cx.lineTo(x + r, y + h);
    cx.quadraticCurveTo(x, y + h, x, y + h - r);
    cx.lineTo(x, y + r);
    cx.quadraticCurveTo(x, y, x + r, y);
    cx.closePath();
  }

  function setup() {
    canvas = document.getElementById('snake-canvas');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    canvas.width  = 306;
    canvas.height = 306;
    best = parseInt(localStorage.getItem('snake-best') || '0');
    const bel = document.getElementById('snake-best');
    if (bel) bel.textContent = best;
    doReset();
    return true;
  }

  function doReset() {
    if (loopId) { clearInterval(loopId); loopId = null; }
    snake   = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    running = false;
    paused  = false;
    placeFood();
    setScore(0);
    if (canvas && ctx) draw();
    setText('Tap ▶ Start or use arrow keys');
    const pb = document.getElementById('snake-pause');
    if (pb) pb.style.display = 'none';
  }

  function startGame() {
    if (!canvas && !setup()) return;
    if (loopId) { clearInterval(loopId); loopId = null; }
    running = true; paused = false;
    setText('');
    const pb = document.getElementById('snake-pause');
    if (pb) { pb.style.display = 'inline-block'; pb.textContent = '⏸ Pause'; }
    loopId = setInterval(tick, 120);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    const pb = document.getElementById('snake-pause');
    if (paused) {
      clearInterval(loopId); loopId = null;
      if (pb) pb.textContent = '▶ Resume';
      setText('⏸ Paused — tap Resume');
    } else {
      loopId = setInterval(tick, 120);
      if (pb) pb.textContent = '⏸ Pause';
      setText('');
    }
  }

  function tick() {
    if (!canvas) return;
    dir = { x: nextDir.x, y: nextDir.y };
    const cols = Math.floor(canvas.width  / CELL);
    const rows = Math.floor(canvas.height / CELL);
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) { endGame(); return; }
    if (snake.some(s => s.x === head.x && s.y === head.y))             { endGame(); return; }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; setScore(score); placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function endGame() {
    if (loopId) { clearInterval(loopId); loopId = null; }
    running = false;
    if (score > best) {
      best = score; localStorage.setItem('snake-best', best);
      const bel = document.getElementById('snake-best');
      if (bel) bel.textContent = best;
    }
    setText('💀 Game Over! Score: ' + score + ' — tap ▶ Start to retry');
    const pb = document.getElementById('snake-pause');
    if (pb) pb.style.display = 'none';
  }

  function placeFood() {
    if (!canvas) return;
    const cols = Math.floor(canvas.width  / CELL);
    const rows = Math.floor(canvas.height / CELL);
    let f;
    let attempts = 0;
    do {
      f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      attempts++;
    } while (snake.some(s => s.x === f.x && s.y === f.y) && attempts < 200);
    food = f;
  }

  function draw() {
    if (!ctx || !canvas) return;
    const light = document.documentElement.getAttribute('data-theme') === 'light';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = light ? '#eef2ff' : '#06091A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    const cols = Math.floor(canvas.width  / CELL);
    const rows = Math.floor(canvas.height / CELL);
    ctx.fillStyle = light ? 'rgba(30,58,95,0.07)' : 'rgba(126,184,247,0.05)';
    for (let cx = 0; cx < cols; cx++)
      for (let cy = 0; cy < rows; cy++) {
        ctx.beginPath();
        ctx.arc(cx * CELL + CELL/2, cy * CELL + CELL/2, 1.2, 0, Math.PI*2);
        ctx.fill();
      }

    // Snake
    snake.forEach((s, i) => {
      const alpha = Math.max(0.25, 1 - i / (snake.length + 2));
      ctx.fillStyle = i === 0
        ? (light ? '#11998e' : '#38ef7d')
        : (light ? `rgba(17,153,142,${alpha})` : `rgba(56,239,125,${alpha})`);
      roundRect(ctx, s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });

    // Food — glowing dot
    if (food) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 220);
      ctx.fillStyle   = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur  = 8 + pulse * 8;
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, 3.5 + pulse * 1.5, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function changeDir(d) {
    const m = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} };
    const n = m[d]; if (!n) return;
    if (n.x === -dir.x && n.y === -dir.y) return;
    nextDir = n;
  }

  function setScore(n) { const el = document.getElementById('snake-score'); if (el) el.textContent = n; }
  function setText(t)  { const el = document.getElementById('snake-msg');   if (el) el.textContent = t; }

  function boot() {
    const screen = document.getElementById('app-snake');
    if (!screen) return;

    let ready = false;
    new MutationObserver(() => {
      if (screen.style.display !== 'none' && !ready) {
        ready = true;
        setup();
        // Kick off animation loop for food pulse
        requestAnimationFrame(function loop() {
          if (running && !paused && canvas && ctx) draw();
          requestAnimationFrame(loop);
        });
      }
    }).observe(screen, { attributes: true, attributeFilter: ['style'] });

    // ── Buttons — stopPropagation so back-nav never fires ──
    document.getElementById('snake-start')?.addEventListener('click', e => {
      e.stopPropagation();
      doReset();
      startGame();
    });

    document.getElementById('snake-pause')?.addEventListener('click', e => {
      e.stopPropagation();
      togglePause();
    });

    document.querySelectorAll('.snake-ctrl').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!running) { doReset(); startGame(); }
        changeDir(btn.dataset.dir);
      });
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (screen.style.display === 'none') return;
      const map = { ArrowUp:'UP', ArrowDown:'DOWN', ArrowLeft:'LEFT', ArrowRight:'RIGHT' };
      if (map[e.code]) { e.preventDefault(); changeDir(map[e.code]); }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!running) { doReset(); startGame(); }
        else togglePause();
      }
    });

    // Swipe on canvas
    let tx = 0, ty = 0;
    const cvs = document.getElementById('snake-canvas');
    cvs?.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    cvs?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) changeDir(dx > 0 ? 'RIGHT' : 'LEFT');
      else changeDir(dy > 0 ? 'DOWN' : 'UP');
      if (!running) { doReset(); startGame(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


/* ════════════════════════════════════════════════════════════
   SUDOKU
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  let board = [], solution = [], prefilled = new Set(), selected = null;
  let timerSec = 0, timerInt = null, gameEnded = false;

  function generateFull() {
    const g = Array.from({ length: 9 }, () => Array(9).fill(0));
    fill(g, 0);
    return g;
  }

  function fill(g, pos) {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9), c = pos % 9;
    if (g[r][c] !== 0) return fill(g, pos + 1);
    const nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (const n of nums) {
      if (safe(g, r, c, n)) {
        g[r][c] = n;
        if (fill(g, pos + 1)) return true;
        g[r][c] = 0;
      }
    }
    return false;
  }

  function safe(g, r, c, n) {
    for (let i = 0; i < 9; i++) if (g[r][i] === n || g[i][c] === n) return false;
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[br+i][bc+j] === n) return false;
    return true;
  }

  function shuffle(a) {
    for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  function newGame() {
    const full = generateFull();
    solution   = full.map(r => [...r]);
    board      = full.map(r => [...r]);
    prefilled.clear();
    gameEnded = false;

    // Remove 44 cells for medium difficulty
    const idxs = shuffle([...Array(81).keys()]);
    for (let i = 0; i < 44; i++) {
      const r = Math.floor(idxs[i]/9), c = idxs[i]%9;
      board[r][c] = 0;
    }
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] !== 0) prefilled.add(r*9+c);

    selected = null;
    clearInterval(timerInt); timerSec = 0; updateTimer();
    timerInt = setInterval(() => { timerSec++; updateTimer(); }, 1000);

    renderBoard();
    buildNumpad();
    setMsg('');
  }

  function renderBoard() {
    const el = document.getElementById('sudoku-board');
    if (!el) return;
    el.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx  = r * 9 + c;
        const isPre = prefilled.has(idx);
        const val   = board[r][c];
        const isSel = selected === idx;
        const isErr = !isPre && val !== 0 && val !== solution[r][c];

        const cell = document.createElement('div');
        cell.textContent = val || '';
        cell.style.cssText = [
          'display:flex', 'align-items:center', 'justify-content:center',
          'aspect-ratio:1', 'min-height:28px',
          "font-family:'Space Grotesk',sans-serif", 'font-size:0.78rem', 'font-weight:700',
          'cursor:' + (isPre ? 'default' : 'pointer'),
          'background:' + (isSel ? 'rgba(126,184,247,0.22)' : 'var(--phone-screen)'),
          'color:' + (isPre ? 'var(--accent-gold)' : isErr ? '#ff6b6b' : 'var(--text-bright)'),
          'border-right:' + ((c+1)%3===0 && c<8 ? '2px solid var(--accent-blue)' : '1px solid var(--border)'),
          'border-bottom:' + ((r+1)%3===0 && r<8 ? '2px solid var(--accent-blue)' : '1px solid var(--border)'),
          'user-select:none', '-webkit-user-select:none',
          'transition:background 0.12s',
        ].join(';');

        if (!isPre && !gameEnded) {
          cell.addEventListener('click', e => {
            e.stopPropagation(); // safety net
            selected = idx;
            renderBoard();
          });
        }
        el.appendChild(cell);
      }
    }
  }

  function buildNumpad() {
    const pad = document.getElementById('sudoku-numpad');
    if (!pad || pad.children.length > 0) return;
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'sudoku-num-btn';
      btn.textContent = n;
      btn.addEventListener('click', e => { e.stopPropagation(); inputNum(n); });
      pad.appendChild(btn);
    }
    const erase = document.createElement('button');
    erase.className = 'sudoku-num-btn erase';
    erase.textContent = '✕';
    erase.title = 'Erase';
    erase.addEventListener('click', e => { e.stopPropagation(); inputNum(0); });
    pad.appendChild(erase);
  }

  function inputNum(n) {
    if (gameEnded) return;
    if (selected === null) { setMsg('👆 Tap a cell first!'); return; }
    if (prefilled.has(selected)) return;
    const r = Math.floor(selected / 9), c = selected % 9;
    board[r][c] = n;
    setMsg('');
    renderBoard();

    // Check for completion
    if (!board.flat().includes(0)) {
      const correct = board.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]));
      if (correct) {
        clearInterval(timerInt);
        gameEnded = true;
        setMsg('🎉 Solved! Congratulations! 🎊');
      } else {
        setMsg('🔍 Board complete but has errors — keep trying!');
      }
    }
  }

  function checkBoard() {
    // Does NOT end the game — just highlights errors
    let errors = 0;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!prefilled.has(r*9+c) && board[r][c] !== 0 && board[r][c] !== solution[r][c])
          errors++;

    // Re-render to show red cells
    renderBoard();

    if (errors === 0 && !board.flat().includes(0)) {
      clearInterval(timerInt); gameEnded = true;
      setMsg('🎉 Perfect! Board is correct!');
    } else if (errors === 0) {
      setMsg('✅ No errors so far — keep going!');
    } else {
      setMsg(`❌ ${errors} error${errors > 1 ? 's' : ''} found — red cells are wrong`);
    }
  }

  function giveHint() {
    if (gameEnded) return;
    const empties = [];
    for (let i = 0; i < 81; i++)
      if (board[Math.floor(i/9)][i%9] === 0) empties.push(i);
    if (!empties.length) { setMsg('Board is full!'); return; }
    const idx = empties[Math.floor(Math.random() * empties.length)];
    const r = Math.floor(idx/9), c = idx%9;
    board[r][c] = solution[r][c];
    prefilled.add(idx);
    selected = null;
    renderBoard();
    setMsg('💡 Hint placed!');
  }

  function updateTimer() {
    const el = document.getElementById('sudoku-timer');
    if (!el) return;
    const m = Math.floor(timerSec/60), s = timerSec%60;
    el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  }

  function setMsg(t) { const el = document.getElementById('sudoku-msg'); if (el) el.textContent = t; }

  function boot() {
    const screen = document.getElementById('app-sudoku');
    if (!screen) return;

    let started = false;
    new MutationObserver(() => {
      if (screen.style.display !== 'none' && !started) {
        started = true;
        newGame();
      }
    }).observe(screen, { attributes: true, attributeFilter: ['style'] });

    // Buttons with stopPropagation
    document.getElementById('sudoku-new')?.addEventListener('click',   e => { e.stopPropagation(); newGame(); });
    document.getElementById('sudoku-check')?.addEventListener('click', e => { e.stopPropagation(); checkBoard(); });
    document.getElementById('sudoku-hint')?.addEventListener('click',  e => { e.stopPropagation(); giveHint(); });

    // Keyboard number input
    document.addEventListener('keydown', e => {
      if (screen.style.display === 'none') return;
      if (e.key >= '1' && e.key <= '9') inputNum(parseInt(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') inputNum(0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


/* ════════════════════════════════════════════════════════════
   TIC-TAC-TOE (vs AI minimax)
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  let board, active, scores = { X:0, O:0, D:0 };
  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function newGame() {
    board = Array(9).fill('');
    active = true;
    setStatus('Your turn — tap a square (X)');
    renderBoard();
  }

  function renderBoard() {
    const el = document.getElementById('ttt-board');
    if (!el) return;
    el.innerHTML = '';
    board.forEach((v, i) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell' + (v ? ' filled' : '');
      cell.textContent = v === 'X' ? '✕' : v === 'O' ? '○' : '';
      cell.style.color = v === 'X' ? 'var(--accent-blue)' : 'var(--accent-gold)';
      if (!v && active) {
        cell.addEventListener('click', e => { e.stopPropagation(); playerMove(i); });
      }
      el.appendChild(cell);
    });
  }

  function playerMove(i) {
    if (!active || board[i]) return;
    board[i] = 'X';
    renderBoard();
    const w = checkWin(board, 'X');
    if (w) { highlight(w); endGame('X'); return; }
    if (board.every(Boolean)) { endGame('D'); return; }
    setStatus('🤖 AI is thinking…');
    setTimeout(aiMove, 350);
  }

  function aiMove() {
    const move = bestMove();
    if (move === -1) { endGame('D'); return; }
    board[move] = 'O';
    renderBoard();
    const w = checkWin(board, 'O');
    if (w) { highlight(w); endGame('O'); return; }
    if (board.every(Boolean)) { endGame('D'); return; }
    setStatus('Your turn (X)');
  }

  function bestMove() {
    let best = -Infinity, move = -1;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const s = minimax(board, 0, false);
        board[i] = '';
        if (s > best) { best = s; move = i; }
      }
    }
    return move;
  }

  function minimax(b, d, isMax) {
    if (checkWin(b,'O')) return 10 - d;
    if (checkWin(b,'X')) return d - 10;
    if (b.every(Boolean)) return 0;
    if (isMax) {
      let best = -Infinity;
      for (let i=0;i<9;i++) if (!b[i]) { b[i]='O'; best=Math.max(best,minimax(b,d+1,false)); b[i]=''; }
      return best;
    } else {
      let best = Infinity;
      for (let i=0;i<9;i++) if (!b[i]) { b[i]='X'; best=Math.min(best,minimax(b,d+1,true)); b[i]=''; }
      return best;
    }
  }

  function checkWin(b, p) { return WINS.find(w => w.every(i => b[i] === p)) || null; }

  function highlight(combo) {
    const cells = document.querySelectorAll('.ttt-cell');
    combo.forEach(i => cells[i]?.classList.add('win-cell'));
  }

  function endGame(r) {
    active = false;
    if      (r==='X') { scores.X++; setStatus('🎉 You win! Well played!'); }
    else if (r==='O') { scores.O++; setStatus('🤖 AI wins! Try again?'); }
    else              { scores.D++; setStatus("🤝 It's a draw!"); }
    document.getElementById('ttt-score-x').textContent = scores.X;
    document.getElementById('ttt-score-o').textContent = scores.O;
    document.getElementById('ttt-score-d').textContent = scores.D;
  }

  function setStatus(t) { const el = document.getElementById('ttt-status'); if (el) el.textContent = t; }

  function boot() {
    const screen = document.getElementById('app-tictactoe');
    if (!screen) return;
    let started = false;
    new MutationObserver(() => {
      if (screen.style.display !== 'none' && !started) { started = true; newGame(); }
    }).observe(screen, { attributes: true, attributeFilter: ['style'] });
    document.getElementById('ttt-reset')?.addEventListener('click', e => { e.stopPropagation(); newGame(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();