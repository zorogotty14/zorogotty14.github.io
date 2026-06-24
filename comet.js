/* ============================================================
   comet.js — Starfield + Comet Animation
   Space Observatory Portfolio
   ============================================================ */

(function () {
  'use strict';

  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let stars = [];
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = [];
      const count = Math.floor((W * H) / 3800);
      for (let i = 0; i < count; i++) {
        stars.push({
          x:    Math.random() * W,
          y:    Math.random() * H,
          r:    Math.random() * 1.4 + 0.2,
          base: Math.random() * 0.6 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
        });
      }
    }

    function drawStars(t) {
      ctx.clearRect(0, 0, W, H);
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      for (const s of stars) {
        const alpha = s.base + Math.sin(t * s.speed + s.phase) * 0.3;
        const color = isLight
          ? `rgba(60,80,150,${alpha * 0.5})`
          : `rgba(200,215,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    const COMET_PERIOD = 28000;
    let cometStart = performance.now() - Math.random() * COMET_PERIOD;

    function drawComet(t) {
      const elapsed  = (t - cometStart) % COMET_PERIOD;
      const progress = elapsed / COMET_PERIOD;
      if (progress > 0.55) return;

      const startX = -80,   startY = H * 0.08;
      const endX   = W + 80, endY  = H * 0.65;
      const cx = startX + (endX - startX) * progress;
      const cy = startY + (endY - startY) * progress;
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const tailLen = 220;
      const angle = Math.atan2(endY - startY, endX - startX);
      const tx = cx - Math.cos(angle) * tailLen;
      const ty = cy - Math.sin(angle) * tailLen;

      const grad = ctx.createLinearGradient(tx, ty, cx, cy);
      if (isLight) {
        grad.addColorStop(0, 'rgba(120,100,30,0)');
        grad.addColorStop(0.6, 'rgba(180,140,20,0.18)');
        grad.addColorStop(1, 'rgba(220,180,60,0.55)');
      } else {
        grad.addColorStop(0, 'rgba(232,201,122,0)');
        grad.addColorStop(0.6, 'rgba(232,201,122,0.3)');
        grad.addColorStop(1, 'rgba(255,240,180,0.9)');
      }

      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = grad;
      ctx.shadowColor = isLight ? 'rgba(200,160,20,0.5)' : 'rgba(255,240,160,0.7)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      // thin secondary tail
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      const ox = Math.sin(angle) * 5, oy = -Math.cos(angle) * 5;
      ctx.beginPath();
      ctx.moveTo(tx + ox, ty + oy);
      ctx.lineTo(cx + ox, cy + oy);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Head
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      if (isLight) {
        hg.addColorStop(0, 'rgba(255,240,100,1)');
        hg.addColorStop(0.35, 'rgba(220,180,60,0.5)');
        hg.addColorStop(1, 'rgba(200,160,40,0)');
      } else {
        hg.addColorStop(0, 'rgba(255,252,220,1)');
        hg.addColorStop(0.35, 'rgba(232,201,122,0.7)');
        hg.addColorStop(1, 'rgba(126,184,247,0)');
      }
      ctx.fillStyle = hg;
      ctx.shadowColor = isLight ? 'rgba(220,180,0,0.7)' : 'rgba(255,245,180,1)';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawNebula() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) return;
      const g1 = ctx.createRadialGradient(W*0.82, H*0.12, 0, W*0.82, H*0.12, W*0.28);
      g1.addColorStop(0, 'rgba(80,30,130,0.07)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W*0.12, H*0.78, 0, W*0.12, H*0.78, W*0.22);
      g2.addColorStop(0, 'rgba(20,60,130,0.08)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }

    let rafId;
    function loop(t) {
      drawStars(t);
      drawNebula();
      drawComet(t);
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();
    rafId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarfield);
  } else {
    initStarfield();
  }
})();