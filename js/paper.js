/* ==========================================================================
   CLAT MOCK-1 — Question booklet generator  (js/paper.js)
   Produces a real-CLAT style booklet: cover page with instructions,
   contents table, Section pages with Roman-numbered passages, (A)(B)(C)(D)
   options, page footers. Print window -> "Save as PDF".
   modes:  'paper'     clean booklet
           'annotated' booklet with YOUR highlights / underlines
           'full'      annotated + your answers + answer key + analytics
   ========================================================================== */
import { renderParagraph } from './annotate.js';

const L = ['A', 'B', 'C', 'D'];
const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function roman(n) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
  return s;
}

export const wordCount = (paras) => paras.join(' ').split(/\s+/).filter(Boolean).length;

export function sourceLine(q) {
  const n = wordCount(q.passageParagraphs);
  return `${q.passageSource ? `[${q.passageSource}] ` : ''}[${n} words]`;
}

const fmtDur = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}h ${m}m ${sec}s` : m ? `${m}m ${sec}s` : `${sec}s`;
};

export function buildPaperHtml({ mode, QUESTIONS, CLAT_SECTIONS, candidate, result, meta, rec, insights = [], timeRows = [], title = 'CLAT MOCK-1' }) {
  const full = mode === 'full';
  const showAnn = mode === 'annotated' || full;
  const annotations = rec?.annotations || {};

  /* ---------- Cover page ---------- */
  const cover = `
  <div class="cover">
    <div class="topline"><div class="barcode"></div><div class="qbno">QUESTION BOOKLET NO.</div></div>
    <h1 class="big">${esc(title)}</h1>
    ${full ? '<div class="sub">Solved Booklet — Answer Key &amp; Performance Analytics</div>' : ''}
    <div class="field"><span>1.&nbsp;&nbsp;<b>Name of the Candidate :</b></span><span class="line">${esc(candidate.name)}</span></div>
    <div class="field"><span>2.&nbsp;&nbsp;<b>Admit Card Number :</b></span><span class="line">${esc(candidate.mobile)}</span></div>

    <div class="itc">INSTRUCTIONS TO CANDIDATES</div>
    <div class="dur"><span><b>Duration of the Test : 2 hours (120 minutes) *</b></span><span><b>Maximum Marks : 120</b></span></div>
    <div class="cols">
      <ol>
        <li>This Question Booklet (QB) contains 120 (One hundred and twenty) Multiple Choice Questions across five sections, with space for rough work at the end.</li>
        <li>You have to answer all questions on the computer-based test interface. Each question has four options (A), (B), (C) and (D); exactly one option is the most appropriate answer.</li>
        <li>No clarification on the QB shall be sought on any matter from anyone. In case of any discrepancy such as printing error or missing pages, report it to the invigilator.</li>
      </ol>
      <ol start="4">
        <li>The QB is for the Undergraduate Programme for 120 marks. Every <b>Right Answer</b> secures 1 mark. Every <b>Wrong Answer</b> results in the deduction of 0.25 mark. There shall be no deduction for <b>Unattempted Questions</b>.</li>
        <li>You may retain the QB after the test.</li>
        <li>Electronic devices, switching tabs or leaving full-screen mode during the live attempt are recorded and may lead to automatic submission.</li>
      </ol>
    </div>
    <div class="dno">DO NOT OPEN TILL INSTRUCTED</div>
    <div class="foot">* Except for PWD Candidates who are eligible for extra time as per the law.</div>
  </div>`;

  /* ---------- Contents ---------- */
  const contents = `
  <div class="contents">
    <h2 class="ctitle">CONTENTS</h2>
    <table class="ctable">
      <tr><th>Subject</th><th>Q.Nos.</th><th>Questions</th></tr>
      ${CLAT_SECTIONS.map((s, i) => `<tr><td>Section ${roman(i + 1)} &nbsp;— ${esc(s.name)}</td><td class="c">${s.startQ} — ${s.endQ}</td><td class="c">${s.count}</td></tr>`).join('')}
    </table>
  </div>`;

  /* ---------- Sections ---------- */
  let sections = '';
  CLAT_SECTIONS.forEach((sec, si) => {
    const qs = QUESTIONS.filter((q) => q.sectionId === sec.id);
    let lastPassage = null, pNo = 0, html = `<div class="section"><div class="sech">SECTION ${roman(si + 1)}</div>`;
    qs.forEach((q) => {
      if (q.passageId !== lastPassage) {
        lastPassage = q.passageId;
        pNo++;
        const anns = showAnn ? annotations[q.passageId] || [] : [];
        html += `<div class="passage"><span class="pno">${roman(pNo)}.</span> ${q.passageParagraphs
          .map((para, pi) => `<p>${renderParagraph(para, anns.filter((a) => a.p === pi))}</p>`).join('')}
          <div class="src">${esc(sourceLine(q))}</div></div>`;
      }
      const pq = result?.perQuestion?.[q.id - 1];
      const short = q.options.every((o) => o.length < 42);
      html += `<div class="q"><div class="qt"><span class="qn">${q.id}.</span> ${esc(q.questionText)}</div>
        <div class="opts ${short ? 'two' : ''}">${q.options.map((o, oi) => {
          let cls = '', mark = '';
          if (full && oi === q.correctOption) { cls = 'ok'; mark = ' ✓'; }
          else if (full && pq?.selected === oi) { cls = 'bad'; mark = ' ✗'; }
          return `<div class="opt ${cls}">(${L[oi]}) ${esc(o)}${mark}</div>`;
        }).join('')}</div>`;
      if (full && pq) {
        html += `<div class="ans">Your answer: <b>${pq.selected === null ? 'Not attempted' : L[pq.selected]}</b> &nbsp;|&nbsp; Correct: <b>${L[q.correctOption]}</b> &nbsp;|&nbsp; Marks: <b>${pq.marks > 0 ? '+1' : pq.marks < 0 ? '−0.25' : '0'}</b> &nbsp;|&nbsp; Time: ${Math.round(rec?.qTime?.[q.id - 1] || 0)}s</div>`;
      }
      html += '</div>';
    });
    sections += html + '</div>';
  });

  /* ---------- Rough work ---------- */
  const rough = `<div class="section"><div class="sech">SPACE FOR ROUGH WORK</div><div class="rough"></div></div>
                 <div class="section"><div class="sech">SPACE FOR ROUGH WORK</div><div class="rough"></div></div>`;

  /* ---------- Analytics ---------- */
  let analytics = '';
  if (full && result) {
    analytics = `
    <div class="section">
      <div class="sech">RESULT &amp; ANALYTICS</div>
      <table class="tbl"><tr><th>Score</th><th>Correct</th><th>Wrong</th><th>Unattempted</th><th>Accuracy</th><th>Time Taken</th></tr>
        <tr><td><b>${result.finalScore.toFixed(2)} / 120</b></td><td>${result.totalCorrect}</td><td>${result.totalWrong}</td><td>${result.totalUnattempted}</td><td>${result.accuracy}%</td><td>${fmtDur(meta?.timeTakenSeconds)}</td></tr></table>
      <h3>Section-wise Performance</h3>
      <table class="tbl"><tr><th>Section</th><th>Total</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Score</th></tr>
        ${result.sectionScores.map((s) => `<tr><td>${esc(s.name)}</td><td>${s.total}</td><td>${s.attempted}</td><td>${s.correct}</td><td>${s.wrong}</td><td>${s.accuracy}%</td><td>${s.score.toFixed(2)}</td></tr>`).join('')}</table>
      ${timeRows.length ? `<h3>Time Management</h3><table class="tbl"><tr><th>Section</th><th>Time Spent (min)</th><th>Avg per Question (s)</th></tr>${timeRows.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.mins}</td><td>${t.avg}</td></tr>`).join('')}</table>` : ''}
      <h3>Insights</h3><ul>${insights.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      <h3>Answer Key</h3>
      <div class="key">${result.perQuestion.map((x) => `<span class="${x.status}">${x.id}: ${L[x.correct]}${x.selected !== null ? ` (you ${L[x.selected]})` : ' (skipped)'}</span>`).join('')}</div>
    </div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} — ${full ? 'Solved Booklet' : mode === 'annotated' ? 'Annotated Booklet' : 'Question Booklet'}</title>
<style>
@page { size: A4; margin: 18mm 17mm 20mm;
  @bottom-left { content: "${esc(title)}"; font: 9pt 'Times New Roman', serif; }
  @bottom-right { content: counter(page); font: 9pt 'Times New Roman', serif; } }
*{box-sizing:border-box}
body{font-family:'Times New Roman',Times,serif;color:#000;font-size:11pt;line-height:1.5;margin:0;padding:18px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.noprint{position:sticky;top:0;background:#fff7d6;border:1px solid #e5c76b;padding:8px 12px;margin-bottom:14px;font:13px Arial,sans-serif;display:flex;gap:12px;align-items:center}
.noprint button{padding:6px 14px;font-size:13px;cursor:pointer}
.cover{page-break-after:always}
.topline{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:26px}
.barcode{width:56px;height:56px;background:repeating-linear-gradient(90deg,#000 0 3px,#fff 3px 6px,#000 6px 8px,#fff 8px 12px);border:1px solid #000}
.qbno{border:1px solid #000;padding:12px 18px;font:bold 9pt Arial,sans-serif;width:210px;height:44px}
.big{text-align:center;font-size:30pt;margin:6px 0 4px;letter-spacing:1px}
.sub{text-align:center;font-size:11pt;margin-bottom:12px;font-style:italic}
.field{display:flex;gap:10px;margin:14px 0;font-size:11pt}
.field .line{flex:1;border-bottom:1px solid #000;padding-left:8px}
.itc{margin-top:26px;text-align:center;font-weight:bold;font-size:13pt;border-top:1.5px solid #000;border-bottom:1.5px solid #000;padding:6px 0}
.dur{display:flex;justify-content:space-between;font-size:10.5pt;margin:8px 0 10px}
.cols{columns:2;column-gap:26px;column-rule:1px solid #000;text-align:justify;font-size:10pt;line-height:1.45;padding:6px 0}
.cols ol{margin:0;padding-left:18px}.cols li{margin-bottom:8px}
.dno{margin:26px 0 8px;border:2.5px solid #000;text-align:center;font:bold 24pt Arial,sans-serif;padding:12px 6px}
.foot{border:1px solid #000;padding:4px 10px;font:italic 9pt Arial,sans-serif}
.contents{page-break-after:always;padding-top:60px}
.ctitle{text-align:center;font-size:20pt;letter-spacing:1px}
.ctable{width:92%;margin:30px auto;border-collapse:collapse;font-size:11pt}
.ctable th,.ctable td{border:1px solid #000;padding:10px 14px}.ctable th{text-align:center}.ctable td.c{text-align:center;white-space:nowrap}
.section{page-break-before:always}
.sech{text-align:center;font-weight:bold;font-size:13pt;margin:4px 0 14px;letter-spacing:.5px}
.passage{text-align:justify;margin:10px 0 14px;font-size:10.5pt}.passage p{margin:0 0 6px}
.pno{font-weight:bold}.src{font-style:italic;font-size:9.5pt;margin-top:4px}
.q{margin:12px 0;page-break-inside:avoid;font-size:10.5pt}.qn{font-weight:bold}
.opts{margin:3px 0 0 22px}.opts.two{display:grid;grid-template-columns:1fr 1fr;column-gap:20px}.opt{margin:1px 0}
.ok{font-weight:bold;color:#047857}.bad{font-weight:bold;color:#b91c1c}
.ans{margin:4px 0 0 22px;font:9pt Arial,sans-serif;color:#444}
.rough{height:230mm;border:1px dashed #aaa}
.tbl{width:100%;border-collapse:collapse;margin:6px 0 14px;font:10pt Arial,sans-serif}.tbl th,.tbl td{border:1px solid #888;padding:5px 8px;text-align:left}.tbl th{background:#eef2f7}
h3{font:bold 12pt Arial,sans-serif;margin:14px 0 4px}
.key{display:flex;flex-wrap:wrap;gap:5px;font:9pt Arial,sans-serif}.key span{border:1px solid #bbb;padding:2px 6px;border-radius:3px}
.key .correct{background:#d1fae5}.key .wrong{background:#fee2e2}.key .unattempted{background:#f1f5f9}
@media print{.noprint{display:none}body{padding:0}}
</style></head><body>
<div class="noprint"><button onclick="window.print()">🖨 Print / Save as PDF</button>
<span>In the print dialog choose <b>Save as PDF</b> and tick <b>Background graphics</b> so highlights appear.</span></div>
${cover}${contents}${sections}${rough}${analytics}
</body></html>`;
}