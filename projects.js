/* ============================================================
   projects.js — Loads projects from projects.json and renders them
   To add/edit projects: edit projects.json only.
   ============================================================ */

(function () {
  'use strict';

  const CATEGORY_ORDER = [
    'Personal Project',
    'IBM · State of Arizona',
    'University Research'
  ];

  function renderProjects(projects) {
    const body = document.getElementById('projects-body');
    if (!body) return;
    body.innerHTML = '';

    // Group by category
    const groups = {};
    projects.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    // Sort categories
    const orderedCats = [
      ...CATEGORY_ORDER.filter(c => groups[c]),
      ...Object.keys(groups).filter(c => !CATEGORY_ORDER.includes(c))
    ];

    orderedCats.forEach(cat => {
      const catProjects = groups[cat];

      // Section heading
      const heading = document.createElement('div');
      heading.className = 'section-heading';
      heading.textContent = cat;
      body.appendChild(heading);

      catProjects.forEach(p => {
        const card = buildProjectCard(p);
        body.appendChild(card);
      });
    });
  }

  function buildProjectCard(p) {
    const isFeatured = p.featured;
    const div = document.createElement('div');
    div.className = 'card';
    if (isFeatured) {
      div.style.borderColor = 'rgba(232,201,122,0.4)';
      div.style.background  = 'linear-gradient(135deg, var(--surface), rgba(232,201,122,0.05))';
    }

    // Image (if provided)
    let imgHtml = '';
    if (p.image) {
      imgHtml = `<img src="${p.image}" alt="${p.title}" style="width:100%;border-radius:10px;margin-bottom:0.65rem;object-fit:cover;max-height:140px;" loading="lazy" />`;
    }

    // Tags
    const tagsHtml = (p.tags || [])
      .map(t => `<span class="tag">${t}</span>`)
      .join('');

    // Links
    let linksHtml = '';
    if (p.github || p.demo) {
      linksHtml = `<div class="project-meta" style="margin-top:0.65rem; display:flex; gap:0.75rem; flex-wrap:wrap;">`;
      if (p.github) {
        linksHtml += `<a class="project-link" href="${p.github}" target="_blank" rel="noopener">🐙 GitHub →</a>`;
      }
      if (p.demo) {
        linksHtml += `<a class="project-link" href="${p.demo}" target="_blank" rel="noopener">🌐 Live Demo →</a>`;
      }
      linksHtml += `</div>`;
    }

    div.innerHTML = `
      ${imgHtml}
      ${p.label ? `<div class="card-label">${p.label}</div>` : ''}
      <div class="card-title">${p.title}</div>
      <div class="card-text" style="margin-top:0.3rem;">${p.description}</div>
      ${tagsHtml ? `<div class="tags" style="margin-top:0.5rem;">${tagsHtml}</div>` : ''}
      ${linksHtml}
    `;
    return div;
  }

  async function loadProjects() {
    try {
      const res = await fetch('projects.json');
      if (!res.ok) throw new Error('Failed to load projects.json');
      const projects = await res.json();
      renderProjects(projects);
    } catch (err) {
      const body = document.getElementById('projects-body');
      if (body) {
        body.innerHTML = `<div class="card"><div class="card-text" style="color:#ff6b6b;">
          ⚠️ Could not load projects. Make sure projects.json is in the same folder.
          <br><small>${err.message}</small>
        </div></div>`;
      }
      console.error('Projects load error:', err);
    }
  }

  // Load when projects app is first opened
  document.addEventListener('DOMContentLoaded', () => {
    // Observe when #app-projects becomes visible
    const projectsScreen = document.getElementById('app-projects');
    if (!projectsScreen) return;

    let loaded = false;
    const observer = new MutationObserver(() => {
      if (projectsScreen.style.display !== 'none' && !loaded) {
        loaded = true;
        loadProjects();
      }
    });
    observer.observe(projectsScreen, { attributes: true, attributeFilter: ['style'] });
  });

})();