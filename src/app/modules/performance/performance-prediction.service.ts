import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface PredictionRequest {
  studentId?: number;
  attendance: number;
  assignmentScore: number;
  midtermScore: number;
  participation: number;
  prevGpa: number;
}

export interface PredictionResponse {
  category: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'At Risk';
  confidence: number;
  class_probabilities: Record<string, number>;
  quick_category: 'High Performer' | 'Average Performer' | 'Needs Attention' | 'Critical Intervention';
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class PerformancePredictionService {
  constructor(private api: ApiService) {}

  predict(req: PredictionRequest): Observable<PredictionResponse> {
    return this.api.post<PredictionResponse>('performance/predict', req);
  }

  checkMlServiceHealth(): Observable<{ mlServiceHealthy: boolean }> {
    return this.api.get<{ mlServiceHealthy: boolean }>('performance/health');
  }

  retrain(dataCsvPath?: string): Observable<any> {
    return this.api.post<any>('performance/retrain', { dataCsvPath });
  }
}