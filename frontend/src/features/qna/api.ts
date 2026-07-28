/**
 * src/features/qna/api.ts
 * Q&A service layer routing through Express API Gateway.
 */
import { apiClient } from '../../core/api/httpClient';
import type { QuestionWithDoctor, SubmitQuestionPayload } from './types';

export async function getPatientQuestions(patientId: string): Promise<QuestionWithDoctor[]> {
  try {
    return await apiClient<QuestionWithDoctor[]>(`/qna/patient/${patientId}`);
  } catch (err: any) {
    console.error('[QnAService] getPatientQuestions error:', err.message);
    throw err;
  }
}

export async function submitQuestion({ patient_id, doctor_id, question_text, report_url }: SubmitQuestionPayload) {
  try {
    return await apiClient<QuestionWithDoctor>('/qna', {
      method: 'POST',
      body: JSON.stringify({
        patient_id,
        doctor_id,
        question_text: question_text.trim(),
        report_url: report_url || null,
      }),
    });
  } catch (err: any) {
    console.error('[QnAService] submitQuestion error:', err.message);
    throw err;
  }
}
