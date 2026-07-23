import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { 
  toNepali,
  adToNepaliMonth,
  getDaysInBSMonth,      // ✅ Now exported
  bsToAD,                // ✅ Now exported
  getADDayFromBS,        // ✅ Now exported
  getCurrentBSDate,      // ✅ Now exported
  NepaliDate
} from './nepali-date.component';

@Component({
  selector: 'app-attendance-monthly',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatTooltipModule],
  templateUrl: './attendance-monthly.component.html',
  styleUrl: './attendance-monthly.component.scss'
})
export class AttendanceMonthlyComponent implements OnInit {
  gsId!: number;
  year!: number;
  month!: number;
  bsYear!: number;
  bsMonth!: number;
  bsMonthName!: string;
  bsDaysInMonth!: number;
  data: any = null;
  loading = false;
  savingKey: string | null = null;

  // Cycle: null → P → A → L → null
  private readonly CYCLE: { [k: string]: string | null } = {
    '':  'P',
    'P': 'A',
    'A': 'L',
    'L': null
  };

  get days(): number[] {
    if (this.bsYear && this.bsMonth) {
      const days = getDaysInBSMonth(this.bsYear, this.bsMonth);
      return Array.from({ length: days }, (_, i) => i + 1);
    }
    return Array.from({ length: 30 }, (_, i) => i + 1);
  }

  get nepaliMonthLabel(): string {
    if (this.bsYear && this.bsMonth) {
      return `${this.bsMonthName} ${this.bsYear} BS`;
    }
    
    if (this.data) {
      const bsInfo = adToNepaliMonth(this.year, this.month);
      this.bsYear = bsInfo.bsYear;
      this.bsMonth = bsInfo.bsMonth;
      this.bsMonthName = bsInfo.bsMonthName;
      this.bsDaysInMonth = getDaysInBSMonth(this.bsYear, this.bsMonth);
      return `${bsInfo.bsMonthName} ${bsInfo.bsYear} BS`;
    }
    
    return 'Loading...';
  }

  get englishMonthLabel(): string {
    return this.data?.monthName || '';
  }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.gsId = +this.route.snapshot.params['gsId'];
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1;
    
    const bsInfo = adToNepaliMonth(this.year, this.month);
    this.bsYear = bsInfo.bsYear;
    this.bsMonth = bsInfo.bsMonth;
    this.bsMonthName = bsInfo.bsMonthName;
    this.bsDaysInMonth = getDaysInBSMonth(this.bsYear, this.bsMonth);
    
    this.load();
  }

  load() {
    this.loading = true;
    this.data = null;
    
    this.api.get<any>(`attendance/monthly/${this.gsId}?year=${this.year}&month=${this.month}`)
      .subscribe({
        next: d => { 
          this.data = d;
          this.loading = false;
          
          const bsInfo = adToNepaliMonth(this.year, this.month);
          this.bsYear = bsInfo.bsYear;
          this.bsMonth = bsInfo.bsMonth;
          this.bsMonthName = bsInfo.bsMonthName;
          this.bsDaysInMonth = getDaysInBSMonth(this.bsYear, this.bsMonth);
        },
        error: () => { 
          this.loading = false; 
          this.snack.open('Could not load data', '', { duration: 2000 }); 
        }
      });
  }

  prevMonth() {
    if (this.month === 1) { this.month = 12; this.year--; } 
    else { this.month--; }
    this.load();
  }

  nextMonth() {
    if (this.month === 12) { this.month = 1; this.year++; } 
    else { this.month++; }
    this.load();
  }

  getStatus(student: any, day: number): string {
    return student.days?.[day] || '';
  }

  getBSDay(bsDayNumber: number): string {
    return this.toNepaliDigits(bsDayNumber);
  }

  getADDay(bsDayNumber: number): string {
    try {
      const adDate = bsToAD(this.bsYear, this.bsMonth, bsDayNumber);
      return String(adDate.getDate());
    } catch {
      return String(bsDayNumber);
    }
  }

  toNepaliDigits(n: number): string {
    const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(n).split('').map(d => digits[parseInt(d, 10)] ?? d).join('');
  }

  getADDateString(bsDay: number): string {
    const adDate = bsToAD(this.bsYear, this.bsMonth, bsDay);
    const y = adDate.getFullYear();
    const m = String(adDate.getMonth() + 1).padStart(2, '0');
    const d = String(adDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  cycleStatus(student: any, day: number) {
    const current = this.getStatus(student, day);
    const next = this.CYCLE[current] ?? null;
    const key = `${student.studentId}-${day}`;
    const dateStr = this.getADDateString(day);

    if (!student.days) student.days = {};
    if (next === null) delete student.days[day];
    else student.days[day] = next;

    this.recalcStudent(student);
    this.recalcDaily(day);
    this.savingKey = key;

    this.api.patch('attendance/mark', {
      studentId: student.studentId,
      date: dateStr,
      status: next || ''
    }).subscribe({
      next: () => { this.savingKey = null; },
      error: () => {
        this.savingKey = null;
        if (current === '') delete student.days[day];
        else student.days[day] = current;
        this.recalcStudent(student);
        this.recalcDaily(day);
        this.snack.open('Save failed', '', { duration: 2000 });
      }
    });
  }

  markDayAll(day: number, status: string) {
    const dateStr = this.getADDateString(day);
    this.data.students.forEach((s: any) => {
      if (!s.days) s.days = {};
      s.days[day] = status;
      this.recalcStudent(s);
    });
    this.recalcDaily(day);
    this.api.post('attendance/mark-all', { gsId: this.gsId, date: dateStr, status })
      .subscribe({ error: () => this.snack.open('Bulk mark failed', '', { duration: 2000 }) });
  }

  private recalcStudent(s: any) {
    const vals: string[] = Object.values(s.days || {});
    s.present = vals.filter(v => v === 'P' || v === 'L').length;
    s.absent = vals.filter(v => v === 'A').length;
    s.late = vals.filter(v => v === 'L').length;
    s.totalMarked = s.present + s.absent;

    const totalWorkingDays = this.data?.totalWorkingDays || 0;
    s.totalWorkingDays = totalWorkingDays;
    s.pct = totalWorkingDays > 0
      ? Math.round((s.present / totalWorkingDays) * 1000) / 10 : 0;
  }

  private recalcDaily(day: number) {
    if (!this.data?.dailySummary) return;
    let p = 0, a = 0, l = 0;
    for (const s of this.data.students) {
      const st = s.days?.[day] || '';
      if (st === 'P') p++;
      else if (st === 'A') a++;
      else if (st === 'L') l++;
    }
    this.data.dailySummary[day] = { P: p, A: a, L: l };
  }

  cellClass(status: string): string {
    if (status === 'P') return 'cell-p';
    if (status === 'A') return 'cell-a';
    if (status === 'L') return 'cell-l';
    return 'cell-empty';
  }

  pctClass(pct: number): string {
    if (!pct) return '';
    if (pct >= 90) return 'pct-high';
    if (pct >= 75) return 'pct-mid';
    return 'pct-low';
  }

  classAvg(): number {
    if (!this.data?.students?.length) return 0;
    const s = this.data.students.reduce((sum: number, r: any) => sum + (r.pct || 0), 0);
    return Math.round((s / this.data.students.length) * 10) / 10;
  }

  printStudent(student: any) {
    this.openPrint([student]);
  }

  printAll() {
    this.openPrint(this.data?.students || []);
  }

  private openPrint(students: any[]) {
    const monthLabel = this.nepaliMonthLabel;
    const grade = `Grade ${this.data?.gradeName || ''} - Section ${this.data?.sectionName || ''}`;
    const days = this.days;

    const sheets = students.map(s => {
      const dayCells = days.map(d => {
        const st = this.getStatus(s, d);
        const color = st === 'P' ? '#e8f5e9' : st === 'A' ? '#ffebee' : st === 'L' ? '#fff9c4' : '#fff';
        const bsDay = this.getBSDay(d);
        const adDay = this.getADDay(d);
        return `<td style="background:${color};text-align:center;font-weight:700;font-size:13px;padding:8px 4px;border:1px solid #e0e0e0;">${st || '—'}<br><small style="font-weight:normal;color:#888;font-size:10px;">${bsDay}(${adDay})</small></td>`;
      }).join('');

      const pctColor = s.pct >= 90 ? '#2e7d32' : s.pct >= 75 ? '#e65100' : '#c62828';

      return `
        <div style="page-break-after:always;padding:24px;">
          <h2 style="margin:0 0 4px;color:#1a237e;font-size:22px;">Monthly Attendance Sheet</h2>
          <p style="margin:0 0 2px;font-size:14px;color:#555;">${grade}</p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a237e;">${monthLabel}</p>
          <p style="font-size:16px;font-weight:600;margin-bottom:12px;">Student: ${s.studentName}</p>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr>
                ${days.map(d => {
                  const bsDay = this.getBSDay(d);
                  const adDay = this.getADDay(d);
                  return `<th style="background:#1a237e;color:#fff;text-align:center;padding:8px 4px;font-size:14px;border:1px solid #283593;min-width:40px;">
                    <div style="font-size:18px;font-weight:800;">${bsDay}</div>
                    <div style="font-size:9px;font-weight:400;color:#90caf9;">(${adDay})</div>
                  </th>`;
                }).join('')}
                <th style="background:#283593;color:#fff;text-align:center;padding:8px 6px;border:1px solid #283593;">Present</th>
                <th style="background:#283593;color:#fff;text-align:center;padding:8px 6px;border:1px solid #283593;">Absent</th>
                <th style="background:#283593;color:#fff;text-align:center;padding:8px 6px;border:1px solid #283593;">Total</th>
                <th style="background:#283593;color:#fff;text-align:center;padding:8px 6px;border:1px solid #283593;">%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                ${dayCells}
                <td style="text-align:center;font-weight:700;color:#2e7d32;border:1px solid #e0e0e0;padding:8px 4px;font-size:14px;">${s.present}</td>
                <td style="text-align:center;font-weight:700;color:#c62828;border:1px solid #e0e0e0;padding:8px 4px;font-size:14px;">${s.absent}</td>
                <td style="text-align:center;font-weight:700;border:1px solid #e0e0e0;padding:8px 4px;font-size:14px;">${s.totalMarked}</td>
                <td style="text-align:center;font-weight:700;color:${pctColor};border:1px solid #e0e0e0;padding:8px 4px;font-size:14px;">${s.pct}%</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:40px;display:flex;justify-content:space-between;padding:0 20px;">
            <div style="text-align:center;width:150px;">
              <div style="border-top:2px solid #333;width:150px;margin:0 auto 8px;"></div>
              <small style="font-size:12px;color:#555;">Class Teacher</small>
            </div>
            <div style="text-align:center;width:150px;">
              <div style="border-top:2px solid #333;width:150px;margin:0 auto 8px;"></div>
              <small style="font-size:12px;color:#555;">Principal</small>
            </div>
          </div>
        </div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (!w) { this.snack.open('Allow popups to print', '', { duration: 3000 }); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Attendance</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        @media print { 
          body { padding: 0; } 
          table { page-break-inside: avoid; }
        }
        table { font-size: 11px; }
      </style>
      </head><body>${sheets}<script>window.onload=()=>window.print();<\/script></body></html>`);
    w.document.close();
  }
}