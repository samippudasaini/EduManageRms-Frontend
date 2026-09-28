import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

interface AddSubjectState {
  subjectId: any;
  optional: boolean;
}

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
    MatCheckboxModule, MatTooltipModule, MatSnackBarModule, MatExpansionModule],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.scss'
})
export class FacultyDetailsComponent implements OnInit {
  programs: any[] = [];
  streams: any[] = [];
  subjects: any[] = [];
  form: any = { name: '', streamId: null, subjectIds: [] };
  editId: any = null;

  addState: { [programId: number]: AddSubjectState } = {};
  expandedProgram: any;

  constructor(private api: ApiService, private snack: MatSnackBar, private route: ActivatedRoute) {}

  ngOnInit() {
    forkJoin({
      streams: this.api.get<any[]>('streams').pipe(catchError(() => of([]))),
      subjects: this.api.get<any[]>('subjects').pipe(catchError(() => of([])))
    }).subscribe(r => {
      this.streams = r.streams;
      this.subjects = r.subjects;
    });
    this.load();
  }

  load() {
    this.api.get<any[]>('programs').pipe(catchError(() => of([]))).subscribe(d => {
      this.programs = d || [];
      const editIdParam = this.route.snapshot.queryParamMap.get('editId');
      if (editIdParam) {
        const target = this.programs.find(p => String(p.id) === editIdParam);
        if (target) this.edit(target);
      }
    });
  }

  save() {
    if (!this.form.name.trim()) { this.snack.open('Enter program name', '', { duration: 2000 }); return; }
    const obs = this.editId
      ? this.api.put(`programs/${this.editId}`, this.form)
      : this.api.post('programs', this.form);
    obs.subscribe({
      next: () => { this.snack.open('Saved!', '', { duration: 2000 }); this.reset(); this.load(); },
      error: () => this.snack.open('Error saving program', '', { duration: 2000 })
    });
  }

  edit(program: any) {
    this.editId = program.id;
    this.form = {
      name: program.name,
      streamId: program.streamId,
      subjectIds: program.subjects?.map((s: any) => s.id) || []
    };
  }

  delete(program: any) {
    if (!confirm(`Delete program "${program.name}"? This cannot be undone.`)) return;
    this.doDelete(program, false);
  }

  private doDelete(program: any, force: boolean) {
    const url = `programs/${program.id}${force ? '?force=true' : ''}`;
    this.api.delete(url).subscribe({
      next: () => {
        this.snack.open('Program deleted', '', { duration: 2000 });
        this.programs = this.programs.filter(p => p.id !== program.id);
        if (this.editId === program.id) this.reset();
        if (this.expandedProgram === program) this.expandedProgram = null;
      },
      error: (err) => {
        const body = err?.error;
        if (body?.requiresForce && !force) {
          if (confirm(body.message + '\n\nDelete anyway?')) {
            this.doDelete(program, true);
          }
          return;
        }
        this.snack.open(body?.message || 'Could not delete program', '', { duration: 4000 });
      }
    });
  }

  reset() {
    this.editId = null;
    this.form = { name: '', streamId: null, subjectIds: [] };
  }

  availableSubjects(program: any) {
    const used = new Set((program.subjects || []).map((s: any) => s.id));
    return this.subjects.filter(s => !used.has(s.id));
  }

  getAddState(program: any): AddSubjectState {
    if (!this.addState[program.id]) this.addState[program.id] = { subjectId: null, optional: false };
    return this.addState[program.id];
  }

  addSubject(program: any) {
    const state = this.getAddState(program);
    if (!state.subjectId) { this.snack.open('Select a subject first', '', { duration: 2000 }); return; }
    this.api.post(`programs/${program.id}/subjects`, { subjectId: state.subjectId, optional: state.optional })
      .subscribe({
        next: () => {
          this.snack.open('Subject added', '', { duration: 1500 });
          this.addState[program.id] = { subjectId: null, optional: false };
          this.load();
        },
        error: () => this.snack.open('Could not add subject', '', { duration: 2000 })
      });
  }

  removeSubject(program: any, subjectId: any) {
    if (!confirm('Remove this subject from the program?')) return;
    this.api.delete(`programs/${program.id}/subjects/${subjectId}`).subscribe({
      next: () => { this.snack.open('Subject removed', '', { duration: 1500 }); this.load(); },
      error: () => this.snack.open('Could not remove subject', '', { duration: 2000 })
    });
  }

  toggleType(program: any, subject: any) {
    const newOptional = !subject.optional;
    this.api.put(`programs/${program.id}/subjects/${subject.id}`, { optional: newOptional }).subscribe({
      next: () => this.load(),
      error: () => this.snack.open('Could not update subject type', '', { duration: 2000 })
    });
  }

  toggleExpand(program: any) {
    this.expandedProgram = this.expandedProgram === program ? null : program;
  }
}