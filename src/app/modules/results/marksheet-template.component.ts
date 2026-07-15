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
  const logoHtml = p?.logoUrl
    ? `<img src="${p.logoUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;">`
    : `<div style="width:70px;height:70px;border-radius:50%;background:#1e88e5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold;">${(p?.name || 'S').charAt(0).toUpperCase()}</div>`;

  const sheets = marksheets.map(ms => {
    const totalObtained = ms.totalObtained
      ?? (ms.marks || []).reduce((s: number, m: any) => s + (m.theory ?? 0) + (m.practical ?? 0), 0);
    const totalMax = ms.totalMax
      ?? (ms.marks || []).reduce((s: number, m: any) => s + (m.fullMarks ?? 0), 0);
    const isFail = ms.grade === 'NG' || ms.grade === 'F';

    const rows = (ms.marks || []).map((m: any) => `
      <tr class="${m.pass ? '' : 'fail-row'}">
        <td class="tl">${m.subjectName}</td>
        <td>${m.theoryMax ?? '-'}</td>
        <td>${m.practicalMax ?? '-'}</td>
        <td>${m.fullMarks}</td>
        <td>${m.passMarks ?? '-'}</td>
        <td>${m.theory ?? 0}</td>
        <td>${m.practical ?? 0}</td>
        <td><strong>${m.obtained ?? ((m.theory ?? 0) + (m.practical ?? 0))}</strong></td>
        <td>${m.grade ?? '-'}</td>
        <td>${m.gradePoint ?? '-'}</td>
        <td class="${m.pass ? 'pass' : 'fail'}">${m.pass ? 'PASS' : 'FAIL'}</td>
      </tr>`).join('');

    return `
    <div class="marksheet">
      <div class="ms-header">
        <div class="ms-logo">${logoHtml}</div>
        <div class="ms-college">
          <h1>${p?.name || 'School Management System'}</h1>
          <p>${p?.address || ''}</p>
          <p>${[p?.email, p?.phone].filter(Boolean).join(' | ')}</p>
          <h2 class="exam-title">${ms.examination?.name ?? ''} &mdash; ${ms.examination?.year ?? ''}</h2>
        </div>
      </div>
      <div class="divider"></div>
      <table class="info-table">
        <tr>
          <td class="label">Student Name</td><td>${ms.student?.name ?? ''}</td>
          <td class="label">Program</td><td>${ms.program?.name ?? ''}</td>
        </tr>
        <tr>
          <td class="label">Address</td><td>${ms.student?.address ?? '-'}</td>
          <td class="label">Guardian</td><td>${ms.student?.guardianName ?? '-'}</td>
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
            <td colspan="7" class="tr"><strong>Grand Total</strong></td>
            <td><strong>${totalObtained} / ${totalMax}</strong></td>
            <td><strong>${ms.gpa ?? ms.grade ?? '-'}</strong></td>
            <td colspan="2"></td>
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
  }).join('<div class="page-break"></div>');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><title>Marksheet</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#222}
  .marksheet{padding:28px 36px;max-width:950px;margin:0 auto}
  .ms-header{display:flex;align-items:center;gap:20px;margin-bottom:10px}
  .ms-college h1{font-size:20px;color:#1a237e;margin-bottom:3px}
  .ms-college h2.exam-title{font-size:14px;color:#1e88e5;margin-top:6px}
  .ms-college p{font-size:12px;color:#555;margin-bottom:2px}
  .divider{border-bottom:2px solid #1e88e5;margin:10px 0 12px}
  .info-table{width:100%;border-collapse:collapse;margin-bottom:14px}
  .info-table td{padding:4px 10px;font-size:12px}
  .info-table .label{font-weight:bold;color:#444;width:110px}
  .marks-table{width:100%;border-collapse:collapse;margin-bottom:14px}
  .marks-table thead tr{background:#1a237e;color:#fff}
  .marks-table th{padding:7px 8px;text-align:center;font-size:11px}
  .marks-table td{padding:6px 8px;text-align:center;border-bottom:1px solid #e0e6f0}
  .marks-table tbody tr:nth-child(even){background:#f8f9ff}
  .marks-table tfoot td{background:#e8eaf6;font-weight:bold;padding:7px 8px}
  .fail-row{background:#fff3f3!important}
  .pass{color:#2e7d32;font-weight:bold}.fail{color:#c62828;font-weight:bold}
  .tl{text-align:left!important;padding-left:10px!important}
  .tr{text-align:right!important}
  .summary{display:flex;align-items:center;gap:24px;margin:14px 0;flex-wrap:wrap}
  .sum-item{display:flex;flex-direction:column;gap:2px}
  .sum-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px}
  .sum-val{font-size:16px;font-weight:bold;color:#1a237e}
  .badge{padding:6px 20px;border-radius:6px;font-weight:bold;font-size:16px;margin-left:auto}
  .badge.pass{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7}
  .badge.fail{background:#ffebee;color:#c62828;border:1px solid #ef9a9a}
  .sigs{display:flex;justify-content:space-between;margin-top:50px}
  .sig{text-align:center}.sig-line{width:120px;border-top:1px solid #333;margin:0 auto 6px}
  .sig p{font-size:11px;color:#555}
  .page-break{page-break-after:always}
  @media print{body{margin:0}.page-break{page-break-after:always}}
</style>
</head><body>
${sheets}
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;
}