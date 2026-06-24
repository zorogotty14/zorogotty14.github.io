/* ============================================================
   contact.js — Contact form via Formspree
   Zero backend, works on GitHub Pages, free tier = 50 msgs/month

   ONE-TIME SETUP (2 minutes):
   1. Go to https://formspree.io and sign up free
   2. Click "New Form", give it a name like "Portfolio Contact"
   3. Copy your form endpoint — looks like:
        https://formspree.io/f/xyzabcde
   4. Paste it into FORMSPREE_ENDPOINT below
   5. That's it — emails land in your inbox automatically ✅
   ============================================================ */

(function () {
  'use strict';

  // ── ⚙️ Paste your Formspree endpoint here ────────────────
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrewegrg';
  // e.g.  'https://formspree.io/f/xyzabcde'
  // ─────────────────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }
  function val(id) { return ($( id)?.value || '').trim(); }

  function showStatus(msg, type) {
    const el = $('cf-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-status ' + type;
    el.style.display = 'block';
  }

  function hideStatus() {
    const el = $('cf-status');
    if (el) { el.textContent = ''; el.style.display = 'none'; el.className = 'form-status'; }
  }

  function setSubmitting(isSubmitting) {
    const btn  = $('cf-submit');
    const txt  = $('cf-submit-text');
    if (btn) btn.disabled = isSubmitting;
    if (txt) txt.textContent = isSubmitting ? '📡 Sending…' : '📡 Send Message';
  }

  function validate() {
    const name    = val('cf-name');
    const email   = val('cf-email');
    const subject = val('cf-subject');
    const message = val('cf-message');

    if (!name)                                           { showStatus('⚠️ Please enter your name.',            'error'); return null; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showStatus('⚠️ Please enter a valid email.', 'error'); return null; }
    if (!subject)                                        { showStatus('⚠️ Please enter a subject.',           'error'); return null; }
    if (!message || message.length < 5)                  { showStatus('⚠️ Message is too short.',             'error'); return null; }
    return { name, email, subject, message };
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    hideStatus();

    const data = validate();
    if (!data) return;

    // Not configured yet
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      showStatus(
        '⚙️ Not configured yet — open contact.js and paste your Formspree endpoint. ' +
        'Or reach Gautham on LinkedIn: linkedin.com/in/gautham-gali/',
        'error'
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name:    data.name,
          email:   data.email,
          subject: data.subject,
          message: data.message,
          _replyto: data.email,
          _subject: `Portfolio contact: ${data.subject}`,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        showStatus('✅ Message sent! Gautham will get back to you soon. 🚀', 'success');
        // Clear fields
        ['cf-name','cf-email','cf-subject','cf-message'].forEach(id => {
          const el = $(id); if (el) el.value = '';
        });
      } else {
        const errMsg = json?.errors?.map(e => e.message).join(', ') || 'Unknown error';
        showStatus(`❌ Send failed: ${errMsg}. Try LinkedIn: linkedin.com/in/gautham-gali/`, 'error');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      showStatus('❌ Network error. Please reach Gautham on LinkedIn: linkedin.com/in/gautham-gali/', 'error');
    }

    setSubmitting(false);
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('cf-submit')?.addEventListener('click', handleSubmit);

    // Enter key on single-line fields submits
    ['cf-name', 'cf-email', 'cf-subject'].forEach(id => {
      $(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
      });
    });
  });

})();