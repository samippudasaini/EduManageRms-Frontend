import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { adToNepaliMonth } from './nepali-date.component';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './attendance-summary.component.html',
  styleUrl: './attendance-summary.component.scss'
})
export class AttendanceSummaryComponent implements OnInit {
  gsId!: number;
  year!: number;
  data: any = null;
  loading = false;
  gradeName = '';
  sectionName = '';

  years = [2082, 2083, 2084]; // BS years
  selectedBsYear = 2083;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.gsId = +this.route.snapshot.params['gsId'];
    const adYear = new Date().getFullYear();
    this.year    = adYear;
    this.selectedBsYear = adToNepaliMonth(adYear, 7).bsYear; // approximate current BS year
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<any>(`attendance/summary/${this.gsId}?year=${this.year}`).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; this.snack.open('Could not load summary', '', { duration: 2000 }); }
    });
    this.api.get<any[]>('attendance/sections').subscribe({
      next: sections => {
        const s = sections.find((s: any) => s.id === this.gsId);
        if (s) { this.gradeName = s.gradeName; this.sectionName = s.sectionName; }
      }
    });
  }

  getMonthData(student: any, month: number): any {
    return student.months?.[month] || { present: 0, absent: 0, total: 0, pct: 0 };
  }

  monthLabel(month: number): string {
    const np = adToNepaliMonth(this.year, month);
    return `${np.label.split(' ')[0]}\n(${new Date(this.year, month - 1, 1).toLocaleString('default', { month: 'short' })})`;
  }

  nepaliMonth(month: number): string {
    return adToNepaliMonth(this.year, month).label.split(' ')[0];
  }

  englishMonth(month: number): string {
    return new Date(this.year, month - 1, 1).toLocaleString('default', { month: 'short' });
  }

  pctClass(pct: number): string {
    if (!pct) return '';
    if (pct >= 90) return 'pct-high';
    if (pct >= 75) return 'pct-mid';
    return 'pct-low';
  }

  printAll() { this.openPrint(this.data?.students || []); }

  printStudent(s: any) { this.openPrint([s]); }

  private openPrint(students: any[]) {
    const months: number[] = this.data?.months || [];
    const title = `Grade ${this.gradeName} — Section ${this.sectionName} | Annual Summary ${this.year}`;

    const rows = students.map(s => {
      const monthCells = months.map(m => {
        const md = this.getMonthData(s, m);
        const pColor = md.pct >= 90 ? '#2e7d32' : md.pct >= 75 ? '#e65100' : md.total > 0 ? '#c62828' : '#999';
        return `<td style="text-align:center;border:1px solid #e0e0e0;padding:5px;">
          <div style="font-weight:700;color:#2e7d32;font-size:12px;">${md.present}</div>
          <div style="font-weight:700;color:#c62828;font-size:12px;">${md.absent}</div>
          <div style="color:#666;font-size:11px;">${md.total}</div>
          <div style="font-weight:700;color:${pColor};font-size:11px;">${md.pct ? md.pct + '%' : '—'}</div>
        </td>`;
      }).join('');

      const cumColor = s.cumPct >= 90 ? '#2e7d32' : s.cumPct >= 75 ? '#e65100' : '#c62828';
      return `<tr>
        <td style="font-weight:600;padding:6px 10px;border:1px solid #e0e0e0;white-space:nowrap;">${s.studentName}</td>
        ${monthCells}
        <td style="text-align:center;border:1px solid #e0e0e0;padding:5px;background:#f0f4ff;">
          <div style="font-weight:700;color:#2e7d32;">${s.totalPresent}</div>
          <div style="font-weight:700;color:#c62828;">${s.totalAbsent}</div>
          <div style="color:#666;">${s.grandTotal}</div>
          <div style="font-weight:700;color:${cumColor};font-size:13px;">${s.cumPct}%</div>
        </td>
      </tr>`;
    }).join('');

    const headerCells = months.map(m =>
      `<th style="background:#1a237e;color:#fff;padding:6px 4px;text-align:center;border:1px solid #283593;font-size:11px;">
        ${this.nepaliMonth(m)}<br><small style="color:#90caf9;">(${this.englishMonth(m)})</small>
      </th>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Attendance Summary</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px;}@media print{body{margin:0}}</style>
    </head><body>
      <h2 style="color:#1a237e;margin-bottom:4px;">Monthly Attendance Summary</h2>
      <p style="margin-bottom:16px;">${title}</p>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th style="background:#1a237e;color:#fff;padding:8px 10px;text-align:left;border:1px solid #283593;">Student Name</th>
            ${headerCells}
            <th style="background:#0d47a1;color:#fff;padding:6px 4px;text-align:center;border:1px solid #283593;font-size:11px;">
              Annual Total<br><small style="color:#90caf9;font-weight:normal;">P / A / Days / %</small>
            </th>
          </tr>
          <tr style="background:#e8eaf6;">
            <td style="padding:3px 10px;font-size:10px;color:#555;border:1px solid #e0e0e0;">Legend: P=Present A=Absent Total Days %</td>
            ${months.map(() => '<td style="border:1px solid #e0e0e0;"></td>').join('')}
            <td style="border:1px solid #e0e0e0;"></td>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:40px;display:flex;justify-content:space-between;">
        <div style="text-align:center;"><div style="border-top:1px solid #333;width:120px;margin:0 auto 4px;"></div><small>Class Teacher</small></div>
        <div style="text-align:center;"><div style="border-top:1px solid #333;width:120px;margin:0 auto 4px;"></div><small>Principal</small></div>
      </div>
      <script>window.onload=()=>window.print();<\/script>
    </body></html>`;

    const w = window.open('', '_blank');
    if (!w) { this.snack.open('Allow popups to print', '', { duration: 3000 }); return; }
    w.document.write(html);
    w.document.close();
  }
}