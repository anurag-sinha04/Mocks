/* ==========================================================================
   CLAT MOCK-1 — Exam security  (js/security.js)
   - Blocks phones / tablets ("please attempt on a computer")
   - Forces full-screen during the exam; leaving it shows a blocking screen
   - Counts violations (exit full-screen, tab switch, window blur)
   - Blocks right-click, copy/paste and common shortcuts
   NOTE: no website can physically stop a user pressing Esc or Alt+Tab.
   We lock Esc where the browser allows it (Chrome/Edge), detect everything
   else instantly, hide the paper and count it as a warning.
   ========================================================================== */

/* ---------------- Device check ---------------- */
export function checkDevice() {
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini|Tablet/i.test(ua);
  const ipadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const touchOnly =
    window.matchMedia?.('(pointer: coarse)').matches && !window.matchMedia?.('(any-pointer: fine)').matches;
  const tiny = Math.min(screen.width, screen.height) < 600;

  if (!(mobileUA || ipadOS || touchOnly || tiny)) return false;

  document.body.className = 'bg-slate-950 min-h-screen flex items-center justify-center p-6';
  document.body.innerHTML = `
    <div class="max-w-md w-full text-center text-white">
      <div class="mx-auto w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="2" y="4" width="20" height="13" rx="2"></rect><path d="M8 21h8M12 17v4"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-extrabold">Please attempt on a computer</h1>
      <p class="mt-3 text-slate-300 text-sm leading-relaxed">
        <b>CLAT MOCK-1</b> cannot be attempted on a mobile phone or tablet.
        Open this link on a <b>laptop or desktop</b> (Google Chrome or Microsoft Edge recommended).
      </p>
      <p class="mt-5 text-xs text-slate-500">The exam runs in full-screen mode and needs a webcam for the live photo.</p>
    </div>`;
  return true;
}

/* ---------------- Fullscreen ---------------- */
export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

export async function enterFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return false;
  try {
    await req.call(el, { navigationUI: 'hide' });
  } catch (e) {
    try { await req.call(el); } catch (e2) { return false; }
  }
  // Chromium: a short tap on Esc will NOT exit full-screen (only a long hold does)
  try { await navigator.keyboard?.lock?.(['Escape', 'F11']); } catch (e) { /* unsupported */ }
  return isFullscreen();
}

export function exitFullscreen() {
  try { navigator.keyboard?.unlock?.(); } catch (e) { /* ignore */ }
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if (isFullscreen() && ex) {
    try { const p = ex.call(document); if (p?.catch) p.catch(() => {}); } catch (e) { /* ignore */ }
  }
}

/* ---------------- Guard ---------------- */
let guard = null;

export function startGuard({ onViolation, getCount, max }) {
  stopGuard();

  const startedAt = Date.now();
  let lastViolation = 0;
  let pendingWarning = false;

  const overlay = document.createElement('div');
  overlay.id = 'guard-overlay';
  overlay.className = 'hidden fixed inset-0 z-[500] bg-slate-950 text-white flex items-center justify-center p-6 text-center';
  overlay.innerHTML = `
    <div class="max-w-md w-full">
      <div class="mx-auto w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center mb-5">
        <svg class="w-8 h-8 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 id="guard-title" class="text-xl font-extrabold"></h2>
      <p id="guard-detail" class="mt-2 text-sm text-slate-300 leading-relaxed"></p>
      <p class="mt-2 text-xs text-slate-500">Your timer is still running.</p>
      <button id="guard-btn" type="button" class="mt-6 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm cursor-pointer"></button>
    </div>`;
  document.body.appendChild(overlay);

  const titleEl = overlay.querySelector('#guard-title');
  const detailEl = overlay.querySelector('#guard-detail');
  const btn = overlay.querySelector('#guard-btn');

  const refresh = () => {
    const needFs = !isFullscreen();
    if (!needFs && !pendingWarning) {
      overlay.classList.add('hidden');
      return;
    }
    if (needFs && !pendingWarning) {
      titleEl.textContent = 'Full-screen mode is required';
      detailEl.textContent = 'The exam can only be attempted in full-screen. Click the button below to continue.';
    }
    btn.textContent = needFs ? 'Return to Full Screen & Continue' : 'Continue Exam';
    overlay.classList.remove('hidden');
  };

  const violate = (type) => {
    if (!guard) return;
    const now = Date.now();
    if (now - startedAt < 2500 || now - lastViolation < 1200) return;
    lastViolation = now;
    onViolation(type);
    if (!guard) return; // exam may have been auto-submitted
    pendingWarning = true;
    titleEl.textContent = `Warning ${getCount()} of ${max}`;
    detailEl.textContent = `${type}. After ${max} warnings your exam is submitted automatically.`;
    refresh();
  };

  btn.addEventListener('click', async () => {
    if (!isFullscreen()) await enterFullscreen();
    pendingWarning = false;
    refresh();
  });

  const onFsChange = () => {
    if (!isFullscreen()) violate('You exited full-screen mode');
    refresh();
  };
  const onVisibility = () => { if (document.visibilityState === 'hidden') violate('You switched tab or minimised the window'); };
  const onBlur = () => violate('The exam window lost focus');
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onKey = (e) => {
    const k = (e.key || '').toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const bad =
      ['f12', 'f5', 'f11', 'printscreen'].includes(k) ||
      (ctrl && ['c', 'v', 'x', 'a', 's', 'p', 'u', 'r', 'f', 'g', 'o', 'n', 'j'].includes(k)) ||
      (ctrl && e.shiftKey && ['i', 'j', 'c', 'k', 'n'].includes(k)) ||
      (e.altKey && ['arrowleft', 'arrowright'].includes(k));
    if (bad) stop(e);
  };

  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onBlur);
  document.addEventListener('keydown', onKey, true);
  ['contextmenu', 'copy', 'cut', 'paste', 'dragstart'].forEach((ev) => document.addEventListener(ev, stop, true));

  guard = {
    overlay,
    cleanup() {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('keydown', onKey, true);
      ['contextmenu', 'copy', 'cut', 'paste', 'dragstart'].forEach((ev) => document.removeEventListener(ev, stop, true));
    }
  };

  refresh(); // shows "full-screen required" straight away if not yet in full-screen
}

export function stopGuard() {
  if (!guard) return;
  guard.cleanup();
  guard.overlay.remove();
  guard = null;
  exitFullscreen();
}