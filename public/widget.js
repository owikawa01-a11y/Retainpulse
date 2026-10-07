/**
 * RetainPulse Widget v4.5
 * Single-offer cancellation flow with Pause option
 *
 * Reads window.RetainPulseConfig dynamically at open-time,
 * so it works regardless of when the config is set on the page.
 *
 * v4.4 changes:
 * - Production API base (retainpulse.pro)
 * - Replaced native alert() with branded toast notifications
 * - Minor stability improvements
 */

(function () {
  'use strict';

  var API_BASE = 'https://retainpulse.pro';
  var REQUEST_TIMEOUT_MS = 8000;

  // ─────────────────────────────────────────────
  //  Config accessor (dynamic — always fresh)
  // ─────────────────────────────────────────────
  function getConfig() {
    return window.RetainPulseConfig || {};
  }

  // ─────────────────────────────────────────────
  //  Constants
  // ─────────────────────────────────────────────
  var REASONS = [
    { id: 'price',      label: 'Too expensive' },
    { id: 'feature',    label: 'Missing a feature I need' },
    { id: 'competitor', label: 'Switching to another tool' },
    { id: 'usage',      label: "Don't use it enough" },
    { id: 'other',      label: 'Other' }
  ];

  var UI = {
    brand: '#8b5cf6',
    brandGradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    text: '#ffffff',
    textMuted: '#94a3b8',
    textSubtle: '#64748b',
    border: 'rgba(255,255,255,0.09)',
    bg: '#0a0a14',
    bgSubtle: '#11111d'
  };

  var state = {
    overlay: null,
    escapeHandler: null,
    submitting: false,
    toastTimer: null,
    previousActiveElement: null,
    previousBodyOverflow: ''
  };

  // ─────────────────────────────────────────────
  //  DOM helpers
  // ─────────────────────────────────────────────
  function el(tag, styles, attrs) {
    var e = document.createElement(tag);
    if (styles) e.style.cssText = styles;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
      });
    }
    return e;
  }

  function clearElement(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function injectStyles() {
    if (document.getElementById('retainpulse-styles')) return;
    var style = document.createElement('style');
    style.id = 'retainpulse-styles';
    style.textContent =
      '@keyframes rpFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes rpSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes rpSpin{to{transform:rotate(360deg)}}' +
      '@keyframes rpToastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes rpToastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}';
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  //  Toast notification (replaces alert())
  // ─────────────────────────────────────────────
  function showToast(message) {
    // Remove existing toast if any
    var existing = document.getElementById('retainpulse-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }

    var toast = document.createElement('div');
    toast.id = 'retainpulse-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'max-width:420px', 'width:calc(100% - 40px)',
      'background:' + UI.bg, 'border:1px solid ' + UI.border,
      'border-radius:14px', 'padding:16px 20px',
      'box-shadow:0 15px 40px rgba(0,0,0,0.15)',
      'font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'font-size:14px', 'color:' + UI.text, 'line-height:1.5',
      'z-index:2147483647', 'display:flex', 'align-items:flex-start', 'gap:12px',
      'animation:rpToastIn 0.3s ease-out',
      'box-sizing:border-box'
    ].join(';');

    var checkIcon = document.createElement('div');
    checkIcon.style.cssText = [
      'flex-shrink:0', 'width:24px', 'height:24px', 'border-radius:50%',
      'background:' + UI.brandGradient,
      'display:flex', 'align-items:center', 'justify-content:center',
      'color:#ffffff', 'font-weight:700', 'font-size:13px'
    ].join(';');
    checkIcon.textContent = '✓';
    toast.appendChild(checkIcon);

    var text = document.createElement('div');
    text.style.cssText = 'flex:1;padding-top:2px;';
    text.textContent = message;
    toast.appendChild(text);

    document.body.appendChild(toast);

    state.toastTimer = setTimeout(function () {
      toast.style.animation = 'rpToastOut 0.3s ease-in forwards';
      setTimeout(function () {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // ─────────────────────────────────────────────
  //  Network helper
  // ─────────────────────────────────────────────
  function postJson(path, payload) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);

    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .finally(function () { clearTimeout(timeout); });
  }

  // ─────────────────────────────────────────────
  //  Modal lifecycle
  // ─────────────────────────────────────────────
  function createModal() {
    removeExistingModal();

    state.previousActiveElement = document.activeElement;
    state.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var overlay = document.createElement('div');
    overlay.id = 'retainpulse-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cancellation feedback');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'background:rgba(5,5,12,0.72)',
      'backdrop-filter:blur(6px)', '-webkit-backdrop-filter:blur(6px)',
      'z-index:2147483647', 'display:flex', 'align-items:center',
      'justify-content:center', 'padding:20px',
      'font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'animation:rpFadeIn 0.2s ease-out'
    ].join(';');

    var box = document.createElement('div');
    box.style.cssText = [
      'background:' + UI.bg, 'border-radius:18px', 'padding:32px',
      'max-width:420px', 'width:100%',
      'box-shadow:0 24px 80px rgba(0,0,0,0.55)', 'box-sizing:border-box',
      'animation:rpSlideUp 0.3s ease-out', 'max-height:90vh', 'overflow-y:auto'
    ].join(';');

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    state.overlay = overlay;

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    state.escapeHandler = function (e) {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', state.escapeHandler);

    setTimeout(function () {
      var firstButton = box.querySelector('button, textarea, input');
      if (firstButton) firstButton.focus();
    }, 0);

    return box;
  }

  function removeExistingModal() {
    var existing = document.getElementById('retainpulse-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  function closeModal() {
    if (!state.overlay) return;
    var overlay = state.overlay;

    if (state.escapeHandler) {
      document.removeEventListener('keydown', state.escapeHandler);
      state.escapeHandler = null;
    }

    overlay.style.transition = 'opacity 0.15s';
    overlay.style.opacity = '0';
    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 150);

    state.overlay = null;
    state.submitting = false;
    document.body.style.overflow = state.previousBodyOverflow;
    if (state.previousActiveElement && typeof state.previousActiveElement.focus === 'function') {
      try { state.previousActiveElement.focus(); } catch (e) {}
    }
    state.previousActiveElement = null;

  }

  // ─────────────────────────────────────────────
  //  Cancellation completion
  // ─────────────────────────────────────────────
  function completeCancellation() {
    var config = getConfig();
    closeModal();

    if (typeof config.onCancelConfirmed === 'function') {
      try { config.onCancelConfirmed(); }
      catch (err) { console.error('[RetainPulse] onCancelConfirmed failed:', err); }
    } else if (config.cancelUrl) {
      window.location.href = config.cancelUrl;
    }
  }

  // ─────────────────────────────────────────────
  //  Step 1: Reason
  // ─────────────────────────────────────────────
  function renderReasonStep(box) {
    clearElement(box);

    box.appendChild(el(
      'h3',
      'margin:0 0 6px;font-size:20px;font-weight:700;color:' + UI.text + ';line-height:1.3;',
      { text: 'Before you go...' }
    ));

    box.appendChild(el(
      'p',
      'margin:0 0 22px;font-size:14px;color:' + UI.textMuted + ';line-height:1.5;',
      { text: "We'd love to understand what's not working. Your feedback helps us improve." }
    ));

    REASONS.forEach(function (reason) {
      var btn = el('button', [
        'display:block', 'width:100%', 'text-align:left', 'padding:14px 18px',
        'margin-bottom:10px', 'border:1.5px solid ' + UI.border,
        'border-radius:12px', 'background:' + UI.bgSubtle, 'cursor:pointer',
        'font-size:14px', 'font-weight:500', 'color:' + UI.text,
        'transition:all 0.15s', 'font-family:inherit'
      ].join(';'), { type: 'button', text: reason.label });

      btn.addEventListener('mouseenter', function () {
        btn.style.borderColor = UI.brand;
        btn.style.background = '#17142a';
        btn.style.transform = 'translateY(-1px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.borderColor = UI.border;
        btn.style.background = UI.bgSubtle;
        btn.style.transform = 'translateY(0)';
      });
      btn.addEventListener('click', function () {
        if (state.submitting) return;
        state.submitting = true;
        submitReason(reason.label, box);
      });
      box.appendChild(btn);
    });

    var skip = el(
      'button',
      'margin-top:12px;background:none;border:none;color:' + UI.textSubtle +
      ';font-size:13px;cursor:pointer;padding:8px;font-family:inherit;width:100%;text-decoration:underline;',
      { type: 'button', text: 'Skip and cancel' }
    );
    skip.addEventListener('click', function () {
      if (state.submitting) return;
      state.submitting = true;
      completeCancellation();
    });
    box.appendChild(skip);
  }

  // ─────────────────────────────────────────────
  //  Loading state
  // ─────────────────────────────────────────────
  function renderLoadingStep(box, message) {
    clearElement(box);
    var wrapper = el('div', 'text-align:center;padding:20px 0;', null);

    wrapper.appendChild(el(
      'div',
      'display:inline-block;width:32px;height:32px;border:3px solid ' + UI.border +
      ';border-top-color:' + UI.brand + ';border-radius:50%;animation:rpSpin 0.7s linear infinite;',
      null
    ));

    wrapper.appendChild(el(
      'p',
      'margin:16px 0 0;font-size:14px;color:' + UI.textMuted + ';',
      { text: message || 'Thinking...' }
    ));

    box.appendChild(wrapper);
  }

  // ─────────────────────────────────────────────
  //  Step 2: Follow-up question
  // ─────────────────────────────────────────────
  function renderFollowUpStep(box, eventId, question, reason) {
    clearElement(box);
    state.submitting = false;

    box.appendChild(el(
      'h3',
      'margin:0 0 8px;font-size:18px;font-weight:700;color:' + UI.text + ';line-height:1.3;',
      { text: 'One more thing' }
    ));

    box.appendChild(el(
      'p',
      'margin:0 0 18px;font-size:15px;color:' + UI.text + ';line-height:1.5;font-weight:500;',
      { text: question }
    ));

    var textarea = el('textarea', [
      'width:100%', 'padding:12px 14px', 'border:1.5px solid ' + UI.border,
      'border-radius:12px', 'font-size:14px', 'font-family:inherit',
      'resize:vertical', 'min-height:80px', 'box-sizing:border-box',
      'color:' + UI.text, 'transition:border-color 0.15s', 'outline:none'
    ].join(';'), { rows: '3', placeholder: 'Your thoughts (optional)...' });

    textarea.addEventListener('focus', function () { textarea.style.borderColor = UI.brand; });
    textarea.addEventListener('blur',  function () { textarea.style.borderColor = UI.border; });
    box.appendChild(textarea);

    var submitBtn = el('button', [
      'margin-top:16px', 'width:100%', 'padding:14px',
      'background:' + UI.brandGradient, 'color:#ffffff', 'border:none',
      'border-radius:12px', 'font-size:14px', 'font-weight:600',
      'cursor:pointer', 'font-family:inherit', 'transition:all 0.15s',
      'box-shadow:0 4px 14px rgba(139,92,246,0.3)'
    ].join(';'), { type: 'button', text: 'Continue' });

    submitBtn.addEventListener('click', function () {
      if (state.submitting) return;
      state.submitting = true;

      var answer = textarea.value.trim();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      submitBtn.style.opacity = '0.7';

      postJson('/api/answer', {
        event_id: eventId,
        public_key: getConfig().publicKey,
        answer: answer
      })
        .catch(function (err) { console.error('[RetainPulse] Failed to save answer:', err); })
        .then(function () { fetchAndShowOffer(box, eventId, reason, answer); });
    });
    box.appendChild(submitBtn);

    var skip = el(
      'button',
      'margin-top:10px;background:none;border:none;color:' + UI.textSubtle +
      ';font-size:13px;cursor:pointer;padding:8px;font-family:inherit;width:100%;text-decoration:underline;',
      { type: 'button', text: 'Skip and cancel' }
    );
    skip.addEventListener('click', function () {
      if (state.submitting) return;
      state.submitting = true;
      recordDecision(eventId, false).then(function () { completeCancellation(); });
    });
    box.appendChild(skip);
  }

  // ─────────────────────────────────────────────
  //  Step 3: Fetch + show retention offer
  // ─────────────────────────────────────────────
  function fetchAndShowOffer(box, eventId, reason, answer) {
    renderLoadingStep(box, 'Preparing something...');

    postJson('/api/retention', {
      event_id: eventId,
      public_key: getConfig().publicKey,
      reason: reason,
      follow_up_answer: answer
    })
      .then(function (result) {
        if (!result.ok || !result.data.offer) {
          recordDecision(eventId, false);
          completeCancellation();
          return;
        }
        renderOfferStep(box, eventId, result.data.offer, result.data.offer_type);
      })
      .catch(function (err) {
        console.error('[RetainPulse] Failed to fetch offer:', err);
        recordDecision(eventId, false);
        completeCancellation();
      });
  }

  // ─────────────────────────────────────────────
  //  Step 4: Offer display
  // ─────────────────────────────────────────────
  function renderOfferStep(box, eventId, offerText, offerType) {
    clearElement(box);
    state.submitting = false;

    box.appendChild(el(
      'h3',
      'margin:0 0 10px;font-size:18px;font-weight:700;color:' + UI.text + ';line-height:1.3;',
      { text: 'Wait, before you cancel' }
    ));

    box.appendChild(el(
      'p',
      'margin:0 0 20px;font-size:15px;color:' + UI.text + ';line-height:1.55;',
      { text: offerText }
    ));

    // Accept
    var acceptBtn = el('button', [
      'width:100%', 'padding:14px', 'margin-bottom:10px',
      'background:' + UI.brandGradient, 'color:#ffffff', 'border:none',
      'border-radius:12px', 'font-size:14px', 'font-weight:600',
      'cursor:pointer', 'font-family:inherit', 'transition:all 0.15s',
      'box-shadow:0 4px 14px rgba(139,92,246,0.3)'
    ].join(';'), { type: 'button', text: offerType === 'pause' ? 'Yes, pause my account' : 'Yes, keep my account' });

    acceptBtn.addEventListener('click', function () {
      if (state.submitting) return;
      state.submitting = true;

      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Saving...';
      acceptBtn.style.opacity = '0.7';

      recordDecision(eventId, true, offerType === 'pause' ? 'paused' : 'stayed').then(function () {
        var config = getConfig();
        closeModal();
        if (typeof config.onOfferAccepted === 'function') {
          try { config.onOfferAccepted(); }
          catch (err) { console.error('[RetainPulse] onOfferAccepted failed:', err); }
        } else {
          showToast("We've noted your response — the offer will be applied to your account shortly.");
        }
      });
    });
    box.appendChild(acceptBtn);

    // No secondary offer is shown: the server returns exactly one deterministic offer.

    // Decline
    var declineBtn = el('button', [
      'width:100%', 'padding:14px', 'background:transparent',
      'color:' + UI.textSubtle, 'border:none',
      'border-radius:12px', 'font-size:13px', 'font-weight:500',
      'cursor:pointer', 'font-family:inherit', 'transition:all 0.15s',
      'text-decoration:underline'
    ].join(';'), { type: 'button', text: 'No thanks, cancel my subscription' });

    declineBtn.addEventListener('click', function () {
      if (state.submitting) return;
      state.submitting = true;

      declineBtn.disabled = true;
      declineBtn.textContent = 'Cancelling...';
      declineBtn.style.opacity = '0.6';

      recordDecision(eventId, false).then(function () {
        completeCancellation();
      });
    });
    box.appendChild(declineBtn);
  }

  // ─────────────────────────────────────────────
  //  API: submit reason → get AI question
  // ─────────────────────────────────────────────
  function submitReason(reason, box) {
    var config = getConfig();
    renderLoadingStep(box, 'Thinking...');

    fetch(API_BASE + '/api/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_key: config.publicKey,
        reason: reason,
        customer_email: config.customerEmail || null
      })
    })
      .then(function (res) {
        return res.json().then(function (d) {
          return { status: res.status, ok: res.ok, data: d };
        });
      })
      .then(function (result) {
        state.submitting = false;

        if (result.status === 429) {
          renderErrorStep(box, 'Too many requests. Please wait a few seconds and try again.', true, function () {
            submitReason(reason, box);
          });
          return;
        }
        if (result.status === 404) {
          renderErrorStep(box, 'This widget is not configured correctly.', false);
          return;
        }
        if (!result.ok) {
          renderErrorStep(box, 'Server error. Please try again in a moment.', true, function () {
            submitReason(reason, box);
          });
          return;
        }
        if (result.data && result.data.success && result.data.event_id) {
          renderFollowUpStep(box, result.data.event_id, result.data.question, reason);
          return;
        }
        renderErrorStep(box, 'Unexpected response. Please try again.', true, function () {
          submitReason(reason, box);
        });
      })
      .catch(function (err) {
        state.submitting = false;
        console.error('[RetainPulse] Network error:', err);
        renderErrorStep(box, 'Could not connect. Please check your internet.', true, function () {
          submitReason(reason, box);
        });
      });
  }

  // ─────────────────────────────────────────────
  //  Error step
  // ─────────────────────────────────────────────
  function renderErrorStep(box, message, canRetry, onRetry) {
    clearElement(box);
    state.submitting = false;

    box.appendChild(el('div', 'text-align:center;font-size:40px;margin-bottom:12px;line-height:1;', { text: '!' }));
    box.appendChild(el('h3', 'margin:0 0 8px;font-size:18px;font-weight:700;color:' + UI.text + ';text-align:center;', { text: 'Something went wrong' }));
    box.appendChild(el('p', 'margin:0 0 22px;font-size:14px;color:' + UI.textMuted + ';text-align:center;line-height:1.5;', { text: message }));

    if (canRetry && typeof onRetry === 'function') {
      var retryBtn = el('button', [
        'width:100%', 'padding:13px', 'background:' + UI.brandGradient,
        'color:#ffffff', 'border:none', 'border-radius:12px',
        'font-size:14px', 'font-weight:600', 'cursor:pointer',
        'font-family:inherit', 'margin-bottom:10px'
      ].join(';'), { type: 'button', text: 'Try again' });
      retryBtn.addEventListener('click', onRetry);
      box.appendChild(retryBtn);
    }

    var cancelBtn = el('button', [
      'width:100%', 'padding:13px', 'background:#f3f4f6', 'color:#374151',
      'border:none', 'border-radius:12px', 'font-size:14px', 'font-weight:600',
      'cursor:pointer', 'font-family:inherit'
    ].join(';'), { type: 'button', text: 'Continue cancel' });
    cancelBtn.addEventListener('click', completeCancellation);
    box.appendChild(cancelBtn);
  }

  // ─────────────────────────────────────────────
  //  API: record decision
  // ─────────────────────────────────────────────
  function recordDecision(eventId, accepted, action) {
    var config = getConfig();
    var payload = { event_id: eventId, public_key: config.publicKey, accepted: accepted };
    if (action) payload.action = action;
    if (typeof config.customerMrr === 'number' && config.customerMrr >= 0) {
      payload.customer_mrr = config.customerMrr;
    }

    return postJson('/api/decision', payload)
      .then(function (result) { return result.data || null; })
      .then(function (data) {
        console.log('[RetainPulse] Decision recorded:', data);
        return data;
      })
      .catch(function (err) {
        console.error('[RetainPulse] Failed to record decision:', err);
        return null;
      });
  }

  // ─────────────────────────────────────────────
  //  Public API
  // ─────────────────────────────────────────────
  function show() {
    var config = getConfig();

    if (!config.publicKey) {
      console.error('[RetainPulse] Cannot open: no publicKey set in window.RetainPulseConfig');
      showToast('Configuration error: publicKey is missing. Please refresh and try again.');
      return;
    }

    state.submitting = false;
    var box = createModal();
    renderReasonStep(box);
  }

  window.RetainPulse = {
    show: show,
    hide: closeModal,
    version: '4.5'
  };

  // ─────────────────────────────────────────────
  //  Auto-bind triggers + boot
  // ─────────────────────────────────────────────
  function init() {
    var triggers = document.querySelectorAll('[data-retainpulse-trigger]');
    triggers.forEach(function (trigger) {
      if (trigger.dataset.retainpulseBound === 'true') return;
      trigger.dataset.retainpulseBound = 'true';
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        show();
      });
    });
  }

  function boot() {
    injectStyles();
    init();
    console.log('[RetainPulse] Widget v4.5 ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();