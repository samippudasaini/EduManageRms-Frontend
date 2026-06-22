import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss'
})
export class GradesComponent implements OnInit {
  gradeSections: any[] = []; grades: any[] = []; sections: any[] = [];
  gsForm: any = { gradeId: null, sectionId: null }; editGSId: any = null;
  gradeName = ''; editGradeId: any = null;
  sectionName = ''; editSectionId: any = null;
  constructor(private api: ApiService, private snack: MatSnackBar) {}
  ngOnInit() { this.load(); }
  load() {
    this.api.get<any[]>('grade-sections').subscribe(d => this.gradeSections = d);
    this.api.get<any[]>('grades').subscribe(d => this.grades = d);
    this.api.get<any[]>('sections').subscribe(d => this.sections = d);
  }
  saveGS() {
    const obs = this.editGSId ? this.api.put(`grade-sections/${this.editGSId}`, this.gsForm) : this.api.post('grade-sections', this.gsForm);
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.resetGS(); this.load(); } });
  }
  editGS(r: any) { this.editGSId = r.id; this.gsForm = { gradeId: r.gradeId, sectionId: r.sectionId }; }
  deleteGS(id: any) { if (!confirm('Delete?')) return; this.api.delete(`grade-sections/${id}`).subscribe(() => this.load()); }
  resetGS() { this.editGSId = null; this.gsForm = { gradeId: null, sectionId: null }; }
  saveGrade() {
    const obs = this.editGradeId ? this.api.put(`grades/${this.editGradeId}`, {name:this.gradeName}) : this.api.post('grades', {name:this.gradeName});
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.resetGrade(); this.load(); } });
  }
  deleteGrade(id: any) { if (!confirm('Delete?')) return; this.api.delete(`grades/${id}`).subscribe(() => this.load()); }
  resetGrade() { this.editGradeId = null; this.gradeName = ''; }
  saveSection() {
    const obs = this.editSectionId ? this.api.put(`sections/${this.editSectionId}`, {name:this.sectionName}) : this.api.post('sections', {name:this.sectionName});
    obs.subscribe({ next: () => { this.snack.open('Saved!','',{duration:2000}); this.resetSection(); this.load(); } });
  }
  deleteSection(id: any) { if (!confirm('Delete?')) return; this.api.delete(`sections/${id}`).subscribe(() => this.load()); }
  resetSection() { this.editSectionId = null; this.sectionName = ''; }
}
