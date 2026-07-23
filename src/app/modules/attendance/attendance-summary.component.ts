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

  // BS Month names
  private readonly BS_MONTHS = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  private readonly EN_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.gsId = +this.route.snapshot.params['gsId'];
    this.year = new Date().getFullYear();
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<any>(`attendance/summary/${this.gsId}?year=${this.year}`).subscribe({
      next: d => { 
        this.data = d; 
        this.loading = false;
        
        // 🔍 Debug - check what months are coming from backend
        console.log('Months from backend:', this.data?.months);
      },
      error: () => { 
        this.loading = false; 
        this.snack.open('Could not load summary', '', { duration: 2000 }); 
      }
    });
    
    this.api.get<any[]>('attendance/sections').subscribe({
      next: sections => {
        const s = sections.find((s: any) => s.id === this.gsId);
        if (s) { 
          this.gradeName = s.gradeName; 
          this.sectionName = s.sectionName; 
        }
      }
    });
  }

  // ✅ Get month data for a student
  getMonthData(student: any, month: number): any {
    return student.months?.[month] || { present: 0, absent: 0, total: 0, pct: 0 };
  }

  // ✅ Get Nepali month name - USING adToNepaliMonth
  getNepaliMonth(month: number): string {
    try {
      const np = adToNepaliMonth(this.year, month);
      return np.label.split(' ')[0];
    } catch (e) {
      // Fallback if adToNepaliMonth fails
      return this.getNepaliMonthFallback(month);
    }
  }

  // ✅ FALLBACK - Direct mapping if adToNepaliMonth fails
  getNepaliMonthFallback(adMonth: number): string {
    // AD Month to BS Month mapping for BS 2083
    // AD: Jun (6) → Ashadh, Jul (7) → Shrawan
    const mapping: { [key: number]: number } = {
      1: 9,   // Jan → Poush
      2: 10,  // Feb → Magh
      3: 11,  // Mar → Falgun
      4: 12,  // Apr → Chaitra
      5: 1,   // May → Baishakh
      6: 2,   // Jun → Jestha
      7: 3,   // Jul → Ashadh
      8: 4,   // Aug → Shrawan
      9: 5,   // Sep → Bhadra
      10: 6,  // Oct → Ashwin
      11: 7,  // Nov → Kartik
      12: 8   // Dec → Mangsir
    };
    
    const bsIndex = mapping[adMonth] || adMonth;
    return this.BS_MONTHS[bsIndex - 1] || adMonth.toString();
  }

  // ✅ Get English month name
  getEnglishMonth(month: number): string {
    return this.EN_MONTHS[month - 1] || month.toString();
  }

  // ✅ Get month label for header (BS with EN in brackets)
  getMonthLabel(month: number): string {
    return `${this.getNepaliMonth(month)} (${this.getEnglishMonth(month)})`;
  }

  // ✅ Percentage class for styling
  pctClass(pct: number): string {
    if (!pct) return '';
    if (pct >= 90) return 'pct-high';
    if (pct >= 75) return 'pct-mid';
    return 'pct-low';
  }

  // ✅ Get month average
  getMonthAverage(month: number): number {
    if (!this.data?.students?.length) return 0;
    
    let total = 0;
    let count = 0;
    for (const student of this.data.students) {
      const data = this.getMonthData(student, month);
      if (data.total > 0) {
        total += data.pct || 0;
        count++;
      }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  }

  // ✅ Get class average
  classAverage(): number {
    if (!this.data?.students?.length) return 0;
    
    let total = 0;
    let count = 0;
    for (const student of this.data.students) {
      if (student.cumPct !== undefined && student.cumPct !== null) {
        total += student.cumPct || 0;
        count++;
      }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  }

  // ✅ Print all students
  printAll() { 
    this.openPrint(this.data?.students || []); 
  }

  // ✅ Print single student
  printStudent(s: any) { 
    this.openPrint([s]); 
  }

  private openPrint(students: any[]) {
    if (!students.length) {
      this.snack.open('No data to print', '', { duration: 2000 });
      return;
    }

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

    const headerCells = months.map(m => {
      const bsName = this.getNepaliMonth(m);
      const enName = this.getEnglishMonth(m);
      return `<th style="background:#1a237e;color:#fff;padding:6px 4px;text-align:center;border:1px solid #283593;font-size:11px;">
        ${bsName}<br><small style="color:#90caf9;">(${enName})</small>
      </th>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Attendance Summary</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;}
        @media print{body{margin:0}}
        table{width:100%;border-collapse:collapse;}
        th, td{border:1px solid #e0e0e0;}
      </style>
    </head><body>
      <h2 style="color:#1a237e;margin-bottom:4px;">Monthly Attendance Summary</h2>
      <p style="margin-bottom:16px;">${title}</p>
      <table>
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
    if (!w) { 
      this.snack.open('Allow popups to print', '', { duration: 3000 }); 
      return; 
    }
    w.document.write(html);
    w.document.close();
  }
}