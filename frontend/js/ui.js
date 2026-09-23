/**
 * ============================================================
 * js/ui.js
 * PURPOSE : Future UI helpers — lightweight, dependency-free
 *           utilities for niceties the v0.1 UI doesn't need yet:
 *             - toast()     : transient success/error notification
 *             - confirmBox(): a nicer confirmation dialog than window.confirm
 *           app.js currently uses the built-in window.confirm and a
 *           static <p id="form-error"> instead, so NOTHING in this
 *           file is required by the running app.
 * STATUS  : [RESERVED] — loaded by index.html but NOT imported/called
 *           by any other file. Safe to delete; or wire `toast()` into
 *           app.js when you want nicer feedback.
 * ============================================================
 */

/* global window */
'use strict';

(function attachUiHelpers() {
  /**
   * Show a small toast notification at the bottom of the viewport.
   * Purely additive: creates a <div>, animates it in, removes it.
   *
   * @param {string} message  Text to display.
   * @param {'info'|'error'} [kind='info']  Visual variant.
   */
  function toast(message, kind = 'info') {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = [
      'position:fixed', 'bottom:1rem', 'left:50%', 'transform:translateX(-50%)',
      'padding:.6rem 1rem', 'border-radius:8px', 'font:inherit', 'z-index:1000',
      'background:' + (kind === 'error' ? '#dc2626' : '#1f2933'),
      'color:#fff', 'box-shadow:0 4px 12px rgba(0,0,0,.25)',
      'opacity:0', 'transition:opacity .2s',
    ].join(';');
    document.body.appendChild(el);
    requestAnimationFrame(() => (el.style.opacity = '1'));
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    }, 2600);
  }

  /**
   * Promise-based confirmation dialog (still uses the native dialog for
   * now — the point of this helper is the Promise interface so callers
   * can `await confirmBox(...)`; swap the body for a custom <dialog>
   * later without touching call sites).
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  function confirmBox(message) {
    return Promise.resolve(window.confirm(message));
  }

  window.UiHelpers = { toast, confirmBox };
})();
