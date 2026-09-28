// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-marksheet-template',
//   standalone: true,
//   imports: [],
//   templateUrl: './marksheet-template.component.html',
//   styleUrl: './marksheet-template.component.scss'
// })
// export class MarksheetTemplateComponent {

// }
// export function buildMarksheetHtml(marksheets: any[], profile: any): string {
//   const p = profile;
//   const logoHtml = p?.logoUrl
//     ? `<img src="${p.logoUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;">`
//     : `<div style="width:70px;height:70px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(p?.name || 'S').charAt(0).toUpperCase()}</div>`;

//   const sheets = marksheets.map(ms => {
//     const totalObtained = ms.totalObtained
//       ?? (ms.marks || []).reduce((s: number, m: any) => s + (m.theory ?? 0) + (m.practical ?? 0), 0);
//     const totalMax = ms.totalMax
//       ?? (ms.marks || []).reduce((s: number, m: any) => s + (m.fullMarks ?? 0), 0);
//     const isFail = ms.grade === 'NG' || ms.grade === 'F';

//     const rows = (ms.marks || []).map((m: any) => `
//       <tr class="${m.pass ? '' : 'fail-row'}">
//         <td class="tl">${m.subjectName}</td>
//         <td>${m.theoryMax ?? '-'}</td>
//         <td>${m.practicalMax ?? '-'}</td>
//         <td>${m.fullMarks}</td>
//         <td>${m.passMarks ?? '-'}</td>
//         <td>${m.theory ?? 0}</td>
//         <td>${m.practical ?? 0}</td>
//         <td><strong>${m.obtained ?? ((m.theory ?? 0) + (m.practical ?? 0))}</strong></td>
//         <td>${m.grade ?? '-'}</td>
//         <td>${m.gradePoint ?? '-'}</td>
//         <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
//       </tr>`).join('');

//     return `
//     <div class="marksheet">
//       <div class="ms-header">
//         <div class="ms-logo">${logoHtml}</div>
//         <div class="ms-college">
//           <h1>${p?.name || 'School Management System'}</h1>
//           <p>${p?.address || ''}</p>
//           <p>${[p?.email, p?.phone].filter(Boolean).join(' | ')}</p>
//           <h2 class="exam-title">${ms.examination?.name ?? ''} &mdash; ${ms.examination?.year ?? ''}</h2>
//         </div>
//       </div>
//       <div class="divider"></div>
//       <table class="info-table">
//         <tr>
//           <td class="label">Student Name</td><td>${ms.student?.name ?? ''}</td>
//           <td class="label">Program</td><td>${ms.program?.name ?? ''}</td>
//         </tr>
//         <tr>
//           <td class="label">Address</td><td>${ms.student?.address ?? '-'}</td>
//           <td class="label">Guardian</td><td>${ms.student?.guardianName ?? '-'}</td>
//         </tr>
//       </table>
//       <table class="marks-table">
//         <thead>
//           <tr>
//             <th class="tl">Subject</th><th>T.Max</th><th>P.Max</th>
//             <th>Full</th><th>Pass</th><th>Theory</th><th>Practical</th>
//             <th>Total</th><th>Grade</th><th>GP</th><th>Status</th>
//           </tr>
//         </thead>
//         <tbody>${rows}</tbody>
//         <tfoot>
//           <tr>
//             <td colspan="7" class="tr"><strong>Grand Total</strong></td>
//             <td><strong>${totalObtained} / ${totalMax}</strong></td>
//             <td><strong>${ms.gpa ?? ms.grade ?? '-'}</strong></td>
//             <td colspan="2"></td>
//           </tr>
//         </tfoot>
//       </table>
//       <div class="summary">
//         <div class="sum-item"><span class="sum-label">Percentage</span><span class="sum-val">${Number(ms.percentage ?? 0).toFixed(2)}%</span></div>
//         <div class="sum-item"><span class="sum-label">Final Grade</span><span class="sum-val">${ms.grade ?? '-'}</span></div>
//         <div class="sum-item"><span class="sum-label">Rank</span><span class="sum-val">${ms.rank ?? '-'}</span></div>
//         <div class="badge ${isFail ? 'fail' : 'pass'}">${isFail ? 'FAIL' : 'PASS'}</div>
//       </div>
//       <div class="sigs">
//         <div class="sig"><div class="sig-line"></div><p>Class Teacher</p></div>
//         <div class="sig"><div class="sig-line"></div><p>Exam Controller</p></div>
//         <div class="sig"><div class="sig-line"></div><p>Principal</p></div>
//         <div class="sig"><div class="sig-line"></div><p>Date: ___________</p></div>
//       </div>
//     </div>`;
//   }).join('<div class="page-break"></div>');

//   return `<!DOCTYPE html>
// <html lang="en"><head>
// <meta charset="UTF-8"><title>Marksheet</title>
// <style>
//   *{box-sizing:border-box;margin:0;padding:0}
//   body{font-family:Arial,sans-serif;font-size:12px;color:#222}
//   .marksheet{padding:28px 36px;max-width:950px;margin:0 auto}
//   .ms-header{display:flex;align-items:center;gap:20px;margin-bottom:10px}
//   .ms-college h1{font-size:20px;color:#1a237e;margin-bottom:3px}
//   .ms-college h2.exam-title{font-size:14px;color:#1e88e5;margin-top:6px}
//   .ms-college p{font-size:12px;color:#555;margin-bottom:2px}
//   .divider{border-bottom:2px solid #1e88e5;margin:10px 0 12px}
//   .info-table{width:100%;border-collapse:collapse;margin-bottom:14px}
//   .info-table td{padding:4px 10px;font-size:12px}
//   .info-table .label{font-weight:bold;color:#444;width:110px}
//   .marks-table{width:100%;border-collapse:collapse;margin-bottom:14px}
//   .marks-table thead tr{background:#1a237e;color:#fff}
//   .marks-table th{padding:7px 8px;text-align:center;font-size:11px}
//   .marks-table td{padding:6px 8px;text-align:center;border-bottom:1px solid #e0e6f0}
//   .marks-table tbody tr:nth-child(even){background:#f8f9ff}
//   .marks-table tfoot td{background:#e8eaf6;font-weight:bold;padding:7px 8px}
//   .fail-row{background:#fff3f3!important}
//   .pass{color:#2e7d32;font-weight:bold}.fail{color:#c62828;font-weight:bold}
//   .tl{text-align:left!important;padding-left:10px!important}
//   .tr{text-align:right!important}
//   .summary{display:flex;align-items:center;gap:24px;margin:14px 0;flex-wrap:wrap}
//   .sum-item{display:flex;flex-direction:column;gap:2px}
//   .sum-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px}
//   .sum-val{font-size:16px;font-weight:bold;color:#1a237e}
//   .badge{padding:6px 20px;border-radius:6px;font-weight:bold;font-size:16px;margin-left:auto}
//   .badge.pass{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7}
//   .badge.fail{background:#ffebee;color:#c62828;border:1px solid #ef9a9a}
//   .sigs{display:flex;justify-content:space-between;margin-top:50px}
//   .sig{text-align:center}.sig-line{width:120px;border-top:1px solid #333;margin:0 auto 6px}
//   .sig p{font-size:11px;color:#555}
//   .page-break{page-break-after:always}
//   @media print{body{margin:0}.page-break{page-break-after:always}}
// </style>
// </head><body>
// ${sheets}
// <script>window.onload=function(){window.print();}<\/script>
// </body></html>`;
// }



import { Component } from '@angular/core';

@Component({
  selector: 'app-marksheet-template',
  standalone: true,
  imports: [],
  templateUrl: './marksheet-template.component.html',
  styleUrl: './marksheet-template.component.scss'
})
export class MarksheetTemplateComponent {

}

export function buildMarksheetHtml(marksheets: any[], profile: any): string {
  const p = profile;
  const LOGO = 110; // logo size in px

  const logoHtml = p?.logoUrl
    ? `<img src="${p.logoUrl}" style="width:${LOGO}px;height:${LOGO}px;border-radius:50%;object-fit:cover;">`
    : `<div style="width:${LOGO}px;height:${LOGO}px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:44px;font-weight:bold;">${(p?.name || 'S').charAt(0).toUpperCase()}</div>`;

  const sheets = marksheets.map(ms => {
    const marks: any[] = ms.marks || [];
    const totalObtained = ms.totalObtained
      ?? marks.reduce((s: number, m: any) => s + (m.theory ?? 0) + (m.practical ?? 0), 0);
    const totalMax = ms.totalMax
      ?? marks.reduce((s: number, m: any) => s + (m.fullMarks ?? 0), 0);
    const isFail = ms.grade === 'NG' || ms.grade === 'F';

    // Row height adapts to subject count so 4 subjects or 9 subjects
    // both fill the A4 page nicely.
    const n = marks.length;
    const rowPad = n <= 5 ? 18 : n <= 7 ? 13 : n <= 9 ? 9 : 6;

    const rows = marks.map((m: any) => `
      <tr class="${m.pass ? '' : 'fail-row'}" style="height:auto">
        <td class="tl subj" style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.subjectName}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.theoryMax ?? '-'}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.practicalMax ?? '-'}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.fullMarks}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.passMarks ?? '-'}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.theory ?? 0}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.practical ?? 0}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px"><strong>${m.obtained ?? ((m.theory ?? 0) + (m.practical ?? 0))}</strong></td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.grade ?? '-'}</td>
        <td style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.gradePoint ?? '-'}</td>
        <td class="${m.pass ? 'pass' : 'fail'}" style="padding-top:${rowPad}px;padding-bottom:${rowPad}px">${m.pass ? 'PASS' : 'FAIL'}</td>
      </tr>`).join('');

    return `
    <div class="marksheet">

      <div class="ms-header">
        <div class="ms-logo">${logoHtml}</div>
        <div class="ms-college">
          <h1>${p?.name || 'School Management System'}</h1>
          <p class="addr">${p?.address || ''}</p>
          <p class="contact">${[p?.email, p?.phone].filter(Boolean).join(' | ')}</p>
          <h2 class="exam-title">${ms.examination?.name ?? ''} &mdash; ${ms.examination?.year ?? ''}</h2>
        </div>
        <div class="ms-logo-spacer"></div>
      </div>

      <div class="divider"></div>

      <table class="info-table">
        <tr>
          <td class="label">Student Name</td><td class="val">${ms.student?.name ?? ''}</td>
          <td class="gap"></td>
          <td class="label">Program</td><td class="val">${ms.program?.name ?? ''}</td>
        </tr>
        <tr>
          <td class="label">Address</td><td class="val">${ms.student?.address ?? '-'}</td>
          <td class="gap"></td>
          <td class="label">Guardian</td><td class="val">${ms.student?.guardianName ?? '-'}</td>
        </tr>
      </table>

      <table class="marks-table">
        <thead>
          <tr>
            <th class="tl">Subject</th><th>T.Max</th><th>P.Max</th>
            <th>Full</th><th>Pass</th><th>Theory</th><th>Practical</th>
            <th>Total</th><th>Grade</th><th>GP</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="tr">Grand Total</td>
            <td colspan="2" class="ft">Obtained: ${totalObtained}</td>
            <td colspan="2" class="ft">Full Marks: ${totalMax}</td>
            <td colspan="2" class="ft">Grade: ${ms.grade ?? ms.gpa ?? '-'}</td>
          </tr>
        </tfoot>
      </table>

      <div class="summary">
        <div class="sum-item"><span class="sum-label">Percentage</span><span class="sum-val">${Number(ms.percentage ?? 0).toFixed(2)}%</span></div>
        <div class="sum-item"><span class="sum-label">Final Grade</span><span class="sum-val">${ms.grade ?? '-'}</span></div>
        <div class="sum-item"><span class="sum-label">Rank</span><span class="sum-val">${ms.rank ?? '-'}</span></div>
        <div class="badge ${isFail ? 'fail' : 'pass'}">${isFail ? 'FAIL' : 'PASS'}</div>
      </div>

      <div class="sigs">
        <div class="sig"><div class="sig-line"></div><p>Class Teacher</p></div>
        <div class="sig"><div class="sig-line"></div><p>Exam Controller</p></div>
        <div class="sig"><div class="sig-line"></div><p>Principal</p></div>
        <div class="sig"><div class="sig-line"></div><p>Date: ___________</p></div>
      </div>

    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><title>Marksheet</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing:border-box; margin:0; padding:0;
      -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #000; }

  /* Each marksheet fills one full A4 page (277mm printable height).
     272mm leaves a small safety margin so it never spills onto a blank page. */
  .marksheet {
    display: flex;
    flex-direction: column;
    height: 272mm;
    padding: 6mm 8mm;
    page-break-after: always;
    break-after: page;
  }
  .sheets > .marksheet:last-child { page-break-after: auto; break-after: auto; }

  /* Header: logo left, name/address truly centered */
  .ms-header { display: flex; align-items: center; margin-bottom: 8px; }
  .ms-logo, .ms-logo-spacer { width: ${LOGO}px; flex-shrink: 0; }
  .ms-college { flex: 1; text-align: center; padding: 0 12px; }
  .ms-college h1 { font-size: 30px; color: #000; margin-bottom: 6px; letter-spacing: .5px; }
  .ms-college p.addr { font-size: 16px; color: #000; margin-bottom: 3px; }
  .ms-college p.contact { font-size: 15px; color: #000; margin-bottom: 3px; }
  .ms-college h2.exam-title { font-size: 19px; color: #000; margin-top: 8px; }
  .divider { border-bottom: 2px solid #000; margin: 12px 0 18px; }

  /* Student info: more breathing room between the two column pairs */
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
  .info-table td { padding: 8px 10px; font-size: 14px; color: #000; }
  .info-table .label { font-weight: bold; width: 130px; }
  .info-table .gap { width: 50px; }

  /* Marks table: all text black */
  .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  .marks-table thead tr { background: #e6e6e6; }
  .marks-table th {
    padding: 10px 8px; text-align: center; font-size: 13px; color: #000;
    border-top: 2px solid #000; border-bottom: 2px solid #000;
  }
  .marks-table td {
    padding: 8px; text-align: center; font-size: 14px; color: #000;
    border-bottom: 1px solid #999;
  }
  .marks-table td.subj { font-size: 15px; font-weight: 600; }
  .marks-table tfoot td {
    background: #e6e6e6; font-weight: bold; font-size: 14px; color: #000;
    padding: 10px 8px; border-top: 2px solid #000; border-bottom: 2px solid #000;
    white-space: nowrap;
  }
  .marks-table tfoot td.ft { text-align: center; }
  .fail-row { background: #fff3f3 !important; }
  .pass { color: #2e7d32; font-weight: bold; }
  .fail { color: #c62828; font-weight: bold; }
  .tl { text-align: left !important; padding-left: 10px !important; }
  .tr { text-align: right !important; padding-right: 14px !important; }

  /* Summary */
  .summary { display: flex; align-items: center; gap: 30px; margin: 10px 0; flex-wrap: wrap; }
  .sum-item { display: flex; flex-direction: column; gap: 3px; }
  .sum-label { font-size: 11px; color: #000; text-transform: uppercase; letter-spacing: .5px; }
  .sum-val { font-size: 19px; font-weight: bold; color: #000; }
  .badge { padding: 7px 26px; border-radius: 6px; font-weight: bold; font-size: 18px; margin-left: auto; }
  .badge.pass { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
  .badge.fail { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

  /* Signatures pinned to the bottom of the page */
  .sigs { display: flex; justify-content: space-between; margin-top: auto; padding-top: 30px; }
  .sig { text-align: center; }
  .sig-line { width: 130px; border-top: 1px solid #000; margin: 0 auto 6px; }
  .sig p { font-size: 12px; color: #000; }

  @media print { body { margin: 0; } }
</style>
</head><body>
<div class="sheets">
${sheets}
</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;
}