/* ==========================================================================
   CLAT MOCK-1 — Core Application Logic  (js/app.js)
   - Candidate doc ID = mobile number  -> duplicate / email-mismatch checks
   - Timer is anchored to Firestore SERVER time (cannot be paused/reset by
     logout, login, refresh, closing the tab or changing the PC clock)
   - Answers autosave to Firebase; re-login resumes exactly where you left
   - Already-attempted candidates see their scorecard with per-question review
   - Downloadable Question Paper / Answer Key + Analytics (print -> Save as PDF)
   - Camera auto-starts for a LIVE photo (upload fallback removed)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, updateDoc, getDocFromServer,
  getDocs, query, where, limit, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { firebaseConfig, COLLECTION_NAME, isFirebaseConfigured } from "./firebase-config.js";
import { CLAT_SECTIONS, QUESTIONS, TOTAL_EXAM_SECONDS } from "./questions.js";

const REG_BTN_TEXT = 'Register / Login & Continue';
const LETTERS = ['A', 'B', 'C', 'D'];

/* =========================================================================
   1. STATE
   ========================================================================= */
let db = null;
let auth = null;
let currentUser = null;
let firebaseReady = false;
let unsubscribeScoreboard = null;
let allScoreboardRecords = [];

let candidate = emptyCandidate();
function emptyCandidate() {
  return { name: '', mobile: '', email: '', photoDataUrl: '' };
}

let mediaStream = null;
let currentQuestionIndex = 0;
let paletteShowAll = false;
let passageFontSize = 15;
let remainingSeconds = TOTAL_EXAM_SECONDS;
let examSubmitted = false;
let examRunning = false;
let questionStates = [];
let lastResult = null;

// Server-anchored clock
let examStartMs = null;
let syncServerMs = 0;
let syncPerf = 0;
let timerInterval = null;
let heartbeatInterval = null;
let saveTimeout = null;

function resetExamState() {
  currentQuestionIndex = 0;
  paletteShowAll = false;
  remainingSeconds = TOTAL_EXAM_SECONDS;
  examSubmitted = false;
  examRunning = false;
  clearInterval(timerInterval);
  clearInterval(heartbeatInterval);
  clearTimeout(saveTimeout);
  timerInterval = heartbeatInterval = saveTimeout = null;
  questionStates = QUESTIONS.map(() => ({ visited: false, selectedOption: null, markedForReview: false }));
}
resetExamState();

/* =========================================================================
   2. UI HELPERS
   ========================================================================= */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const styles = {
    success: 'bg-emerald-700 text-white border-emerald-500',
    error: 'bg-red-700 text-white border-red-500',
    warning: 'bg-amber-600 text-white border-amber-400',
    info: 'bg-slate-900 text-white border-slate-700'
  };
  toast.className = `toast-enter pointer-events-auto px-4 py-3 rounded-xl border shadow-lg text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-all duration-200 ${styles[type] || styles.info}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 220);
  }, 4200);
}

function showScreen(screenId) {
  ['screen-registration', 'screen-instructions', 'screen-exam', 'screen-scorecard'].forEach((id) => {
    document.getElementById(id)?.classList.toggle('hidden', id !== screenId);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function formatTimer(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function formatDurationHuman(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safe / 3600), m = Math.floor((safe % 3600) / 60), s = safe % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const maskMobile = (m = '') => (m.length === 10 ? `${m.slice(0, 2)}XXXXX${m.slice(7)}` : m);
const maskEmail = (e = '') => {
  const [u, d] = String(e).split('@');
  return d ? `${u.slice(0, 2)}***@${d}` : e;
};
const toMs = (ts) => (ts && typeof ts.toMillis === 'function' ? ts.toMillis() : ts ? new Date(ts).getTime() : null);

function updateFirebaseStatusUI(status, text) {
  const dot = document.getElementById('firebase-status-dot');
  const label = document.getElementById('firebase-status-text');
  if (!dot || !label) return;
  dot.className = 'w-2 h-2 rounded-full ' + (status === 'connected' ? 'bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse');
  label.textContent = text;
}

/* =========================================================================
   3. FIREBASE
   ========================================================================= */
const attemptsCol = () => collection(db, COLLECTION_NAME);
const recRef = (mobile = candidate.mobile) => doc(db, COLLECTION_NAME, mobile);

async function initFirebase() {
  if (!isFirebaseConfigured()) {
    updateFirebaseStatusUI('error', 'Firebase keys missing');
    showToast('Firebase is not configured. Check js/firebase-config.js', 'error');
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    const cred = await signInAnonymously(auth);
    currentUser = cred.user;
    firebaseReady = true;
    updateFirebaseStatusUI('connected', 'Firebase Synced');
    subscribeToScoreboard();
  } catch (err) {
    console.error('Firebase init error:', err);
    firebaseReady = false;
    updateFirebaseStatusUI('error', 'Firebase Offline');
    showToast('Firebase connection failed. Enable Anonymous sign-in & Firestore in the console.', 'error');
  }
}

function subscribeToScoreboard() {
  if (unsubscribeScoreboard) unsubscribeScoreboard();
  unsubscribeScoreboard = onSnapshot(
    attemptsCol(),
    (snap) => {
      allScoreboardRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderAllScoreboards();
    },
    (err) => console.error('Scoreboard error:', err)
  );
}

/* ---- Server-anchored clock ---- */
function serverNow() {
  return syncServerMs + (performance.now() - syncPerf);
}

function computeRemaining() {
  return TOTAL_EXAM_SECONDS - Math.floor((serverNow() - examStartMs) / 1000);
}

function questionStatePayload() {
  return {
    answers: questionStates.map((s) => (s.selectedOption === null ? -1 : s.selectedOption)),
    marked: questionStates.map((s) => (s.markedForReview ? 1 : 0)),
    visited: questionStates.map((s) => (s.visited ? 1 : 0)),
    currentQ: currentQuestionIndex
  };
}

function applyRecordToState(rec) {
  if (!Array.isArray(rec.answers) || rec.answers.length !== QUESTIONS.length) return;
  questionStates = QUESTIONS.map((_, i) => ({
    visited: !!(rec.visited && rec.visited[i]) || rec.answers[i] >= 0,
    selectedOption: rec.answers[i] >= 0 ? rec.answers[i] : null,
    markedForReview: !!(rec.marked && rec.marked[i])
  }));
  currentQuestionIndex = Math.min(Math.max(Number(rec.currentQ) || 0, 0), QUESTIONS.length - 1);
}

async function saveProgress() {
  if (!examRunning || examSubmitted || !candidate.mobile) return;
  try {
    await updateDoc(recRef(), { ...questionStatePayload(), lastSeen: serverTimestamp() });
  } catch (e) {
    console.warn('Autosave failed:', e);
  }
}

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveProgress, 900);
}

// Save + re-sync the local timer to Firebase server time
async function pushAndSync() {
  if (!examRunning || examSubmitted) return;
  try {
    await updateDoc(recRef(), { ...questionStatePayload(), lastSeen: serverTimestamp() });
    const snap = await getDocFromServer(recRef());
    const d = snap.data();
    if (d?.lastSeen) {
      syncServerMs = toMs(d.lastSeen);
      syncPerf = performance.now();
    }
    if (d?.status === 'completed' && !examSubmitted) {
      stopExamLoops();
      examSubmitted = true;
      showToast('This attempt was already submitted from another device.', 'warning');
      showCompletedScorecard(d);
    }
  } catch (e) {
    console.warn('Sync failed:', e);
  }
}

function stopExamLoops() {
  examRunning = false;
  clearInterval(timerInterval);
  clearInterval(heartbeatInterval);
  clearTimeout(saveTimeout);
}

/* =========================================================================
   4. LIVE CAMERA (auto-start, live only)
   FIX: video is un-hidden BEFORE the stream is attached/played, secure-context
   check, fallback constraints and clear error messages per failure type.
   ========================================================================= */
const videoEl = document.getElementById('camera-video');
const placeholderEl = document.getElementById('camera-placeholder');
const guideOverlayEl = document.getElementById('camera-guide-overlay');
const previewImgEl = document.getElementById('captured-photo-preview');
const verifiedOverlayEl = document.getElementById('photo-verified-overlay');
const timestampLabelEl = document.getElementById('photo-timestamp-label');
const cameraErrorBox = document.getElementById('camera-error-box');
const photoSizeIndicator = document.getElementById('photo-size-indicator');
const captureCanvas = document.getElementById('photo-capture-canvas');
const btnStartCamera = document.getElementById('btn-start-camera');
const btnClickPhoto = document.getElementById('btn-click-photo');
const btnRetakePhoto = document.getElementById('btn-retake-photo');

// Live photo only: remove the upload option
document.getElementById('btn-upload-fallback')?.parentElement?.classList.add('hidden');

function stopCameraStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (videoEl) videoEl.srcObject = null;
}

function showCameraError(msg) {
  if (!cameraErrorBox) return;
  cameraErrorBox.textContent = msg;
  cameraErrorBox.classList.remove('hidden');
}
function hideCameraError() {
  cameraErrorBox?.classList.add('hidden');
}

function setCameraButtons(mode) {
  btnStartCamera?.classList.toggle('hidden', mode !== 'idle');
  btnClickPhoto?.classList.toggle('hidden', mode !== 'live');
  btnRetakePhoto?.classList.toggle('hidden', mode !== 'captured');
}

async function startCamera() {
  hideCameraError();
  document.getElementById('error-photo')?.classList.add('hidden');
  stopCameraStream();
  candidate.photoDataUrl = '';
  if (photoSizeIndicator) photoSizeIndicator.textContent = 'No photo yet';

  if (!navigator.mediaDevices?.getUserMedia) {
    showCameraError('Camera API unavailable. Open this page via https:// or http://localhost (not by double-clicking the file).');
    setCameraButtons('idle');
    return;
  }
  if (!window.isSecureContext) {
    showCameraError('Camera needs a secure page. Use https:// or http://localhost instead of ' + location.protocol + '//');
    setCameraButtons('idle');
    return;
  }

  try {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
    } catch (firstErr) {
      if (firstErr.name === 'NotAllowedError' || firstErr.name === 'SecurityError') throw firstErr;
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    // Show the video element FIRST so the browser can actually render frames
    previewImgEl?.classList.add('hidden');
    verifiedOverlayEl?.classList.add('hidden');
    placeholderEl?.classList.add('hidden');
    videoEl.classList.remove('hidden');
    guideOverlayEl?.classList.remove('hidden');

    videoEl.muted = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.srcObject = mediaStream;
    await new Promise((resolve) => {
      if (videoEl.readyState >= 2) return resolve();
      videoEl.onloadedmetadata = () => resolve();
      setTimeout(resolve, 3000);
    });
    try { await videoEl.play(); } catch (e) { console.warn('video.play():', e); }

    setCameraButtons('live');
  } catch (err) {
    console.error('Webcam error:', err);
    stopCameraStream();
    videoEl?.classList.add('hidden');
    guideOverlayEl?.classList.add('hidden');
    placeholderEl?.classList.remove('hidden');
    const msgs = {
      NotAllowedError: 'Camera permission denied. Click the camera/lock icon in the address bar, set Camera to Allow, then press "Start Camera".',
      SecurityError: 'Camera blocked by browser security. Use https:// or http://localhost.',
      NotFoundError: 'No camera found on this device. A live photo is mandatory — connect a webcam.',
      NotReadableError: 'Camera is being used by another app/tab. Close it and press "Start Camera".',
      OverconstrainedError: 'Camera does not support the requested settings. Press "Start Camera" again.'
    };
    showCameraError(msgs[err.name] || `Could not start camera (${err.name || 'error'}). Press "Start Camera" to retry.`);
    setCameraButtons('idle');
  }
}

function captureFromVideo() {
  const w = videoEl.videoWidth, h = videoEl.videoHeight;
  const size = 180;
  captureCanvas.width = size;
  captureCanvas.height = size;
  const ctx = captureCanvas.getContext('2d');
  const min = Math.min(w, h);
  ctx.save();
  ctx.translate(size, 0);
  ctx.scale(-1, 1); // match mirrored preview
  ctx.drawImage(videoEl, (w - min) / 2, (h - min) / 2, min, min, 0, 0, size, size);
  ctx.restore();
  return captureCanvas.toDataURL('image/jpeg', 0.72);
}

function applyCapturedPhoto(dataUrl) {
  stopCameraStream();
  candidate.photoDataUrl = dataUrl;
  if (previewImgEl) previewImgEl.src = dataUrl;
  if (timestampLabelEl) timestampLabelEl.textContent = new Date().toLocaleTimeString();
  if (photoSizeIndicator) photoSizeIndicator.textContent = `Verified (~${Math.round((dataUrl.length * 3) / 4 / 1024)} KB)`;
  placeholderEl?.classList.add('hidden');
  videoEl?.classList.add('hidden');
  guideOverlayEl?.classList.add('hidden');
  previewImgEl?.classList.remove('hidden');
  verifiedOverlayEl?.classList.remove('hidden');
  setCameraButtons('captured');
  document.getElementById('error-photo')?.classList.add('hidden');
  hideCameraError();
  showToast('Live photo captured!', 'success');
}

btnStartCamera?.addEventListener('click', startCamera);
btnRetakePhoto?.addEventListener('click', startCamera);
btnClickPhoto?.addEventListener('click', () => {
  if (!videoEl.videoWidth || !videoEl.videoHeight) {
    showToast('Camera is still warming up. Wait a second and try again.', 'warning');
    return;
  }
  applyCapturedPhoto(captureFromVideo());
});

function resetCameraUI() {
  stopCameraStream();
  candidate.photoDataUrl = '';
  previewImgEl?.classList.add('hidden');
  verifiedOverlayEl?.classList.add('hidden');
  videoEl?.classList.add('hidden');
  guideOverlayEl?.classList.add('hidden');
  placeholderEl?.classList.remove('hidden');
  setCameraButtons('idle');
  if (photoSizeIndicator) photoSizeIndicator.textContent = 'No photo yet';
}

/* =========================================================================
   5. REGISTER / LOGIN
   ========================================================================= */
const inputName = document.getElementById('input-name');
const inputMobile = document.getElementById('input-mobile');
const inputEmail = document.getElementById('input-email');
const regForm = document.getElementById('registration-form');

const regBtnText = document.getElementById('btn-register-text');
if (regBtnText) regBtnText.textContent = REG_BTN_TEXT;
const newAttemptBtn = document.getElementById('btn-new-attempt');
if (newAttemptBtn) newAttemptBtn.textContent = 'Log Out';

inputMobile?.addEventListener('input', () => {
  inputMobile.value = inputMobile.value.replace(/\D/g, '').slice(0, 10);
  document.getElementById('error-mobile')?.classList.add('hidden');
});
inputName?.addEventListener('input', () => document.getElementById('error-name')?.classList.add('hidden'));
inputEmail?.addEventListener('input', () => document.getElementById('error-email')?.classList.add('hidden'));

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
}

regForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = inputName.value.trim();
  const mobile = inputMobile.value.trim();
  const email = inputEmail.value.trim();
  const emailLower = email.toLowerCase();
  let ok = true;

  if (name.length < 2) { setFieldError('error-name', 'Please enter your full name.'); ok = false; } else setFieldError('error-name', '');
  if (!/^[6-9]\d{9}$/.test(mobile)) { setFieldError('error-mobile', 'Enter a valid 10-digit Indian mobile number.'); ok = false; } else setFieldError('error-mobile', '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setFieldError('error-email', 'Enter a valid email address.'); ok = false; } else setFieldError('error-email', '');
  if (!candidate.photoDataUrl) { setFieldError('error-photo', 'Click your live photo before continuing.'); ok = false; } else setFieldError('error-photo', '');

  if (!ok) { showToast('Please complete all fields and click your live photo.', 'error'); return; }
  if (!firebaseReady) { showToast('Firebase is not connected. Refresh and try again.', 'error'); return; }

  const submitBtn = document.getElementById('btn-register-submit');
  const submitText = document.getElementById('btn-register-text');
  const arrow = document.getElementById('btn-register-arrow');
  const spinner = document.getElementById('btn-register-spinner');
  submitBtn.disabled = true;
  submitText.textContent = 'Checking details...';
  arrow?.classList.add('hidden');
  spinner?.classList.remove('hidden');

  try {
    const ref = recRef(mobile);
    const snap = await getDocFromServer(ref);

    if (snap.exists()) {
      /* ---- EXISTING MOBILE ---- */
      const data = snap.data();
      const savedEmail = String(data.emailLower || data.email || '').toLowerCase();
      if (savedEmail !== emailLower) {
        setFieldError('error-email', 'This mobile number is already registered with a different email.');
        showToast('Mobile already registered with a different email. Use the original email to log in.', 'error');
        return;
      }

      candidate = { name: data.name, mobile, email: data.email, photoDataUrl: data.photoDataUrl || candidate.photoDataUrl };
      stopCameraStream();
      await updateDoc(ref, {
        lastLoginPhotoDataUrl: document.getElementById('captured-photo-preview')?.src || '',
        lastLoginAt: serverTimestamp()
      }).catch(() => {});

      if (data.status === 'completed') {
        showToast('You have already attempted CLAT MOCK-1. Showing your scorecard.', 'info');
        showCompletedScorecard(data);
      } else if (data.status === 'in_progress' && data.examStartedAt) {
        showToast('Welcome back! Resuming your exam — the timer never stopped.', 'warning');
        await resumeExam(data);
      } else {
        populateInstructionsScreen();
        showScreen('screen-instructions');
      }
      return;
    }

    /* ---- NEW MOBILE: make sure the email is not used by another mobile ---- */
    const dup = await getDocs(query(attemptsCol(), where('emailLower', '==', emailLower), limit(1)));
    if (!dup.empty && dup.docs[0].id !== mobile) {
      setFieldError('error-email', 'This email is already registered with another mobile number.');
      showToast('Email already registered with a different mobile number.', 'error');
      return;
    }

    const payload = {
      candidateUid: currentUser?.uid || 'guest',
      examTitle: 'CLAT MOCK-1',
      name, mobile, email, emailLower,
      photoDataUrl: candidate.photoDataUrl,
      status: 'registered',
      createdAt: serverTimestamp(),
      startedAt: new Date().toISOString(),
      examStartedAt: null,
      completedAt: null,
      score: null,
      totalQuestions: QUESTIONS.length,
      correct: 0, wrong: 0, unattempted: QUESTIONS.length,
      accuracy: 0, timeTakenSeconds: 0, sectionScores: null
    };
    await setDoc(ref, payload);

    candidate = { name, mobile, email, photoDataUrl: candidate.photoDataUrl };
    populateInstructionsScreen();
    showScreen('screen-instructions');
    showToast('Registration saved! Read the instructions to begin.', 'success');
  } catch (err) {
    console.error('Register/login error:', err);
    showToast('Could not complete registration. Check internet / Firestore rules and retry.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = REG_BTN_TEXT;
    arrow?.classList.remove('hidden');
    spinner?.classList.add('hidden');
  }
});

/* =========================================================================
   6. INSTRUCTIONS
   ========================================================================= */
const checkboxInstructions = document.getElementById('checkbox-instructions');
const btnStartExam = document.getElementById('btn-start-exam');

function populateInstructionsScreen() {
  document.getElementById('inst-candidate-photo').src = candidate.photoDataUrl;
  document.getElementById('inst-candidate-name').textContent = candidate.name;
  document.getElementById('inst-candidate-mobile').textContent = `+91 ${candidate.mobile}`;
  document.getElementById('inst-candidate-email').textContent = candidate.email;
  if (checkboxInstructions) checkboxInstructions.checked = false;
  if (btnStartExam) btnStartExam.disabled = true;
}

checkboxInstructions?.addEventListener('change', () => { btnStartExam.disabled = !checkboxInstructions.checked; });
document.getElementById('btn-back-to-reg')?.addEventListener('click', () => {
  showScreen('screen-registration');
  startCamera();
});

btnStartExam?.addEventListener('click', async () => {
  btnStartExam.disabled = true;
  try {
    let snap = await getDocFromServer(recRef());
    let d = snap.data();

    if (d.status === 'completed') { showCompletedScorecard(d); return; }

    // Timer starts ONLY ONCE, stamped by the Firebase server
    if (!d.examStartedAt) {
      resetExamState();
      await updateDoc(recRef(), {
        status: 'in_progress',
        examStartedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        ...questionStatePayload()
      });
      snap = await getDocFromServer(recRef());
      d = snap.data();
    }
    await resumeExam(d);
  } catch (err) {
    console.error('Start exam error:', err);
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
  syncServerMs = toMs(d.lastSeen) || toMs(d.examStartedAt);
  syncPerf = performance.now();

  // Get a fresh server time reading right now
  try {
    await updateDoc(recRef(), { lastSeen: serverTimestamp() });
    const fresh = (await getDocFromServer(recRef())).data();
    syncServerMs = toMs(fresh.lastSeen);
    syncPerf = performance.now();
  } catch (e) {
    console.warn('Clock sync failed:', e);
  }

  examRunning = true;
  if (computeRemaining() <= 0) {
    showToast('Your exam time is over. Submitting your saved answers...', 'warning');
    await finalizeAndSubmitExam(true);
    return;
  }
  launchExamInterface();
}

function launchExamInterface() {
  document.getElementById('exam-candidate-photo').src = candidate.photoDataUrl;
  document.getElementById('exam-candidate-name').textContent = candidate.name;
  showScreen('screen-exam');
  goToQuestion(currentQuestionIndex);
  startExamTimer();
  heartbeatInterval = setInterval(pushAndSync, 45000);
}

function startExamTimer() {
  clearInterval(timerInterval);
  tick();
  timerInterval = setInterval(tick, 500);
}

function tick() {
  remainingSeconds = computeRemaining();
  updateTimerDisplay();
  if (remainingSeconds <= 0 && !examSubmitted) {
    clearInterval(timerInterval);
    showToast('Time is up! Auto-submitting CLAT MOCK-1...', 'warning');
    finalizeAndSubmitExam(true);
  }
}

function updateTimerDisplay() {
  const display = document.getElementById('exam-timer-display');
  const box = document.getElementById('exam-timer-box');
  if (!display || !box) return;
  display.textContent = formatTimer(remainingSeconds);
  box.classList.remove('border-white/20', 'border-amber-400', 'border-red-500', 'bg-red-950');
  display.classList.remove('text-white', 'text-amber-300', 'text-red-300');
  if (remainingSeconds <= 300) { box.classList.add('border-red-500', 'bg-red-950'); display.classList.add('text-red-300'); }
  else if (remainingSeconds <= 900) { box.classList.add('border-amber-400'); display.classList.add('text-amber-300'); }
  else { box.classList.add('border-white/20'); display.classList.add('text-white'); }
}

function getActiveSection() {
  return CLAT_SECTIONS.find((s) => s.id === QUESTIONS[currentQuestionIndex].sectionId);
}

function goToQuestion(index) {
  if (index < 0 || index >= QUESTIONS.length) return;
  currentQuestionIndex = index;
  questionStates[index].visited = true;
  renderSectionTabs();
  renderPassageAndQuestion();
  renderQuestionPalette();
  scheduleSave();
}

function renderSectionTabs() {
  const container = document.getElementById('section-tabs-container');
  if (!container) return;
  const active = getActiveSection();
  container.innerHTML = CLAT_SECTIONS.map((sec) => {
    const isActive = sec.id === active.id;
    let n = 0;
    for (let i = sec.startQ - 1; i < sec.endQ; i++) if (questionStates[i].selectedOption !== null) n++;
    return `
      <button type="button" data-section-start="${sec.startQ - 1}"
        class="section-tab-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
        <span>${escapeHtml(sec.shortName)}</span>
        <span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-600'}">${n}/${sec.count}</span>
      </button>`;
  }).join('');
  container.querySelectorAll('.section-tab-btn').forEach((btn) =>
    btn.addEventListener('click', () => goToQuestion(Number(btn.dataset.sectionStart))));
}

function renderPassageAndQuestion() {
  const q = QUESTIONS[currentQuestionIndex];
  const state = questionStates[currentQuestionIndex];

  document.getElementById('passage-badge').textContent = `PASSAGE ${q.passageIndex}`;
  document.getElementById('passage-title').textContent = q.passageTitle;
  document.getElementById('passage-range').textContent = `${q.sectionName} • ${q.passageRange}`;

  const body = document.getElementById('passage-body');
  body.style.fontSize = `${passageFontSize}px`;
  body.innerHTML = q.passageParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');

  document.getElementById('question-number-label').textContent = `Question ${q.id} of ${QUESTIONS.length}`;
  document.getElementById('question-section-pill').textContent = q.sectionName;
  document.getElementById('question-text').textContent = q.questionText;

  const oc = document.getElementById('options-container');
  oc.innerHTML = q.options.map((opt, i) => {
    const sel = state.selectedOption === i;
    return `
      <button type="button" data-option-idx="${i}" role="radio" aria-checked="${sel}"
        class="option-btn w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition flex items-start gap-3 cursor-pointer ${sel ? 'border-blue-700 bg-blue-50/80 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}">
        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${sel ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'}">${LETTERS[i]}</span>
        <span class="text-sm text-slate-800 leading-relaxed font-medium">${escapeHtml(opt)}</span>
      </button>`;
  }).join('');
  oc.querySelectorAll('.option-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      questionStates[currentQuestionIndex].selectedOption = Number(btn.dataset.optionIdx);
      renderPassageAndQuestion();
      renderSectionTabs();
      renderQuestionPalette();
      scheduleSave();
    }));

  document.getElementById('btn-prev-question').disabled = currentQuestionIndex === 0;
  document.getElementById('btn-save-next').textContent = currentQuestionIndex === QUESTIONS.length - 1 ? 'Save Response' : 'Save & Next →';
}

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
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('count-answered', c.answered);
  set('count-not-answered', c.notAnswered);
  set('count-not-visited', c.notVisited);
  set('count-marked', c.marked);
  const am = document.getElementById('count-answered-marked');
  if (am?.childNodes[0]) am.childNodes[0].textContent = `${c.answeredMarked} `;

  const sec = getActiveSection();
  let start = sec.startQ - 1, end = sec.endQ - 1;
  if (paletteShowAll) {
    start = 0; end = QUESTIONS.length - 1;
    set('palette-scope-subtitle', 'Showing All 120 Questions');
    set('btn-palette-scope-toggle', 'Active Section');
  } else {
    set('palette-scope-subtitle', `${sec.shortName} (Q${sec.startQ}–Q${sec.endQ})`);
    set('btn-palette-scope-toggle', 'View All 120');
  }

  const html = [];
  for (let i = start; i <= end; i++) {
    const st = questionStates[i];
    let cls = 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200';
    let dot = '';
    if (st.visited) {
      if (st.markedForReview && st.selectedOption !== null) {
        cls = 'bg-purple-600 text-white hover:bg-purple-700';
        dot = '<span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>';
      } else if (st.markedForReview) cls = 'bg-purple-600 text-white hover:bg-purple-700';
      else if (st.selectedOption !== null) cls = 'bg-emerald-600 text-white hover:bg-emerald-700';
      else cls = 'bg-red-600 text-white hover:bg-red-700';
    }
    const ring = i === currentQuestionIndex ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : '';
    html.push(`<button type="button" data-q-index="${i}" class="palette-q-btn relative h-10 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${cls} ${ring}">${i + 1}${dot}</button>`);
  }
  const grid = document.getElementById('palette-grid');
  grid.innerHTML = html.join('');
  grid.querySelectorAll('.palette-q-btn').forEach((b) =>
    b.addEventListener('click', () => { goToQuestion(Number(b.dataset.qIndex)); closeMobilePalette(); }));
}

document.getElementById('btn-save-next')?.addEventListener('click', () => {
  if (questionStates[currentQuestionIndex].selectedOption !== null) questionStates[currentQuestionIndex].markedForReview = false;
  if (currentQuestionIndex < QUESTIONS.length - 1) goToQuestion(currentQuestionIndex + 1);
  else { renderQuestionPalette(); scheduleSave(); showToast('Response saved. You are on the final question.', 'info'); }
});

document.getElementById('btn-mark-review')?.addEventListener('click', () => {
  questionStates[currentQuestionIndex].markedForReview = true;
  if (currentQuestionIndex < QUESTIONS.length - 1) goToQuestion(currentQuestionIndex + 1);
  else { renderQuestionPalette(); scheduleSave(); showToast('Marked for review.', 'info'); }
});

document.getElementById('btn-clear-response')?.addEventListener('click', () => {
  questionStates[currentQuestionIndex].selectedOption = null;
  questionStates[currentQuestionIndex].markedForReview = false;
  renderPassageAndQuestion(); renderSectionTabs(); renderQuestionPalette(); scheduleSave();
});

document.getElementById('btn-prev-question')?.addEventListener('click', () => {
  if (currentQuestionIndex > 0) goToQuestion(currentQuestionIndex - 1);
});

const applyFont = () => { const pb = document.getElementById('passage-body'); if (pb) pb.style.fontSize = `${passageFontSize}px`; };
document.getElementById('btn-font-inc')?.addEventListener('click', () => { passageFontSize = Math.min(22, passageFontSize + 1.5); applyFont(); });
document.getElementById('btn-font-dec')?.addEventListener('click', () => { passageFontSize = Math.max(12, passageFontSize - 1.5); applyFont(); });
document.getElementById('btn-font-reset')?.addEventListener('click', () => { passageFontSize = 15; applyFont(); });

document.getElementById('btn-palette-scope-toggle')?.addEventListener('click', () => { paletteShowAll = !paletteShowAll; renderQuestionPalette(); });

const paletteSidebar = document.getElementById('question-palette-sidebar');
const paletteBackdrop = document.getElementById('palette-backdrop');
function openMobilePalette() { paletteSidebar?.classList.remove('translate-x-full'); paletteBackdrop?.classList.remove('hidden'); }
function closeMobilePalette() { paletteSidebar?.classList.add('translate-x-full'); paletteBackdrop?.classList.add('hidden'); }
document.getElementById('btn-toggle-mobile-palette')?.addEventListener('click', openMobilePalette);
document.getElementById('btn-close-mobile-palette')?.addEventListener('click', closeMobilePalette);
paletteBackdrop?.addEventListener('click', closeMobilePalette);

// Never lose answers on tab close / hide / refresh
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveProgress();
  else if (examRunning) pushAndSync();
});
window.addEventListener('pagehide', saveProgress);
window.addEventListener('beforeunload', (e) => {
  stopCameraStream();
  if (examRunning && !examSubmitted) {
    saveProgress();
    e.preventDefault();
    e.returnValue = '';
  }
});

/* =========================================================================
   8. SUBMIT, SCORING (+1 / -0.25)
   ========================================================================= */
const submitConfirmModal = document.getElementById('modal-submit-confirm');

document.getElementById('btn-open-submit-modal')?.addEventListener('click', () => {
  const c = getQuestionPaletteCounts();
  const answered = c.answered + c.answeredMarked;
  document.getElementById('submit-summary-answered').textContent = answered;
  document.getElementById('submit-summary-unanswered').textContent = QUESTIONS.length - answered;
  document.getElementById('submit-summary-marked').textContent = c.marked + c.answeredMarked;
  document.getElementById('submit-summary-time').textContent = formatTimer(remainingSeconds);
  submitConfirmModal?.classList.remove('hidden');
});
document.getElementById('btn-cancel-submit')?.addEventListener('click', () => submitConfirmModal?.classList.add('hidden'));
document.getElementById('btn-confirm-submit')?.addEventListener('click', () => {
  submitConfirmModal?.classList.add('hidden');
  finalizeAndSubmitExam(false);
});

function computeResult(answerArr) {
  let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0;
  const perQuestion = QUESTIONS.map((q, i) => {
    const raw = answerArr?.[i];
    const selected = raw === undefined || raw === null || raw < 0 ? null : raw;
    let status, marks;
    if (selected === null) { status = 'unattempted'; marks = 0; totalUnattempted++; }
    else if (selected === q.correctOption) { status = 'correct'; marks = 1; totalCorrect++; }
    else { status = 'wrong'; marks = -0.25; totalWrong++; }
    return { id: q.id, sectionId: q.sectionId, selected, correct: q.correctOption, status, marks };
  });

  const sectionScores = CLAT_SECTIONS.map((sec) => {
    const items = perQuestion.slice(sec.startQ - 1, sec.endQ);
    const correct = items.filter((x) => x.status === 'correct').length;
    const wrong = items.filter((x) => x.status === 'wrong').length;
    const attempted = correct + wrong;
    return {
      sectionId: sec.id, name: sec.name, total: sec.count, attempted, correct, wrong,
      unattempted: sec.count - attempted,
      score: Number((correct - wrong * 0.25).toFixed(2)),
      accuracy: attempted ? Number(((correct / attempted) * 100).toFixed(1)) : 0
    };
  });

  const attempted = totalCorrect + totalWrong;
  return {
    finalScore: Number((totalCorrect - totalWrong * 0.25).toFixed(2)),
    totalCorrect, totalWrong, totalUnattempted,
    accuracy: attempted ? Number(((totalCorrect / attempted) * 100).toFixed(1)) : 0,
    sectionScores, perQuestion
  };
}

async function writeWithRetry(updates, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { await updateDoc(recRef(), updates); return true; }
    catch (e) { console.warn('Write retry', i + 1, e); await new Promise((r) => setTimeout(r, 1000 * (i + 1))); }
  }
  return false;
}

async function finalizeAndSubmitExam(autoSubmitted = false) {
  if (examSubmitted) return;
  examSubmitted = true;
  stopExamLoops();

  const payload = questionStatePayload();
  const result = computeResult(payload.answers);
  const elapsed = Math.floor((serverNow() - examStartMs) / 1000);
  const timeTakenSeconds = Math.min(TOTAL_EXAM_SECONDS, Math.max(1, elapsed));
  const completedAt = new Date().toISOString();

  const saved = await writeWithRetry({
    ...payload,
    status: 'completed',
    score: result.finalScore,
    correct: result.totalCorrect,
    wrong: result.totalWrong,
    unattempted: result.totalUnattempted,
    accuracy: result.accuracy,
    timeTakenSeconds,
    sectionScores: result.sectionScores,
    completedAt,
    autoSubmitted
  });

  showToast(saved
    ? (autoSubmitted ? 'Time up — exam auto-submitted and saved!' : 'Exam submitted and score saved!')
    : 'Score calculated, but cloud sync failed. Log in again to retry.',
    saved ? 'success' : 'warning');

  renderScorecard(result, { completedAt, timeTakenSeconds });
  showScreen('screen-scorecard');
}

// Already-attempted candidate: rebuild scorecard + per-question review
function showCompletedScorecard(d) {
  stopExamLoops();
  examSubmitted = true;
  const result = computeResult(d.answers);
  renderScorecard(result, { completedAt: d.completedAt, timeTakenSeconds: d.timeTakenSeconds });
  showScreen('screen-scorecard');
}

/* =========================================================================
   9. SCORECARD, ANALYTICS & PER-QUESTION REVIEW
   ========================================================================= */
function renderScorecard(result, meta) {
  lastResult = { result, meta };
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  const photo = document.getElementById('res-candidate-photo');
  if (photo) photo.src = candidate.photoDataUrl;
  set('res-candidate-name', candidate.name);
  set('res-candidate-contact', `+91 ${candidate.mobile} • ${candidate.email}`);
  set('res-meta-time', `Completed on ${meta.completedAt ? new Date(meta.completedAt).toLocaleString() : '-'} • Time Taken: ${formatDurationHuman(meta.timeTakenSeconds)}`);
  set('res-total-score', result.finalScore.toFixed(2));
  set('res-correct', result.totalCorrect);
  set('res-wrong', result.totalWrong);
  set('res-negative-deduction', `-${(result.totalWrong * 0.25).toFixed(2)} marks`);
  set('res-unattempted', result.totalUnattempted);
  set('res-accuracy', `${result.accuracy}%`);

  const tbody = document.getElementById('res-section-table-body');
  if (tbody) {
    tbody.innerHTML = result.sectionScores.map((s) => {
      const pct = Math.max(0, Math.min(100, (s.score / s.total) * 100));
      return `
        <tr class="hover:bg-slate-50/70">
          <td class="px-5 py-3.5 font-semibold text-slate-900"><div>${escapeHtml(s.name)}</div>
            <div class="w-32 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden"><div class="h-full bg-slate-700 rounded-full" style="width:${pct.toFixed(1)}%"></div></div></td>
          <td class="px-4 py-3.5 text-center text-slate-600">${s.total}</td>
          <td class="px-4 py-3.5 text-center font-semibold">${s.attempted}</td>
          <td class="px-4 py-3.5 text-center font-bold text-emerald-600">${s.correct}</td>
          <td class="px-4 py-3.5 text-center font-bold text-red-600">${s.wrong}</td>
          <td class="px-4 py-3.5 text-center font-semibold">${s.accuracy}%</td>
          <td class="px-5 py-3.5 text-right font-extrabold">${s.score.toFixed(2)} / ${s.total}</td>
        </tr>`;
    }).join('');
  }

  renderAnalyticsAndReview(result, meta);
  renderAllScoreboards();
}

function buildInsights(r, meta) {
  const attempted = r.totalCorrect + r.totalWrong;
  const lines = [];
  lines.push(`Attempt rate: ${attempted}/${QUESTIONS.length} questions (${((attempted / QUESTIONS.length) * 100).toFixed(0)}%).`);
  lines.push(`Negative marking cost you ${(r.totalWrong * 0.25).toFixed(2)} marks across ${r.totalWrong} wrong answers.`);
  if (attempted) lines.push(`Average time per attempted question: ${Math.round(meta.timeTakenSeconds / attempted)} seconds.`);
  const act = r.sectionScores.filter((s) => s.attempted > 0);
  if (act.length) {
    const best = [...act].sort((a, b) => b.accuracy - a.accuracy)[0];
    const weak = [...act].sort((a, b) => a.accuracy - b.accuracy)[0];
    lines.push(`Strongest section: ${best.name} (${best.accuracy}% accuracy).`);
    if (weak.sectionId !== best.sectionId) lines.push(`Needs most work: ${weak.name} (${weak.accuracy}% accuracy).`);
  }
  if (attempted && r.accuracy < 70) lines.push('Accuracy is below 70%: with -0.25 marking, skip questions where you are not at least ~60% sure.');
  if (r.totalUnattempted > 30) lines.push('Many questions were left unattempted. Practise sectional timing to raise your attempt rate.');
  return lines;
}

function ensureReviewSection() {
  let sec = document.getElementById('review-section');
  if (sec) return sec;
  sec = document.createElement('section');
  sec.id = 'review-section';
  sec.className = 'space-y-6';
  document.getElementById('res-section-table-body').closest('section').insertAdjacentElement('afterend', sec);
  return sec;
}

function renderAnalyticsAndReview(r, meta) {
  const sec = ensureReviewSection();
  const total = QUESTIONS.length;
  const pc = (n) => ((n / total) * 100).toFixed(1);

  sec.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-base font-bold text-nlu-900">Performance Analytics &amp; Downloads</h3>
        <div class="flex flex-wrap gap-2">
          <button id="btn-dl-paper" type="button" class="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm cursor-pointer">⬇ Question Paper (PDF)</button>
          <button id="btn-dl-full" type="button" class="px-4 py-2 rounded-xl bg-nlu-900 hover:bg-nlu-800 text-white font-semibold text-xs sm:text-sm cursor-pointer">⬇ Paper + Answer Key + Analytics (PDF)</button>
        </div>
      </div>
      <div class="p-6 space-y-5">
        <div>
          <div class="flex h-4 rounded-full overflow-hidden bg-slate-200">
            <div class="bg-emerald-500" style="width:${pc(r.totalCorrect)}%" title="Correct"></div>
            <div class="bg-red-500" style="width:${pc(r.totalWrong)}%" title="Wrong"></div>
            <div class="bg-slate-400" style="width:${pc(r.totalUnattempted)}%" title="Unattempted"></div>
          </div>
          <div class="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-slate-600">
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Correct ${r.totalCorrect}</span>
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span> Wrong ${r.totalWrong}</span>
            <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-slate-400"></span> Unattempted ${r.totalUnattempted}</span>
          </div>
        </div>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
          ${buildInsights(r, meta).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-base font-bold text-nlu-900">Question-wise Review</h3>
        <div class="flex flex-wrap gap-2">
          <select id="review-filter-status" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
            <option value="all">All questions</option><option value="correct">Correct</option>
            <option value="wrong">Wrong</option><option value="unattempted">Unattempted</option>
          </select>
          <select id="review-filter-section" class="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white">
            <option value="all">All sections</option>
            ${CLAT_SECTIONS.map((s) => `<option value="${s.id}">${escapeHtml(s.shortName)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="overflow-x-auto max-h-[600px] overflow-y-auto custom-scroll">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
            <tr><th class="px-4 py-3">Q</th><th class="px-4 py-3">Question</th><th class="px-4 py-3 text-center">Your Answer</th><th class="px-4 py-3 text-center">Correct</th><th class="px-4 py-3 text-center">Result</th><th class="px-4 py-3 text-right">Marks</th></tr>
          </thead>
          <tbody id="review-tbody" class="divide-y divide-slate-100"></tbody>
        </table>
      </div>
    </div>`;

  const drawRows = () => {
    const st = document.getElementById('review-filter-status').value;
    const sc = document.getElementById('review-filter-section').value;
    const badge = {
      correct: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      wrong: 'bg-red-50 text-red-700 border-red-200',
      unattempted: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    document.getElementById('review-tbody').innerHTML = r.perQuestion
      .filter((x) => (st === 'all' || x.status === st) && (sc === 'all' || x.sectionId === sc))
      .map((x) => `
        <tr class="hover:bg-slate-50/70">
          <td class="px-4 py-2.5 font-bold text-slate-900">${x.id}</td>
          <td class="px-4 py-2.5 text-slate-700 max-w-[420px]"><div class="line-clamp-2" title="${escapeHtml(QUESTIONS[x.id - 1].questionText)}">${escapeHtml(QUESTIONS[x.id - 1].questionText)}</div></td>
          <td class="px-4 py-2.5 text-center font-bold ${x.status === 'wrong' ? 'text-red-600' : ''}">${x.selected === null ? '—' : LETTERS[x.selected]}</td>
          <td class="px-4 py-2.5 text-center font-bold text-emerald-700">${LETTERS[x.correct]}</td>
          <td class="px-4 py-2.5 text-center"><span class="inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${badge[x.status]}">${x.status === 'unattempted' ? 'Skipped' : x.status === 'correct' ? 'Correct' : 'Wrong'}</span></td>
          <td class="px-4 py-2.5 text-right font-bold ${x.marks > 0 ? 'text-emerald-600' : x.marks < 0 ? 'text-red-600' : 'text-slate-500'}">${x.marks > 0 ? '+1.00' : x.marks < 0 ? '-0.25' : '0.00'}</td>
        </tr>`).join('') || '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400">No questions match this filter.</td></tr>';
  };
  drawRows();
  document.getElementById('review-filter-status').addEventListener('change', drawRows);
  document.getElementById('review-filter-section').addEventListener('change', drawRows);
  document.getElementById('btn-dl-paper').addEventListener('click', () => openPrintWindow(buildPrintHtml('paper', r, meta)));
  document.getElementById('btn-dl-full').addEventListener('click', () => openPrintWindow(buildPrintHtml('full', r, meta)));
}

/* ---- Printable question paper / answer key / analytics ---- */
function buildPrintHtml(mode, r, meta) {
  const full = mode === 'full';
  let body = '';
  let lastSec = null, lastPassage = null;

  QUESTIONS.forEach((q, i) => {
    if (q.sectionId !== lastSec) {
      lastSec = q.sectionId;
      body += `<h2>${escapeHtml(q.sectionName)}</h2>`;
    }
    if (q.passageId !== lastPassage) {
      lastPassage = q.passageId;
      body += `<div class="passage"><div class="ptitle">${escapeHtml(q.passageTitle)} <span>(${escapeHtml(q.passageRange)})</span></div>${q.passageParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>`;
    }
    const pq = r.perQuestion[i];
    body += `<div class="q"><div class="qt"><b>Q${q.id}.</b> ${escapeHtml(q.questionText)}</div>`;
    q.options.forEach((o, oi) => {
      let cls = '';
      if (full && oi === q.correctOption) cls = 'ok';
      else if (full && pq.selected === oi) cls = 'bad';
      body += `<div class="opt ${cls}">(${LETTERS[oi]}) ${escapeHtml(o)}${full && oi === q.correctOption ? ' ✓' : ''}${full && pq.selected === oi ? ' ← your answer' : ''}</div>`;
    });
    if (full) body += `<div class="meta">Your answer: <b>${pq.selected === null ? 'Not attempted' : LETTERS[pq.selected]}</b> &nbsp;|&nbsp; Correct: <b>${LETTERS[q.correctOption]}</b> &nbsp;|&nbsp; Marks: <b>${pq.marks > 0 ? '+1' : pq.marks < 0 ? '-0.25' : '0'}</b></div>`;
    body += '</div>';
  });

  let summary = '';
  if (full) {
    summary = `
      <h2>Result Summary</h2>
      <table><tr><th>Score</th><th>Correct</th><th>Wrong</th><th>Unattempted</th><th>Accuracy</th><th>Time Taken</th></tr>
      <tr><td><b>${r.finalScore.toFixed(2)} / 120</b></td><td>${r.totalCorrect}</td><td>${r.totalWrong}</td><td>${r.totalUnattempted}</td><td>${r.accuracy}%</td><td>${formatDurationHuman(meta.timeTakenSeconds)}</td></tr></table>
      <h2>Section-wise Analytics</h2>
      <table><tr><th>Section</th><th>Total</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Score</th></tr>
      ${r.sectionScores.map((s) => `<tr><td>${escapeHtml(s.name)}</td><td>${s.total}</td><td>${s.attempted}</td><td>${s.correct}</td><td>${s.wrong}</td><td>${s.accuracy}%</td><td>${s.score.toFixed(2)}</td></tr>`).join('')}</table>
      <h2>Insights</h2><ul>${buildInsights(r, meta).map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <h2>Answer Key</h2>
      <div class="key">${r.perQuestion.map((x) => `<span class="${x.status}">${x.id}: ${LETTERS[x.correct]}${x.selected !== null ? ` (you ${LETTERS[x.selected]})` : ' (skipped)'}</span>`).join('')}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CLAT MOCK-1 ${full ? 'Answer Key & Analytics' : 'Question Paper'}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px;font-size:13px;line-height:1.5}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;background:#0f294d;color:#fff;padding:6px 10px;margin:22px 0 10px;page-break-after:avoid}
.head{border-bottom:3px solid #fbbf24;padding-bottom:8px;margin-bottom:10px}
.passage{background:#f1f5f9;border-left:4px solid #0f294d;padding:8px 12px;margin:12px 0}.ptitle{font-weight:bold;margin-bottom:4px}.ptitle span{font-weight:normal;color:#555}
.q{margin:10px 0;page-break-inside:avoid}.opt{margin:2px 0 2px 18px}.ok{color:#047857;font-weight:bold}.bad{color:#b91c1c;font-weight:bold}.meta{margin:4px 0 0 18px;color:#444;font-size:12px}
table{border-collapse:collapse;width:100%;margin-bottom:10px}th,td{border:1px solid #bbb;padding:5px 8px;text-align:left}th{background:#eef2f7}
.key{display:flex;flex-wrap:wrap;gap:6px}.key span{border:1px solid #ccc;padding:2px 6px;border-radius:4px;font-size:12px}.key .correct{background:#d1fae5}.key .wrong{background:#fee2e2}.key .unattempted{background:#f1f5f9}
.noprint{margin-bottom:12px}button{padding:8px 16px;font-size:14px;cursor:pointer}
@media print{.noprint{display:none}body{margin:10mm}}
</style></head><body>
<div class="noprint"><button onclick="window.print()">Print / Save as PDF</button></div>
<div class="head"><h1>CLAT MOCK-1 — ${full ? 'Question Paper, Answer Key &amp; Analytics' : 'Question Paper'}</h1>
<div>Candidate: <b>${escapeHtml(candidate.name)}</b> &nbsp;|&nbsp; Mobile: ${escapeHtml(candidate.mobile)} &nbsp;|&nbsp; Email: ${escapeHtml(candidate.email)}</div>
<div>120 Questions &bull; 120 Minutes &bull; +1 for correct, -0.25 for wrong</div></div>
${summary}${body}</body></html>`;
}

function openPrintWindow(html) {
  const w = window.open('', '_blank');
  if (!w) { showToast('Pop-up blocked. Allow pop-ups for this page and try again.', 'warning'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* user can press the Print button */ } }, 700);
}

/* Log out -> back to registration/login with a fresh live-photo camera */
newAttemptBtn?.addEventListener('click', () => {
  stopExamLoops();
  candidate = emptyCandidate();
  lastResult = null;
  regForm?.reset();
  resetExamState();
  resetCameraUI();
  showScreen('screen-registration');
  startCamera();
});

/* =========================================================================
   10. SCOREBOARD (PII masked on screen)
   ========================================================================= */
function sortScoreboardRecords(records) {
  return [...records].sort((a, b) => {
    const ac = a.status === 'completed', bc = b.status === 'completed';
    if (ac && !bc) return -1;
    if (!ac && bc) return 1;
    if (ac && bc) {
      const d = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (d !== 0) return d;
      return (Number(a.timeTakenSeconds) || 99999) - (Number(b.timeTakenSeconds) || 99999);
    }
    return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
  });
}

function renderScoreboardTable(tbodyId, searchValue, filterValue) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const q = (searchValue || '').trim().toLowerCase();
  const filtered = sortScoreboardRecords(allScoreboardRecords).filter((rec) =>
    (filterValue === 'all' || rec.status === filterValue) && (!q || (rec.name || '').toLowerCase().includes(q)));

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 text-sm">No candidate records match your current view yet.</td></tr>';
    return;
  }

  let rank = 0;
  tbody.innerHTML = filtered.map((rec) => {
    let rankDisplay = '—';
    if (rec.status === 'completed') { rank++; rankDisplay = `#${rank}`; }
    const meta = {
      completed: ['Completed', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
      in_progress: ['In Progress', 'bg-amber-50 text-amber-800 border-amber-200'],
      registered: ['Registered', 'bg-blue-50 text-blue-700 border-blue-200']
    }[rec.status] || [rec.status || 'Registered', 'bg-slate-100 text-slate-600 border-slate-200'];
    const me = candidate.mobile && rec.id === candidate.mobile;
    const fallback = `https://placehold.co/80x80/1e3a8a/ffffff?text=${encodeURIComponent((rec.name || 'U').charAt(0).toUpperCase())}`;
    return `
      <tr class="${me ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}">
        <td class="px-4 py-3 text-center font-extrabold">${rankDisplay}</td>
        <td class="px-4 py-3"><div class="flex items-center gap-3">
          <img src="${rec.photoDataUrl || fallback}" onerror="this.onerror=null;this.src='${fallback}';" alt="" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
          <div class="min-w-0"><div class="font-bold text-slate-900 flex items-center gap-1.5"><span class="truncate max-w-[160px]">${escapeHtml(rec.name || 'Unnamed')}</span>${me ? '<span class="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">YOU</span>' : ''}</div>
          <div class="text-[11px] text-slate-400">${rec.startedAt ? new Date(rec.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}</div></div></div></td>
        <td class="px-4 py-3"><div class="font-medium text-slate-800">${escapeHtml(maskMobile(rec.mobile || '-'))}</div><div class="text-xs text-slate-500 truncate max-w-[190px]">${escapeHtml(maskEmail(rec.email || '-'))}</div></td>
        <td class="px-4 py-3 text-center"><span class="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${meta[1]}">${meta[0]}</span></td>
        <td class="px-4 py-3 text-center font-extrabold">${rec.status === 'completed' && rec.score != null ? Number(rec.score).toFixed(2) : '—'}</td>
        <td class="px-4 py-3 text-center font-semibold">${rec.status === 'completed' ? `${rec.accuracy ?? 0}%` : '—'}</td>
        <td class="px-4 py-3 text-right font-mono text-xs text-slate-600">${rec.status === 'completed' ? formatDurationHuman(rec.timeTakenSeconds) : '—'}</td>
      </tr>`;
  }).join('');
}

function renderAllScoreboards() {
  const badge = document.getElementById('scoreboard-count-badge');
  if (badge) badge.textContent = allScoreboardRecords.length;
  renderScoreboardTable('modal-scoreboard-tbody', document.getElementById('modal-scoreboard-search')?.value, document.getElementById('modal-scoreboard-filter')?.value || 'all');
  renderScoreboardTable('inline-scoreboard-tbody', document.getElementById('inline-scoreboard-search')?.value, document.getElementById('inline-scoreboard-filter')?.value || 'all');
}

const modalScoreboard = document.getElementById('modal-scoreboard');
document.getElementById('btn-open-scoreboard')?.addEventListener('click', () => { renderAllScoreboards(); modalScoreboard?.classList.remove('hidden'); });
document.getElementById('btn-close-scoreboard')?.addEventListener('click', () => modalScoreboard?.classList.add('hidden'));
modalScoreboard?.addEventListener('click', (e) => { if (e.target === modalScoreboard) modalScoreboard.classList.add('hidden'); });

['modal-scoreboard-search', 'inline-scoreboard-search'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.placeholder = 'Search by candidate name...';
});
['modal-scoreboard-search', 'modal-scoreboard-filter', 'inline-scoreboard-search', 'inline-scoreboard-filter'].forEach((id) => {
  const el = document.getElementById(id);
  el?.addEventListener('input', renderAllScoreboards);
  el?.addEventListener('change', renderAllScoreboards);
});

function exportScoreboardCsv() {
  const sorted = sortScoreboardRecords(allScoreboardRecords);
  if (!sorted.length) { showToast('No records to export yet.', 'warning'); return; }
  const headers = ['Rank', 'Name', 'Mobile', 'Email', 'Status', 'Score', 'Correct', 'Wrong', 'Unattempted', 'Accuracy (%)', 'Time (s)', 'Registered At', 'Completed At'];
  let rank = 0;
  const rows = sorted.map((r) => {
    const done = r.status === 'completed';
    return [done ? ++rank : '', r.name || '', r.mobile || '', r.email || '', r.status || '',
      done && r.score != null ? Number(r.score).toFixed(2) : '', done ? r.correct ?? 0 : '', done ? r.wrong ?? 0 : '',
      done ? r.unattempted ?? 120 : '', done ? r.accuracy ?? 0 : '', done ? r.timeTakenSeconds ?? 0 : '',
      r.startedAt || '', r.completedAt || '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CLAT_MOCK_1_Scoreboard_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
document.getElementById('btn-export-csv-modal')?.addEventListener('click', exportScoreboardCsv);
document.getElementById('btn-export-csv-inline')?.addEventListener('click', exportScoreboardCsv);

/* =========================================================================
   11. BOOTSTRAP — Firebase, then camera opens automatically for the live photo
   ========================================================================= */
initFirebase();
startCamera();