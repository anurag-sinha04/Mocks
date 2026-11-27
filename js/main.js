/* ==========================================================================
   CLAT MOCK-1 — Core logic  (js/main.js, loaded by js/app.js)
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, updateDoc, getDocFromServer,
  getDocs, query, where, limit, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { firebaseConfig, COLLECTION_NAME, isFirebaseConfigured } from "./firebase-config.js";
import { CLAT_SECTIONS, QUESTIONS, TOTAL_EXAM_SECONDS } from "./questions.js";
import { enterFullscreen, startGuard, stopGuard } from "./security.js";
import { renderParagraph, attachPen, PEN_COLORS, HL } from "./annotate.js";
import { buildPaperHtml, roman, sourceLine } from "./paper.js";

const REG_BTN_TEXT = 'Register / Login & Continue';
const LETTERS = ['A', 'B', 'C', 'D'];
const MAX_VIOLATIONS = 5;
const N = QUESTIONS.length;

/* =========================================================================
   1. STATE
   ========================================================================= */
let db = null, currentUser = null, firebaseReady = false, unsubscribeScoreboard = null;
let allScoreboardRecords = [];

let candidate = emptyCandidate();
function emptyCandidate() { return { name: '', mobile: '', email: '', photoDataUrl: '' }; }

let mediaStream = null;
let currentQuestionIndex = 0;
let paletteShowAll = false;
let passageFontSize = 15;
let remainingSeconds = TOTAL_EXAM_SECONDS;
let examSubmitted = false, examRunning = false;
let questionStates = [];
let annotations = {};
let qTime = [];
let violations = [];
let lastSwitchPerf = performance.now();
let viewMode = 'split'; // 'split' | 'booklet'
let bookletSectionId = null, bookletObserver = null;
let pen = { mode: 'off', color: 'yellow' };
let warned = { 15: false, 5: false, 1: false };

let activeRec = null;          // latest Firestore record of this candidate
let attemptsList = [];         // all attempts incl. latest completed one
let viewedAttemptIdx = 0;
let lastView = null;

let examStartMs = null, syncServerMs = 0, syncPerf = 0;
let timerInterval = null, heartbeatInterval = null, saveTimeout = null;

function resetExamState() {
  currentQuestionIndex = 0;
  paletteShowAll = false;
  remainingSeconds = TOTAL_EXAM_SECONDS;
  examSubmitted = false;
  examRunning = false;
  clearInterval(timerInterval); clearInterval(heartbeatInterval); clearTimeout(saveTimeout);
  timerInterval = heartbeatInterval = saveTimeout = null;
  questionStates = QUESTIONS.map(() => ({ visited: false, selectedOption: null, markedForReview: false }));
  annotations = {};
  qTime = QUESTIONS.map(() => 0);
  violations = [];
  bookletSectionId = null;
  pen = { mode: 'off', color: 'yellow' };
  warned = { 15: false, 5: false, 1: false };
  lastSwitchPerf = performance.now();
}
resetExamState();

/* =========================================================================
   2. HELPERS
   ========================================================================= */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function showToast(message, type = 'info') {
  const c = $('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  const styles = {
    success: 'bg-emerald-700 text-white border-emerald-500', error: 'bg-red-700 text-white border-red-500',
    warning: 'bg-amber-600 text-white border-amber-400', info: 'bg-slate-900 text-white border-slate-700'
  };
  t.className = `toast-enter pointer-events-auto px-4 py-3 rounded-xl border shadow-lg text-xs sm:text-sm font-medium transition-all duration-200 ${styles[type] || styles.info}`;
  t.textContent = message;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.remove(), 220); }, 4200);
}

function showScreen(id) {
  ['screen-registration', 'screen-instructions', 'screen-exam', 'screen-scorecard'].forEach((s) => $(s)?.classList.toggle('hidden', s !== id));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

const formatTimer = (s) => { s = Math.max(0, Math.floor(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function formatDurationHuman(s) {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}h ${m}m ${sec}s` : m ? `${m}m ${sec}s` : `${sec}s`;
}
const maskMobile = (m = '') => (m.length === 10 ? `${m.slice(0, 2)}XXXXX${m.slice(7)}` : m);
const maskEmail = (e = '') => { const [u, d] = String(e).split('@'); return d ? `${u.slice(0, 2)}***@${d}` : e; };
const toMs = (ts) => (ts && typeof ts.toMillis === 'function' ? ts.toMillis() : ts ? new Date(ts).getTime() : null);
const wc = (paras) => paras.join(' ').split(/\s+/).filter(Boolean).length;

/* =========================================================================
   3. FIREBASE + SERVER-ANCHORED CLOCK
   ========================================================================= */
const attemptsCol = () => collection(db, COLLECTION_NAME);
const recRef = (mobile = candidate.mobile) => doc(db, COLLECTION_NAME, mobile);

async function initFirebase() {
  if (!isFirebaseConfigured()) { showToast('Server settings are missing. Contact the administrator.', 'error'); return; }
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    currentUser = (await signInAnonymously(getAuth(app))).user;
    firebaseReady = true;
    subscribeToScoreboard();
  } catch (err) {
    console.error('Init error:', err);
    showToast('Could not connect to the server. Check your internet and refresh.', 'error');
  }
}

function subscribeToScoreboard() {
  unsubscribeScoreboard?.();
  unsubscribeScoreboard = onSnapshot(attemptsCol(), (snap) => {
    allScoreboardRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderAllScoreboards();
  }, (e) => console.error('Leaderboard error:', e));
}

const serverNow = () => syncServerMs + (performance.now() - syncPerf);
const computeRemaining = () => TOTAL_EXAM_SECONDS - Math.floor((serverNow() - examStartMs) / 1000);

function accrueTime() {
  const now = performance.now();
  if (examRunning && !examSubmitted && document.visibilityState === 'visible') {
    qTime[currentQuestionIndex] += (now - lastSwitchPerf) / 1000;
  }
  lastSwitchPerf = now;
}

function blankPayload() {
  return {
    answers: Array(N).fill(-1), marked: Array(N).fill(0), visited: Array(N).fill(0),
    qTime: Array(N).fill(0), annotations: {}, violations: [], currentQ: 0
  };
}

function statePayload() {
  accrueTime();
  return {
    answers: questionStates.map((s) => (s.selectedOption === null ? -1 : s.selectedOption)),
    marked: questionStates.map((s) => (s.markedForReview ? 1 : 0)),
    visited: questionStates.map((s) => (s.visited ? 1 : 0)),
    qTime: qTime.map((x) => Math.round(x)),
    annotations,
    violations,
    currentQ: currentQuestionIndex
  };
}

function applyRecordToState(rec) {
  if (!Array.isArray(rec.answers) || rec.answers.length !== N) return;
  questionStates = QUESTIONS.map((_, i) => ({
    visited: !!(rec.visited && rec.visited[i]) || rec.answers[i] >= 0,
    selectedOption: rec.answers[i] >= 0 ? rec.answers[i] : null,
    markedForReview: !!(rec.marked && rec.marked[i])
  }));
  currentQuestionIndex = Math.min(Math.max(Number(rec.currentQ) || 0, 0), N - 1);
  qTime = QUESTIONS.map((_, i) => Number(rec.qTime?.[i]) || 0);
  annotations = rec.annotations || {};
  violations = Array.isArray(rec.violations) ? rec.violations : [];
}

async function saveProgress() {
  if (!examRunning || examSubmitted || !candidate.mobile) return;
  try { await updateDoc(recRef(), { ...statePayload(), lastSeen: serverTimestamp() }); }
  catch (e) { console.warn('Autosave failed:', e); }
}
function scheduleSave() { clearTimeout(saveTimeout); saveTimeout = setTimeout(saveProgress, 900); }

async function pushAndSync() {
  if (!examRunning || examSubmitted) return;
  try {
    await updateDoc(recRef(), { ...statePayload(), lastSeen: serverTimestamp() });
    const d = (await getDocFromServer(recRef())).data();
    if (d?.lastSeen) { syncServerMs = toMs(d.lastSeen); syncPerf = performance.now(); }
    if (d?.status === 'completed' && !examSubmitted) {
      stopExamLoops(); stopGuard(); examSubmitted = true;
      showToast('This attempt was already submitted from another device.', 'warning');
      showCompletedScorecard(d);
    }
  } catch (e) { console.warn('Sync failed:', e); }
}

function stopExamLoops() {
  examRunning = false;
  clearInterval(timerInterval); clearInterval(heartbeatInterval); clearTimeout(saveTimeout);
}

/* =========================================================================
   4. LIVE CAMERA (auto-start, live photo only)
   ========================================================================= */
const videoEl = $('camera-video'), placeholderEl = $('camera-placeholder'), guideOverlayEl = $('camera-guide-overlay');
const previewImgEl = $('captured-photo-preview'), verifiedOverlayEl = $('photo-verified-overlay');
const timestampLabelEl = $('photo-timestamp-label'), cameraErrorBox = $('camera-error-box');
const photoSizeIndicator = $('photo-size-indicator'), captureCanvas = $('photo-capture-canvas');
const btnStartCamera = $('btn-start-camera'), btnClickPhoto = $('btn-click-photo'), btnRetakePhoto = $('btn-retake-photo');

$('btn-upload-fallback')?.parentElement?.classList.add('hidden');

function stopCameraStream() {
  mediaStream?.getTracks().forEach((t) => t.stop());
  mediaStream = null;
  if (videoEl) videoEl.srcObject = null;
}
function showCameraError(msg) { if (cameraErrorBox) { cameraErrorBox.textContent = msg; cameraErrorBox.classList.remove('hidden'); } }
function hideCameraError() { cameraErrorBox?.classList.add('hidden'); }
function setCameraButtons(mode) {
  btnStartCamera?.classList.toggle('hidden', mode !== 'idle');
  btnClickPhoto?.classList.toggle('hidden', mode !== 'live');
  btnRetakePhoto?.classList.toggle('hidden', mode !== 'captured');
}

async function startCamera() {
  hideCameraError();
  $('error-photo')?.classList.add('hidden');
  stopCameraStream();
  candidate.photoDataUrl = '';
  if (photoSizeIndicator) photoSizeIndicator.textContent = 'No photo yet';

  if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
    showCameraError('Camera needs https:// or http://localhost. Open this page from a proper address (not by double-clicking the file).');
    setCameraButtons('idle');
    return;
  }
  try {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    } catch (e1) {
      if (e1.name === 'NotAllowedError' || e1.name === 'SecurityError') throw e1;
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    previewImgEl?.classList.add('hidden');
    verifiedOverlayEl?.classList.add('hidden');
    placeholderEl?.classList.add('hidden');
    videoEl.classList.remove('hidden');
    guideOverlayEl?.classList.remove('hidden');
    videoEl.muted = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.srcObject = mediaStream;
    await new Promise((res) => { if (videoEl.readyState >= 2) return res(); videoEl.onloadedmetadata = () => res(); setTimeout(res, 3000); });
    try { await videoEl.play(); } catch (e) { /* ignore */ }
    setCameraButtons('live');
  } catch (err) {
    console.error('Webcam error:', err);
    stopCameraStream();
    videoEl?.classList.add('hidden');
    guideOverlayEl?.classList.add('hidden');
    placeholderEl?.classList.remove('hidden');
    const msgs = {
      NotAllowedError: 'Camera permission denied. Click the lock icon in the address bar, set Camera to Allow, then press "Start Camera".',
      NotFoundError: 'No camera found. A live photo is mandatory — connect a webcam.',
      NotReadableError: 'Camera is being used by another app or tab. Close it and press "Start Camera".'
    };
    showCameraError(msgs[err.name] || `Could not start the camera (${err.name || 'error'}). Press "Start Camera" to retry.`);
    setCameraButtons('idle');
  }
}

function applyCapturedPhoto() {
  const w = videoEl.videoWidth, h = videoEl.videoHeight, size = 180, min = Math.min(w, h);
  captureCanvas.width = size; captureCanvas.height = size;
  const ctx = captureCanvas.getContext('2d');
  ctx.save(); ctx.translate(size, 0); ctx.scale(-1, 1);
  ctx.drawImage(videoEl, (w - min) / 2, (h - min) / 2, min, min, 0, 0, size, size);
  ctx.restore();
  const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.72);

  stopCameraStream();
  candidate.photoDataUrl = dataUrl;
  previewImgEl.src = dataUrl;
  if (timestampLabelEl) timestampLabelEl.textContent = new Date().toLocaleTimeString();
  if (photoSizeIndicator) photoSizeIndicator.textContent = `Verified (~${Math.round((dataUrl.length * 3) / 4 / 1024)} KB)`;
  placeholderEl?.classList.add('hidden'); videoEl?.classList.add('hidden'); guideOverlayEl?.classList.add('hidden');
  previewImgEl.classList.remove('hidden'); verifiedOverlayEl?.classList.remove('hidden');
  setCameraButtons('captured');
  $('error-photo')?.classList.add('hidden');
  showToast('Live photo captured!', 'success');
}

btnStartCamera?.addEventListener('click', startCamera);
btnRetakePhoto?.addEventListener('click', startCamera);
btnClickPhoto?.addEventListener('click', () => {
  if (!videoEl.videoWidth) { showToast('Camera is still warming up. Try again in a second.', 'warning'); return; }
  applyCapturedPhoto();
});

function resetCameraUI() {
  stopCameraStream();
  candidate.photoDataUrl = '';
  previewImgEl?.classList.add('hidden'); verifiedOverlayEl?.classList.add('hidden');
  videoEl?.classList.add('hidden'); guideOverlayEl?.classList.add('hidden');
  placeholderEl?.classList.remove('hidden');
  setCameraButtons('idle');
  if (photoSizeIndicator) photoSizeIndicator.textContent = 'No photo yet';
}

/* =========================================================================
   5. REGISTER / LOGIN
   ========================================================================= */
const inputName = $('input-name'), inputMobile = $('input-mobile'), inputEmail = $('input-email'), regForm = $('registration-form');
if ($('btn-register-text')) $('btn-register-text').textContent = REG_BTN_TEXT;

inputMobile?.addEventListener('input', () => { inputMobile.value = inputMobile.value.replace(/\D/g, '').slice(0, 10); $('error-mobile')?.classList.add('hidden'); });
inputName?.addEventListener('input', () => $('error-name')?.classList.add('hidden'));
inputEmail?.addEventListener('input', () => $('error-email')?.classList.add('hidden'));

function setFieldError(id, msg) { const el = $(id); if (!el) return; el.textContent = msg || ''; el.classList.toggle('hidden', !msg); }

regForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = inputName.value.trim(), mobile = inputMobile.value.trim(), email = inputEmail.value.trim();
  const emailLower = email.toLowerCase();
  let ok = true;
  if (name.length < 2) { setFieldError('error-name', 'Please enter your full name.'); ok = false; } else setFieldError('error-name', '');
  if (!/^[6-9]\d{9}$/.test(mobile)) { setFieldError('error-mobile', 'Enter a valid 10-digit Indian mobile number.'); ok = false; } else setFieldError('error-mobile', '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setFieldError('error-email', 'Enter a valid email address.'); ok = false; } else setFieldError('error-email', '');
  if (!candidate.photoDataUrl) { setFieldError('error-photo', 'Click your live photo before continuing.'); ok = false; } else setFieldError('error-photo', '');
  if (!ok) { showToast('Please complete all fields and click your live photo.', 'error'); return; }
  if (!firebaseReady) { showToast('Not connected to the server. Refresh and try again.', 'error'); return; }

  const btn = $('btn-register-submit'), txt = $('btn-register-text');
  btn.disabled = true; txt.textContent = 'Checking details...';
  $('btn-register-arrow')?.classList.add('hidden'); $('btn-register-spinner')?.classList.remove('hidden');

  try {
    const ref = recRef(mobile);
    const snap = await getDocFromServer(ref);
    const livePhoto = candidate.photoDataUrl;

    if (snap.exists()) {
      const data = snap.data();
      const savedEmail = String(data.emailLower || data.email || '').toLowerCase();
      if (savedEmail !== emailLower) {
        setFieldError('error-email', 'This mobile number is already registered with a different email.');
        showToast('Mobile already registered with a different email. Use the original email to log in.', 'error');
        return;
      }
      candidate = { name: data.name, mobile, email: data.email, photoDataUrl: data.photoDataUrl || livePhoto };
      stopCameraStream();
      updateDoc(ref, { lastLoginPhotoDataUrl: livePhoto, lastLoginAt: serverTimestamp() }).catch(() => {});

      if (data.status === 'completed') {
        showToast('You have already attempted CLAT MOCK-1. Showing your scorecard.', 'info');
        showCompletedScorecard(data);
      } else if (data.status === 'in_progress' && data.examStartedAt) {
        activeRec = data;
        showToast('Welcome back! Your timer never stopped. Resuming exam...', 'warning');
        await resumeExam(data);
      } else {
        activeRec = data;
        populateInstructionsScreen();
        showScreen('screen-instructions');
      }
      return;
    }

    const dup = await getDocs(query(attemptsCol(), where('emailLower', '==', emailLower), limit(1)));
    if (!dup.empty && dup.docs[0].id !== mobile) {
      setFieldError('error-email', 'This email is already registered with another mobile number.');
      showToast('Email already registered with a different mobile number.', 'error');
      return;
    }

    const payload = {
      candidateUid: currentUser?.uid || 'guest', examTitle: 'CLAT MOCK-1',
      name, mobile, email, emailLower, photoDataUrl: livePhoto,
      status: 'registered', attemptNo: 1, history: [],
      createdAt: serverTimestamp(), startedAt: new Date().toISOString(),
      examStartedAt: null, completedAt: null, score: null,
      bestScore: null, bestAccuracy: null, bestTime: null,
      totalQuestions: N, correct: 0, wrong: 0, unattempted: N, accuracy: 0, timeTakenSeconds: 0, sectionScores: null,
      ...blankPayload()
    };
    await setDoc(ref, payload);
    activeRec = payload;
    candidate = { name, mobile, email, photoDataUrl: livePhoto };
    populateInstructionsScreen();
    showScreen('screen-instructions');
    showToast('Registration saved! Read the instructions to begin.', 'success');
  } catch (err) {
    console.error('Register/login error:', err);
    showToast('Could not complete this step. Check your internet and try again.', 'error');
  } finally {
    btn.disabled = false; txt.textContent = REG_BTN_TEXT;
    $('btn-register-arrow')?.classList.remove('hidden'); $('btn-register-spinner')?.classList.add('hidden');
  }
});

/* =========================================================================
   6. INSTRUCTIONS + START
   ========================================================================= */
const checkboxInstructions = $('checkbox-instructions'), btnStartExam = $('btn-start-exam');

function populateInstructionsScreen() {
  $('inst-candidate-photo').src = candidate.photoDataUrl;
  $('inst-candidate-name').textContent = candidate.name;
  $('inst-candidate-mobile').textContent = `+91 ${candidate.mobile}`;
  $('inst-candidate-email').textContent = candidate.email;
  if (checkboxInstructions) checkboxInstructions.checked = false;
  if (btnStartExam) btnStartExam.disabled = true;
}

function injectRulesBlock() {
  const host = checkboxInstructions?.closest('label')?.parentElement;
  if (!host || $('rules-block')) return;
  host.insertAdjacentHTML('beforebegin', `
    <div id="rules-block" class="pt-4 border-t border-slate-200">
      <h3 class="font-bold text-nlu-900 mb-2.5 flex items-center gap-2">
        <span class="w-5 h-5 rounded bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">D</span>
        Exam Rules (Proctoring)
      </h3>
      <ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
        <li>The exam runs in <strong>full-screen mode only</strong>. It opens when you click <em>Start Exam</em>.</li>
        <li>Leaving full-screen, switching tabs or minimising the window shows a <strong>warning</strong> and hides the paper until you return.</li>
        <li>After <strong>${MAX_VIOLATIONS} warnings</strong> your exam is <strong>auto-submitted</strong>.</li>
        <li>Right-click, copy-paste, refresh and developer shortcuts are disabled.</li>
        <li>The <strong>timer cannot be paused</strong>. Closing the tab or logging out does not stop it — log in again with the same mobile and email to continue.</li>
        <li>Use the <strong>pen tools</strong> to highlight or underline passages, and the <strong>Booklet</strong> switch to read the paper in full-page format.</li>
      </ul>
    </div>`);
}

checkboxInstructions?.addEventListener('change', () => { btnStartExam.disabled = !checkboxInstructions.checked; });
$('btn-back-to-reg')?.addEventListener('click', () => { showScreen('screen-registration'); startCamera(); });

btnStartExam?.addEventListener('click', async () => {
  btnStartExam.disabled = true;
  enterFullscreen(); // must run inside the click (user gesture)
  try {
    let d = (await getDocFromServer(recRef())).data();
    if (d.status === 'completed') { showCompletedScorecard(d); return; }
    if (!d.examStartedAt) {
      resetExamState();
      await updateDoc(recRef(), { status: 'in_progress', examStartedAt: serverTimestamp(), lastSeen: serverTimestamp(), ...statePayload() });
      d = (await getDocFromServer(recRef())).data();
    }
    activeRec = d;
    await resumeExam(d);
  } catch (err) {
    console.error('Start error:', err);
    showToast('Could not start the exam. Check your connection and try again.', 'error');
    btnStartExam.disabled = false;
  }
});

/* =========================================================================
   7. EXAM ENGINE
   ========================================================================= */
async function resumeExam(d) {
  resetExamState();
  applyRecordToState(d);
  examStartMs = toMs(d.examStartedAt);
  syncServerMs = toMs(d.lastSeen) || examStartMs;
  syncPerf = performance.now();
  try {
    await updateDoc(recRef(), { lastSeen: serverTimestamp() });
    const fresh = (await getDocFromServer(recRef())).data();
    syncServerMs = toMs(fresh.lastSeen); syncPerf = performance.now();
  } catch (e) { console.warn('Clock sync failed:', e); }

  examRunning = true;
  if (computeRemaining() <= 0) {
    showToast('Your exam time is over. Submitting your saved answers...', 'warning');
    await finalizeAndSubmitExam(true);
    return;
  }
  launchExamInterface();
}

function handleViolation(type) {
  if (!examRunning || examSubmitted) return;
  violations.push({ type, at: new Date().toISOString() });
  updateWarnBadge();
  saveProgress();
  if (violations.length >= MAX_VIOLATIONS) {
    showToast('Maximum warnings reached. Auto-submitting your exam.', 'error');
    finalizeAndSubmitExam(true);
  }
}

function launchExamInterface() {
  $('exam-candidate-photo').src = candidate.photoDataUrl;
  $('exam-candidate-name').textContent = candidate.name;
  showScreen('screen-exam');
  injectExamToolbar();
  setupBooklet();
  applyViewVisibility();
  lastSwitchPerf = performance.now();
  goToQuestion(currentQuestionIndex);
  startExamTimer();
  heartbeatInterval = setInterval(pushAndSync, 45000);
  updateWarnBadge();
  startGuard({ onViolation: handleViolation, getCount: () => violations.length, max: MAX_VIOLATIONS });
}

function startExamTimer() { clearInterval(timerInterval); tick(); timerInterval = setInterval(tick, 500); }

function tick() {
  remainingSeconds = computeRemaining();
  updateTimerDisplay();
  [15, 5, 1].forEach((m) => {
    if (!warned[m] && remainingSeconds <= m * 60 && remainingSeconds > 0) {
      warned[m] = true;
      showToast(`${m} minute${m > 1 ? 's' : ''} remaining!`, 'warning');
    }
  });
  if (remainingSeconds <= 0 && !examSubmitted) {
    clearInterval(timerInterval);
    showToast('Time is up! Auto-submitting CLAT MOCK-1...', 'warning');
    finalizeAndSubmitExam(true);
  }
}

function updateTimerDisplay() {
  const display = $('exam-timer-display'), box = $('exam-timer-box');
  if (!display || !box) return;
  display.textContent = formatTimer(remainingSeconds);
  box.classList.remove('border-white/20', 'border-amber-400', 'border-red-500', 'bg-red-950');
  display.classList.remove('text-white', 'text-amber-300', 'text-red-300');
  if (remainingSeconds <= 300) { box.classList.add('border-red-500', 'bg-red-950'); display.classList.add('text-red-300'); }
  else if (remainingSeconds <= 900) { box.classList.add('border-amber-400'); display.classList.add('text-amber-300'); }
  else { box.classList.add('border-white/20'); display.classList.add('text-white'); }
}

const getActiveSection = () => CLAT_SECTIONS.find((s) => s.id === QUESTIONS[currentQuestionIndex].sectionId);

/* ---------- Toolbar: warnings, split/booklet switch, pen ---------- */
function injectExamToolbar() {
  if ($('exam-toolbar')) return;
  const nav = document.querySelector('#screen-exam nav');
  const bar = document.createElement('div');
  bar.id = 'exam-toolbar';
  bar.className = 'ml-auto flex items-center gap-4 min-w-max pl-4';
  bar.innerHTML = `
    <span id="warn-badge" class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold"></span>
    <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700" title="Switch between split view and full booklet view">
      <span>Split</span>
      <span class="relative inline-block w-10 h-5">
        <input id="view-toggle" type="checkbox" class="sr-only peer" />
        <span class="absolute inset-0 rounded-full bg-slate-300 peer-checked:bg-nlu-700 transition"></span>
        <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition peer-checked:translate-x-5"></span>
      </span>
      <span>Booklet</span>
    </label>
    <div class="flex items-center gap-1.5 pl-3 border-l border-slate-200">
      <span class="text-[11px] font-bold uppercase tracking-wide text-slate-500 mr-1">Pen</span>
      <button type="button" data-pen="highlight" title="Highlight selected text" class="pen-btn px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 cursor-pointer">🖍 Highlight</button>
      <button type="button" data-pen="underline" title="Underline selected text" class="pen-btn px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 cursor-pointer"><u>U</u>nderline</button>
      <button type="button" data-pen="erase" title="Click a marked part to remove it" class="pen-btn px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 cursor-pointer">⌫ Erase</button>
      ${PEN_COLORS.map((c) => `<button type="button" data-color="${c}" title="${c}" class="pen-dot w-5 h-5 rounded-full border border-slate-400 cursor-pointer" style="background:${HL[c]}"></button>`).join('')}
      <button type="button" id="pen-clear" title="Remove all marks from this passage" class="px-2 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-600 cursor-pointer">Clear</button>
    </div>`;
  nav.appendChild(bar);

  bar.querySelectorAll('.pen-btn').forEach((b) => b.addEventListener('click', () => {
    pen.mode = pen.mode === b.dataset.pen ? 'off' : b.dataset.pen;
    updatePenUI();
  }));
  bar.querySelectorAll('.pen-dot').forEach((b) => b.addEventListener('click', () => {
    pen.color = b.dataset.color;
    if (pen.mode === 'off' || pen.mode === 'erase') pen.mode = 'highlight';
    updatePenUI();
  }));
  $('pen-clear').addEventListener('click', () => {
    const pid = QUESTIONS[currentQuestionIndex].passageId;
    if (!(annotations[pid] || []).length) return;
    annotations[pid] = [];
    rerenderPassages(); scheduleSave();
  });
  $('view-toggle').addEventListener('change', (e) => {
    viewMode = e.target.checked ? 'booklet' : 'split';
    bookletSectionId = null;
    applyViewVisibility();
    goToQuestion(currentQuestionIndex);
  });
  updatePenUI();
}

function updatePenUI() {
  const screen = $('screen-exam');
  screen.classList.toggle('pen-on', pen.mode === 'highlight' || pen.mode === 'underline');
  screen.classList.toggle('pen-erase', pen.mode === 'erase');
  document.querySelectorAll('#exam-toolbar .pen-btn').forEach((b) => b.classList.toggle('pen-btn-active', b.dataset.pen === pen.mode));
  document.querySelectorAll('#exam-toolbar .pen-dot').forEach((b) => b.classList.toggle('pen-dot-active', b.dataset.color === pen.color));
}

function updateWarnBadge() {
  const b = $('warn-badge');
  if (!b) return;
  b.textContent = `⚠ Warnings ${violations.length}/${MAX_VIOLATIONS}`;
  b.className = `px-2.5 py-1 rounded-lg border text-[11px] font-bold ${violations.length ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`;
}

/* ---------- Passage rendering (shared) ---------- */
function passageHtml(q) {
  const anns = annotations[q.passageId] || [];
  return q.passageParagraphs.map((p, pi) => `<p class="passage-p" data-p="${pi}">${renderParagraph(p, anns.filter((a) => a.p === pi))}</p>`).join('')
    + `<div class="src-line">${esc(sourceLine(q))}</div>`;
}

function rerenderPassages() {
  document.querySelectorAll('#screen-exam .passage-text').forEach((el) => {
    const q = QUESTIONS.find((x) => x.passageId === el.dataset.passage);
    if (q) el.innerHTML = passageHtml(q);
  });
}

const penApi = {
  getPen: () => pen,
  getAnns: (pid) => annotations[pid] || [],
  setAnns: (pid, arr) => { annotations[pid] = arr; },
  onChange: () => { rerenderPassages(); scheduleSave(); }
};

/* ---------- Navigation ---------- */
function goToQuestion(index) {
  if (index < 0 || index >= N) return;
  accrueTime();
  currentQuestionIndex = index;
  questionStates[index].visited = true;
  if (viewMode === 'booklet') ensureBooklet(true);
  else renderPassageAndQuestion();
  renderSectionTabs(); renderQuestionPalette(); scheduleSave();
}

function renderSectionTabs() {
  const c = $('section-tabs-container');
  if (!c) return;
  const active = getActiveSection();
  c.innerHTML = CLAT_SECTIONS.map((sec) => {
    const isActive = sec.id === active.id;
    let n = 0;
    for (let i = sec.startQ - 1; i < sec.endQ; i++) if (questionStates[i].selectedOption !== null) n++;
    return `<button type="button" data-section-start="${sec.startQ - 1}" class="section-tab-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
      <span>${esc(sec.shortName)}</span>
      <span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-600'}">${n}/${sec.count}</span></button>`;
  }).join('');
  c.querySelectorAll('.section-tab-btn').forEach((b) => b.addEventListener('click', () => goToQuestion(Number(b.dataset.sectionStart))));
}

function renderPassageAndQuestion() {
  const q = QUESTIONS[currentQuestionIndex], st = questionStates[currentQuestionIndex];
  $('passage-note')?.remove();
  $('passage-placeholder-note')?.classList.add('hidden');
  $('passage-badge').textContent = `PASSAGE ${q.passageIndex}`;
  $('passage-title').textContent = q.passageTitle;
  $('passage-range').textContent = `${q.sectionName} • ${q.passageRange}`;

  const body = $('passage-body');
  body.dataset.passage = q.passageId;
  body.classList.add('passage-text');
  body.style.fontSize = `${passageFontSize}px`;
  body.innerHTML = passageHtml(q);

  $('question-number-label').textContent = `Question ${q.id} of ${N}`;
  $('question-section-pill').textContent = q.sectionName;
  $('question-text').textContent = q.questionText;

  const oc = $('options-container');
  oc.innerHTML = q.options.map((opt, i) => {
    const sel = st.selectedOption === i;
    return `<button type="button" data-option-idx="${i}" role="radio" aria-checked="${sel}" class="option-btn w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition flex items-start gap-3 cursor-pointer ${sel ? 'border-blue-700 bg-blue-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}">
      <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${sel ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'}">${LETTERS[i]}</span>
      <span class="text-sm text-slate-800 leading-relaxed font-medium">${esc(opt)}</span></button>`;
  }).join('');
  oc.querySelectorAll('.option-btn').forEach((b) => b.addEventListener('click', () => selectOption(currentQuestionIndex, Number(b.dataset.optionIdx))));

  $('btn-prev-question').disabled = currentQuestionIndex === 0;
  $('btn-save-next').textContent = currentQuestionIndex === N - 1 ? 'Save Response' : 'Save & Next →';
}

function afterStateChange(i) {
  if (viewMode === 'booklet') {
    const el = $(`bq-${i}`);
    if (el) el.innerHTML = bookletQuestionInner(i);
  } else if (i === currentQuestionIndex) {
    renderPassageAndQuestion();
  }
  renderSectionTabs(); renderQuestionPalette(); scheduleSave();
}
function selectOption(i, idx) { questionStates[i].selectedOption = idx; questionStates[i].visited = true; afterStateChange(i); }
function clearResponse(i) { questionStates[i].selectedOption = null; questionStates[i].markedForReview = false; afterStateChange(i); }
function toggleMark(i) { questionStates[i].markedForReview = !questionStates[i].markedForReview; questionStates[i].visited = true; afterStateChange(i); }

/* ---------- Booklet (full paper) view ---------- */
let splitEl = null, bookletEl = null;

function setupBooklet() {
  if (bookletEl) return;
  splitEl = $('passage-body').closest('section').parentElement;
  bookletEl = document.createElement('div');
  bookletEl.id = 'booklet-view';
  bookletEl.className = 'hidden flex-1 overflow-y-auto bg-slate-200 p-3 sm:p-5 custom-scroll';
  splitEl.insertAdjacentElement('afterend', bookletEl);

  attachPen($('passage-body'), penApi);
  attachPen(bookletEl, penApi);

  bookletEl.addEventListener('click', (e) => {
    const opt = e.target.closest('.bk-opt');
    if (opt) return selectOption(Number(opt.dataset.qi), Number(opt.dataset.oi));
    const mk = e.target.closest('.bk-mark');
    if (mk) return toggleMark(Number(mk.dataset.qi));
    const cl = e.target.closest('.bk-clear');
    if (cl) clearResponse(Number(cl.dataset.qi));
  });
}

function applyViewVisibility() {
  const booklet = viewMode === 'booklet';
  splitEl.classList.toggle('hidden', booklet);
  bookletEl.classList.toggle('hidden', !booklet);
  const t = $('view-toggle'); if (t) t.checked = booklet;
}

function bookletQuestionInner(i) {
  const q = QUESTIONS[i], st = questionStates[i];
  return `<div class="bk-qtext"><b>${q.id}.</b> ${esc(q.questionText)}</div>
    <div class="bk-opts">${q.options.map((o, oi) => `<button type="button" class="bk-opt ${st.selectedOption === oi ? 'bk-opt-sel' : ''}" data-qi="${i}" data-oi="${oi}"><span class="bk-letter">${LETTERS[oi]}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div class="bk-actions">
      <button type="button" class="bk-mark" data-qi="${i}">${st.markedForReview ? '★ Marked for review (click to unmark)' : '☆ Mark for review'}</button>
      <button type="button" class="bk-clear" data-qi="${i}">Clear response</button>
    </div>`;
}

function renderBooklet() {
  const sec = getActiveSection();
  const secNo = CLAT_SECTIONS.findIndex((s) => s.id === sec.id) + 1;
  const qs = QUESTIONS.filter((q) => q.sectionId === sec.id);
  let html = `<div class="mx-auto max-w-4xl space-y-5"><div class="bk-page"><div style="text-align:center;font-weight:700;letter-spacing:.5px;font-size:1.1rem">SECTION ${roman(secNo)} — ${esc(sec.name.toUpperCase())}</div>`;
  let last = null, pNo = 0;
  qs.forEach((q) => {
    if (q.passageId !== last) {
      last = q.passageId; pNo++;
      html += `<div class="bk-passage" style="margin-top:18px"><div class="bk-pno">${roman(pNo)}.</div>
        <div class="passage-text" data-passage="${q.passageId}" style="font-size:${passageFontSize + 1}px">${passageHtml(q)}</div></div>`;
    }
    html += `<div id="bq-${q.id - 1}" class="bk-q" data-qi="${q.id - 1}">${bookletQuestionInner(q.id - 1)}</div>`;
  });
  html += '</div></div>';
  bookletEl.innerHTML = html;
  bookletSectionId = sec.id;

  bookletObserver?.disconnect();
  bookletObserver = new IntersectionObserver((entries) => {
    let dirty = false;
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = Number(en.target.dataset.qi);
      if (!questionStates[i].visited) { questionStates[i].visited = true; dirty = true; }
      if (i !== currentQuestionIndex) { accrueTime(); currentQuestionIndex = i; dirty = true; markCurrentBooklet(); }
    });
    if (dirty) { renderQuestionPalette(); renderSectionTabs(); scheduleSave(); }
  }, { root: bookletEl, threshold: 0.6 });
  bookletEl.querySelectorAll('.bk-q').forEach((el) => bookletObserver.observe(el));
}

function markCurrentBooklet() {
  bookletEl.querySelectorAll('.bk-q').forEach((el) => el.classList.toggle('bk-current', Number(el.dataset.qi) === currentQuestionIndex));
}

function ensureBooklet(scroll) {
  if (bookletSectionId !== getActiveSection().id) renderBooklet();
  markCurrentBooklet();
  if (scroll) $(`bq-${currentQuestionIndex}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

/* ---------- Palette ---------- */
function getQuestionPaletteCounts() {
  const c = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 };
  questionStates.forEach((s) => {
    if (!s.visited) c.notVisited++;
    else if (s.markedForReview && s.selectedOption !== null) c.answeredMarked++;
    else if (s.markedForReview) c.marked++;
    else if (s.selectedOption !== null) c.answered++;
    else c.notAnswered++;
  });
  return c;
}

function renderQuestionPalette() {
  const c = getQuestionPaletteCounts();
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('count-answered', c.answered); set('count-not-answered', c.notAnswered);
  set('count-not-visited', c.notVisited); set('count-marked', c.marked);
  const am = $('count-answered-marked');
  if (am?.childNodes[0]) am.childNodes[0].textContent = `${c.answeredMarked} `;

  const sec = getActiveSection();
  let start = sec.startQ - 1, end = sec.endQ - 1;
  if (paletteShowAll) {
    start = 0; end = N - 1;
    set('palette-scope-subtitle', 'Showing All 120 Questions'); set('btn-palette-scope-toggle', 'Active Section');
  } else {
    set('palette-scope-subtitle', `${sec.shortName} (Q${sec.startQ}–Q${sec.endQ})`); set('btn-palette-scope-toggle', 'View All 120');
  }
  const html = [];
  for (let i = start; i <= end; i++) {
    const st = questionStates[i];
    let cls = 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200', dot = '';
    if (st.visited) {
      if (st.markedForReview && st.selectedOption !== null) { cls = 'bg-purple-600 text-white hover:bg-purple-700'; dot = '<span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>'; }
      else if (st.markedForReview) cls = 'bg-purple-600 text-white hover:bg-purple-700';
      else if (st.selectedOption !== null) cls = 'bg-emerald-600 text-white hover:bg-emerald-700';
      else cls = 'bg-red-600 text-white hover:bg-red-700';
    }
    const ring = i === currentQuestionIndex ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : '';
    html.push(`<button type="button" data-q-index="${i}" class="palette-q-btn relative h-10 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${cls} ${ring}">${i + 1}${dot}</button>`);
  }
  const grid = $('palette-grid');
  grid.innerHTML = html.join('');
  grid.querySelectorAll('.palette-q-btn').forEach((b) => b.addEventListener('click', () => { goToQuestion(Number(b.dataset.qIndex)); closeMobilePalette(); }));
}

/* ---------- Bottom bar, fonts, drawer ---------- */
$('btn-save-next')?.addEventListener('click', () => {
  if (questionStates[currentQuestionIndex].selectedOption !== null) questionStates[currentQuestionIndex].markedForReview = false;
  if (currentQuestionIndex < N - 1) goToQuestion(currentQuestionIndex + 1);
  else { renderQuestionPalette(); scheduleSave(); showToast('Response saved. You are on the final question.', 'info'); }
});
$('btn-mark-review')?.addEventListener('click', () => {
  questionStates[currentQuestionIndex].markedForReview = true;
  if (currentQuestionIndex < N - 1) goToQuestion(currentQuestionIndex + 1);
  else { renderQuestionPalette(); scheduleSave(); showToast('Marked for review.', 'info'); }
});
$('btn-clear-response')?.addEventListener('click', () => clearResponse(currentQuestionIndex));
$('btn-prev-question')?.addEventListener('click', () => { if (currentQuestionIndex > 0) goToQuestion(currentQuestionIndex - 1); });

const applyFont = () => { if (viewMode === 'split') { const pb = $('passage-body'); if (pb) pb.style.fontSize = `${passageFontSize}px`; } else document.querySelectorAll('#booklet-view .passage-text').forEach((e) => { e.style.fontSize = `${passageFontSize + 1}px`; }); };
$('btn-font-inc')?.addEventListener('click', () => { passageFontSize = Math.min(24, passageFontSize + 1.5); applyFont(); });
$('btn-font-dec')?.addEventListener('click', () => { passageFontSize = Math.max(12, passageFontSize - 1.5); applyFont(); });
$('btn-font-reset')?.addEventListener('click', () => { passageFontSize = 15; applyFont(); });
$('btn-palette-scope-toggle')?.addEventListener('click', () => { paletteShowAll = !paletteShowAll; renderQuestionPalette(); });

const paletteSidebar = $('question-palette-sidebar'), paletteBackdrop = $('palette-backdrop');
function openMobilePalette() { paletteSidebar?.classList.remove('translate-x-full'); paletteBackdrop?.classList.remove('hidden'); }
function closeMobilePalette() { paletteSidebar?.classList.add('translate-x-full'); paletteBackdrop?.classList.add('hidden'); }
$('btn-toggle-mobile-palette')?.addEventListener('click', openMobilePalette);
$('btn-close-mobile-palette')?.addEventListener('click', closeMobilePalette);
paletteBackdrop?.addEventListener('click', closeMobilePalette);

// Keyboard: A-D choose, arrows move (split view)
document.addEventListener('keydown', (e) => {
  if (!examRunning || viewMode !== 'split' || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const idx = ['a', 'b', 'c', 'd'].indexOf(k);
  if (idx >= 0) selectOption(currentQuestionIndex, idx);
  else if (e.key === 'ArrowRight') goToQuestion(currentQuestionIndex + 1);
  else if (e.key === 'ArrowLeft') goToQuestion(currentQuestionIndex - 1);
});

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(); else if (examRunning) pushAndSync(); });
window.addEventListener('pagehide', saveProgress);
window.addEventListener('beforeunload', (e) => {
  stopCameraStream();
  if (examRunning && !examSubmitted) { saveProgress(); e.preventDefault(); e.returnValue = ''; }
});

/* =========================================================================
   8. SUBMIT + SCORING
   ========================================================================= */
const submitConfirmModal = $('modal-submit-confirm');
$('btn-open-submit-modal')?.addEventListener('click', () => {
  const c = getQuestionPaletteCounts(), answered = c.answered + c.answeredMarked;
  $('submit-summary-answered').textContent = answered;
  $('submit-summary-unanswered').textContent = N - answered;
  $('submit-summary-marked').textContent = c.marked + c.answeredMarked;
  $('submit-summary-time').textContent = formatTimer(remainingSeconds);
  submitConfirmModal?.classList.remove('hidden');
});
$('btn-cancel-submit')?.addEventListener('click', () => submitConfirmModal?.classList.add('hidden'));
$('btn-confirm-submit')?.addEventListener('click', () => { submitConfirmModal?.classList.add('hidden'); finalizeAndSubmitExam(false); });

function computeResult(answerArr) {
  let tc = 0, tw = 0, tu = 0;
  const perQuestion = QUESTIONS.map((q, i) => {
    const raw = answerArr?.[i];
    const selected = raw === undefined || raw === null || raw < 0 ? null : raw;
    let status, marks;
    if (selected === null) { status = 'unattempted'; marks = 0; tu++; }
    else if (selected === q.correctOption) { status = 'correct'; marks = 1; tc++; }
    else { status = 'wrong'; marks = -0.25; tw++; }
    return { id: q.id, sectionId: q.sectionId, selected, correct: q.correctOption, status, marks };
  });
  const sectionScores = CLAT_SECTIONS.map((sec) => {
    const items = perQuestion.slice(sec.startQ - 1, sec.endQ);
    const correct = items.filter((x) => x.status === 'correct').length;
    const wrong = items.filter((x) => x.status === 'wrong').length;
    const attempted = correct + wrong;
    return {
      sectionId: sec.id, name: sec.name, total: sec.count, attempted, correct, wrong, unattempted: sec.count - attempted,
      score: Number((correct - wrong * 0.25).toFixed(2)), accuracy: attempted ? Number(((correct / attempted) * 100).toFixed(1)) : 0
    };
  });
  const attempted = tc + tw;
  return {
    finalScore: Number((tc - tw * 0.25).toFixed(2)), totalCorrect: tc, totalWrong: tw, totalUnattempted: tu,
    accuracy: attempted ? Number(((tc / attempted) * 100).toFixed(1)) : 0, sectionScores, perQuestion
  };
}

async function writeWithRetry(updates, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { await updateDoc(recRef(), updates); return true; }
    catch (e) { console.warn('Write retry', i + 1, e); await new Promise((r) => setTimeout(r, 1000 * (i + 1))); }
  }
  return false;
}

async function finalizeAndSubmitExam(auto = false) {
  if (examSubmitted) return;
  examSubmitted = true;
  const payload = statePayload();
  stopExamLoops();
  stopGuard();

  const result = computeResult(payload.answers);
  const timeTaken = Math.min(TOTAL_EXAM_SECONDS, Math.max(1, Math.floor((serverNow() - examStartMs) / 1000)));
  const completedAt = new Date().toISOString();
  const prevBest = activeRec?.bestScore;
  const isBest = prevBest == null || result.finalScore > prevBest || (result.finalScore === prevBest && timeTaken < (activeRec?.bestTime ?? Infinity));

  const updates = {
    ...payload, status: 'completed', attemptNo: activeRec?.attemptNo || 1,
    score: result.finalScore, correct: result.totalCorrect, wrong: result.totalWrong, unattempted: result.totalUnattempted,
    accuracy: result.accuracy, timeTakenSeconds: timeTaken, sectionScores: result.sectionScores, completedAt, autoSubmitted: auto,
    ...(isBest ? { bestScore: result.finalScore, bestAccuracy: result.accuracy, bestTime: timeTaken } : {})
  };
  const saved = await writeWithRetry(updates);
  showToast(saved ? (auto ? 'Exam auto-submitted and saved!' : 'Exam submitted successfully!') : 'Score calculated, but saving failed. Log in again to retry.', saved ? 'success' : 'warning');

  let d = null;
  if (saved) { try { d = (await getDocFromServer(recRef())).data(); } catch (e) { /* fall back */ } }
  showCompletedScorecard(d && d.status === 'completed' ? d : { ...activeRec, ...updates });
}

/* =========================================================================
   9. SCORECARD, HISTORY, RE-ATTEMPT, ANALYTICS & DOWNLOADS
   ========================================================================= */
const snapshotOf = (d) => ({
  attemptNo: d.attemptNo || 1, score: d.score, correct: d.correct, wrong: d.wrong, unattempted: d.unattempted,
  accuracy: d.accuracy, timeTakenSeconds: d.timeTakenSeconds, completedAt: d.completedAt, answers: d.answers,
  marked: d.marked, visited: d.visited, qTime: d.qTime || [], annotations: d.annotations || {}, violations: d.violations || [],
  sectionScores: d.sectionScores || null
});

function showCompletedScorecard(d) {
  stopExamLoops(); examSubmitted = true;
  activeRec = d;
  attemptsList = [...(d.history || []), snapshotOf(d)];
  viewAttempt(attemptsList.length - 1);
  showScreen('screen-scorecard');
}

function viewAttempt(idx) {
  viewedAttemptIdx = idx;
  const a = attemptsList[idx];
  renderScorecard(computeResult(a.answers), { completedAt: a.completedAt, timeTakenSeconds: a.timeTakenSeconds }, a);
}

function sectionTimeRows(att) {
  return CLAT_SECTIONS.map((s) => {
    let t = 0;
    for (let i = s.startQ - 1; i < s.endQ; i++) t += Number(att.qTime?.[i]) || 0;
    return { name: s.name, mins: (t / 60).toFixed(1), avg: Math.round(t / s.count), total: t };
  });
}

function buildInsights(r, meta, att) {
  const attempted = r.totalCorrect + r.totalWrong, L = [];
  L.push(`Attempt rate: ${attempted}/${N} questions (${((attempted / N) * 100).toFixed(0)}%).`);
  L.push(`Negative marking cost you ${(r.totalWrong * 0.25).toFixed(2)} marks across ${r.totalWrong} wrong answers.`);
  if (attempted) L.push(`Average time per attempted question: ${Math.round(meta.timeTakenSeconds / attempted)} seconds.`);
  const act = r.sectionScores.filter((s) => s.attempted > 0);
  if (act.length) {
    const best = [...act].sort((a, b) => b.accuracy - a.accuracy)[0];
    const weak = [...act].sort((a, b) => a.accuracy - b.accuracy)[0];
    L.push(`Strongest section: ${best.name} (${best.accuracy}% accuracy).`);
    if (weak.sectionId !== best.sectionId) L.push(`Needs most work: ${weak.name} (${weak.accuracy}% accuracy).`);
  }
  const rows = sectionTimeRows(att), totalT = rows.reduce((a, b) => a + b.total, 0);
  if (totalT > 60) {
    const top = [...rows].sort((a, b) => b.total - a.total)[0];
    L.push(`You spent the most time on ${top.name}: ${top.mins} min (${((top.total / totalT) * 100).toFixed(0)}% of your time).`);
    const slow = (att.qTime || []).map((t, i) => ({ i, t })).sort((a, b) => b.t - a.t).slice(0, 3).filter((x) => x.t > 0);
    if (slow.length) L.push(`Slowest questions: ${slow.map((x) => `Q${x.i + 1} (${Math.round(x.t)}s)`).join(', ')}.`);
  }
  if (attempted && r.accuracy < 70) L.push('Accuracy is below 70%: with -0.25 marking, skip questions where you are not at least ~60% sure.');
  if (r.totalUnattempted > 30) L.push('Many questions were left unattempted. Practise sectional timing to raise your attempt rate.');
  if ((att.violations || []).length) L.push(`Proctoring: ${att.violations.length} warning(s) were recorded during this attempt.`);
  return L;
}

function ensureReviewSection() {
  let sec = $('review-section');
  if (sec) return sec;
  sec = document.createElement('section');
  sec.id = 'review-section'; sec.className = 'space-y-6';
  $('res-section-table-body').closest('section').insertAdjacentElement('afterend', sec);
  return sec;
}

function renderScorecard(result, meta, att) {
  lastView = { result, meta, att };
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  const photo = $('res-candidate-photo'); if (photo) photo.src = candidate.photoDataUrl;
  set('res-candidate-name', candidate.name);
  set('res-candidate-contact', `+91 ${candidate.mobile} • ${candidate.email}`);
  set('res-meta-time', `Attempt ${att.attemptNo} of ${attemptsList.length} • Completed on ${meta.completedAt ? new Date(meta.completedAt).toLocaleString() : '-'} • Time Taken: ${formatDurationHuman(meta.timeTakenSeconds)}`);
  set('res-total-score', result.finalScore.toFixed(2));
  set('res-correct', result.totalCorrect); set('res-wrong', result.totalWrong);
  set('res-negative-deduction', `-${(result.totalWrong * 0.25).toFixed(2)} marks`);
  set('res-unattempted', result.totalUnattempted); set('res-accuracy', `${result.accuracy}%`);

  $('res-section-table-body').innerHTML = result.sectionScores.map((s) => {
    const pct = Math.max(0, Math.min(100, (s.score / s.total) * 100));
    return `<tr class="hover:bg-slate-50/70">
      <td class="px-5 py-3.5 font-semibold text-slate-900"><div>${esc(s.name)}</div><div class="w-32 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden"><div class="h-full bg-slate-700 rounded-full" style="width:${pct.toFixed(1)}%"></div></div></td>
      <td class="px-4 py-3.5 text-center text-slate-600">${s.total}</td><td class="px-4 py-3.5 text-center font-semibold">${s.attempted}</td>
      <td class="px-4 py-3.5 text-center font-bold text-emerald-600">${s.correct}</td><td class="px-4 py-3.5 text-center font-bold text-red-600">${s.wrong}</td>
      <td class="px-4 py-3.5 text-center font-semibold">${s.accuracy}%</td><td class="px-5 py-3.5 text-right font-extrabold">${s.score.toFixed(2)} / ${s.total}</td></tr>`;
  }).join('');

  renderAnalyticsAndReview(result, meta, att);
  renderAllScoreboards();
}

function renderAnalyticsAndReview(r, meta, att) {
  const sec = ensureReviewSection();
  const pc = (n) => ((n / N) * 100).toFixed(1);
  const insights = buildInsights(r, meta, att), timeRows = sectionTimeRows(att);

  sec.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-4"><h3 class="text-base font-bold text-nlu-900">Attempt History</h3></div>
      <div class="overflow-x-auto"><table class="w-full text-left text-xs sm:text-sm">
        <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200"><tr>
          <th class="px-4 py-3">Attempt</th><th class="px-4 py-3">Date</th><th class="px-4 py-3 text-center">Score</th>
          <th class="px-4 py-3 text-center">Accuracy</th><th class="px-4 py-3 text-right">Time</th><th class="px-4 py-3 text-right"></th></tr></thead>
        <tbody class="divide-y divide-slate-100">${attemptsList.map((a, i) => `
          <tr class="${i === viewedAttemptIdx ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}">
            <td class="px-4 py-2.5 font-bold">#${a.attemptNo}${i === attemptsList.length - 1 ? ' <span class="text-[10px] text-slate-500">(latest)</span>' : ''}</td>
            <td class="px-4 py-2.5 text-slate-600">${a.completedAt ? new Date(a.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
            <td class="px-4 py-2.5 text-center font-extrabold">${Number(a.score ?? 0).toFixed(2)}</td>
            <td class="px-4 py-2.5 text-center">${a.accuracy ?? 0}%</td>
            <td class="px-4 py-2.5 text-right font-mono text-xs">${formatDurationHuman(a.timeTakenSeconds)}</td>
            <td class="px-4 py-2.5 text-right">${i === viewedAttemptIdx ? '<span class="text-xs font-bold text-nlu-700">Viewing</span>' : `<button type="button" data-view-attempt="${i}" class="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold cursor-pointer">View</button>`}</td>
          </tr>`).join('')}</tbody></table></div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-base font-bold text-nlu-900">Performance Analytics &amp; Downloads</h3>
        <div class="flex flex-wrap gap-2">
          <button id="btn-dl-paper" type="button" class="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm cursor-pointer">⬇ Question Booklet</button>
          <button id="btn-dl-annotated" type="button" class="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm cursor-pointer">⬇ My Annotated Booklet</button>
          <button id="btn-dl-full" type="button" class="px-3.5 py-2 rounded-xl bg-nlu-900 hover:bg-nlu-800 text-white font-semibold text-xs sm:text-sm cursor-pointer">⬇ Solved + Analytics</button>
        </div>
      </div>
      <div class="p-6 space-y-5">
        <div>
          <div class="flex h-4 rounded-full overflow-hidden bg-slate-200">
            <div class="bg-emerald-500" style="width:${pc(r.totalCorrect)}%"></div><div class="bg-red-500" style="width:${pc(r.totalWrong)}%"></div><div class="bg-slate-400" style="width:${pc(r.totalUnattempted)}%"></div>
          </div>
          <div class="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-slate-600">
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Correct ${r.totalCorrect}</span>
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span> Wrong ${r.totalWrong}</span>
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-slate-400"></span> Unattempted ${r.totalUnattempted}</span>
          </div>
        </div>
        <div class="overflow-x-auto rounded-xl border border-slate-200"><table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200"><tr><th class="px-4 py-2.5">Section</th><th class="px-4 py-2.5 text-center">Time Spent</th><th class="px-4 py-2.5 text-center">Avg / Question</th><th class="px-4 py-2.5 text-center">Accuracy</th></tr></thead>
          <tbody class="divide-y divide-slate-100">${timeRows.map((t, i) => `<tr><td class="px-4 py-2 font-medium">${esc(t.name)}</td><td class="px-4 py-2 text-center">${t.mins} min</td><td class="px-4 py-2 text-center">${t.avg}s</td><td class="px-4 py-2 text-center font-semibold">${r.sectionScores[i].accuracy}%</td></tr>`).join('')}</tbody></table></div>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-700">${insights.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-base font-bold text-nlu-900">Question-wise Review</h3>
        <div class="flex flex-wrap gap-2">
          <select id="review-filter-status" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"><option value="all">All questions</option><option value="correct">Correct</option><option value="wrong">Wrong</option><option value="unattempted">Unattempted</option></select>
          <select id="review-filter-section" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"><option value="all">All sections</option>${CLAT_SECTIONS.map((s) => `<option value="${s.id}">${esc(s.shortName)}</option>`).join('')}</select>
        </div>
      </div>
      <div class="overflow-x-auto max-h-[600px] overflow-y-auto custom-scroll"><table class="w-full text-left text-xs sm:text-sm">
        <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0"><tr><th class="px-4 py-3">Q</th><th class="px-4 py-3">Question</th><th class="px-4 py-3 text-center">Your Answer</th><th class="px-4 py-3 text-center">Correct</th><th class="px-4 py-3 text-center">Result</th><th class="px-4 py-3 text-center">Time</th><th class="px-4 py-3 text-right">Marks</th></tr></thead>
        <tbody id="review-tbody" class="divide-y divide-slate-100"></tbody></table></div>
    </div>`;

  const draw = () => {
    const st = $('review-filter-status').value, sc = $('review-filter-section').value;
    const badge = { correct: 'bg-emerald-50 text-emerald-700 border-emerald-200', wrong: 'bg-red-50 text-red-700 border-red-200', unattempted: 'bg-slate-100 text-slate-600 border-slate-200' };
    $('review-tbody').innerHTML = r.perQuestion.filter((x) => (st === 'all' || x.status === st) && (sc === 'all' || x.sectionId === sc)).map((x) => `
      <tr class="hover:bg-slate-50/70"><td class="px-4 py-2.5 font-bold">${x.id}</td>
        <td class="px-4 py-2.5 text-slate-700 max-w-[380px]"><div class="truncate" title="${esc(QUESTIONS[x.id - 1].questionText)}">${esc(QUESTIONS[x.id - 1].questionText)}</div></td>
        <td class="px-4 py-2.5 text-center font-bold ${x.status === 'wrong' ? 'text-red-600' : ''}">${x.selected === null ? '—' : LETTERS[x.selected]}</td>
        <td class="px-4 py-2.5 text-center font-bold text-emerald-700">${LETTERS[x.correct]}</td>
        <td class="px-4 py-2.5 text-center"><span class="inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${badge[x.status]}">${x.status === 'unattempted' ? 'Skipped' : x.status === 'correct' ? 'Correct' : 'Wrong'}</span></td>
        <td class="px-4 py-2.5 text-center text-slate-500">${Math.round(att.qTime?.[x.id - 1] || 0)}s</td>
        <td class="px-4 py-2.5 text-right font-bold ${x.marks > 0 ? 'text-emerald-600' : x.marks < 0 ? 'text-red-600' : 'text-slate-500'}">${x.marks > 0 ? '+1.00' : x.marks < 0 ? '-0.25' : '0.00'}</td></tr>`).join('')
      || '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400">No questions match this filter.</td></tr>';
  };
  draw();
  $('review-filter-status').addEventListener('change', draw);
  $('review-filter-section').addEventListener('change', draw);
  sec.querySelectorAll('[data-view-attempt]').forEach((b) => b.addEventListener('click', () => { viewAttempt(Number(b.dataset.viewAttempt)); window.scrollTo({ top: 0, behavior: 'smooth' }); }));

  const paper = (mode) => openPrintWindow(buildPaperHtml({ mode, QUESTIONS, CLAT_SECTIONS, candidate, result: r, meta, rec: att, insights, timeRows, title: 'CLAT MOCK-1' }));
  $('btn-dl-paper').addEventListener('click', () => paper('paper'));
  $('btn-dl-annotated').addEventListener('click', () => paper('annotated'));
  $('btn-dl-full').addEventListener('click', () => paper('full'));
}

function openPrintWindow(html) {
  const w = window.open('', '_blank');
  if (!w) { showToast('Pop-up blocked. Allow pop-ups for this page and try again.', 'warning'); return; }
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* use the Print button */ } }, 800);
}

/* ---------- Re-attempt & logout ---------- */
async function startReattempt() {
  if (!firebaseReady || !candidate.mobile) return;
  if (!confirm('Start a new attempt? Your previous result stays saved in your Attempt History.')) return;
  try {
    const d = (await getDocFromServer(recRef())).data();
    if (d.status !== 'completed') { showToast('Finish your current attempt first.', 'warning'); return; }
    const history = [...(d.history || []), snapshotOf(d)];
    const next = {
      history, attemptNo: (d.attemptNo || 1) + 1, status: 'registered', examStartedAt: null, completedAt: null,
      score: null, correct: 0, wrong: 0, unattempted: N, accuracy: 0, timeTakenSeconds: 0, sectionScores: null, autoSubmitted: false,
      ...blankPayload()
    };
    await updateDoc(recRef(), next);
    activeRec = { ...d, ...next };
    resetExamState();
    populateInstructionsScreen();
    showScreen('screen-instructions');
    showToast(`Attempt #${next.attemptNo} is ready. Read the instructions and start.`, 'success');
  } catch (e) {
    console.error(e);
    showToast('Could not start a re-attempt. Try again.', 'error');
  }
}

function injectScorecardButtons() {
  const logout = $('btn-new-attempt');
  if (!logout || $('btn-reattempt')) return;
  logout.textContent = 'Log Out';
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-wrap gap-2';
  logout.replaceWith(wrap);
  const re = document.createElement('button');
  re.id = 'btn-reattempt'; re.type = 'button';
  re.className = 'px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-sm shadow-sm transition cursor-pointer';
  re.textContent = '↻ Re-attempt Exam';
  re.addEventListener('click', startReattempt);
  wrap.append(re, logout);
  logout.addEventListener('click', () => {
    stopExamLoops(); stopGuard();
    candidate = emptyCandidate(); activeRec = null; attemptsList = []; lastView = null;
    regForm?.reset(); resetExamState(); resetCameraUI();
    showScreen('screen-registration');
    startCamera();
  });
}

/* =========================================================================
   10. LEADERBOARD (best attempt, masked contact details)
   ========================================================================= */
const bestOf = (r) => (r.bestScore != null ? Number(r.bestScore) : r.status === 'completed' && r.score != null ? Number(r.score) : null);

function sortRecords(records) {
  return [...records].sort((a, b) => {
    const as = bestOf(a), bs = bestOf(b);
    if (as !== null && bs === null) return -1;
    if (as === null && bs !== null) return 1;
    if (as !== null && bs !== null) {
      if (bs !== as) return bs - as;
      return (Number(a.bestTime ?? a.timeTakenSeconds) || 99999) - (Number(b.bestTime ?? b.timeTakenSeconds) || 99999);
    }
    return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
  });
}

function renderScoreboardTable(tbodyId, searchValue, filterValue) {
  const tbody = $(tbodyId);
  if (!tbody) return;
  const q = (searchValue || '').trim().toLowerCase();
  const list = sortRecords(allScoreboardRecords).filter((r) => (filterValue === 'all' || r.status === filterValue) && (!q || (r.name || '').toLowerCase().includes(q)));
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No candidates match your current view yet.</td></tr>'; return; }

  let rank = 0;
  tbody.innerHTML = list.map((rec) => {
    const best = bestOf(rec);
    const rankDisplay = best !== null ? `#${++rank}` : '—';
    const meta = { completed: ['Completed', 'bg-emerald-50 text-emerald-700 border-emerald-200'], in_progress: ['In Progress', 'bg-amber-50 text-amber-800 border-amber-200'], registered: ['Registered', 'bg-blue-50 text-blue-700 border-blue-200'] }[rec.status] || [rec.status || 'Registered', 'bg-slate-100 text-slate-600 border-slate-200'];
    const me = candidate.mobile && rec.id === candidate.mobile;
    const fb = `https://placehold.co/80x80/1e3a8a/ffffff?text=${encodeURIComponent((rec.name || 'U').charAt(0).toUpperCase())}`;
    return `<tr class="${me ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}">
      <td class="px-4 py-3 text-center font-extrabold">${rankDisplay}</td>
      <td class="px-4 py-3"><div class="flex items-center gap-3"><img src="${rec.photoDataUrl || fb}" onerror="this.onerror=null;this.src='${fb}';" alt="" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
        <div class="min-w-0"><div class="font-bold text-slate-900 flex items-center gap-1.5"><span class="truncate max-w-[160px]">${esc(rec.name || 'Unnamed')}</span>${me ? '<span class="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">YOU</span>' : ''}</div>
        <div class="text-[11px] text-slate-400">Attempt ${rec.attemptNo || 1}</div></div></div></td>
      <td class="px-4 py-3"><div class="font-medium text-slate-800">${esc(maskMobile(rec.mobile || '-'))}</div><div class="text-xs text-slate-500 truncate max-w-[190px]">${esc(maskEmail(rec.email || '-'))}</div></td>
      <td class="px-4 py-3 text-center"><span class="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${meta[1]}">${meta[0]}</span></td>
      <td class="px-4 py-3 text-center font-extrabold">${best !== null ? best.toFixed(2) : '—'}</td>
      <td class="px-4 py-3 text-center font-semibold">${best !== null ? `${rec.bestAccuracy ?? rec.accuracy ?? 0}%` : '—'}</td>
      <td class="px-4 py-3 text-right font-mono text-xs text-slate-600">${best !== null ? formatDurationHuman(rec.bestTime ?? rec.timeTakenSeconds) : '—'}</td></tr>`;
  }).join('');
}

function renderAllScoreboards() {
  const badge = $('scoreboard-count-badge'); if (badge) badge.textContent = allScoreboardRecords.length;
  renderScoreboardTable('modal-scoreboard-tbody', $('modal-scoreboard-search')?.value, $('modal-scoreboard-filter')?.value || 'all');
  renderScoreboardTable('inline-scoreboard-tbody', $('inline-scoreboard-search')?.value, $('inline-scoreboard-filter')?.value || 'all');
}

const modalScoreboard = $('modal-scoreboard');
$('btn-open-scoreboard')?.addEventListener('click', () => { renderAllScoreboards(); modalScoreboard?.classList.remove('hidden'); });
$('btn-close-scoreboard')?.addEventListener('click', () => modalScoreboard?.classList.add('hidden'));
modalScoreboard?.addEventListener('click', (e) => { if (e.target === modalScoreboard) modalScoreboard.classList.add('hidden'); });
['modal-scoreboard-search', 'inline-scoreboard-search'].forEach((id) => { const el = $(id); if (el) el.placeholder = 'Search by candidate name...'; });
['modal-scoreboard-search', 'modal-scoreboard-filter', 'inline-scoreboard-search', 'inline-scoreboard-filter'].forEach((id) => {
  $(id)?.addEventListener('input', renderAllScoreboards); $(id)?.addEventListener('change', renderAllScoreboards);
});

function exportScoreboardCsv() {
  const sorted = sortRecords(allScoreboardRecords);
  if (!sorted.length) { showToast('No records to export yet.', 'warning'); return; }
  const headers = ['Rank', 'Name', 'Mobile', 'Email', 'Status', 'Attempts', 'Best Score', 'Best Accuracy (%)', 'Best Time (s)', 'Registered At'];
  let rank = 0;
  const rows = sorted.map((r) => {
    const b = bestOf(r);
    return [b !== null ? ++rank : '', r.name || '', r.mobile || '', r.email || '', r.status || '', r.attemptNo || 1,
      b !== null ? b.toFixed(2) : '', r.bestAccuracy ?? r.accuracy ?? '', r.bestTime ?? r.timeTakenSeconds ?? '', r.startedAt || '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `CLAT_MOCK_1_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
$('btn-export-csv-modal')?.addEventListener('click', exportScoreboardCsv);
$('btn-export-csv-inline')?.addEventListener('click', exportScoreboardCsv);

/* =========================================================================
   11. BRANDING CLEAN-UP (removes "Firebase / Synced / Real-time" wording)
   ========================================================================= */
function applyBranding() {
  $('firebase-status-badge')?.remove();
  $('passage-placeholder-note')?.classList.add('hidden');

  const sbBtn = $('btn-open-scoreboard');
  const sbLabel = sbBtn?.querySelector('span'); if (sbLabel) sbLabel.textContent = 'Leaderboard';

  const h2 = modalScoreboard?.querySelector('h2');
  if (h2) h2.textContent = 'CLAT MOCK-1 — Leaderboard';
  const sub = modalScoreboard?.querySelector('p'); if (sub) sub.textContent = 'Top candidates ranked by best score';

  const sc = $('screen-scorecard');
  sc?.querySelectorAll('h3').forEach((h) => { if (/Firebase/i.test(h.textContent)) h.textContent = 'Leaderboard'; });
  sc?.querySelectorAll('p').forEach((p) => { if (/Firebase/i.test(p.textContent)) p.textContent = 'Evaluated result with detailed performance analysis'; });
  sc?.querySelectorAll('span').forEach((s) => {
    if (/Exam Submitted/i.test(s.textContent)) s.textContent = 'Exam Submitted';
  });

  const notice = document.querySelector('#screen-registration main > div');
  if (notice) notice.innerHTML = '<span class="font-bold">Candidate Verification Notice:</span> Enter your exact details and click a <span class="font-semibold">live photograph</span> before starting <span class="font-semibold">CLAT MOCK-1</span>. Attempt on a <span class="font-semibold">computer in full-screen mode</span>. Already registered? Enter the same mobile and email to log in and continue or re-attempt.';

  const sp = submitConfirmModal?.querySelector('p.text-xs.text-slate-600');
  if (sp) sp.textContent = 'Once submitted, you cannot modify your responses. Your score (+1 / -0.25) will be calculated immediately and you can review every question.';
  const rb = document.querySelector('#screen-registration form .bg-slate-50.border-t p');
  if (rb) rb.innerHTML = 'By registering, your details &amp; live photo will be recorded for <span class="font-semibold text-slate-700">CLAT MOCK-1</span>.';
}

/* =========================================================================
   12. BOOTSTRAP
   ========================================================================= */
applyBranding();
injectRulesBlock();
injectScorecardButtons();
initFirebase();
startCamera();
